// src/components/SidebarMyCommerce.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import {
    LayoutDashboard,
    Package,
    Layers,
    Truck,
    Store,
    ShoppingBag,
    Flag,
    LogOut,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
} from "lucide-react";

export const SidebarMyCommerce = ({ collapsed, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useLogout();

    const NAV_ITEMS = [
        { label: "Dashboard",     icon: LayoutDashboard, route: "/comercio" },
        { label: "Productos",     icon: Package,         route: "/comercio/productos" },
        { label: "Colecciones",   icon: Layers,          route: "/colecciones" },
        { label: "Mis Pedidos",   icon: ShoppingBag,     route: "/comercio/pedidos" },
        { label: "Reclamos",      icon: Flag,            route: "/comercio/claims" },
        // { label: "Delivery",      icon: Truck,           route: "/delivery" },
        // ← ruta actualizada a /comercio/perfil
        { label: "Mi Comercio",   icon: Store,           route: "/comercio/perfil" },
        { label: "Cerrar Sesión", icon: LogOut,          onClick: logout },
    ];

    // Activo basado en la URL actual — ordena por especificidad (rutas más largas primero)
    // para evitar que /comercio matchee antes que /comercio/perfil o /comercio/editar
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
                        Mi Comercio
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
                        <div
                            key={label}
                            onClick={() => onClick ? onClick() : navigate(route)}
                            title={collapsed ? label : undefined}
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: "10px",
                                padding: "8px 10px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                backgroundColor: isActive ? "var(--primary)" : "transparent",
                                color: "white",
                                opacity: isActive ? 1 : 0.8,
                                justifyContent: collapsed ? "center" : "flex-start",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <Icon size={18} style={{ flexShrink: 0 }} />
                            {!collapsed && <span style={{ fontSize: "14px" }}>{label}</span>}
                        </div>
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
                        Consulta nuestra guía para comercios o contacta soporte.
                    </p>
                </div>
            )}
        </div>
    );
};