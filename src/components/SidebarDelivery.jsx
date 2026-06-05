// src/components/SidebarDelivery.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import {
    Package,
    History,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
} from "lucide-react";

export const SidebarDelivery = ({ collapsed, onToggle, onNavigate }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useLogout();

    const NAV_ITEMS = [
        { label: "Mi Perfil",     icon: User,    route: "/delivery/perfil" },
        { label: "Órdenes",       icon: Package, route: "/delivery/order" },
        { label: "Mis Pedidos",   icon: Package, route: "/delivery/pedidos" },
        { label: "Historial",     icon: History, route: "/delivery/history" },
        { label: "Cerrar Sesión", icon: LogOut,  onClick: logout },
    ];

    // Activo basado en la URL actual — ordena por especificidad (rutas más largas primero)
    const active = [...NAV_ITEMS]
        .filter(item => item.route)
        .sort((a, b) => b.route.length - a.route.length)
        .find(item => location.pathname === item.route || location.pathname.startsWith(item.route + "/"))
        ?.label || "Dashboard";

    return (
        <div style={{
            width: collapsed ? "60px" : "220px",
            backgroundColor: "var(--primary-dark)",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            padding: "12px 8px",
            transition: "width 0.2s ease",
            flexShrink: 0,
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "space-between",
                marginBottom: "24px",
                padding: "0 4px",
            }}>
                {!collapsed && (
                    <span style={{ color: "white", fontWeight: "bold", fontSize: "16px", whiteSpace: "nowrap" }}>
                        Panel Delivery
                    </span>
                )}
                <button
                    onClick={onToggle}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", padding: "4px", borderRadius: "6px" }}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Nav items */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                {NAV_ITEMS.map(({ label, icon: Icon, route, onClick }) => {
                    const isActive = active === label;
                    return (
                        <button
                            type="button"
                            key={label}
                            onClick={() => {
                                if (onClick) {
                                    onClick();
                                } else {
                                    navigate(route);
                                }
                                onNavigate?.();
                            }}
                            title={collapsed ? label : undefined}
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "10px",
                                width: "100%",
                                padding: "8px 10px",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                font: "inherit",
                                textAlign: collapsed ? "center" : "left",
                                backgroundColor: isActive ? "var(--primary)" : "transparent",
                                color: "white",
                                opacity: isActive ? 1 : 0.8,
                                justifyContent: collapsed ? "center" : "flex-start",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <Icon size={18} style={{ flexShrink: 0 }} />
                            {!collapsed && <span style={{ fontSize: "14px" }}>{label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* Help box */}
            {!collapsed && (
                <div style={{
                    backgroundColor: "var(--primary)",
                    borderRadius: "10px",
                    padding: "12px",
                    marginTop: "16px",
                    color: "white",
                }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <HelpCircle size={14} />
                        <span style={{ fontSize: "13px", fontWeight: "bold" }}>¿Necesitas ayuda?</span>
                    </div>
                    <p style={{ fontSize: "12px", margin: 0, opacity: 0.9 }}>
                        Consulta nuestra guía para repartidores o contacta soporte.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SidebarDelivery;