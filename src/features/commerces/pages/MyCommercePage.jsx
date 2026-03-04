import { useState, useEffect } from "react";
import { Package, Star, MessageSquare, Layers } from "lucide-react";
import { Topbar } from "../components/dashboard/Topbar";
import { StatCard } from "../components/dashboard/StatCard";
import { BestRatedSection } from "../components/dashboard/BestRatedSection";
import { MostSoldSection } from "../components/dashboard/MostSoldSection";
import { CollectionsSection } from "../components/dashboard/CollectionsSection";
import axios from "axios";

const ID_STORE = 1;

export const MyCommercePage = () => {
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await axios.get(`/api/commerces/${ID_STORE}`);
                if (!res) {
                    console.log("Error al contactar la API");
                }
                setStore(res.data);
            } catch (err) {
                console.error(err);
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