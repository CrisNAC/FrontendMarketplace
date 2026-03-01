import { useState } from "react";

type Subcategory = {
    name: string;
    count: number;
};

type Category = {
    name: string;
    subcategories?: Subcategory[];
};

const CATEGORIES: Category[] = [
    {
        name: "Tecnologia",
        subcategories: [
            { name: "Celulares y Tabletas", count: 25 },
            { name: "Relojes inteligentes", count: 1 },
            { name: "Televisores", count: 5 },
            { name: "Audio", count: 3 },
            { name: "Cables", count: 7 },
            { name: "Pilas y Cargadores", count: 1 },
        ],
    },
    { name: "Moda" },
    { name: "Coleccionables y Arte" },
    { name: "Hogar y Jardin" },
    { name: "Salud y Belleza" },
    { name: "Entretenimiento" },
    { name: "Deportes" },
    { name: "Equipo Industrial" },
];

type Props = {
    onPriceApply?: (min: number, max: number) => void;
};

export const SearchFilterSidebar = ({ onPriceApply }: Props) => {
    const [expandedCats, setExpandedCats] = useState<string[]>(["Tecnologia"]);
    const [checkedSubs, setCheckedSubs] = useState<string[]>(["Celulares y Tabletas"]);
    const [minPrice, setMinPrice] = useState<string>("0");
    const [maxPrice, setMaxPrice] = useState<string>("10000000");

    const toggleCategory = (name: string) => {
        setExpandedCats((prev) =>
            prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
        );
    };

    const toggleSub = (name: string) => {
        setCheckedSubs((prev) =>
            prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
        );
    };

    return (
        <div
            className="flex flex-col items-start bg-[#6B908033] py-[9px] rounded-[10px] shrink-0"
            style={{ width: "220px" }}
        >
            {/* Title */}
            <span className="text-black text-xl font-bold mb-[21px] ml-[25px]">
                Filtrar por
            </span>

            {/* Category section */}
            <span className="text-black text-lg font-bold mb-3 ml-[11px]">
                Categoria
            </span>

            <div className="flex flex-col items-start mb-4 ml-2 w-full">
                {CATEGORIES.map((cat) => {
                    const isExpanded = expandedCats.includes(cat.name);
                    return (
                        <div key={cat.name} className="w-full">
                            {/* Category row */}
                            <div
                                className="flex flex-row items-center gap-1 cursor-pointer hover:opacity-75 transition-opacity ml-1 mb-1"
                                onClick={() => toggleCategory(cat.name)}
                            >
                                <span className="text-sm text-[#6B9080] w-4 shrink-0">
                                    {isExpanded ? "▾" : "›"}
                                </span>
                                <span className="text-[#464141] text-base font-bold">
                                    {cat.name}
                                </span>
                            </div>

                            {/* Subcategories */}
                            {isExpanded && cat.subcategories && (
                                <div className="flex flex-col ml-6 mb-2 gap-1">
                                    {cat.subcategories.map((sub) => (
                                        <label
                                            key={sub.name}
                                            className="flex flex-row items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checkedSubs.includes(sub.name)}
                                                onChange={() => toggleSub(sub.name)}
                                                className="cursor-pointer accent-[#6B9080] shrink-0"
                                            />
                                            <span className="text-black text-sm leading-tight">
                                                {sub.name}{" "}
                                                <span className="text-gray-500">({sub.count})</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Price section */}
            <span className="text-black text-lg font-bold mb-2 ml-[11px]">
                Precio
            </span>

            <div className="flex flex-row items-center gap-1 mb-[11px] ml-7" style={{ width: "180px" }}>
                <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full text-xs border border-[#cac4d0] rounded px-1 py-1 text-center bg-white"
                    placeholder="Min"
                />
                <span className="text-xs text-gray-400 shrink-0">—</span>
                <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full text-xs border border-[#cac4d0] rounded px-1 py-1 text-center bg-white"
                    placeholder="Max"
                />
            </div>

            <div className="flex flex-col items-center w-full">
                <button
                    className="bg-[#6B9080] text-neutral-100 text-base py-1.5 px-2.5 rounded-[10px] border border-solid border-[#658D7B] hover:bg-[#5a7a6b] transition-colors"
                    onClick={() => onPriceApply?.(Number(minPrice), Number(maxPrice))}
                >
                    Aplicar
                </button>
            </div>
        </div>
    );
};