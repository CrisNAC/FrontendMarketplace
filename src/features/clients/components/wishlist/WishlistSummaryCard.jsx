export default function WishlistSummaryCard({ totalItems, storeCount, cartByStore }) {
  const cartLines = Object.values(cartByStore).reduce((acc, setIds) => acc + setIds.size, 0);

  return (
    <aside className="bg-[#F3F5F4] border border-[#C7D6CF] rounded-xl p-5">
      <h3 className="text-[18px] font-bold text-[#2f3e39] mb-4">Resumen Wishlist</h3>
      <div className="space-y-2 text-[14px] text-[#4f615b]">
        <p className="flex justify-between">
          <span>Productos guardados</span>
          <strong>{totalItems}</strong>
        </p>
        <p className="flex justify-between">
          <span>Tiendas involucradas</span>
          <strong>{storeCount}</strong>
        </p>
        <p className="flex justify-between">
          <span>Productos ya enviados al carrito</span>
          <strong>{cartLines}</strong>
        </p>
      </div>
    </aside>
  );
}
