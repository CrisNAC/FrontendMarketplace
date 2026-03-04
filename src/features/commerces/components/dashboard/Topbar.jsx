import "../../styles/commerces.css";
import { Link } from "react-router-dom";

export const Topbar = ({ storeName = "Mi Comercio" }) => {
    return (
        <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
                <h4 className="fw-semibold mb-1">
                    Dashboard - <span className="text-muted">{storeName}</span>
                </h4>
                <p className="text-muted mb-0">
                    Gestiona tu catálogo y mantente al día con el rendimiento de tus productos
                </p>
            </div>
            <button className="btn new-product-btn px-4">+ Nuevo Producto</button>
        </div>
    );
};
