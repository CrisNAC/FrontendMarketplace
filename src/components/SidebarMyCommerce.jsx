import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Layers,
    Truck,
    Store,
    LogOut,
    ChevronLeft,
    ChevronRight,
    HelpCircle,
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard",     icon: LayoutDashboard, route: "/comercio" },
    { label: "Productos",     icon: Package,         route: "/comercio-producto" },
    { label: "Colecciones",   icon: Layers,          route: "/colecciones" },
    { label: "Delivery",      icon: Truck,           route: "/delivery" },
    { label: "Mi Comercio",   icon: Store,           route: "/mi-comercio" },
    // { label: "Cerrar Sesión", icon: LogOut },
];

export const SidebarMyCommerce = ({ collapsed, onToggle }) => {
    // const [active, setActive] = useState("Dashboard"); *PROBLEMA: El estado se reinicia cuando el componente se remonta.*
    const navigate = useNavigate();
    const location = useLocation();
    
    // Determina el activo basándose en la URL
    const active = NAV_ITEMS.find(
        item => item.route === location.pathname
    )?.label || "Dashboard";

    const handleNavigation = (label, route) => {
        // setActive(label); *SE PIERDE AL NAVEGAR*
        navigate(route);
    };

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
                {NAV_ITEMS.map(({ label, icon: Icon, route }) => {
                    const isActive = active === label;
                    return (
                        <div
                            key={label}
                            onClick={() => handleNavigation(label, route)}
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