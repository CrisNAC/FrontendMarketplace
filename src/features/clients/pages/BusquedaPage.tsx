import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { SearchFilterSidebar } from "../components/search/SearchFilterSidebar";
import { SearchProductCard } from "../components/search/SearchProductCard";
import { Pagination } from "../components/commerceProfile/Pagination";

type BackendProduct = {
    id_product: number;
    name: string;
    description?: string | null;
    price: string | number;
    is_offer?: boolean;
    offer_price?: string | number | null;
    original_price?: string | number | null;
    image_url?: string | null;
    imageUrl?: string | null;
    store?: { id_store: number; name: string };
};

type ProductCategory = {
    id: number;
    name: string;
};

type BackendProductsResponse = {
    products?: BackendProduct[];
    content?: BackendProduct[];
    pagination?: {
        totalProducts?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
    total_pages?: number;
    page?: number;
    size?: number;
    total_elements?: number;
};

type Props = {
    query?: string;
};

type PriceRange = {
    min: number | null;
    max: number | null;
};

function resolveApiAssetUrl(path: string | null | undefined, apiBase: string) {
    if (!path?.trim()) return undefined;

    const value = path.trim();
    if (/^https?:\/\//i.test(value)) return value;

    const base = apiBase.replace(/\/$/, "");
    return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
}

export const BusquedaPage = ({ query = "Todos los Productos" }: Props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [products, setProducts] = useState<BackendProduct[]>([]);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [categoryStatus, setCategoryStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState("");
    const [categoriesError, setCategoriesError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [priceRange, setPriceRange] = useState<PriceRange>({
        min: null,
        max: null,
    });

    const apiBase = useMemo(() => {
        return (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
    }, []);

    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const categoryIdFromUrl = searchParams.get("categoryId") || "";
    const categoryName = searchParams.get("categoryName") || "";
    const search = searchParams.get("search") || "";
    const parsedUrlCategoryId = Number(categoryIdFromUrl);
    const initialCategoryId =
        Number.isInteger(parsedUrlCategoryId) && parsedUrlCategoryId > 0
            ? parsedUrlCategoryId
            : null;
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(initialCategoryId);
    const isOffersPage =
        location.pathname === "/ofertas" ||
        searchParams.get("isOffer") === "true" ||
        searchParams.get("isOffer") === "1";

    useEffect(() => {
        setSelectedCategoryId(initialCategoryId);
    }, [initialCategoryId]);

    const selectedCategoryName = useMemo(
        () => categories.find((cat) => cat.id === selectedCategoryId)?.name || "",
        [categories, selectedCategoryId]
    );

    const title = isOffersPage
        ? selectedCategoryName || categoryName
            ? `Ofertas en ${selectedCategoryName || categoryName}`
            : search
                ? `Ofertas para: ${search}`
                : "Ofertas"
        : selectedCategoryName || categoryName
            ? `Resultado de Busqueda para: ${selectedCategoryName || categoryName}`
            : search
                ? `Resultado de Busqueda para: ${search}`
                : `Resultado de Busqueda para: ${query}`;

    useEffect(() => {
        setPage(1);
    }, [selectedCategoryId, isOffersPage, priceRange.max, priceRange.min, search]);

    useEffect(() => {
        let isActive = true;
        const controller = new AbortController();
        const resolvedApiBase = apiBase || "http://localhost:3000";

        const loadCategories = async () => {
            try {
                setCategoryStatus("loading");
                setCategoriesError("");

                const response = await fetch(`${resolvedApiBase}/api/categories/products`, {
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP ${response.status}`);
                }

                const data = await response.json();
                const list = Array.isArray(data)
                    ? data
                          .map((item) => ({
                              id: Number(item?.id),
                              name: String(item?.name || "").trim(),
                          }))
                          .filter((item) => Number.isInteger(item.id) && item.id > 0 && item.name)
                    : [];

                if (!isActive) return;
                setCategories(list);
                setCategoryStatus("success");
            } catch (e: any) {
                if (e?.name === "AbortError") return;
                if (!isActive) return;
                setCategories([]);
                setCategoryStatus("error");
                setCategoriesError(e instanceof Error ? e.message : "No se pudieron cargar categorías.");
            }
        };

        loadCategories();
        return () => {
            isActive = false;
            controller.abort();
        };
    }, [apiBase]);

    useEffect(() => {
        let isActive = true;
        const controller = new AbortController();
        const resolvedApiBase = apiBase || "http://localhost:3000";

        const load = async () => {
            try {
                setStatus("loading");
                setError("");
                setProducts([]);

                const url = new URL(`${resolvedApiBase}/products/filter`);
                if (search) url.searchParams.set("search", search);
                if (selectedCategoryId !== null) {
                    url.searchParams.set("categoryId", String(selectedCategoryId));
                }
                if (isOffersPage) url.searchParams.set("isOffer", "true");
                if (priceRange.min !== null) {
                    url.searchParams.set("minPrice", String(priceRange.min));
                }
                if (priceRange.max !== null) {
                    url.searchParams.set("maxPrice", String(priceRange.max));
                }
                url.searchParams.set("page", String(page));
                url.searchParams.set("limit", "20");

                const res = await fetch(url.toString(), {
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) {
                    throw new Error(`Error HTTP ${res.status}`);
                }

                const data = (await res.json()) as BackendProductsResponse;
                const list = Array.isArray(data?.products)
                    ? data.products
                    : Array.isArray(data?.content)
                        ? data.content
                        : [];
                const tp =
                    Number(data?.pagination?.totalPages) ||
                    Number(data?.total_pages) ||
                    1;

                if (!isActive) return;
                setProducts(list);
                setTotalPages(tp);
                setStatus("success");
            } catch (e: any) {
                if (e?.name === "AbortError") return;
                if (!isActive) return;
                setProducts([]);
                setTotalPages(1);
                setStatus("error");
                setError(e instanceof Error ? e.message : "No se pudieron cargar productos.");
            }
        };

        load();

        return () => {
            isActive = false;
            controller.abort();
        };
    }, [apiBase, selectedCategoryId, isOffersPage, page, priceRange.max, priceRange.min, search]);

    const columns = useMemo(() => {
        const cols: BackendProduct[][] = [[], [], [], []];
        products.forEach((p, idx) => cols[idx % 4].push(p));
        return cols;
    }, [products]);

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "100%",
                backgroundColor: "#F3F3F3",
                paddingBottom: "44px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: "20px",
                    marginLeft: "25px",
                    marginTop: "16px",
                    gap: "4px",
                }}
            >
                <ArrowLeft
                    size={24}
                    style={{ cursor: "pointer", color: "#6b7280" }}
                    onClick={handleBack}
                />
                <span style={{ color: "#000000", fontSize: "25px", fontWeight: "bold" }}>
                    {title}
                </span>
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    width: "100%",
                    paddingLeft: "26px",
                    paddingRight: "26px",
                    gap: "28px",
                    marginBottom: "40px",
                    boxSizing: "border-box",
                }}
            >
                <div style={{ flexShrink: 0, width: "220px" }}>
                    <SearchFilterSidebar
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        onFiltersApply={({ min, max, categoryId }) => {
                            setPriceRange({ min, max });
                            setSelectedCategoryId(categoryId);
                            setPage(1);
                        }}
                    />
                    {categoryStatus === "error" && (
                        <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "8px" }}>
                            Error categorías: {categoriesError}
                        </div>
                    )}
                </div>

                {status === "loading" && (
                    <div style={{ color: "#6b7280" }}>Cargando productos...</div>
                )}
                {status === "error" && (
                    <div style={{ color: "#dc2626" }}>
                        No se pudieron cargar productos con este filtro{error ? `: ${error}` : "."}
                    </div>
                )}
                {status === "success" && products.length === 0 && (
                    <div style={{ color: "#6b7280" }}>No hay productos para ese filtro.</div>
                )}
                {columns.map((col, colIdx) => (
                    <div
                        key={colIdx}
                        style={{ display: "flex", flexDirection: "column", flex: 1, gap: "29px" }}
                    >
                        {col.map((product) => (
                            <SearchProductCard
                                key={product.id_product}
                                productId={product.id_product}
                                name={product.name}
                                price={product.price}
                                isOffer={product.is_offer}
                                offerPrice={product.offer_price}
                                originalPrice={product.original_price}
                                imageUrl={
                                    resolveApiAssetUrl(
                                        product.image_url ?? product.imageUrl ?? null,
                                        apiBase || "http://localhost:3000"
                                    ) || "https://placehold.co/600x600?text=Producto"
                                }
                            />
                        ))}
                    </div>
                ))}
            </div>

            <Pagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={setPage}
            />
        </div>
    );
};
