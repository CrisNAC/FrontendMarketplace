import WishlistItemCard from "./WishlistItemCard";

export default function WishlistStoreSection({
  storeName,
  storeId,
  items,
  cartByStore,
  onViewMore,
  onAddToCart,
  onAddAllStoreToCart,
  onRemove,
}) {
  const addedInStore = cartByStore[storeId]?.size ?? 0;

  return (
    <section className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <h2 className="text-[20px] font-bold text-[#2f3e39]">{storeName}</h2>
          <p className="text-[13px] text-[#60706a]">
            {items.length} guardados - {addedInStore} en carrito de esta tienda
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAddAllStoreToCart(storeId)}
          className="px-5 py-2 rounded-full text-white text-[13px] font-medium hover:opacity-90 bg-[#8BB2A1] w-full sm:w-auto"
        >
          Agregar todos al carrito de esta tienda
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <WishlistItemCard
            key={item.id}
            item={item}
            isInStoreCart={Boolean(cartByStore[storeId]?.has(item.id))}
            onViewMore={onViewMore}
            onAddToCart={onAddToCart}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}
