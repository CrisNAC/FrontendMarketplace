import { useState } from "react";

const CATEGORIES = [
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

export const CategorySidebar = ({
    showCheckboxes = false,
    showPriceFilter = false,
    onPriceApply,
}) => {
    const [expandedCats, setExpandedCats] = useState(
        showCheckboxes ? ["Tecnologia"] : []
    );
    const [checkedSubs, setCheckedSubs] = useState(
        showCheckboxes ? ["Celulares y Tabletas"] : []
    );
    const [minPrice, setMinPrice] = useState("0");
    const [maxPrice, setMaxPrice] = useState("10000000");

    const toggleCategory = (name) => {
        setExpandedCats((prev) =>
            prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
        );
    };

    const toggleSub = (name) => {
        setCheckedSubs((prev) =>
            prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
        );
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: showCheckboxes
                    ? "rgba(107, 144, 128, 0.2)"
                    : "rgba(247, 200, 200, 0.28)",
                padding: "9px 12px",
                borderRadius: "10px",
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            {/* Title */}
            <span
                style={{
                    color: "#000",
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    marginLeft: "13px",
                }}
            >
                Filtrar por
            </span>

            {/* Category title */}
            <span
                style={{
                    color: "#000",
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "12px",
                    marginLeft: "11px",
                }}
            >
                Categorias
            </span>

            {/* Category list */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    marginBottom: "8px",
                    width: "100%",
                }}
            >
                {CATEGORIES.map((cat) => {
                    const isExpanded = expandedCats.includes(cat.name);
                    return (
                        <div key={cat.name} style={{ width: "100%" }}>
                            {/* Category row */}
                            <div
                                onClick={() => toggleCategory(cat.name)}
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: "4px",
                                    cursor: "pointer",
                                    padding: "3px 0 3px 4px",
                                }}
                            >
                                <span
                                    style={{
                                        color: "#6B9080",
                                        width: "14px",
                                        flexShrink: 0,
                                        fontSize: "13px",
                                    }}
                                >
                                    {isExpanded ? "▾" : "›"}
                                </span>
                                <span
                                    style={{
                                        color: "#464141",
                                        fontSize: "14px",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {cat.name}
                                </span>
                            </div>

                            {/* Subcategories with checkboxes */}
                            {showCheckboxes && isExpanded && cat.subcategories && (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        paddingLeft: "18px",
                                        marginBottom: "4px",
                                        gap: "3px",
                                    }}
                                >
                                    {cat.subcategories.map((sub) => (
                                        <label
                                            key={sub.name}
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                alignItems: "flex-start",
                                                gap: "6px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checkedSubs.includes(sub.name)}
                                                onChange={() => toggleSub(sub.name)}
                                                style={{
                                                    cursor: "pointer",
                                                    accentColor: "#6B9080",
                                                    flexShrink: 0,
                                                    marginTop: "2px",
                                                }}
                                            />
                                            <span
                                                style={{
                                                    color: "#000",
                                                    fontSize: "12px",
                                                    lineHeight: "1.4",
                                                }}
                                            >
                                                {sub.name}{" "}
                                                <span style={{ color: "#6b7280" }}>
                                                    ({sub.count})
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Price filter */}
            {showPriceFilter && (
                <>
                    <span
                        style={{
                            color: "#000",
                            fontSize: "18px",
                            fontWeight: "bold",
                            marginBottom: "8px",
                            marginLeft: "11px",
                        }}
                    >
                        Precio
                    </span>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "4px",
                            marginBottom: "11px",
                            marginLeft: "11px",
                            width: "calc(100% - 22px)",
                        }}
                    >
                        <input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            style={{
                                width: "100%",
                                fontSize: "12px",
                                border: "1px solid #cac4d0",
                                borderRadius: "4px",
                                padding: "4px",
                                textAlign: "center",
                                backgroundColor: "white",
                                boxSizing: "border-box",
                            }}
                            placeholder="Min"
                        />
                        <span
                            style={{
                                color: "#9ca3af",
                                fontSize: "12px",
                                flexShrink: 0,
                            }}
                        >
                            —
                        </span>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            style={{
                                width: "100%",
                                fontSize: "12px",
                                border: "1px solid #cac4d0",
                                borderRadius: "4px",
                                padding: "4px",
                                textAlign: "center",
                                backgroundColor: "white",
                                boxSizing: "border-box",
                            }}
                            placeholder="Max"
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            width: "100%",
                        }}
                    >
                        <button
                            onClick={() =>
                                onPriceApply?.(Number(minPrice), Number(maxPrice))
                            }
                            style={{
                                backgroundColor: "#6B9080",
                                color: "#f5f5f5",
                                fontSize: "15px",
                                padding: "6px 20px",
                                borderRadius: "10px",
                                border: "1px solid #658D7B",
                                cursor: "pointer",
                            }}
                        >
                            Aplicar
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};