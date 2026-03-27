import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import { SidebarClientProfile } from "../../../components/SidebarClientProfile";
import { mergeWishlistLinesIntoLocalCart } from "../../../lib/cartLocalStorage";

const VERDE = "#8BB2A1";
const AZUL = "#6487B9";

export default function FavoritesPage() {
  const navigate = useNavigate();

  const apiBase = useMemo(() => {
    return (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  }, []);

  const [status, setStatus] = useState("idle");
  const [userId, setUserId] = useState(null);
  const [productos, setProductos] = useState([]);
  const [refreshingList, setRefreshingList] = useState(false);
  const [addingAllToCart, setAddingAllToCart] = useState(false);

  const fetchFavorites = useCallback(async (uid) => {
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
        }))
      );
      return true;
    } catch (e) {
      const code = e?.response?.status;
      if (code === 401) {
        toast.error("Iniciá sesión para ver tus favoritos");
        navigate("/login");
      } else {
        toast.error("No se pudo cargar la lista de favoritos");
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
          toast.error("Iniciá sesión para ver tus favoritos");
          navigate("/login");
          return;
        }

        setUserId(uid);
        const ok = await fetchFavorites(uid);
        setStatus(ok ? "idle" : "error");
      } catch (e) {
        const code = e?.response?.status;
        if (code === 401) {
          toast.error("Iniciá sesión para ver tus favoritos");
          navigate("/login");
        } else {
          setStatus("error");
        }
      }
    };

    init();
  }, [apiBase, fetchFavorites, navigate]);

  const actualizarFavoritos = async () => {
    if (!userId || refreshingList) return;
    setRefreshingList(true);
    try {
      const ok = await fetchFavorites(userId);
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

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#E5EAE9] flex items-center justify-center">
        <p className="text-gray-500 text-[14px]">Cargando lista de favoritos...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#E5EAE9] flex items-center justify-center">
        <p className="text-red-500 text-[14px]">No se pudo cargar la lista de favoritos.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5EAE9] py-10">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-[#2f3e39] mb-8">Lista de Favoritos</h1>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <aside className="w-full md:w-[240px] shrink-0">
            <SidebarClientProfile />
          </aside>

          <section className="flex-1 w-full">
            {productos.length === 0 ? (
              <p className="text-gray-500 text-[14px]">
                Tu lista de favoritos está vacía.{" "}
                <button className="underline text-[#2f3e39]" onClick={() => navigate("/busqueda")}>
                  Explorá productos
                </button>
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-8">
                  {productos.map((producto) => (
                    <article key={producto.itemId} className="w-[190px]">
                      <div className="bg-white border border-[#d7dddc] rounded-md p-3">
                        <div className="w-full h-[140px] rounded-md bg-[#E8DCCB]" />
                      </div>
                      <h2 className="mt-3 font-semibold text-[14px] text-[#2f3e39] line-clamp-2">
                        {producto.nombre}
                      </h2>
                      <p className="text-[12px] text-gray-500 mt-1">
                        Gs. {typeof producto.precio === "number" ? producto.precio.toLocaleString() : "-"}
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/producto-detalle/${producto.productId}`)}
                        className="mt-3 px-5 py-2 rounded-full text-white text-[12px] font-medium hover:opacity-90"
                        style={{ backgroundColor: AZUL }}
                      >
                        Ver mas
                      </button>
                    </article>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={actualizarFavoritos}
                    disabled={refreshingList}
                    className="px-5 py-2 rounded-full text-white text-[13px] font-medium disabled:opacity-60 hover:opacity-90"
                    style={{ backgroundColor: VERDE }}
                  >
                    {refreshingList ? "Actualizando..." : "Actualizar Favoritos"}
                  </button>
                  <button
                    type="button"
                    onClick={compartirFavoritos}
                    className="px-5 py-2 rounded-full text-white text-[13px] font-medium hover:opacity-90"
                    style={{ backgroundColor: VERDE }}
                  >
                    Compartir Favoritos
                  </button>
                  <button
                    type="button"
                    onClick={agregarTodoAlCarrito}
                    disabled={addingAllToCart}
                    className="px-5 py-2 rounded-full text-white text-[13px] font-medium disabled:opacity-60 hover:opacity-90"
                    style={{ backgroundColor: VERDE }}
                  >
                    {addingAllToCart ? "Agregando..." : "Agregar todo al Carrito"}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
