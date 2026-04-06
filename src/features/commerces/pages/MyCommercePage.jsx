// src/features/commerces/pages/MyCommercePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Star, MessageSquare, Layers } from "lucide-react";
import { Topbar } from "../components/dashboard/Topbar";
import { StatCard } from "../components/dashboard/StatCard";
import { BestRatedSection } from "../components/dashboard/BestRatedSection";
import { MostSoldSection } from "../components/dashboard/MostSoldSection";
import { CollectionsSection } from "../components/dashboard/CollectionsSection";
import { apiClient } from "../services/editCommerceApi";

export const MyCommercePage = () => {
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const sessionRes = await apiClient.get("/api/session/user-session");
                const idStore = sessionRes.data?.user?.id_store;

                if (!idStore) {
                    setError("No tenés un comercio registrado.");
                    return;
                }

                const res = await apiClient.get(`/api/commerces/my/${idStore}`);
                setStore(res.data);
            } catch (err) {
                const status = err.response?.status;
                if (status === 404) {
                    // Comercio eliminado — redirigir a crear comercio
                    navigate("/crear-comercio");
                } else {
                    setError(err.response?.data?.message || "No se pudo cargar el comercio.");
                }
            } finally {
                setLoading(false);
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
            <Topbar storeName={store?.name} />

            {/* Estadísticas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                <StatCard title="Productos Activos"     value={store?.products?.length ?? 0} icon={Package}       iconColor="#16a34a" />
                <StatCard title="Calificación Promedio" value="—"                            icon={Star}          iconColor="#f59e0b" />
                <StatCard title="Total Reseñas"         value="—"                            icon={MessageSquare} iconColor="#3b82f6" />
                <StatCard title="Colecciones Activas"   value="—"                            icon={Layers}        iconColor="#6B9080" />
            </div>

            {/* Secciones */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <BestRatedSection />
                <MostSoldSection products={store?.products} />
            </div>

            <CollectionsSection />
        </>
    );
};