import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { CategoryFilterSidebar } from "../components/commerceProfile/CategoryFilterSidebar";
import { CommerceProfileHeader } from "../components/commerceProfile/CommerceProfileHeader";
import { FeaturedProducts } from "../components/commerceProfile/FeaturedProducts";
import { Pagination } from "../components/commerceProfile/Pagination";

type Store = {
    id_store: number;
    name: string;
    description?: string | null;
    logo?: string | null;
    store_category?: { id_store_category: number; name: string };
    status?: boolean;
};

type StoreProduct = {
    id_product: number;
    name: string;
    description?: string | null;
    price: string | number;
    visible?: boolean;
    product_category?: { id_product_category: number; name: string };
};

export const VistaComercioPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [store, setStore] = useState<Store | null>(null);
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const PRODUCTS_PER_PAGE = 12;

    const apiBase = useMemo(() => {
        return (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
    }, []);

    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const storeId = searchParams.get("storeId") || "";
    const storeName = searchParams.get("storeName") || "";

    const handleBack = () => {
        navigate(-1);
    };

    useEffect(() => {
        if (!storeId) return;

        let isActive = true;
        const controller = new AbortController();

        const load = async () => {
            try {
                setStatus("loading");
                setError("");

                const base = apiBase || "http://localhost:3000";

                const [storeRes, productsRes] = await Promise.all([
                    fetch(`${base}/api/commerces/${storeId}`, {
                        signal: controller.signal,
                        headers: { Accept: "application/json" },
                    }),
                    fetch(`${base}/api/commerces/products/${storeId}`, {
                        signal: controller.signal,
                        headers: { Accept: "application/json" },
                    }),
                ]);

                if (!storeRes.ok) {
                    throw new Error(`Error tienda HTTP ${storeRes.status}`);
                }
                if (!productsRes.ok) {
                    throw new Error(`Error productos HTTP ${productsRes.status}`);
                }

                const storeData = (await storeRes.json()) as Store;
                const productsData = (await productsRes.json()) as StoreProduct[];
                const list = Array.isArray(productsData) ? productsData : [];

                if (!isActive) return;
                setStore(storeData);
                setProducts(list);
                setPage(1);
                setStatus("success");
            } catch (e: any) {
                if (e?.name === "AbortError") return;
                if (!isActive) return;
                setStore(null);
                setProducts([]);
                setStatus("error");
                setError(e instanceof Error ? e.message : "No se pudo cargar el comercio.");
            }
        };

        load();

        return () => {
            isActive = false;
            controller.abort();
        };
    }, [apiBase, storeId]);

    const headerName = store?.name || storeName || "Comercio";
    const headerCategory = store?.store_category?.name || "Comercio";

    const totalPages =
        products.length > 0
            ? Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE))
            : 1;

    const pagedProducts = products.slice(
        (page - 1) * PRODUCTS_PER_PAGE,
        (page - 1) * PRODUCTS_PER_PAGE + PRODUCTS_PER_PAGE
    );

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--background-soft)" }}>

            {/* Breadcrumb */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", padding: "16px 24px" }}>
                <ArrowLeft
                    size={24}
                    style={{ cursor: "pointer", color: "#6b7280" }}
                    onClick={handleBack}  // ← AGREGAR
                />
                <h5 style={{ fontWeight: "bold", fontSize: "20px", margin: 0 }}>
                    Comercios / {headerName}
                </h5>
            </div>

            {/* Commerce profile banner */}
            <CommerceProfileHeader
                name={headerName}
                category={headerCategory}
                isOpen={true}
                rating={4.7}
                reviews={542}
                closesAt="20:00"
                logoUrl={store?.logo || undefined}
            />

            {/* Main content: sidebar + products */}
            <div style={{ display: "flex", flexDirection: "row", gap: "24px", padding: "40px 24px 24px 24px" }}>
                <CategoryFilterSidebar />
                {status === "loading" && <div style={{ color: "#6b7280" }}>Cargando productos...</div>}
                {status === "error" && (
                    <div style={{ color: "#dc2626" }}>
                        No se encontraron productos para esta tienda
                    </div>
                )}
                {status === "success" && (
                    <FeaturedProducts
                        products={pagedProducts.map((p) => ({
                            id: p.id_product,
                            name: p.name,
                            price: String(p.price),
                            imageUrl: "https://placehold.co/600x600?text=Producto",
                        }))}
                    />
                )}
            </div>

            {/* Pagination */}
            <Pagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={setPage}
            />
        </div>
    );
};