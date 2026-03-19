import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const VERDE = "#8BB2A1";
const API = (import.meta.env.VITE_API_URL || "http://localhost:3000").trim().replace(/\/$/, "");

export default function Wishlist() {
  const [cupon, setCupon] = useState("");
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  // Cargar sesión y wishlist al montar
  useEffect(() => {
    const init = async () => {
      try {
        const sessionRes = await axios.get(`${API}/api/session/user-session`, {
          withCredentials: true,
        });
        const id = sessionRes.data?.user?.id_user;
        if (!id) {
          setLoading(false);
          return;
        }
        setUserId(id);
        await fetchWishlist(id);
      } catch {
        setLoading(false);
      }
    };
    init();
  }, []);

  const fetchWishlist = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/users/${id}/wishlist`, {
        withCredentials: true,
      });
      // El backend devuelve { id, name, items: [{ id, quantity, product: { id, name, price } }] }
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
    } catch {
      toast.error("No se pudo cargar la lista de deseos");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleCheck = (itemId) => {
    setProductos((prev) =>
      prev.map((p) => (p.itemId === itemId ? { ...p, checked: !p.checked } : p))
    );
  };

  const eliminarItem = async (productId, itemId) => {
    if (!userId || removingId) return;
    try {
      setRemovingId(itemId);
      await axios.delete(`${API}/api/users/${userId}/wishlist/items/${productId}`, {
        withCredentials: true,
      });
      setProductos((prev) => prev.filter((p) => p.itemId !== itemId));
      toast.success("Producto eliminado de la lista");
    } catch {
      toast.error("No se pudo eliminar el producto");
    } finally {
      setRemovingId(null);
    }
  };

  const seleccionados = productos.filter((p) => p.checked);
  const total = seleccionados.reduce((acc, p) => acc + p.precio, 0);

  const aplicarCupon = () => {
    if (!cupon) {
      toast.error("Ingresa un cupón");
      return;
    }
    toast.success("Cupón aplicado");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E5EAE9] flex items-center justify-center">
        <p className="text-[#2f3e39] text-[15px]">Cargando lista de deseos...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#E5EAE9] flex items-center justify-center">
        <p className="text-[#2f3e39] text-[15px]">
          Iniciá sesión para ver tu lista de deseos.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5EAE9] py-10">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#2f3e39] mb-8">Lista de deseos</h1>

        {productos.length === 0 ? (
          <p className="text-gray-500 text-[14px]">No tenés productos en tu lista de deseos.</p>
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
                      onChange={() => toggleCheck(producto.itemId)}
                      className="w-5 h-5 cursor-pointer"
                    />

                    {/* placeholder de imagen */}
                    <div className="w-[110px] h-[80px] rounded-md bg-[#E8DCCB]" />

                    <div>
                      <h2 className="font-semibold text-[17px]">{producto.nombre}</h2>
                      <div className="mt-1 text-gray-500 text-[12px]">
                        Cantidad: {producto.cantidad}
                      </div>
                      <div className="mt-2 font-semibold text-[18px]">
                        $ {producto.precio.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-gray-500 text-[13px]">
                      {producto.checked ? "Seleccionado" : "No seleccionado"}
                    </div>
                    <button
                      onClick={() => eliminarItem(producto.productId, producto.itemId)}
                      disabled={removingId === producto.itemId}
                      className="text-red-400 hover:text-red-600 text-[12px] disabled:opacity-50"
                    >
                      {removingId === producto.itemId ? "Eliminando..." : "Eliminar"}
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
                      <div key={p.itemId} className="flex justify-between text-[14px]">
                        <span>{p.nombre}</span>
                        <span>$ {p.precio.toLocaleString()}</span>
                      </div>
                    ))}

                    <div className="border-t pt-3 mt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>$ {total.toLocaleString()}</span>
                    </div>

                    <div className="mt-4">
                      <p className="text-[14px] font-semibold mb-2">Cupón de descuento</p>
                      <div className="flex gap-2 w-full">
                        <input
                          type="text"
                          placeholder="Ingresa tu cupón"
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