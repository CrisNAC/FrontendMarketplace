export default function WishlistSummaryCard({ totalLists, totalItems }) {
  return (
    <aside className="bg-[#F3F5F4] border border-[#C7D6CF] rounded-xl p-5 sticky top-6">
      <h3 className="text-[18px] font-bold text-[#2f3e39] mb-4">Resumen</h3>
      <div className="space-y-2 text-[14px] text-[#4f615b]">
        <p className="flex justify-between">
          <span>Listas creadas</span>
          <strong>{totalLists}</strong>
        </p>
        <p className="flex justify-between">
          <span>Productos guardados</span>
          <strong>{totalItems}</strong>
        </p>
      </div>
    </aside>
  );
}