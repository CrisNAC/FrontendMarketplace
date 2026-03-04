import { useState, useEffect } from "react";
import { Topbar } from "../components/dashboard/Topbar";
import { StatCard } from "../components/dashboard/StatCard";
import { BestRatedSection } from "../components/dashboard/BestRatedSection";
import { MostSoldSection } from "../components/dashboard/MostSoldSection";
import { CollectionsSection } from "../components/dashboard/CollectionsSection";

const ID_STORE = 1; // Hardcodeado hasta tener auth

export const MyCommercePage = () => {
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await fetch(`http://localhost:3000/stores/${ID_STORE}`);
                if (!res.ok) throw new Error("Error al obtener el comercio");
                const data = await res.json();
                setStore(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, []);

    if (loading) return <p className="text-muted p-4">Cargando...</p>;

    return (
        <>
            <Topbar storeName={store?.name} />

            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <StatCard
                        title="Productos Activos"
                        value={store?.products?.length ?? 0}
                    />
                </div>
                <div className="col-md-3">
                    <StatCard title="Calificación Promedio" value="—" />
                </div>
                <div className="col-md-3">
                    <StatCard title="Total Reseñas" value="—" />
                </div>
                <div className="col-md-3">
                    <StatCard title="Colecciones Activas" value="—" />
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <BestRatedSection />
                </div>
                <div className="col-md-6">
                    <MostSoldSection products={store?.products} />
                </div>
            </div>

            <CollectionsSection />
        </>
    );
};