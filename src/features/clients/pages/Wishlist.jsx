import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { SidebarClientProfile } from "../../../components/SidebarClientProfile";
import WishlistStoreSection from "../components/wishlist/WishlistStoreSection";
import WishlistSummaryCard from "../components/wishlist/WishlistSummaryCard";
import { wishlistMockData } from "../mocks/wishlistMockData";

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState(wishlistMockData);
  const [cartByStore, setCartByStore] = useState({});

  const groupedByStore = useMemo(() => {
    return wishlistItems.reduce((acc, item) => {
      if (!acc[item.storeId]) {
        acc[item.storeId] = {
          storeId: item.storeId,
          storeName: item.storeName,
          items: [],
        };
      }
      acc[item.storeId].items.push(item);
      return acc;
    }, {});
  }, [wishlistItems]);

  const stores = Object.values(groupedByStore);

  const handleViewMore = (item) => {
    navigate(`/producto-detalle/${item.productId}`);
  };

  const handleRemove = (item) => {
    setWishlistItems((prev) => prev.filter((x) => x.id !== item.id));
    setCartByStore((prev) => {
      const next = { ...prev };
      if (next[item.storeId]) {
        const setIds = new Set(next[item.storeId]);
        setIds.delete(item.id);
        next[item.storeId] = setIds;
      }
      return next;
    });
    toast.success("Producto eliminado de la wishlist");
  };

  const handleAddToCart = (item) => {
    setCartByStore((prev) => {
      const current = prev[item.storeId] ?? new Set();
      if (current.has(item.id)) return prev;
      const nextSet = new Set(current);
      nextSet.add(item.id);
      return { ...prev, [item.storeId]: nextSet };
    });
    toast.success(`Agregado al carrito de ${item.storeName}`);
  };

  const handleAddAllStoreToCart = (storeId) => {
    const store = groupedByStore[storeId];
    if (!store) return;

    setCartByStore((prev) => {
      const current = prev[storeId] ?? new Set();
      const nextSet = new Set(current);
      store.items.forEach((item) => nextSet.add(item.id));
      return { ...prev, [storeId]: nextSet };
    });
    toast.success(`Todos los productos de ${store.storeName} fueron agregados`);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#E5EAE9] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-[#2f3e39] mb-8">Lista de deseos</h1>
          <div className="bg-[#F3F5F4] border border-[#C7D6CF] rounded-xl p-10 text-center">
            <p className="text-[18px] text-[#4f615b] font-medium">Tu wishlist esta vacia</p>
            <p className="text-[14px] text-gray-500 mt-2">
              Guarda productos de tecnologia, moda, hogar, arte, salud y mucho mas.
            </p>
            <button
              type="button"
              onClick={() => navigate("/busqueda")}
              className="mt-5 px-6 py-3 rounded-full text-white text-[14px] font-medium bg-[#8BB2A1] hover:opacity-90"
            >
              Explorar productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E5EAE9] py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between gap-3 mb-8">
          <h1 className="text-4xl font-bold text-[#2f3e39]">Lista de deseos</h1>
          <span className="px-4 py-1 rounded-full bg-[#8BB2A1] text-white text-[13px] font-semibold">
            {wishlistItems.length} productos guardados
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-6 items-start">
          <aside className="w-full">
            <SidebarClientProfile />
          </aside>

          <main className="w-full">
            {stores.map((store) => (
              <WishlistStoreSection
                key={store.storeId}
                storeName={store.storeName}
                storeId={store.storeId}
                items={store.items}
                cartByStore={cartByStore}
                onViewMore={handleViewMore}
                onAddToCart={handleAddToCart}
                onAddAllStoreToCart={handleAddAllStoreToCart}
                onRemove={handleRemove}
              />
            ))}
          </main>

          <WishlistSummaryCard
            totalItems={wishlistItems.length}
            storeCount={stores.length}
            cartByStore={cartByStore}
          />
        </div>
      </div>
    </div>
  );
}