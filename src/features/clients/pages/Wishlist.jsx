import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import { PageLoader } from "../../../components/PageLoader";
import { EmptyState } from "../../../components/EmptyState";
import { ConfirmationModal } from "../components/cart/ConfirmationModal";
import toast from "react-hot-toast";

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

  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: "" });
  const [removeModal, setRemoveModal] = useState({ open: false, wishlistId: null, item: null });
  const [addAllModal, setAddAllModal] = useState(false);

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

  const handleDeleteList = (wishlistId, wishlistName) => {
    setDeleteModal({ open: true, id: wishlistId, name: wishlistName });
  };

  const doDeleteList = async () => {
    try {
      await deleteWishlist(userId, deleteModal.id);
      setWishlists((prev) => prev.filter((w) => w.id !== deleteModal.id));
      setDeleteModal({ open: false, id: null, name: "" });
      toast.success("Lista eliminada");
    } catch {
      toast.error("No se pudo eliminar la lista");
    }
  };

  const handleRemoveItem = (wishlistId, item) => {
    if (!item?.product?.id) return toast.error("Producto inválido");
    setRemoveModal({ open: true, wishlistId, item });
  };

  const doRemoveItem = async () => {
    const { wishlistId, item } = removeModal;
    try {
      await removeWishlistItem(userId, wishlistId, item.product.id);
      setWishlists((prev) =>
        prev.map((w) =>
          w.id === wishlistId
            ? { ...w, items: w.items.filter((i) => i.id !== item.id) }
            : w
        )
      );
      setRemoveModal({ open: false, wishlistId: null, item: null });
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

  if (status === "loading") return <PageLoader />;

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-[14px]">No se pudieron cargar las listas.</p>
      </div>
    );
  }

  const handleAddAllToCart = () => {
    const allItems = wishlists.flatMap((w) => w.items.map((i) => ({ ...i, wishlistId: w.id })));
    if (!allItems.length || addingAllToCart) return;
    setAddAllModal(true);
  };

  const confirmAddAllToCart = () => {
    setAddAllModal(false);
    doAddAllToCart();
  };

  const doAddAllToCart = async () => {
    const allItems = wishlists.flatMap((w) => w.items.map((i) => ({ ...i, wishlistId: w.id })));
    if (!allItems.length) return;
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
    <div className="max-w-[1100px] mx-auto w-full">
      <WishlistSummaryCard
            totalLists={wishlists.length}
            totalItems={totalItems}
            showCreateForm={showCreateForm}
            onToggleCreateForm={() => setShowCreateForm((v) => !v)}
            newListName={newListName}
            onListNameChange={setNewListName}
            onCreateList={handleCreateList}
            creatingList={creatingList}
            onAddAllToCart={handleAddAllToCart}
            addingAllToCart={addingAllToCart}
          />

          <main className="space-y-8">
            {wishlists.length === 0 ? (
              <EmptyState
                message="No tenés listas creadas"
                subtitle="Creá una lista y empezá a guardar productos."
              />
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
                    <EmptyState
                      message="Esta lista está vacía."
                      subtitle="Explorá productos y agregálos a tu lista."
                    />
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

      <ConfirmationModal
        isOpen={deleteModal.open}
        title="Eliminar lista"
        subtitle={`"${deleteModal.name}"`}
        warnings={[
          "Esta acción no se puede deshacer.",
          "Se eliminarán todos los productos guardados en esta lista.",
        ]}
        confirmText="Eliminar lista"
        loadingText="Eliminando..."
        onClose={() => setDeleteModal({ open: false, id: null, name: "" })}
        onConfirm={doDeleteList}
        icon={Trash2}
      />

      <ConfirmationModal
        isOpen={removeModal.open}
        title="Quitar producto"
        description="¿Querés quitar este producto de la lista?"
        confirmText="Quitar"
        loadingText="Quitando..."
        onClose={() => setRemoveModal({ open: false, wishlistId: null, item: null })}
        onConfirm={doRemoveItem}
        icon={Trash2}
      />

      <ConfirmationModal
        isOpen={addAllModal}
        title="Agregar todo al carrito"
        description={`Se agregarán ${totalItems} producto${totalItems !== 1 ? "s" : ""} al carrito y serán quitados de tus listas.`}
        confirmText="Agregar todo"
        variant="confirm"
        onClose={() => setAddAllModal(false)}
        onConfirm={confirmAddAllToCart}
        icon={ShoppingCart}
      />
    </div>
  );
}