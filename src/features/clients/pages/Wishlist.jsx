import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { SidebarClientProfile } from "../../../components/SidebarClientProfile";
import WishlistItemCard from "../components/wishlist/WishlistItemCard";
import WishlistSummaryCard from "../components/wishlist/WishlistSummaryCard";
import { addToCartApi } from "../../../lib/cartApi";
import { mergeCartResponseFromApi } from "../../../lib/cartLocalStorage";
import {
  getWishlists,
  getWishlistItems,
  createWishlist,
  deleteWishlist,
  removeWishlistItem,
} from "../services/wishlistService";

export default function Wishlist() {
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [userId, setUserId] = useState(null);
  const [wishlists, setWishlists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [addingAllToCart, setAddingAllToCart] = useState(false);

  const totalItems = wishlists.reduce((acc, w) => acc + (w.items?.length ?? 0), 0);

  const loadWishlists = useCallback(async (uid) => {
    try {
      const lists = await getWishlists(uid);
      const withItems = await Promise.all(
        lists.map(async (list) => {
          const detail = await getWishlistItems(uid, list.id);
          return { ...list, items: detail.items ?? [] };
        })
      );
      setWishlists(withItems);
    } catch {
      toast.error("No se pudieron cargar las listas");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await import("../../../lib/apiClient").then((m) =>
          m.default.get("/api/session/user-session")
        );
        const uid = res.data?.user?.id_user;
        if (!uid) {
          toast.error("Iniciá sesión para ver tu lista de deseos");
          navigate("/login");
          return;
        }
        setUserId(uid);
        await loadWishlists(uid);
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    };
    init();
  }, [loadWishlists, navigate]);

  const handleCreateList = async () => {
    const name = newListName.trim();
    if (!name) return toast.error("Ingresá un nombre para la lista");
    setCreatingList(true);
    try {
      await createWishlist(userId, name);
      setNewListName("");
      setShowCreateForm(false);
      await loadWishlists(userId);
      toast.success("Lista creada");
    } catch {
      toast.error("No se pudo crear la lista");
    } finally {
      setCreatingList(false);
    }
  };

  const handleDeleteList = async (wishlistId, wishlistName) => {
    if (!window.confirm(`¿Eliminár la lista "${wishlistName}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteWishlist(userId, wishlistId);
      setWishlists((prev) => prev.filter((w) => w.id !== wishlistId));
      toast.success("Lista eliminada");
    } catch {
      toast.error("No se pudo eliminar la lista");
    }
  };

  const handleRemoveItem = async (wishlistId, item) => {
    if (!item?.product?.id) return toast.error("Producto inválido");
    try {
      await removeWishlistItem(userId, wishlistId, item.product.id);
      setWishlists((prev) =>
        prev.map((w) =>
          w.id === wishlistId
            ? { ...w, items: w.items.filter((i) => i.id !== item.id) }
            : w
        )
      );
      toast.success("Producto eliminado de la lista");
    } catch {
      toast.error("No se pudo eliminar el producto");
    }
  };

  const handleAddToCart = async (wishlistId, item) => {
    if (!item?.product?.id) return toast.error("Producto inválido");
    try {
      const cart = await addToCartApi(userId, {
        productId: item.product.id,
        quantity: Math.max(1, Number(item.quantity) || 1),
      });
      mergeCartResponseFromApi(cart);
      await removeWishlistItem(userId, wishlistId, item.product.id);
      setWishlists((prev) =>
        prev.map((w) =>
          w.id === wishlistId
            ? { ...w, items: w.items.filter((i) => i.id !== item.id) }
            : w
        )
      );
      toast.success("Agregado al carrito");
    } catch (e) {
      const code = e?.response?.status;
      if (code === 401) {
        toast.error("Iniciá sesión para usar el carrito");
        navigate("/login");
      } else {
        toast.error("No se pudo agregar al carrito");
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#E5EAE9] flex items-center justify-center">
        <p className="text-gray-500 text-[14px]">Cargando listas de deseos...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-[#E5EAE9] flex items-center justify-center">
        <p className="text-red-500 text-[14px]">No se pudieron cargar las listas.</p>
      </div>
    );
  }

  const handleAddAllToCart = async () => {
    const allItems = wishlists.flatMap((w) => w.items.map((i) => ({ ...i, wishlistId: w.id })));
    if (!allItems.length || addingAllToCart) return;
    setAddingAllToCart(true);
    try {
      for (const item of allItems) {
        const cart = await addToCartApi(userId, {
          productId: item.product.id,
          quantity: Math.max(1, Number(item.quantity) || 1),
        });
        mergeCartResponseFromApi(cart);
        await removeWishlistItem(userId, item.wishlistId, item.product.id);
        setWishlists((prev) =>
          prev.map((w) =>
            w.id === item.wishlistId
              ? { ...w, items: w.items.filter((i) => i.product.id !== item.product.id) }
              : w
          )
        );
      }
      toast.success("Todos los productos agregados al carrito");
    } catch (e) {
      const code = e?.response?.status;
      if (code === 401) {
        toast.error("Iniciá sesión para usar el carrito");
        navigate("/login");
      } else {
        toast.error("No se pudieron agregar todos los productos");
      }
    } finally {
      setAddingAllToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5EAE9] py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-row justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold text-[#2f3e39]">Lista de deseos</h1>
          <div className="flex items-center gap-2">
            {showCreateForm && (
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nombre de la lista"
                  className="border border-[#C7D6CF] rounded-full px-4 py-2 text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#8BB2A1] w-[32rem]"
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={handleCreateList}
                  disabled={creatingList}
                  className="px-4 py-2 rounded-full text-white text-[13px] font-medium bg-[#2f3e39] hover:opacity-90 disabled:opacity-60"
                >
                  {creatingList ? "Creando..." : "Crear"}
                </button>
              </div>
            )}
            {totalItems > 0 && (
              <button
                type="button"
                onClick={handleAddAllToCart}
                disabled={addingAllToCart}
                className="px-4 py-2 rounded-full text-white text-[13px] font-medium bg-[#6487B9] hover:opacity-90 disabled:opacity-60"
              >
                {addingAllToCart ? "Agregando..." : "Agregar todo al carrito"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowCreateForm((v) => !v)}
              className="px-4 py-2 rounded-full text-white text-[13px] font-medium bg-[#8BB2A1] hover:opacity-90"
            >
              {showCreateForm ? "Cancelar" : "Nueva lista"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-6 items-start">
          <aside className="w-full">
            <SidebarClientProfile />
          </aside>

          <main className="w-full space-y-8">
            {wishlists.length === 0 ? (
              <div className="bg-[#F3F5F4] border border-[#C7D6CF] rounded-xl p-10 text-center">
                <p className="text-[18px] text-[#4f615b] font-medium">No tenés listas creadas</p>
                <p className="text-[14px] text-gray-500 mt-2">
                  Creá una lista y empezá a guardar productos.
                </p>
              </div>
            ) : (
              wishlists.map((wishlist) => (
                <section key={wishlist.id} className="bg-white border border-[#C7D6CF] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-[20px] font-bold text-[#2f3e39]">{wishlist.name}</h2>
                      <p className="text-[13px] text-[#60706a]">{wishlist.items.length} productos</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteList(wishlist.id, wishlist.name)}
                      className="px-4 py-1.5 rounded-full text-[12px] font-medium bg-red-500 text-white border border-red-200 hover:bg-red-50"
                    >
                      Eliminar lista
                    </button>
                  </div>

                  {wishlist.items.length === 0 ? (
                    <p className="text-[14px] text-gray-400">
                      Esta lista está vacía.{" "}
                      <button
                        className="underline text-[#2f3e39]"
                        onClick={() => navigate("/busqueda")}
                      >
                        Explorá productos
                      </button>
                    </p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {wishlist.items.map((item) => (
                        <WishlistItemCard
                          key={item.id}
                          item={item}
                          onViewMore={(productId) => navigate(`/producto-detalle/${productId}`)}
                          onAddToCart={(item) => handleAddToCart(wishlist.id, item)}
                          onRemove={(i) => handleRemoveItem(wishlist.id, i)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              ))
            )}
          </main>

          <WishlistSummaryCard
            totalLists={wishlists.length}
            totalItems={totalItems}
          />
        </div>
      </div>
    </div>
  );
}