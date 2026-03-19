import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const VERDE = "#8BB2A1";

export default function Wishlist() {
  const navigate = useNavigate();

  const apiBase = useMemo(() => {
    return (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  }, []);

  const [cupon, setCupon] = useState("");
  const [productos, setProductos] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [userId, setUserId] = useState(null);
  const [removingId, setRemovingId] = useState(null); // productId que se está eliminando

  // ─── Cargar sesión y wishlist ────────────────────────────────────────────────

  const fetchWishlist = useCallback(async (uid) => {
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
        }))
      );
    } catch (e) {
      const code = e?.response?.status;
      if (code === 401) {
        toast.error("Iniciá sesión para ver tu lista de deseos");
        navigate("/login");
      } else {
        toast.error("No se pudo cargar la lista de deseos");
        setStatus("error");
      }
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

  // ─── Checkbox ────────────────────────────────────────────────────────────────

  const toggleCheck = (productId) => {
    setProductos((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, checked: !p.checked } : p
      )
    );
  };

  // ─── Eliminar item ───────────────────────────────────────────────────────────

  const eliminarProducto = async (productId) => {
    if (removingId) return;

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

  // Total considera precio × cantidad (fix CodeRabbit)
  const total = seleccionados.reduce(
    (acc, p) => acc + p.precio * p.cantidad,
    0
  );

  // ─── Cupón ───────────────────────────────────────────────────────────────────

  const aplicarCupon = () => {
    if (!cupon.trim()) {
      toast.error("Ingresá un cupón");
      return;
    }
    toast.success("Cupón aplicado");
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

        <h1 className="text-3xl font-bold text-[#2f3e39] mb-8">
          Lista de deseos
        </h1>

        {productos.length === 0 ? (
          <p className="text-gray-500 text-[14px]">
            Tu lista de deseos está vacía.{" "}
            <button
              className="underline text-[#2f3e39]"
              onClick={() => navigate("/busqueda")}
            >
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

                    {/* placeholder imagen */}
                    <div className="w-[110px] h-[80px] rounded-md bg-[#E8DCCB]" />

                    <div>
                      <h2 className="font-semibold text-[17px]">
                        {producto.nombre}
                      </h2>

                      <div className="mt-1 text-gray-500 text-[13px]">
                        Cantidad: {producto.cantidad}
                      </div>

                      <div className="mt-1 font-semibold text-[18px]">
                        Gs.{" "}
                        {typeof producto.precio === "number"
                          ? producto.precio.toLocaleString()
                          : "-"}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {producto.checked ? (
                      <span className="text-gray-500 text-[13px]">Seleccionado</span>
                    ) : (
                      <span className="text-gray-400 text-[13px]">No seleccionado</span>
                    )}

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
                  <p className="text-gray-500 text-[13px]">
                    No hay productos seleccionados
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {seleccionados.map((p) => (
                      <div
                        key={p.itemId}
                        className="flex justify-between text-[14px]"
                      >
                        <span>{p.nombre}</span>
                        {/* precio × cantidad (fix CodeRabbit) */}
                        <span>
                          Gs.{" "}
                          {typeof p.precio === "number"
                            ? (p.precio * p.cantidad).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                    ))}

                    <div className="border-t pt-3 mt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>Gs. {total.toLocaleString()}</span>
                    </div>

                    {/* cupón */}
                    <div className="mt-4">
                      <p className="text-[14px] font-semibold mb-2">
                        Cupón de descuento
                      </p>
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

          </div>
        )}
      </div>
    </div>
  );
}