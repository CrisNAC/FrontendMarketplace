import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Box,
  MessageSquareWarning,
  ShoppingCart,
  Store,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { fetchAdminDashboardStats } from "../services/adminDashboardApi";

const cardStyle = {
  backgroundColor: "var(--background-white)",
  borderRadius: "14px",
  padding: "20px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const formatRelativeTime = (minutesAgo) => {
  if (minutesAgo < 60) return `Hace ${minutesAgo} minuto${minutesAgo !== 1 ? "s" : ""}`;
  const hours = Math.floor(minutesAgo / 60);
  return `Hace ${hours} hora${hours !== 1 ? "s" : ""}`;
};

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBuyers: 0,
    registeredCommerces: 0,
    pendingProducts: 0,
    pendingReviews: 0,
    pendingCommerces: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchAdminDashboardStats();
        setStats(result);
      } catch (err) {
        setError(err?.response?.data?.error?.message || "No se pudo cargar el dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statCards = useMemo(
    () => [
      {
        title: "Total Usuarios",
        value: stats.totalUsers,
        variation: "+12% este mes",
        Icon: Users,
        danger: false,
        navigateTo: "/admin/usuarios",
      },
      {
        title: "Compradores Activos",
        value: stats.activeBuyers,
        variation: "+8% este mes",
        Icon: UserRound,
        danger: false,
        navigateTo: "/admin/usuarios?role=CUSTOMER&status=true",
      },
      {
        title: "Comercios Registrados",
        value: stats.registeredCommerces,
        variation: "+15% este mes",
        Icon: Store,
        danger: false,
        navigateTo: "/admin/usuarios?role=SELLER",
      },
      {
        title: "Productos Pendientes",
        value: stats.pendingProducts,
        variation: "Revisión requerida",
        Icon: AlertTriangle,
        danger: true,
        navigateTo: null,
      },
    ],
    [stats]
  );

  const recentActivity = useMemo(
    () => [
      {
        id: "a1",
        type: "info",
        label: "info",
        description: "Nuevo comprador registrado",
        detail: "Mario González",
        minutesAgo: 5,
      },
      {
        id: "a2",
        type: "warning",
        label: "warning",
        description: "Producto reportado",
        detail: "iPhone 15 Pro",
        minutesAgo: 15,
      },
      {
        id: "a3",
        type: "error",
        label: "error",
        description: "Reseña reportada por contenido inapropiado",
        detail: "",
        minutesAgo: 30,
      },
      {
        id: "a4",
        type: "success",
        label: "success",
        description: "Comercio aprobado",
        detail: "TechStore S.A.",
        minutesAgo: 60,
      },
    ],
    []
  );

  const pendingTasks = useMemo(
    () => [
      {
        key: "products",
        title: "Productos sospechosos",
        subtitle: `${stats.pendingProducts} producto${stats.pendingProducts !== 1 ? "s" : ""} requieren revisión`,
        count: stats.pendingProducts,
        bg: "#fef3c7",
        border: "#fcd34d",
        color: "#92400e",
        Icon: Box,
        route: "/admin/productos",
      },
      {
        key: "reviews",
        title: "Reseñas reportadas",
        subtitle: `${stats.pendingReviews} reseña${stats.pendingReviews !== 1 ? "s" : ""} pendientes de moderación`,
        count: stats.pendingReviews,
        bg: "#dcfce7",
        border: "#86efac",
        color: "#166534",
        Icon: MessageSquareWarning,
        route: "/admin/resenas",
      },
      {
        key: "commerces",
        title: "Comercios por aprobar",
        subtitle: `${stats.pendingCommerces} solicitud${stats.pendingCommerces !== 1 ? "es" : ""} de registro`,
        count: stats.pendingCommerces,
        bg: "#dbeafe",
        border: "#93c5fd",
        color: "#1e40af",
        Icon: ShoppingCart,
        route: "/admin/comercios",
      },
    ],
    [stats]
  );

  const badgeStyleByType = {
    info: { color: "#1d4ed8", backgroundColor: "#dbeafe" },
    warning: { color: "#92400e", backgroundColor: "#fef3c7" },
    error: { color: "#b91c1c", backgroundColor: "#fee2e2" },
    success: { color: "#166534", backgroundColor: "#dcfce7" },
  };

  return (
    <div style={{ maxWidth: "1150px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>
          Resumen general de la plataforma
        </p>
      </div>

      {error && (
        <div
          style={{
            ...cardStyle,
            marginBottom: "16px",
            backgroundColor: "#fff1f2",
            border: "1px solid #fecdd3",
            color: "#be123c",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        {statCards.map(({ title, value, variation, Icon, danger, navigateTo }) => {
          const body = (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>{title}</span>
                <Icon size={17} color={danger ? "#dc2626" : "#64748b"} />
              </div>
              <p style={{ margin: "0 0 10px 0", fontSize: "30px", fontWeight: "700", color: "#111827" }}>
                {loading ? "..." : value.toLocaleString("es-PY")}
              </p>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  borderRadius: "999px",
                  padding: "4px 10px",
                  color: danger ? "#b91c1c" : "#16a34a",
                  backgroundColor: danger ? "#fee2e2" : "#dcfce7",
                }}
              >
                {!danger && <TrendingUp size={12} />}
                {variation}
              </span>
            </>
          );

          if (navigateTo) {
            return (
              <button
                key={title}
                type="button"
                title="Abrir gestión de usuarios con este filtro"
                onClick={() => navigate(navigateTo)}
                style={{
                  ...cardStyle,
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  cursor: "pointer",
                  font: "inherit",
                  transition: "box-shadow 0.15s ease, transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = cardStyle.boxShadow;
                }}
              >
                {body}
              </button>
            );
          }

          return (
            <div key={title} style={cardStyle}>
              {body}
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "19px" }}>Actividad Reciente</h2>
          <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#6b7280" }}>
            Ultimas acciones en la plataforma
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentActivity.map((activity) => (
              <div key={activity.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span
                  style={{
                    ...badgeStyleByType[activity.type],
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    textTransform: "lowercase",
                    fontWeight: "700",
                    minWidth: "72px",
                    textAlign: "center",
                  }}
                >
                  {activity.label}
                </span>
                <div>
                  <p style={{ margin: "0 0 2px 0", fontSize: "13px", color: "#111827" }}>
                    {activity.description}
                    {activity.detail ? <strong> {activity.detail}</strong> : ""}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                    {formatRelativeTime(activity.minutesAgo)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "19px" }}>Tareas Pendientes</h2>
          <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#6b7280" }}>
            Elementos que requieren tu atencion
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {pendingTasks.map((task) => (
              <button
                key={task.key}
                type="button"
                onClick={() => navigate(task.route)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: `1px solid ${task.border}`,
                  borderRadius: "12px",
                  padding: "12px 14px",
                  backgroundColor: task.bg,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <task.Icon size={16} color={task.color} />
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: task.color }}>
                      {task.title}
                    </p>
                    <p style={{ margin: 0, fontSize: "12px", color: task.color, opacity: 0.9 }}>
                      {loading ? "Cargando..." : task.subtitle}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    minWidth: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255,255,255,0.65)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: task.color,
                  }}
                >
                  {loading ? "..." : task.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
