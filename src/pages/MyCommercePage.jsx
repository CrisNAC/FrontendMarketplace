
import { Topbar } from "../features/commerces/components/Topbar";
import { StatCard } from "../features/commerces/components/StatCard";
import { BestRatedSection } from "../features/commerces/components/BestRatedSection";
import { MostSoldSection } from "../features/commerces/components/MostSoldSection";
import { CollectionsSection } from "../features/commerces/components/CollectionsSection";

export const MyCommercePage = () => {
    return (
        <>
            <Topbar />

            {/* Estadisticas */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <StatCard title="Productos Activos" value="3" />
                </div>
                <div className="col-md-3">
                    <StatCard title="Calificación Promedio" value="4.6" />
                </div>
                <div className="col-md-3">
                    <StatCard title="Total Reseñas" value="5" />
                </div>
                <div className="col-md-3">
                    <StatCard title="Colecciones Activas" value="2" />
                </div>
            </div>

            {/* Secciones */}
            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <BestRatedSection />
                </div>
                <div className="col-md-6">
                    <MostSoldSection />
                </div>
            </div>

            <CollectionsSection />
        </>
    );
};
