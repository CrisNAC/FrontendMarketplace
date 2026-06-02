import { useMemo, useState, useEffect, useCallback } from "react";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import Navbar from "../../../components/navbar/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../components/toast/useToast";
import { getApiBase, removeCartItemApi, updateCartItemQuantityApi } from "../../../lib/cartApi";
import { formatGuarani } from "../../../lib/formatGuarani.js";
import { PageLoader } from "../../../components/PageLoader";
import { ConfirmationModal } from "../components/cart/ConfirmationModal";

type CartItem = {
  id: number;
  productId: number;
  name: string;
  store: string;
  price: number;
  offerPrice?: number | null;
  isOffer: boolean;
  quantity: number;
  image: string;
  stock: number;
};

type BackendCart = {
  id: number;
  storeId: number;
  commerce: {
    id: number;
    name: string;
  } | null;
  status: string;
  items: Array<{
    id: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      price: number;
      originalPrice?: number | null;
      offerPrice?: number | null;
      isOffer: boolean;
      imageUrl?: string | null;
      stock?: number;
    };
  }>;
};

export const CartPage = () => {
  const navigate = useNavigate();
  const { cartId } = useParams();
  const apiBase = getApiBase() || "http://localhost:3000";

  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartName, setCartName] = useState("Carrito de Compras");
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "unauthorized">("loading");
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);
  const [loadingItemIds, setLoadingItemIds] = useState<Set<number>>(new Set());

  const loadCart = useCallback(async () => {
    try {
      setStatus("loading");

      if (!cartId) {
        setStatus("error");
        showToast("Carrito inválido", "error");
        return;
      }

      const sessionRes = await axios.get(`${apiBase}/api/session/user-session`, {
        withCredentials: true,
      });

      const userId = sessionRes.data?.user?.id_user;

      if (!userId) {
        setStatus("unauthorized");
        showToast("Iniciá sesión para ver tu carrito", "error");
        navigate("/login");
        return;
      }

      const cartsRes = await axios.get(`${apiBase}/api/users/${userId}/carts`, {
        withCredentials: true,
      });

      const carts: BackendCart[] = Array.isArray(cartsRes.data?.carts)
        ? cartsRes.data.carts
        : [];

      const selectedCart = carts.find((cart) => Number(cart.id) === Number(cartId));

      if (!selectedCart) {
        setCartItems([]);
        setCartName("Carrito de Compras");
        setStatus("error");
        showToast("Carrito no encontrado", "error");
        return;
      }

      setCartName(selectedCart.commerce?.name || "Carrito de Compras");

      const mappedItems: CartItem[] = (selectedCart.items || []).map((item) => ({
        id: item.id,
        productId: item.product?.id,
        name: item.product?.name ?? "Producto",
        store: selectedCart.commerce?.name ?? "Comercio",
        price: Number(item.product?.originalPrice ?? item.product?.price ?? 0),
        offerPrice:
          item.product?.offerPrice != null
            ? Number(item.product.offerPrice)
            : null,
        isOffer: Boolean(item.product?.isOffer),
        quantity: Number(item.quantity ?? 1),
        image: item.product?.imageUrl ?? "",
        stock: (() => {
          const s = Number(item.product?.stock);
          return Number.isFinite(s) ? Math.max(0, Math.floor(s)) : 0;
        })(),
      }));

      setCartItems(mappedItems);
      setStatus("ready");
    } catch (error: any) {
      const code = error?.response?.status;

      if (code === 401) {
        setStatus("unauthorized");
        showToast("Iniciá sesión para ver tu carrito", "error");
        navigate("/login");
        return;
      }

      setStatus("error");
      showToast(error?.response?.data?.message || "No se pudo cargar el carrito", "error");
    }
  }, [apiBase, cartId, navigate]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQuantity = async (id: number, type: "inc" | "dec") => {
    if (loadingItemIds.has(id)) return;

    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    if (type === "inc" && item.quantity >= item.stock) {
      showToast(`Solo hay ${item.stock} unidades disponibles de ${item.name}`, "error");
      return;
    }

    const newQuantity =
      type === "inc" ? item.quantity + 1 : Math.max(1, item.quantity - 1);

    setLoadingItemIds((prev) => new Set(prev).add(id));
    try {
      await updateCartItemQuantityApi(id, newQuantity);
      setCartItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i))
      );
    } catch (error: any) {
      showToast(error?.response?.data?.message || "No se pudo actualizar la cantidad", "error");
    } finally {
      setLoadingItemIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const removeItem = async (id: number) => {
    try {
      await removeCartItemApi(id);
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      showToast("Producto eliminado del carrito", "success");
    } catch (error: any) {
      showToast(error?.response?.data?.message || "No se pudo eliminar el producto", "error");
    } finally {
      setItemToDelete(null);
    }
  };

  const getFinalPrice = (item: CartItem) => {
    return item.isOffer && item.offerPrice != null ? item.offerPrice : item.price;
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const discount = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      if (item.isOffer && item.offerPrice != null) {
        return acc + (item.price - item.offerPrice) * item.quantity;
      }
      return acc;
    }, 0);
  }, [cartItems]);

  const total = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + getFinalPrice(item) * item.quantity,
      0
    );
  }, [cartItems]);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#edf6f0]">
      <div className="shrink-0">
        <Navbar />
      </div>

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden mx-auto max-w-7xl px-6 w-full">
        <div className="shrink-0 pt-10 mb-6 flex items-center gap-4">
          <ArrowLeft
            className="h-6 w-6 cursor-pointer text-[#1f2f2a]"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-2xl font-bold text-[#1f2f2a]">
            {cartName}
          </h1>
        </div>

        {status === "loading" && (<PageLoader />)}

        {status === "error" && (
          <div className="rounded-2xl border border-[#d7e8dd] bg-white/70 p-6 shadow-sm">
            <p className="text-sm text-gray-500">No se pudo cargar el carrito.</p>
            <button
              onClick={loadCart}
              className="mt-3 rounded-lg bg-[#5B7B6D] px-4 py-2 text-sm text-white"
            >
              Reintentar
            </button>
          </div>
        )}

        {status === "ready" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 flex-1 min-h-0 pb-6">
            <section className="space-y-4 lg:col-span-2 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="rounded-2xl border border-[#d7e8dd] bg-white/70 p-6 shadow-sm">
                  <p className="text-sm text-gray-500">Tu carrito está vacío.</p>
                </div>
              ) : (
                cartItems.map((item) => {
                  const finalPrice = getFinalPrice(item);
                  const itemSubtotal = finalPrice * item.quantity;

                  return (
                    <article
                      key={item.id}
                      className="relative rounded-2xl border border-[#d7e8dd] bg-white/70 p-4 shadow-sm"
                    >
                      <button
                        onClick={() => setItemToDelete(item)}
                        className="absolute right-4 top-4 rounded-full p-1 text-[#ff7a7a] transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-3">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-200">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                Sin imagen
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col justify-center">
                            <div>
                              <h2 className="pr-8 text-lg font-bold leading-tight text-[#344d45]">
                                {item.name}
                              </h2>
                              {item.quantity > item.stock && (
                                <p className="mt-1 text-sm font-semibold text-red-600">
                                  ⚠️ Stock insuficiente (Disponible: {item.stock})
                                </p>
                              )}
                            </div>

                            <div className="mt-1">
                              {item.isOffer && item.offerPrice != null ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-xl font-extrabold text-[#1f2f2a]">
                                    {formatGuarani(item.offerPrice)}
                                  </p>
                                  <p className="text-sm text-gray-400 line-through">
                                    {formatGuarani(item.price)}
                                  </p>
                                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                    Oferta
                                  </span>
                                </div>
                              ) : (
                                <p className="text-xl font-extrabold text-[#1f2f2a]">
                                  {formatGuarani(item.price)}
                                </p>
                              )}

                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, "dec")}
                                  disabled={loadingItemIds.has(item.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef4f1] text-[#4e6a60] transition hover:bg-[#dbe9e2] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus size={14} />
                                </button>

                                <span className="min-w-[20px] text-center text-sm font-semibold text-[#344d45]">
                                  {item.quantity}
                                </span>

                                <button
                                  onClick={() => updateQuantity(item.id, "inc")}
                                  disabled={loadingItemIds.has(item.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef4f1] text-[#4e6a60] transition hover:bg-[#dbe9e2] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row items-center justify-between md:flex-col md:items-end md:gap-4">
                          <p className="text-xs font-semibold text-[#91a79d]">
                            Subtotal: {formatGuarani(itemSubtotal)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </section>

            <aside className="space-y-5 overflow-y-auto">
              <div className="rounded-2xl border border-[#d7e8dd] bg-white/70 p-5 shadow-sm">
                <h3 className="mb-5 text-xl font-bold text-[#344d45]">
                  Resumen del pedido
                </h3>

                <div className="space-y-4 text-[15px] text-[#546760]">
                  <div className="flex items-center justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatGuarani(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Descuentos:</span>
                      <span className="font-semibold text-green-600">
                        - {formatGuarani(discount)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-[#d7e8dd] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#344d45]">
                        Total:
                      </span>
                      <span className="text-2xl font-extrabold text-[#1f2f2a]">
                        {formatGuarani(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(`/confirmar-pedido/${cartId}`)}
                    disabled={cartItems.some(item => item.quantity > item.stock)}
                    className="mt-4 w-full rounded-lg bg-[#5B7B6D] py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-[#4e6a5e] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    Ir a Confirmar Pedido
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
      <ConfirmationModal
        isOpen={itemToDelete !== null}
        title="Eliminar producto del carrito"
        subtitle={itemToDelete?.name}
        warnings={[
          "¿Estás seguro de que deseas eliminar este producto del carrito?",
          "• Esta acción no se puede deshacer",
        ]}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => { if (itemToDelete) removeItem(itemToDelete.id); }}
        confirmText="Eliminar producto"
        icon={Trash2}
      />
    </div>
  );
};