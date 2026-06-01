import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ShoppingCart, Store, Shield, Truck, Eye } from "lucide-react";
import { fetchAdminUsers } from "../services/adminUsersApi";
import { PageLoader } from "../../../components/PageLoader";

// ── Mapeos de rol y estado ─────────────────────────────────────────────────

const ROLE_LABEL = {
  CUSTOMER: "Comprador",
  SELLER:   "Comercio",
  ADMIN:    "Admin",
  DELIVERY: "Delivery",
};

const ROLE_ICON = {
  CUSTOMER: ShoppingCart,
  SELLER:   Store,
  ADMIN:    Shield,
  DELIVERY: Truck,
};

const STATUS_STYLE = {
  true:  { color: "#15803d", backgroundColor: "#dcfce7" },
  false: { color: "#dc2626", backgroundColor: "#fee2e2" },
};

const STATUS_LABEL = { true: "activo", false: "suspendido" };

// ── Componente principal ───────────────────────────────────────────────────

export const AdminUsersPage = () => {
  const [searchParams] = useSearchParams();

  const [users,      setUsers]      = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [search, setSearch] = useState("");
  const [role,   setRole]   = useState(() => searchParams.get("role") ?? "");
  const [status, setStatus] = useState(() => searchParams.get("status") ?? "");
  const [page,   setPage]   = useState(1);

  useEffect(() => {
    setRole(searchParams.get("role") ?? "");
    setStatus(searchParams.get("status") ?? "");
  }, [searchParams]);

  const loadUsers = useCallback(async (currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminUsers({ search, role, status, page: currentPage, limit: 20 });
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (err) {
      // El interceptor de apiClient ya redirige 401/403/500.
      // Este catch captura errores de validación (400) u otros no redirigidos.
      setError(err?.response?.data?.error?.message || "Error al cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, [search, role, status]);

  // Un único efecto evita la doble llamada que ocurría cuando un filtro cambiaba
  // y el reset de page disparaba loadUsers dos veces.
  useEffect(() => {
    setPage(1);
    loadUsers(1);
  }, [search, role, status]);

  useEffect(() => {
    loadUsers(page);
  }, [page]);

  // ── Estilos reutilizables ────────────────────────────────────────────────

  const cardStyle = {
    backgroundColor: "var(--background-white)",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  };

  const selectStyle = {
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#374151",
    background: "white",
    cursor: "pointer",
  };

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Encabezado */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0 }}>Gestión de Usuarios</h1>
        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>
          Administra compradores y comercios de la plataforma
        </p>
      </div>

      {/* Filtros */}
      <div style={{ ...cardStyle, marginBottom: "16px" }}>
        <p style={{ margin: "0 0 12px", fontWeight: "600", fontSize: "14px" }}>Filtros</p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>

          {/* Búsqueda */}
          <div style={{ position: "relative", flex: "1", minWidth: "200px" }}>
            <Search
              size={15}
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: "32px",
                paddingRight: "12px",
                paddingTop: "8px",
                paddingBottom: "8px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Filtro por rol */}
          <select value={role} onChange={(e) => setRole(e.target.value)} style={selectStyle}>
            <option value="">Todos los tipos</option>
            <option value="CUSTOMER">Comprador</option>
            <option value="SELLER">Comercio</option>
            <option value="ADMIN">Admin</option>
            <option value="DELIVERY">Delivery</option>
          </select>

          {/* Filtro por estado */}
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Suspendido</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div style={cardStyle}>
        <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "15px" }}>
          Usuarios ({pagination.total})
        </p>
        <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6b7280" }}>
          Lista de todos los usuarios registrados en la plataforma
        </p>

        {error && (
          <div style={{ padding: "12px", backgroundColor: "#fee2e2", borderRadius: "8px", color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {loading ? (
          <PageLoader />
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>
            No se encontraron usuarios con los filtros seleccionados.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {users.map((user) => {
              const RoleIcon  = ROLE_ICON[user.role] ?? ShoppingCart;
              const statusKey = String(user.status);
              return (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 8px",
                    borderBottom: "1px solid #f3f4f6",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Icono de tipo */}
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "var(--background-soft)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <RoleIcon size={18} color="var(--primary-dark)" />
                  </div>

                  {/* Nombre y email */}
                  <div style={{ flex: "1", minWidth: "150px" }}>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>{user.name}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{user.email}</p>
                  </div>

                  {/* Rol */}
                  <span style={{ fontSize: "13px", minWidth: "80px" }}>
                    {ROLE_LABEL[user.role] ?? user.role}
                  </span>

                  {/* Estado */}
                  <span style={{
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "500",
                    minWidth: "80px",
                    textAlign: "center",
                    ...STATUS_STYLE[statusKey],
                  }}>
                    {STATUS_LABEL[statusKey]}
                  </span>

                  {/* Fecha de registro */}
                  <span style={{ fontSize: "12px", color: "#6b7280", minWidth: "130px" }}>
                    Registro: {new Date(user.createdAt).toLocaleDateString("es-PY")}
                  </span>

                  {/* Acciones */}
                  <button
                    title="Ver detalle (próximamente)"
                    disabled
                    style={{ background: "none", border: "none", cursor: "not-allowed", color: "#6b7280", padding: "4px", borderRadius: "6px", display: "flex", opacity: 0.4 }}
                  >
                    <Eye size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}
            >
              Anterior
            </button>
            <span style={{ fontSize: "13px" }}>
              {page} / {pagination.totalPages}
            </span>
            <button
              className="btn btn-secondary"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              style={{ opacity: page === pagination.totalPages ? 0.5 : 1, cursor: page === pagination.totalPages ? "not-allowed" : "pointer" }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
