import { useEffect, useMemo, useState } from "react";

type Category = {
    id: number;
    name: string;
};

type Props = {
    onPriceApply?: (min: number, max: number) => void;
    onFiltersApply?: (filters: { min: number | null; max: number | null; categoryId: number | null }) => void;
    categories?: Category[];
    selectedCategoryId?: number | null;
};

export const SearchFilterSidebar = ({
    onPriceApply,
    onFiltersApply,
    categories = [],
    selectedCategoryId = null,
}: Props) => {
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [localCategoryId, setLocalCategoryId] = useState<number | null>(selectedCategoryId);

    useEffect(() => {
        setLocalCategoryId(selectedCategoryId ?? null);
    }, [selectedCategoryId]);

    const orderedCategories = useMemo(
        () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
        [categories]
    );

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(107, 144, 128, 0.2)",
            padding: "9px 12px",
            borderRadius: "10px",
            width: "100%",
            boxSizing: "border-box",
        }}>
            {/* Title */}
            <span style={{ color: "#000", fontSize: "20px", fontWeight: "bold", marginBottom: "21px", marginLeft: "13px" }}>
                Filtrar por
            </span>

            {/* Category title */}
            <span style={{ color: "#000", fontSize: "18px", fontWeight: "bold", marginBottom: "12px", marginLeft: "11px" }}>
                Categoría
            </span>

            {/* Category list */}
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "16px", width: "100%" }}>
                <label
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "3px 0 3px 4px",
                    }}
                >
                    <input
                        type="radio"
                        name="search-category-filter"
                        checked={localCategoryId === null}
                        onChange={() => setLocalCategoryId(null)}
                        style={{ cursor: "pointer", accentColor: "#6B9080" }}
                    />
                    <span style={{ color: "#464141", fontSize: "14px", fontWeight: "bold" }}>
                        Todas
                    </span>
                </label>
                {orderedCategories.map((cat) => (
                    <label
                        key={cat.id}
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            padding: "3px 0 3px 4px",
                        }}
                    >
                        <input
                            type="radio"
                            name="search-category-filter"
                            checked={localCategoryId === cat.id}
                            onChange={() => setLocalCategoryId(cat.id)}
                            style={{ cursor: "pointer", accentColor: "#6B9080" }}
                        />
                        <span style={{ color: "#464141", fontSize: "14px", fontWeight: "bold" }}>
                            {cat.name}
                        </span>
                    </label>
                ))}
            </div>

            {/* Price title */}
            <span style={{ color: "#000", fontSize: "18px", fontWeight: "bold", marginBottom: "8px", marginLeft: "11px" }}>
                Precio
            </span>

            {/* Price inputs */}
            <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "4px",
                marginBottom: "11px",
                marginLeft: "11px",
                width: "calc(100% - 22px)",
            }}>
                <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min={0}
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
                <span style={{ color: "#9ca3af", fontSize: "12px", flexShrink: 0 }}>—</span>
                <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min={0}
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

            {/* Apply button */}
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <button
                    onClick={() => {
                        const min = minPrice.trim() === "" ? null : Number(minPrice);
                        const max = maxPrice.trim() === "" ? null : Number(maxPrice);

                        if (Number.isNaN(min) || Number.isNaN(max)) {
                            alert("Precios inválidos");
                            return;
                        }

                        if ((min !== null && min <= 0) || (max !== null && max <= 0)) {
                            alert("Los precios deben ser mayores a 0");
                            return;
                        }

                        if (min !== null && max !== null && min > max) {
                            alert("El precio mínimo no puede ser mayor al máximo");
                            return;
                        }

                        onPriceApply?.(min ?? 0, max ?? 0);
                        onFiltersApply?.({
                            min,
                            max,
                            categoryId: localCategoryId,
                        });
                    }}
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
        </div>
    );
};