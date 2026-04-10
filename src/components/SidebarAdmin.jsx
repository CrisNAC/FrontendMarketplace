import { useNavigate, useLocation } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import {
    LayoutDashboard,
    Users,
    Package,
    MessageSquare,
    Tag,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard",              icon: LayoutDashboard, route: "/admin" },
    { label: "Gestión de Usuarios",    icon: Users,           route: "/admin/usuarios" },
    { label: "Moderación de Productos",icon: Package,         route: "/admin/productos" },
    { label: "Moderación de Reseñas",  icon: MessageSquare,   route: "/admin/resenas" },
    { label: "Gestión de Categorías",  icon: Tag,             route: "/admin/categorias" },
];

export const SidebarAdmin = ({ collapsed, onToggle }) => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const logout    = useLogout();

    const active = [...NAV_ITEMS]
        .sort((a, b) => b.route.length - a.route.length)
        .find(item => location.pathname === item.route || location.pathname.startsWith(item.route + "/"))
        ?.label || "Dashboard";

    return (
        <div style={{
            width: collapsed ? "60px" : "260px",
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
                alignItems: "center",
                justifyContent: collapsed ? "center" : "space-between",
                marginBottom: "24px",
                padding: "0 4px",
            }}>
                {!collapsed && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ShieldCheck size={16} color="white" />
                        <span style={{ color: "white", fontWeight: "bold", fontSize: "16px", whiteSpace: "nowrap" }}>
                            Admin Panel
                        </span>
                    </div>
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
                            onClick={() => navigate(route)}
                            title={collapsed ? label : undefined}
                            style={{
                                display: "flex",
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

                {/* Cerrar sesión */}
                <div
                    onClick={logout}
                    title={collapsed ? "Cerrar Sesión" : undefined}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        backgroundColor: "transparent",
                        color: "white",
                        opacity: 0.8,
                        justifyContent: collapsed ? "center" : "flex-start",
                        whiteSpace: "nowrap",
                    }}
                >
                    <LogOut size={18} style={{ flexShrink: 0 }} />
                    {!collapsed && <span style={{ fontSize: "14px" }}>Cerrar Sesión</span>}
                </div>
            </nav>

            {/* Info box */}
            {!collapsed && (
                <div style={{
                    backgroundColor: "var(--primary)",
                    borderRadius: "10px",
                    padding: "12px",
                    marginTop: "16px",
                    color: "white",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <ShieldCheck size={14} />
                        <span style={{ fontSize: "13px", fontWeight: "bold" }}>Área restringida</span>
                    </div>
                    <p style={{ fontSize: "12px", margin: 0, opacity: 0.9 }}>
                        Solo accesible para administradores de la plataforma.
                    </p>
                </div>
            )}
        </div>
    );
};
