import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import axios from "axios";
import { fetchCartsApi, getApiBase, formatGuarani } from "@/lib";
import { DeleteCartModal, DeleteAllCartsModal } from "@/features/components/cart";
import { useToast } from "@/hooks";

function itemSubtotal(unitPrice, qty) {
  const u = Number(unitPrice);
  const q = Math.max(1, Number(qty) || 1);
  if (!Number.isFinite(u)) return 0;
  return u * q;
}

export default function OrdenesComprasPage() {
  const navigate = useNavigate();
  const apiBase = getApiBase() || "http://localhost:3000";

  const [status, setStatus] = useState("loading");
  const [carts, setCarts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [deleteCartModal, setDeleteCartModal] = useState(null);
  const [deleteAllCartsModal, setDeleteAllCartsModal] = useState(false);

  const { showToast } = useToast();

  const loadCarts = useCallback(async () => {
    try {
      setStatus("loading");
      const sessionRes = await axios.get(`${apiBase}/api/session/user-session`, {
        withCredentials: true,
      });
      const uid = sessionRes.data?.user?.id_user;
      if (!uid) {
        setCarts([]);
        setUserId(null);
        setStatus("unauthorized");
        return;
      }
      setUserId(uid);
      const list = await fetchCartsApi(uid);
      setCarts(Array.isArray(list) ? list : []);
      setStatus("ready");
    } catch (e) {
      const code = e?.response?.status;
      if (code === 401) {
        setCarts([]);
        setUserId(null);
        setStatus("unauthorized");
        showToast("Iniciá sesión para ver tu carrito", "error");
        navigate("/login");
      } else {
        setStatus("error");
        showToast("No se pudo cargar el carrito", "error");
      }
    }
  }, [apiBase, navigate]);

  useEffect(() => {
    loadCarts();
  }, [loadCarts]);

  useEffect(() => {
    const onCartUpdated = () => {
      loadCarts();
    };

    const hasGlobalThis = typeof globalThis !== "undefined";
    if (!hasGlobalThis) {
      return undefined;
    }

    const hasListener = typeof globalThis.addEventListener === "function";
    if (!hasListener) {
      return undefined;
    }

    globalThis.addEventListener("cartUpdated", onCartUpdated);

    return () => {
      const hasRemover = typeof globalThis.removeEventListener === "function";
      if (hasRemover) {
        globalThis.removeEventListener("cartUpdated", onCartUpdated);
      }
    };
  }, [loadCarts]);

  const handleDeleteCartClick = (cartId, storeName, itemCount) => {
    setDeleteCartModal({ cartId, storeName, itemCount });
  };

  const handleDeleteAllCartsClick = () => {
    setDeleteAllCartsModal(true);
  };

  const handleDeleteCartSuccess = () => {
    setDeleteCartModal(null);
    showToast("Carrito eliminado correctamente", "success");
    loadCarts();
  };

  const handleDeleteAllCartsSuccess = () => {
    setDeleteAllCartsModal(false);
    showToast("Todos los carritos fueron eliminados correctamente", "success");
    loadCarts();
  };

  const empty = status === "ready" && (!carts || carts.length === 0);
  const totalItems = carts.reduce((acc, cart) => acc + (cart.items?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#F3F3F3] pb-8">
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-6">
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-1 rounded hover:bg-black/5 text-[#2f3e39]"
              aria-label="Volver"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
              Carritos
            </h1>
          </div>

          {status === "ready" && carts.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAllCartsClick}
              className="px-4 py-2 rounded-md text-white text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar todas
            </button>
          )}
        </div>

        {status === "loading" && (
          <p className="text-center text-sm text-gray-500 py-8">
            Cargando carrito...
          </p>
        )}

        {status === "error" && (
          <div className="bg-white rounded-lg border border-[#C7D6CF] p-6 text-center">
            <p className="text-sm text-gray-600">No se pudo cargar el carrito.</p>
            <button
              type="button"
              onClick={() => loadCarts()}
              className="mt-3 text-sm text-[#6B9080] font-medium underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {status === "unauthorized" && (
          <div className="bg-white rounded-lg border border-[#C7D6CF] p-6 text-center text-sm text-gray-600">
            Iniciá sesión para ver tus compras.
          </div>
        )}

        {empty && (
          <div className="bg-white rounded-lg border border-[#C7D6CF] p-10 text-center shadow-sm">
            <p className="text-[#4f615b] font-medium text-base">
              Tu carrito está vacío
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Agregá productos desde el detalle o la búsqueda.
            </p>
            <button
              type="button"
              onClick={() => navigate("/busqueda")}
              className="mt-5 px-6 py-2 rounded-full text-white text-sm font-medium bg-[#6B9080] hover:opacity-90"
            >
              Explorar productos
            </button>
          </div>
        )}

        {status === "ready" && carts.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {carts.map((cart) => {
              const storeName = cart.commerce?.name || "Comercio";
              const initial = (storeName || "?").slice(0, 1).toUpperCase();
              const items = cart.items || [];
              const productCount = items.length;
              const total = items.reduce(
                (acc, row) => acc + itemSubtotal(row.product?.price, row.quantity),
                0
              );

              return (
                <div
                  key={cart.id}
                  className="bg-[#E8EBEA] rounded-2xl border border-[#cfd8d4] p-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-[#c5d0cc] flex items-center justify-center text-[#485B53] font-bold text-sm shrink-0 overflow-hidden">
                      {cart.commerce?.logo ? (
                        <img
                          src={cart.commerce.logo}
                          alt={storeName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.parentElement.textContent = initial;
                          }}
                        />
                      ) : (
                        initial
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold text-[#1a1a1a] leading-tight">
                        {storeName}
                      </h2>
                      <p className="text-xs text-[#4f615b] mt-0.5">
                        Cantidad de productos: {productCount}
                      </p>
                      <p className="text-sm font-semibold text-[#2f3e39] mt-0.5">
                        Total: {formatGuarani(total)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    {items.map((row) => {
                      const sub = itemSubtotal(row.product?.price, row.quantity);
                      const name = row.product?.name || "Producto";
                      const unit = row.product?.price;
                      const imageUrl = row.product?.imageUrl ?? row.product?.image_url ?? null;

                      return (
                        <div
                          key={row.id ?? `${cart.id}-${row.product?.id}`}
                          className="bg-white rounded-lg border border-[#e5e7eb] px-2.5 py-2 flex justify-between gap-2 items-start"
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#111827] leading-snug">
                                {name}
                              </p>
                              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                                Cantidad: {row.quantity}
                              </p>
                              <p className="text-[11px] font-semibold text-[#111827] mt-1">
                                {formatGuarani(unit)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-gray-500">Subtotal</p>
                            <p className="text-xs font-bold text-[#111827]">
                              {formatGuarani(sub)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteCartClick(cart.id, storeName, productCount)}
                      className="px-3 py-1.5 rounded-md text-white text-[11px] font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/carrito/${cart.id}`)}
                      className="px-6 py-1.5 rounded-md text-white text-[11px] font-medium bg-[#6B9080] border border-[#658D7B] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteCartModal && userId && (
        <DeleteCartModal
          cartId={deleteCartModal.cartId}
          userId={userId}
          storeName={deleteCartModal.storeName}
          itemCount={deleteCartModal.itemCount}
          onClose={() => setDeleteCartModal(null)}
          onSuccess={handleDeleteCartSuccess}
        />
      )}

      {deleteAllCartsModal && userId && (
        <DeleteAllCartsModal
          userId={userId}
          totalCarts={carts.length}
          totalItems={totalItems}
          onClose={() => setDeleteAllCartsModal(false)}
          onSuccess={handleDeleteAllCartsSuccess}
        />
      )}
    </div>
  );
}