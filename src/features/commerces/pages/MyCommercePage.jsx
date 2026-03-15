// src/features/commerces/pages/MyCommercePage.jsx
import { useState, useEffect } from "react";
import { Package, Star, MessageSquare, Layers } from "lucide-react";
import { Topbar } from "../components/dashboard/Topbar";
import { StatCard } from "../components/dashboard/StatCard";
import { BestRatedSection } from "../components/dashboard/BestRatedSection";
import { MostSoldSection } from "../components/dashboard/MostSoldSection";
import { CollectionsSection } from "../components/dashboard/CollectionsSection";
import { apiClient } from "../services/editCommerceApi";

export const MyCommercePage = () => {
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                // Obtener id_store desde la sesión activa (igual que useEditCommerce)
                const sessionRes = await apiClient.get("/api/session/user-session");
                const idStore = sessionRes.data?.user?.id_store;

                if (!idStore) {
                    console.warn("El usuario no tiene un comercio registrado.");
                    return;
                }

                const res = await apiClient.get(`/api/commerces/${idStore}`);
                setStore(res.data);
            } catch (err) {
                console.error("Error al cargar el comercio:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, []);

    if (loading) return <p style={{ color: "#6b7280", padding: "16px" }}>Cargando...</p>;

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