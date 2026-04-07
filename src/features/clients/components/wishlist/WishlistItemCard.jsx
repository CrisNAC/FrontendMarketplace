import { formatGuarani } from "../../../../lib/formatGuarani.js";

export default function WishlistItemCard({
  item,
  isInStoreCart,
  onViewMore,
  onAddToCart,
  onRemove,
}) {
  return (
    <article className="bg-[#F3F5F4] border border-[#C7D6CF] rounded-xl p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <div className="flex gap-4 items-start">
        <img
          src={item.image}
          alt={item.name}
          className="w-[110px] h-[90px] rounded-md object-cover bg-[#E8DCCB]"
          loading="lazy"
        />
        <div className="max-w-[520px]">
          <p className="text-[11px] text-[#60706a] font-semibold uppercase tracking-wide">
            {item.category} - {item.storeName}
          </p>
          <h3 className="text-[17px] font-semibold text-[#2f3e39] mt-1">{item.name}</h3>
          <p className="text-[13px] text-gray-500 mt-1">{item.description}</p>
          <p className="text-[18px] font-bold text-[#2f3e39] mt-2">
            {formatGuarani(item.price)}
          </p>
        </div>
      </div>

      <div className="flex md:flex-col gap-2 md:items-end">
        <button
          type="button"
          onClick={() => onViewMore(item)}
          className="px-5 py-2 rounded-full text-white text-[12px] font-medium hover:opacity-90 bg-[#6487B9]"
        >
          Ver mas
        </button>
        <button
          type="button"
          onClick={() => onAddToCart(item)}
          disabled={isInStoreCart}
          className="px-5 py-2 rounded-full text-white text-[12px] font-medium disabled:opacity-60 hover:opacity-90 bg-[#8BB2A1]"
        >
          {isInStoreCart ? "Agregado" : "Agregar al carrito"}
        </button>
        <button
          type="button"
          onClick={() => onRemove(item)}
          className="px-5 py-2 rounded-full text-[12px] font-medium text-red-600 border border-red-200 hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}
