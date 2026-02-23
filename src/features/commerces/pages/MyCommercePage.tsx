
import { Topbar } from "../components/Topbar";
import { Statcard } from "../components/Statcard";
import { BestRatedSection } from "../components/BestRatedSection";
import { MostSoldSection } from "../components/MostSoldSection";
import { CollectionsSection } from "../components/CollectionsSection";

export const MyCommercePage = () => {
    return (
        <>
            <Topbar />

            {/* Estadisticas */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <Statcard title="Productos Activos" value="3" />
                </div>
                <div className="col-md-3">
                    <Statcard title="Calificación Promedio" value="4.6" />
                </div>
                <div className="col-md-3">
                    <Statcard title="Total Reseñas" value="5" />
                </div>
                <div className="col-md-3">
                    <Statcard title="Colecciones Activas" value="2" />
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
