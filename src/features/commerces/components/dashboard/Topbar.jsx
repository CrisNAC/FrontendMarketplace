import { useEffect, useState } from "react";
import { Plus, Bell } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "../../services/editCommerceApi";

export const Topbar = ({ storeName = "Mi Comercio", showCreateProduct = true }) => {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await apiClient.get('/api/notifications');
                setUnreadCount(data.unreadCount ?? data.notifications?.filter(n => !n.read).length ?? 0);
            } catch (err) {
                // Ignore error
            }
        };
        fetchNotifications();
    }, []);

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
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <Link to="/notificaciones" style={{ position: "relative", color: "#4b5563", textDecoration: "none" }} title="Notificaciones">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span style={{
                            position: "absolute", top: "-4px", right: "-4px",
                            backgroundColor: "#ef4444", color: "white", fontSize: "10px", fontWeight: "bold",
                            borderRadius: "50%", minWidth: "16px", height: "16px", display: "flex",
                            alignItems: "center", justifyContent: "center", padding: "0 4px"
                        }}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Link>
                {showCreateProduct && (
                    <button 
                    onClick={() => navigate('/comercio/productos/nuevo')}
                    style={{
                        display: "flex", flexDirection: "row", alignItems: "center", gap: "6px",
                        backgroundColor: "var(--primary-dark)", color: "white",
                        borderRadius: "8px", border: "none", padding: "8px 16px",
                        fontSize: "14px", cursor: "pointer", flexShrink: 0,
                    }}>
                        <Plus size={16} />
                        Nuevo Producto
                    </button>
                )}
            </div>
        </div>
    );
};
