import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import apiClient from "../../../lib/apiClient";
import { CategoryFilterSidebar } from "../components/commerceProfile/CategoryFilterSidebar";
import { CommerceProfileHeader } from "../components/commerceProfile/CommerceProfileHeader";
import { FeaturedProducts } from "../components/commerceProfile/FeaturedProducts";
import { Pagination } from "../components/commerceProfile/Pagination";

type Store = {
    id_store: number;
    name: string;
    description?: string | null;
    logo?: string | null;
    email?: string | null;
    phone?: string | null;
    average_rating?: number | null;
    total_reviews?: number | null;
    open_time?: string | null;
    close_time?: string | null;
    store_category?: { id_store_category: number; name: string };
    status?: boolean;
    addresses?: Array<{
        id_address?: number;
        address?: string | null;
        city?: string | null;
        region?: string | null;
        latitude?: number | string | null;
        longitude?: number | string | null;
    }>;
};

function resolveApiAssetUrl(path: string | null | undefined, apiBase: string): string | undefined {
    if (!path?.trim()) return undefined;
    const p = path.trim();
    if (/^https?:\/\//i.test(p)) return p;
    const base = apiBase.replace(/\/$/, "");
    return `${base}${p.startsWith("/") ? "" : "/"}${p}`;
}

function getRequestErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message;
        if (typeof msg === "string" && msg.trim()) return msg;
        return err.message;
    }
    if (err instanceof Error) return err.message;
    return "No se pudo cargar el comercio.";
}

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

        const load = async () => {
            try {
                setStatus("loading");
                setError("");

                const { data: storeData } = await apiClient.get<Store>(`/api/commerces/${storeId}`);

                if (!isActive) return;
                setStore(storeData);
                setPage(1);

                try {
                    const { data: productsData } = await apiClient.get<StoreProduct[]>(
                        `/api/commerces/products/${storeId}`
                    );
                    if (!isActive) return;
                    setProducts(Array.isArray(productsData) ? productsData : []);
                } catch (pe) {
                    if (axios.isAxiosError(pe) && pe.response?.status === 404) {
                        if (!isActive) return;
                        setProducts([]);
                    } else {
                        throw pe;
                    }
                }

                if (!isActive) return;
                setStatus("success");
            } catch (e: unknown) {
                if (axios.isCancel(e)) return;
                if (!isActive) return;
                setStore(null);
                setProducts([]);
                setStatus("error");
                setError(getRequestErrorMessage(e));
            }
        };

        load();

        return () => {
            isActive = false;
        };
    }, [storeId]);

    const headerName = store?.name || storeName || "Comercio";
    const headerCategory = store?.store_category?.name || "Comercio";
    const mainAddress = store?.addresses?.[0];
    const addressText = [mainAddress?.address, mainAddress?.city, mainAddress?.region]
        .filter(Boolean)
        .join(", ");
    const latitude = mainAddress?.latitude;
    const longitude = mainAddress?.longitude;

    const resolvedLogo = resolveApiAssetUrl(store?.logo ?? null, apiBase || "http://localhost:3000");
    const closesAt =
        store?.close_time != null && String(store.close_time).trim() !== ""
            ? String(store.close_time).trim()
            : "";

    const hasValidCoords =
        latitude !== null &&
        latitude !== undefined &&
        longitude !== null &&
        longitude !== undefined &&
        !Number.isNaN(Number(latitude)) &&
        !Number.isNaN(Number(longitude));

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
                isOpen={Boolean(store?.status)}
                rating={Number(store?.average_rating ?? 0)}
                reviews={Number(store?.total_reviews ?? 0)}
                closesAt={closesAt}
                logoUrl={resolvedLogo}
                phone={store?.phone || undefined}
                email={store?.email || undefined}
                address={addressText || undefined}
                latitude={hasValidCoords ? Number(latitude) : undefined}
                longitude={hasValidCoords ? Number(longitude) : undefined}
            />

            {/* Main content: sidebar + products */}
            <div style={{ display: "flex", flexDirection: "row", gap: "24px", padding: "40px 24px 24px 24px" }}>
                <CategoryFilterSidebar />
                {status === "loading" && <div style={{ color: "#6b7280" }}>Cargando productos...</div>}
                {status === "error" && (
                    <div style={{ color: "#dc2626" }}>{error}</div>
                )}
                {status === "success" && products.length === 0 && (
                    <div style={{ color: "#6b7280" }}>Este comercio aún no tiene productos publicados.</div>
                )}
                {status === "success" && products.length > 0 && (
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