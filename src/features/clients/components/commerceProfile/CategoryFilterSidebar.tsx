import { useState } from "react";

type Category = {
    id: number;
    name: string;
};

type Props = {
    categories?: Category[];
    selectedCategoryId?: number | null;
    initialMinPrice?: number | null;
    initialMaxPrice?: number | null;
    onApply?: (filters: {
        categoryId: number | null;
        minPrice: number | null;
        maxPrice: number | null;
    }) => void;
};

export const CategoryFilterSidebar = ({
    categories = [],
    selectedCategoryId = null,
    initialMinPrice = null,
    initialMaxPrice = null,
    onApply,
}: Props) => {
    const [localCategoryId, setLocalCategoryId] = useState<number | null>(selectedCategoryId);
    const [minPrice, setMinPrice] = useState<string>(initialMinPrice != null ? String(initialMinPrice) : "");
    const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice != null ? String(initialMaxPrice) : "");

    return (
        <div style={{
            backgroundColor: "rgba(247, 200, 200, 0.28)",
            borderRadius: "16px",
            padding: "16px",
            minWidth: "200px",
            maxWidth: "200px",
            alignSelf: "flex-start",
        }}>
            <p style={{ fontWeight: "bold", marginBottom: "4px" }}>Filtrar por</p>
            <p style={{ fontWeight: "bold", marginBottom: "12px" }}>Categorías</p>

            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                <li
                    key="all-categories"
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                    }}
                >
                    <input
                        type="radio"
                        name="store-category-filter"
                        checked={localCategoryId === null}
                        onChange={() => setLocalCategoryId(null)}
                        style={{ cursor: "pointer", accentColor: "#944343" }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>Todas</span>
                </li>
                {categories.map((cat) => (
                    <li
                        key={cat.id}
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                        }}
                    >
                        <input
                            type="radio"
                            name="store-category-filter"
                            checked={localCategoryId === cat.id}
                            onChange={() => setLocalCategoryId(cat.id)}
                            style={{ cursor: "pointer", accentColor: "#944343" }}
                        />
                        <span style={{ fontSize: "14px", fontWeight: "600" }}>{cat.name}</span>
                    </li>
                ))}
            </ul>

            <p style={{ fontWeight: "bold", marginTop: "12px", marginBottom: "8px" }}>Precio</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    style={{ width: "100%", borderRadius: "6px", border: "1px solid #d1d5db", padding: "4px 6px" }}
                />
                <span style={{ color: "#9ca3af", fontSize: "12px" }}>-</span>
                <input
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    style={{ width: "100%", borderRadius: "6px", border: "1px solid #d1d5db", padding: "4px 6px" }}
                />
            </div>

            <button
                type="button"
                style={{
                    marginTop: "14px",
                    width: "100%",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#944343",
                    color: "white",
                    padding: "8px 10px",
                    cursor: "pointer",
                    fontWeight: 600,
                }}
                onClick={() => {
                    const resolvedMin = minPrice.trim() === "" ? null : Number(minPrice);
                    const resolvedMax = maxPrice.trim() === "" ? null : Number(maxPrice);
                    if ((resolvedMin !== null && resolvedMin < 0) || (resolvedMax !== null && resolvedMax < 0)) {
                        window.alert("Los precios no pueden ser negativos.");
                        return;
                    }
                    if (resolvedMin !== null && resolvedMax !== null && resolvedMin > resolvedMax) {
                        window.alert("El precio mínimo no puede ser mayor que el máximo.");
                        return;
                    }
                    onApply?.({
                        categoryId: localCategoryId,
                        minPrice: resolvedMin,
                        maxPrice: resolvedMax,
                    });
                }}
            >
                Aplicar
            </button>
        </div>
    );
};