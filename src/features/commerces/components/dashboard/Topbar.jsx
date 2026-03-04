import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Topbar = ({ storeName = "Mi Comercio" }) => {
    const navigate = useNavigate();
    
        const handleCreateProduct = () => {
            navigate('/comercio/productos/nuevo');
        };

    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div>
                <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>
                    Dashboard - <span style={{ color: "#6b7280" }}>{storeName}</span>
                </h4>
                <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                    Gestiona tu catálogo y mantente al día con el rendimiento de tus productos
                </p>
            </div>
            <button 
            onClick={() => handleCreateProduct()}
            style={{
                display: "flex", flexDirection: "row", alignItems: "center", gap: "6px",
                backgroundColor: "var(--primary-dark)", color: "white",
                borderRadius: "8px", border: "none", padding: "8px 16px",
                fontSize: "14px", cursor: "pointer", flexShrink: 0,
            }}>
                <Plus size={16} />
                Nuevo Producto
            </button>
        </div>
    );
};
