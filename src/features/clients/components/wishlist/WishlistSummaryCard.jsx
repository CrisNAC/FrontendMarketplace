export default function WishlistSummaryCard({
  totalLists,
  totalItems,
  showCreateForm,
  onToggleCreateForm,
  newListName,
  onListNameChange,
  onCreateList,
  creatingList,
  onAddAllToCart,
  addingAllToCart,
}) {
  return (
    <div className="bg-[#f0f2f1] border border-gray-200 px-4 py-3 rounded-sm flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-black text-[15px]">Mis listas</span>
        <span className="text-sm text-gray-500">
          <strong className="text-gray-800">{totalLists}</strong> lista{totalLists !== 1 ? "s" : ""} · <strong className="text-gray-800">{totalItems}</strong> producto{totalItems !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {showCreateForm && (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newListName}
              onChange={(e) => onListNameChange(e.target.value)}
              placeholder="Nombre de la lista"
              aria-label="Nombre de la nueva lista"
              className="border border-[#C7D6CF] rounded-full px-4 py-1.5 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#8BB2A1] w-56"
              maxLength={50}
            />
            <button
              type="button"
              onClick={onCreateList}
              disabled={creatingList}
              className="px-3 py-1.5 rounded-full text-white text-[12px] font-medium bg-[#2d4030] hover:opacity-90 disabled:opacity-60"
            >
              {creatingList ? "Creando..." : "Crear"}
            </button>
          </div>
        )}
        {totalItems > 0 && (
          <button
            type="button"
            onClick={onAddAllToCart}
            disabled={addingAllToCart}
            className="px-3 py-1.5 rounded-full text-white text-[12px] font-medium bg-[#6487B9] hover:opacity-90 disabled:opacity-60"
          >
            {addingAllToCart ? "Agregando..." : "Agregar todo al carrito"}
          </button>
        )}
        <button
          type="button"
          onClick={onToggleCreateForm}
          className="px-3 py-1.5 rounded-full text-white text-[12px] font-medium bg-[#8BB2A1] hover:opacity-90"
        >
          {showCreateForm ? "Cancelar" : "Nueva lista"}
        </button>
      </div>
    </div>
  );
}