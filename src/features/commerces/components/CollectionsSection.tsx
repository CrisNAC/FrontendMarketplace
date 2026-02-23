import { CollectionCard } from "./CollectionCard";
import "../styles/commerces.css";

export const CollectionsSection = () => {
    return (
        <div className="card shadow-sm p-4">
            <div className="d-flex justify-content-between mb-4">
                <h6>Tus Colecciones</h6>
                <span className="text-primary small cursor-pointer">
                    Gestionar colecciones
                </span>
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <CollectionCard
                        title="Lo Más Vendido"
                        description="Nuestros productos más populares y mejor valorados por los clientes"
                        products="2 productos"
                    />
                </div>

                <div className="col-md-6">
                    <CollectionCard
                        title="Nuevos Productos"
                        description="Las últimas incorporaciones a nuestro catálogo"
                        products="2 productos"
                    />
                </div>
            </div>
        </div>
    );
};