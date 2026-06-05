// src/features/commerces/pages/CommerceDeliveryReviewsPage.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, Star, MessageSquare, Truck, TrendingUp, Phone, Mail, Search, Filter } from "lucide-react";
import { apiClient as commerceApiClient } from "../services/editCommerceApi";
import { getDeliveryReviewsErrorMessage, getStoreDeliveryReviews } from "../services/deliveryReviewsApi";
import { PageLoader } from "../../../components/PageLoader";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STAR_OPTIONS = [
    { label: "Todas las estrellas", value: "all" },
    { label: "5 estrellas", value: "5" },
    { label: "4 estrellas", value: "4" },
    { label: "3 estrellas", value: "3" },
    { label: "2 estrellas", value: "2" },
    { label: "1 estrella",  value: "1" },
];

function renderStars(rating) {
    return (
        <div style={{ display: "flex", gap: "2px" }}>
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={15} style={{ color: s <= rating ? "#fbbf24" : "#d1d5db", fill: s <= rating ? "#fbbf24" : "transparent" }} />
            ))}
        </div>
    );
}

function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function StatMini({ label, value, icon: Icon, iconColor }) {
    return (
        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 6px 0" }}>{label}</p>
            <p style={{ fontSize: "20px", fontWeight: "800", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon size={16} color={iconColor} />
                {value ?? "—"}
            </p>
        </div>
    );
}

function ReviewCard({ review }) {
    return (
        <article style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f0fdf4" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "10px" }}>
                <div>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: "0 0 3px 0" }}>
                        {review.customerName || "Cliente"}
                    </p>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                        Orden: ORD-{review.orderId}
                    </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {renderStars(review.rating)}
                    <p style={{ fontSize: "11px", color: "#9ca3af", margin: "4px 0 0 0" }}>
                        {formatDate(review.createdAt)}
                    </p>
                </div>
            </div>
            <p style={{ fontSize: "14px", color: "#374151", margin: 0, lineHeight: 1.6 }}>
                {review.comment?.trim() || "Sin comentario."}
            </p>
        </article>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function CommerceDeliveryReviewsPage() {
    const navigate  = useNavigate();
    const location  = useLocation();

    // Datos del delivery pasados por state desde la lista
    const [searchParams] = useSearchParams();
    const deliveryId   = searchParams.get("deliveryId") ? Number(searchParams.get("deliveryId")) : null;
    const deliveryData = location.state?.deliveryData ?? null;

    const [storeId, setStoreId]           = useState(null);
    const [loadingSession, setLoadingSession] = useState(true);
    const [reviews, setReviews]           = useState([]);
    const [total, setTotal]               = useState(0);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [error, setError]               = useState("");

    // Filtros
    const [orderSearch, setOrderSearch] = useState("");
    const [starFilter, setStarFilter]   = useState("all");

    // ── Sesión ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const loadSession = async () => {
            try {
                const res = await commerceApiClient.get("/api/session/user-session");
                const sid = res.data?.user?.id_store;
                if (!sid) { setError("No tenés un comercio registrado."); return; }
                setStoreId(sid);
            } catch {
                setError("No se pudo cargar la sesión.");
            } finally {
                setLoadingSession(false);
            }
        };
        loadSession();
    }, []);

    // ── Carga de reseñas ──────────────────────────────────────────────────────
    const fetchReviews = useCallback(async (filters = {}) => {
        if (!storeId || !deliveryId) return;
        setLoadingReviews(true);
        setError("");
        try {
            const data = await getStoreDeliveryReviews(storeId, deliveryId, filters);
            setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
            setTotal(Number(data?.total || 0));
        } catch (err) {
            setError(getDeliveryReviewsErrorMessage(err));
            setReviews([]);
            setTotal(0);
        } finally {
            setLoadingReviews(false);
        }
    }, [storeId, deliveryId]);

    // Auto-cargar al tener sesión
    useEffect(() => {
        if (!loadingSession && storeId && deliveryId) {
            fetchReviews();
        }
    }, [loadingSession, storeId, deliveryId, fetchReviews]);

    // ── Aplicar filtros ───────────────────────────────────────────────────────
    const handleApplyFilters = () => {
        const filters = {};
        if (orderSearch.trim()) filters.search = orderSearch.trim();
        if (starFilter !== "all") {
            filters.minRating = Number(starFilter);
            filters.maxRating = Number(starFilter);
        }
        fetchReviews(filters);
    };

    // ── Promedio local (para mostrar inmediatamente sin esperar) ──────────────
    const avgRating = useMemo(() => {
        if (!reviews.length) return null;
        const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews]);

    if (loadingSession) return <PageLoader />;

    // ── Redirección si llegaron sin state ─────────────────────────────────────
    if (!deliveryId) {
        return (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <p style={{ color: "#6b7280", marginBottom: "16px" }}>No se encontró información del repartidor.</p>
                <button type="button" onClick={() => navigate("/comercio/delivery")}
                    style={{ padding: "9px 20px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary-dark)", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                    Volver a Repartidores
                </button>
            </div>
        );
    }

    return (
        <>
            {/* ── Volver ── */}
            <button type="button" onClick={() => navigate("/comercio/delivery")}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", border: "none", backgroundColor: "transparent", color: "#6b7280", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "16px" }}>
                <ArrowLeft size={14} /> Volver a Repartidores
            </button>

            {/* ── Header ── */}
            <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontWeight: "700", margin: "0 0 4px 0", fontSize: "18px" }}>
                    Reseñas de {deliveryData?.user?.name ?? "Repartidor"}
                </h4>
                <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                    Calificaciones y comentarios de los clientes sobre este repartidor
                </p>
            </div>

            {/* ── Stats del delivery ── */}
            {deliveryData && (
                <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                    <StatMini
                        label="Calificación Promedio"
                        value={deliveryData.avgRating ?? avgRating ?? "—"}
                        icon={Star}
                        iconColor="#fbbf24"
                    />
                    <StatMini
                        label="Total Reseñas"
                        value={deliveryData.reviewCount}
                        icon={MessageSquare}
                        iconColor="#3b82f6"
                    />
                    <StatMini
                        label="Total Entregas"
                        value={deliveryData.completedDeliveries}
                        icon={Truck}
                        iconColor="#0f766e"
                    />
                    <StatMini
                        label="Tasa de Éxito"
                        value={deliveryData.successRate !== null ? `${deliveryData.successRate} %` : "—"}
                        icon={TrendingUp}
                        iconColor="#16a34a"
                    />
                </div>
            )}

            {/* ── Contacto ── */}
            {deliveryData && (
                <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "12px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "20px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", color: "#374151", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Phone size={13} color="#6b9080" /> {deliveryData.user?.phone || "—"}
                    </span>
                    <span style={{ fontSize: "13px", color: "#374151", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Mail size={13} color="#3b82f6" /> {deliveryData.user?.email || "—"}
                    </span>
                </div>
            )}

            {/* ── Filtros ── */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "16px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: 1, minWidth: "160px" }}>
                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", margin: "0 0 5px 0", textTransform: "uppercase" }}>Buscar por pedido</p>
                    <div style={{ position: "relative" }}>
                        <Search size={13} color="#9ca3af" style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)" }} />
                        <input
                            type="number"
                            min="1"
                            value={orderSearch}
                            onChange={e => setOrderSearch(e.target.value)}
                            placeholder="Nº de pedido"
                            style={{ width: "100%", padding: "7px 10px 7px 28px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                        />
                    </div>
                </div>
                <div>
                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", margin: "0 0 5px 0", textTransform: "uppercase" }}>Estrellas</p>
                    <select value={starFilter} onChange={e => setStarFilter(e.target.value)}
                        style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", color: "#374151", backgroundColor: "white", outline: "none", cursor: "pointer" }}>
                        {STAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <button type="button" onClick={handleApplyFilters} disabled={loadingReviews}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 16px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary-dark)", color: "white", fontSize: "13px", fontWeight: "600", cursor: loadingReviews ? "not-allowed" : "pointer", opacity: loadingReviews ? 0.7 : 1 }}>
                    <Filter size={13} /> {loadingReviews ? "Buscando..." : "Aplicar filtros"}
                </button>
            </div>

            {/* ── Error ── */}
            {error && (
                <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px", marginBottom: "16px" }}>
                    {error}
                </div>
            )}

            {/* ── Spinner ── */}
            {loadingReviews && <PageLoader />}

            {/* ── Lista de reseñas ── */}
            {!loadingReviews && !error && (
                <>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: "0 0 12px 0" }}>
                        Reseñas ({total})
                    </p>

                    {reviews.length === 0 ? (
                        <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "48px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                            <MessageSquare size={36} color="#d1d5db" style={{ marginBottom: "10px" }} />
                            <p style={{ margin: 0, color: "#6b7280" }}>No hay reseñas para los filtros aplicados.</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
                        </div>
                    )}
                </>
            )}

        </>
    );
}

export default CommerceDeliveryReviewsPage;