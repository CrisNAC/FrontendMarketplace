import { formatGuarani } from "../../../../lib/formatGuarani.js";

export default function WishlistItemCard({ item, onViewMore, onAddToCart, onRemove }) {
  const { product, quantity } = item;

  return (
    <article className="bg-[#F3F5F4] border border-[#C7D6CF] rounded-xl p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <div className="flex gap-4 items-start">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-[110px] h-[90px] rounded-md object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-[110px] h-[90px] rounded-md bg-[#E8DCCB] shrink-0" />
        )}
        <div className="max-w-[520px]">
          <h3 className="text-[17px] font-semibold text-[#2f3e39]">{product.name}</h3>
          {product.isOffer && product.offerPrice !== null ? (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-[18px] font-bold text-[#2f3e39]">{formatGuarani(product.offerPrice)}</p>
              <p className="text-[13px] text-gray-400 line-through">{formatGuarani(product.originalPrice)}</p>
            </div>
          ) : (
            <p className="text-[18px] font-bold text-[#2f3e39] mt-2">{formatGuarani(product.price)}</p>
          )}
          <p className="text-[13px] text-[#60706a] mt-1">Cantidad guardada: {quantity}</p>
        </div>
      </div>

      <div className="flex md:flex-col gap-2 md:items-end">
        <button
          type="button"
          onClick={() => onViewMore(product.id)}
          className="px-5 py-2 rounded-full text-white text-[12px] font-medium hover:opacity-90 bg-[#6487B9]"
        >
          Ver más
        </button>
        <button
          type="button"
          onClick={() => onAddToCart(item)}
          className="px-3 py-2 rounded-full text-white text-[12px] font-medium hover:opacity-90 bg-[#8BB2A1]"
        >
          Agregar al carrito
        </button>
        <button
          type="button"
          onClick={() => onRemove(item)}
          className="px-5 py-2 rounded-full text-[12px] font-medium font-medium bg-red-500 text-white border border-red-200 hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}