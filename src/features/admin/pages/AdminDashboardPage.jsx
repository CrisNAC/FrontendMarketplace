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
import { fetchAdminDashboardStats, fetchAdminRecentActivity } from "../services/adminDashboardApi";
import { PageLoader } from "../../../components/PageLoader";

const cardStyle = {
  backgroundColor: "var(--background-white)",
  borderRadius: "14px",
  padding: "20px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const formatRelativeTime = (dateMs) => {
  if (!dateMs) return "Recientemente";
  const diffMs = Date.now() - dateMs;
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) return `Hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} dia${days !== 1 ? "s" : ""}`;
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
    pendingProductReports: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const [statsResult, activityResult] = await Promise.all([
          fetchAdminDashboardStats(),
          fetchAdminRecentActivity(),
        ]);
        setStats(statsResult);
        setRecentActivity(activityResult);
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


  const pendingTasks = useMemo(
    () => [
      {
        key: "productReports",
        title: "Reportes de productos",
        subtitle: `${stats.pendingProductReports} reporte${stats.pendingProductReports !== 1 ? "s" : ""} de usuario${stats.pendingProductReports !== 1 ? "s" : ""} pendiente${stats.pendingProductReports !== 1 ? "s" : ""}`,
        count: stats.pendingProductReports,
        bg: "#fff7ed",
        border: "#fdba74",
        color: "#9a3412",
        Icon: AlertTriangle,
        route: "/admin/claims",
      },
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

  if (loading) return <PageLoader />;

  const hasProductReportWarnings = stats.pendingProductReports > 0;

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

      {hasProductReportWarnings && (
        <div
          role="alert"
          style={{
            ...cardStyle,
            marginBottom: "16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
            backgroundColor: "#fffbeb",
            border: "1px solid #fcd34d",
            color: "#92400e",
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#fef3c7",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={22} color="#d97706" aria-hidden />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "700" }}>
              Hay reportes de productos pendientes
            </p>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.45, opacity: 0.95 }}>
              {stats.pendingProductReports === 1
                ? "Un comprador reportó un producto. Revisá el reclamo y coordiná con el comercio si hace falta."
                : `${stats.pendingProductReports} compradores reportaron productos. Revisá los reclamos en el panel.`}
            </p>
            <button
              type="button"
              onClick={() => navigate("/admin/reviews")}
              style={{
                marginTop: "10px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: "600",
                borderRadius: "8px",
                border: "1px solid #d97706",
                backgroundColor: "#fff",
                color: "#9a3412",
                cursor: "pointer",
              }}
            >
              Ir a reportes de productos
            </button>
          </div>
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
                {value.toLocaleString("es-PY")}
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
            {recentActivity.length === 0 && (
              <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                Aun no hay actividad disponible para mostrar.
              </p>
            )}
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
                    {formatRelativeTime(activity.dateMs)}
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
                      {task.subtitle}
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
                  {task.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
