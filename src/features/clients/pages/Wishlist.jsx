import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { mergeWishlistLinesIntoLocalCart } from "../../../lib/cartLocalStorage";

const VERDE = "#8BB2A1";
const AZUL_VER_MAS = "#2563eb";

function SvgIcon({ children, className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {children}
    </svg>
  );
}

const I = {
  minus: <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />,
  plus: (
    <>
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
};

export default function Wishlist() {
  const navigate = useNavigate();

  const apiBase = useMemo(() => {
    return (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  }, []);

  const [cupon, setCupon] = useState("");
  const [productos, setProductos] = useState([]);
  const [status, setStatus] = useState("idle");
  const [userId, setUserId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [addingAllToCart, setAddingAllToCart] = useState(false);
  const [refreshingList, setRefreshingList] = useState(false);

  // Timers de debounce por productId para no spamear el PUT
  const debounceTimers = useRef({});

  // ─── Sesión + wishlist ───────────────────────────────────────────────────────

  const fetchWishlist = useCallback(async (uid, options = {}) => {
    const { isRefresh } = options;
    try {
      const res = await axios.get(
        `${apiBase || "http://localhost:3000"}/api/users/${uid}/wishlist`,
        { withCredentials: true }
      );
      const items = res.data?.items ?? [];
      setProductos(
        items.map((item) => ({
          itemId: item.id,
          productId: item.product.id,
          nombre: item.product.name,
          precio: item.product.price,
          cantidad: item.quantity,
          checked: false,
          updatingQty: false,
        }))
      );
      return true;
    } catch (e) {
      const code = e?.response?.status;
      if (code === 401) {
        toast.error("Iniciá sesión para ver tu lista de deseos");
        navigate("/login");
      } else {
        toast.error("No se pudo cargar la lista de deseos");
        if (!isRefresh) setStatus("error");
      }
      return false;
    }
  }, [apiBase, navigate]);

  useEffect(() => {
    const init = async () => {
      try {
        setStatus("loading");
        const sessionRes = await axios.get(
          `${apiBase || "http://localhost:3000"}/api/session/user-session`,
          { withCredentials: true }
        );
        const uid = sessionRes.data?.user?.id_user;
        if (!uid) {
          toast.error("Iniciá sesión para ver tu lista de deseos");
          navigate("/login");
          return;
        }
        setUserId(uid);
        await fetchWishlist(uid);
        setStatus("idle");
      } catch (e) {
        const code = e?.response?.status;
        if (code === 401) {
          toast.error("Iniciá sesión para ver tu lista de deseos");
          navigate("/login");
        } else {
          setStatus("error");
        }
      }
    };
    init();
  }, [apiBase, navigate, fetchWishlist]);

  // Limpiar timers al desmontar
  useEffect(() => {
    const timers = debounceTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  // ─── Checkbox ────────────────────────────────────────────────────────────────

  const toggleCheck = (productId) => {
    setProductos((prev) =>
      prev.map((p) => p.productId === productId ? { ...p, checked: !p.checked } : p)
    );
  };

  // ─── Cambiar cantidad ────────────────────────────────────────────────────────

  const cambiarCantidad = (productId, delta) => {
    // Actualización visual inmediata
    setProductos((prev) =>
      prev.map((p) => {
        if (p.productId !== productId) return p;
        return { ...p, cantidad: Math.max(1, p.cantidad + delta) };
      })
    );

    // Cancelar timer previo para este producto
    if (debounceTimers.current[productId]) {
      clearTimeout(debounceTimers.current[productId]);
    }

    // Persistir al back 600ms después del último click
    debounceTimers.current[productId] = setTimeout(() => {
      setProductos((prev) => {
        const producto = prev.find((p) => p.productId === productId);
        if (!producto) return prev;

        const cantidad = producto.cantidad;

        // Marcar como guardando
        const conFlag = prev.map((p) =>
          p.productId === productId ? { ...p, updatingQty: true } : p
        );

        axios
          .put(
            `${apiBase || "http://localhost:3000"}/api/users/${userId}/wishlist/items/${productId}`,
            { quantity: cantidad },
            { withCredentials: true }
          )
          .catch(() => toast.error("No se pudo actualizar la cantidad"))
          .finally(() => {
            setProductos((latest) =>
              latest.map((p) =>
                p.productId === productId ? { ...p, updatingQty: false } : p
              )
            );
          });

        return conFlag;
      });
    }, 600);
  };

  // ─── Eliminar item ───────────────────────────────────────────────────────────

  const eliminarProducto = async (productId) => {
    if (removingId) return;

    // Cancelar PUT pendiente antes de eliminar
    if (debounceTimers.current[productId]) {
      clearTimeout(debounceTimers.current[productId]);
      delete debounceTimers.current[productId];
    }

    try {
      setRemovingId(productId);
      await axios.delete(
        `${apiBase || "http://localhost:3000"}/api/users/${userId}/wishlist/items/${productId}`,
        { withCredentials: true }
      );
      setProductos((prev) => prev.filter((p) => p.productId !== productId));
      toast.success("Producto eliminado de la lista");
    } catch {
      toast.error("No se pudo eliminar el producto");
    } finally {
      setRemovingId(null);
    }
  };

  // ─── Cálculos ────────────────────────────────────────────────────────────────

  const seleccionados = productos.filter((p) => p.checked);
  const total = seleccionados.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  // ─── Cupón ───────────────────────────────────────────────────────────────────

  const aplicarCupon = () => {
    if (!cupon.trim()) { toast.error("Ingresá un cupón"); return; }
    toast.success("Cupón aplicado");
  };

  const actualizarFavoritos = async () => {
    if (!userId || refreshingList) return;
    setRefreshingList(true);
    try {
      const ok = await fetchWishlist(userId, { isRefresh: true });
      if (ok) toast.success("Lista actualizada");
    } finally {
      setRefreshingList(false);
    }
  };

  const compartirFavoritos = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mis favoritos", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Enlace copiado al portapapeles");
      }
    } catch (e) {
      if (e?.name !== "AbortError") toast.error("No se pudo compartir");
    }
  };

  const agregarTodoAlCarrito = () => {
    if (!productos.length || addingAllToCart) return;
    setAddingAllToCart(true);
    try {
      mergeWishlistLinesIntoLocalCart(productos);
      toast.success("Productos agregados al carrito");
    } finally {
      setAddingAllToCart(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#E5EAE9] flex items-center justify-center">
        <p className="text-gray-500 text-[14px]">Cargando lista de deseos...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#E5EAE9] flex items-center justify-center">
        <p className="text-red-500 text-[14px]">No se pudo cargar la lista de deseos.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5EAE9] py-10">
      <div className="max-w-7xl mx-auto px-6">

        <h1 className="text-3xl font-bold text-[#2f3e39] mb-8">Lista de deseos</h1>

        {productos.length === 0 ? (
          <p className="text-gray-500 text-[14px]">
            Tu lista de deseos está vacía.{" "}
            <button className="underline text-[#2f3e39]" onClick={() => navigate("/busqueda")}>
              Explorá productos
            </button>
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-8">

            {/* productos */}
            <div className="col-span-2 flex flex-col gap-6">
              {productos.map((producto) => (
                <div
                  key={producto.itemId}
                  className="bg-[#F3F5F4] border border-[#C7D6CF] rounded-lg p-5 flex items-center justify-between"
                >
                  <div className="flex gap-5 items-center">
                    <input
                      type="checkbox"
                      checked={producto.checked}
                      onChange={() => toggleCheck(producto.productId)}
                      className="w-5 h-5 cursor-pointer"
                    />

                    <div className="w-[110px] h-[80px] rounded-md bg-[#E8DCCB]" />

                    <div>
                      <h2 className="font-semibold text-[17px]">{producto.nombre}</h2>

                      {/* Contador */}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(producto.productId, -1)}
                          disabled={producto.cantidad <= 1 || producto.updatingQty || !!removingId}
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-100"
                        >
                          <SvgIcon className="w-3 h-3 text-gray-600">{I.minus}</SvgIcon>
                        </button>

                        <span className={`w-6 text-center text-[14px] font-medium ${producto.updatingQty ? "text-gray-400" : "text-black"}`}>
                          {producto.cantidad}
                        </span>

                        <button
                          type="button"
                          onClick={() => cambiarCantidad(producto.productId, +1)}
                          disabled={producto.updatingQty || !!removingId}
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-100"
                        >
                          <SvgIcon className="w-3 h-3 text-gray-600">{I.plus}</SvgIcon>
                        </button>
                      </div>

                      {/* Precio unitario */}
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-gray-400 text-[11px] uppercase tracking-wide">c/u</span>
                        <span className="font-semibold text-[18px]">
                          Gs.{" "}
                          {typeof producto.precio === "number"
                            ? producto.precio.toLocaleString()
                            : "-"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/producto-detalle/${producto.productId}`)}
                        className="mt-3 px-5 py-2 rounded-full text-white text-[13px] font-medium hover:opacity-90"
                        style={{ backgroundColor: AZUL_VER_MAS }}
                      >
                        Ver más
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {producto.checked
                      ? <span className="text-gray-500 text-[13px]">Seleccionado</span>
                      : <span className="text-gray-400 text-[13px]">No seleccionado</span>
                    }
                    <button
                      onClick={() => eliminarProducto(producto.productId)}
                      disabled={removingId === producto.productId}
                      className="text-red-400 hover:text-red-600 text-[12px] disabled:opacity-50"
                    >
                      {removingId === producto.productId ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* resumen */}
            <div className="flex flex-col gap-6">
              <div className="bg-[#F3F5F4] border border-[#C7D6CF] rounded-lg p-5">
                <h3 className="font-semibold mb-4">Resumen de selección</h3>

                {seleccionados.length === 0 ? (
                  <p className="text-gray-500 text-[13px]">No hay productos seleccionados</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {seleccionados.map((p) => (
                      <div key={p.itemId} className="flex flex-col gap-[2px]">
                        <div className="flex justify-between text-[14px]">
                          <span className="font-medium">{p.nombre}</span>
                          <span>
                            Gs.{" "}
                            {typeof p.precio === "number"
                              ? (p.precio * p.cantidad).toLocaleString()
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-end text-[11px] text-gray-400">
                          {p.cantidad} × Gs.{" "}
                          {typeof p.precio === "number" ? p.precio.toLocaleString() : "-"}
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-3 mt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>Gs. {total.toLocaleString()}</span>
                    </div>

                    <div className="mt-4">
                      <p className="text-[14px] font-semibold mb-2">Cupón de descuento</p>
                      <div className="flex gap-2 w-full">
                        <input
                          type="text"
                          placeholder="Ingresá tu cupón"
                          value={cupon}
                          onChange={(e) => setCupon(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-[13px]"
                        />
                        <button
                          onClick={aplicarCupon}
                          className="px-4 py-2 rounded-md text-white text-[13px] whitespace-nowrap"
                          style={{ backgroundColor: VERDE }}
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>

                    <button
                      className="mt-4 w-full py-3 rounded-md text-white text-[14px] font-medium"
                      style={{ backgroundColor: VERDE }}
                    >
                      Comprar selección
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={actualizarFavoritos}
                disabled={refreshingList}
                className="px-6 py-3 rounded-full text-white text-[14px] font-medium disabled:opacity-60 hover:opacity-90"
                style={{ backgroundColor: VERDE }}
              >
                {refreshingList ? "Actualizando..." : "Actualizar Favoritos"}
              </button>
              <button
                type="button"
                onClick={compartirFavoritos}
                className="px-6 py-3 rounded-full text-white text-[14px] font-medium hover:opacity-90"
                style={{ backgroundColor: VERDE }}
              >
                Compartir Favoritos
              </button>
              <button
                type="button"
                onClick={agregarTodoAlCarrito}
                disabled={addingAllToCart}
                className="px-6 py-3 rounded-full text-white text-[14px] font-medium disabled:opacity-60 hover:opacity-90"
                style={{ backgroundColor: VERDE }}
              >
                {addingAllToCart ? "Agregando..." : "Agregar todo al Carrito"}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}