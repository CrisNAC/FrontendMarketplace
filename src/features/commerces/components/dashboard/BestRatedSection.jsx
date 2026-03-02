import { ProductItem } from "./ProductItem";
import "../../styles/commerces.css";

export const BestRatedSection = () => {
    return (
        <div className="card shadow-sm p-3">
            <div className="d-flex justify-content-between mb-3">
                <h6>Mejor Valorados</h6>
                <span className="text-primary small">Ver todos</span>
            </div>

            <ProductItem name="Silla Ergonómica Oficina" detail="⭐ 4.7 (3 reseñas)" />
            <ProductItem name="Organizador de Escritorio" detail="⭐ 4.5 (2 reseñas)" />
        </div>
    );
};