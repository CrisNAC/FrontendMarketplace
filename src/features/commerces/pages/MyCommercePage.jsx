import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Star, MessageSquare, AlertCircle, Info, Send, ArrowLeft } from "lucide-react";
import { Topbar } from "../components/dashboard/Topbar";
import { StatCard } from "../components/dashboard/StatCard";
import { BestRatedSection } from "../components/dashboard/BestRatedSection";
import { MostSoldSection } from "../components/dashboard/MostSoldSection";
import { apiClient } from "../services/editCommerceApi";
import { fetchStoreDashboard } from "../services/commerceDashboardApi";

export const MyCommercePage = () => {
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dashboardLoading, setDashboardLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const sessionRes = await apiClient.get("/api/session/user-session");
                const idStore = sessionRes.data?.user?.id_store;

                if (!idStore) {
                    setError("No tenés un comercio registrado.");
                    return;
                }

                const [storeRes, dashboardRes] = await Promise.allSettled([
                    apiClient.get(`/api/commerces/my/${idStore}`),
                    fetchStoreDashboard(idStore),
                ]);

                if (storeRes.status === "fulfilled") {
                    setStore(storeRes.value.data);
                } else {
                    const status = storeRes.reason?.response?.status;
                    if (status === 404) {
                        navigate("/crear-comercio");
                        return;
                    }
                    setError(storeRes.reason?.response?.data?.message || "No se pudo cargar el comercio.");
                }

                if (dashboardRes.status === "fulfilled") {
                    setDashboard(dashboardRes.value);
                }
                // Tanto si falla como si no, marcar como terminado:
                setDashboardLoading(false);

            } catch (err) {
                setError(err.response?.data?.message || "No se pudo conectar con el servidor.");
            } finally {
                setLoading(false);
                setDashboardLoading(false);
            }
        };

        fetchStore();
    }, [navigate]);

    if (loading) return <p style={{ color: "#6b7280", padding: "16px" }}>Cargando...</p>;

    if (error) return (
        <div style={{
            backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
            borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px",
        }}>
            {error}
        </div>
    );

    return (
        <>
            <button
                onClick={() => navigate("/")}
                style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#6b7280", fontSize: "14px", padding: "0 0 16px 0",
                }}
            >
                <ArrowLeft size={16} />
                Volver al inicio
            </button>

            <Topbar storeName={store?.name} />

            {/* Banners de estado */}
            {store?.store_status === "INACTIVE" && (
                <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "16px", marginBottom: "24px", color: "#92400e", display: "flex", alignItems: "center", gap: "12px" }}>
                    <Info size={24} />
                    <div>
                        <strong style={{ display: "block", fontSize: "15px", marginBottom: "4px" }}>Comercio en revisión</strong>
                        <span style={{ fontSize: "14px" }}>Tu comercio está pendiente de aprobación por un administrador. Podés seguir configurando tu catálogo, pero no estará visible al público hasta ser aprobado.</span>
                    </div>
                </div>
            )}

            {store?.store_status === "SUSPENDED" && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "16px", marginBottom: "24px", color: "#991b1b", display: "flex", alignItems: "center", gap: "12px" }}>
                    <AlertCircle size={24} />
                    <div>
                        <strong style={{ display: "block", fontSize: "15px", marginBottom: "4px" }}>Comercio no aprobado o suspendido</strong>
                        <span style={{ fontSize: "14px" }}>Tu comercio ha sido rechazado o suspendido y no está visible al público. Revisá tus notificaciones para más detalles o comunicate con soporte.</span>
                    </div>
                </div>
            )}

            {store?.store_status === "SUSPENDED" && (
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", marginTop: "-12px", marginBottom: "24px" }}>
                    <button
                        type="button"
                        onClick={() => navigate("/comercio/editar")}
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "none", borderRadius: "8px", backgroundColor: "#991b1b", color: "white", padding: "8px 12px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                    >
                        <Send size={14} />
                        Editar Comercio para Revisión
                    </button>
                </div>
            )}

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                <StatCard
                    title="Productos Activos"
                    value={dashboard?.stats?.activeProducts ?? store?.products?.length ?? 0}
                    icon={Package}
                    iconColor="#16a34a"
                />
                <StatCard
                    title="Calificación Promedio"
                    value={dashboard?.stats?.averageRating != null
                        ? `${dashboard.stats.averageRating} ★`
                        : "—"}
                    icon={Star}
                    iconColor="#f59e0b"
                />
                <StatCard
                    title="Total Reseñas"
                    value={dashboard?.stats?.totalReviews ?? "—"}
                    icon={MessageSquare}
                    iconColor="#3b82f6"
                />
            </div>

            {/* Secciones */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <BestRatedSection products={dashboard?.topRated ?? []} loading={dashboardLoading} />
                <MostSoldSection products={dashboard?.topSelling ?? []} loading={dashboardLoading} />
            </div>
        </>
    );
};