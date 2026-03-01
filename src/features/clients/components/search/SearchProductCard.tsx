type Props = {
    name: string;
    price: string;
    imageUrl?: string;
};

export const SearchProductCard = ({ name, price, imageUrl }: Props) => {
    return (
        <div className="bg-[#FEF7FF] h-80 rounded-xl border border-solid border-[#CAC4D0] flex flex-col overflow-hidden">
            {/* Image area */}
            <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#f0eaf5]">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-[#e8e0f0]" />
                )}
            </div>

            {/* Info */}
            <div className="px-3 pt-2 pb-3 shrink-0">
                <p className="text-sm font-semibold leading-snug mb-1 text-black">{name}</p>
                <p className="text-xs text-gray-500 mb-2">Desde Gs. {price}</p>
                <button className="w-full py-1.5 rounded-lg text-sm text-neutral-100 bg-[#6B9080] border border-solid border-[#658D7B] hover:bg-[#5a7a6b] transition-colors">
                    Ver Ofertas
                </button>
            </div>
        </div>
    );
};