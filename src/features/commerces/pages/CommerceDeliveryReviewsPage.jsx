import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Star,
  User,
  Mail,
  Phone,
  Package,
  Percent,
  ChevronLeft,
  TrendingUp,
} from "lucide-react";
import { apiClient as commerceApiClient } from "../services/editCommerceApi";
import {
  getStoreDeliveries,
  getDeliveryReviewsErrorMessage,
  getStoreDeliveryReviews,
} from "../services/deliveryReviewsApi";

const panelStyle = {
  backgroundColor: "white",
  borderRadius: "14px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
};

const inputStyle = {
  padding: "9px 10px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  outline: "none",
  fontSize: "13px",
  backgroundColor: "white",
};

const normalizeResponse = (payload) => {
  if (Array.isArray(payload)) {
    return { reviews: payload, stats: {}, delivery: {} };
  }
  return {
    reviews: Array.isArray(payload?.reviews) ? payload.reviews : [],
    stats: payload?.stats ?? {},
    delivery: payload?.delivery ?? {},
  };
};

const getOrderCode = (review) =>
  String(review?.orderCode ?? review?.order_id ?? review?.fk_order ?? review?.orderId ?? "");

const getRating = (review) => {
  const value = Number(
    review?.rating ??
      review?.stars ??
      review?.score ??
      review?.calification ??
      review?.qualification ??
      0
  );
  return Number.isFinite(value) ? value : 0;
};

const getCustomerName = (review) =>
  String(
    review?.customerName ??
      review?.customer?.name ??
      review?.user?.name ??
      review?.author ??
      "Cliente"
  );

const getReviewDate = (review) => {
  const raw = review?.createdAt ?? review?.created_at ?? review?.date;
  if (!raw) return "Sin fecha";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "Sin fecha";
  return parsed.toLocaleDateString("es-PY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const renderStars = (value) =>
  [1, 2, 3, 4, 5].map((star) => (
    <Star
      key={star}
      size={14}
      style={{
        color: star <= value ? "#f4a942" : "#d1d5db",
        fill: star <= value ? "#f4a942" : "transparent",
      }}
    />
  ));

const statusLabel = (status) => {
  if (!status) return "—";
  const s = String(status).toUpperCase();
  if (s === "ACTIVE") return "Activo";
  if (s === "INACTIVE") return "Inactivo";
  if (s === "SUSPENDED") return "Suspendido";
  return status;
};

export function CommerceDeliveryReviewsPage() {
  const [storeId, setStoreId] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [view, setView] = useState("list");
  const [driverSearch, setDriverSearch] = useState("");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("all");
  const [selectedDeliveryId, setSelectedDeliveryId] = useState("");
  const [orderCodeFilter, setOrderCodeFilter] = useState("");
  const [starsFilter, setStarsFilter] = useState("all");
  const [payload, setPayload] = useState({ reviews: [], stats: {}, delivery: {} });

  useEffect(() => {
    const init = async () => {
      setLoadingSession(true);
      setError("");
      try {
        const sessionRes = await commerceApiClient.get("/api/session/user-session");
        const sid = sessionRes.data?.user?.id_store;
        if (!sid) {
          setError("No tenés un comercio registrado.");
          return;
        }
        setStoreId(String(sid));
      } catch (_err) {
        setError("No se pudo cargar la sesión.");
      } finally {
        setLoadingSession(false);
      }
    };

    init();
  }, []);

  const fetchReviews = async (deliveryId, overrides = {}) => {
    if (!storeId || !deliveryId) return;

    const orderText = overrides.orderCode !== undefined ? overrides.orderCode : orderCodeFilter;
    const starsVal = overrides.starsFilter !== undefined ? overrides.starsFilter : starsFilter;

    const trimmedOrderCode = String(orderText).trim();
    if (trimmedOrderCode && !/^\d+$/.test(trimmedOrderCode)) {
      setError("El código del pedido debe ser numérico.");
      return;
    }

    const query = {};
    if (trimmedOrderCode) query.search = Number(trimmedOrderCode);
    if (starsVal !== "all") {
      const rating = Number(starsVal);
      query.minRating = rating;
      query.maxRating = rating;
    }

    setLoadingReviews(true);
    setError("");
    try {
      const data = await getStoreDeliveryReviews(storeId, deliveryId, query);
      setPayload(normalizeResponse(data));
    } catch (err) {
      setPayload({ reviews: [], stats: {}, delivery: {} });
      setError(getDeliveryReviewsErrorMessage(err));
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (!storeId) return;

    const loadDeliveries = async () => {
      setLoadingDeliveries(true);
      try {
        const list = await getStoreDeliveries(storeId);
        setDeliveries(list);
      } catch (_err) {
        setDeliveries([]);
      } finally {
        setLoadingDeliveries(false);
      }
    };

    loadDeliveries();
  }, [storeId]);

  const filteredDrivers = useMemo(() => {
    let list = deliveries;
    const q = driverSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((d) => {
        const hay = `${d.id} ${d.name} ${d.email ?? ""} ${d.phone ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
    }
    if (deliveryStatusFilter !== "all") {
      list = list.filter(
        (d) => String(d.delivery_status ?? "").toUpperCase() === deliveryStatusFilter
      );
    }
    return list;
  }, [deliveries, driverSearch, deliveryStatusFilter]);

  const hasStatusColumn = useMemo(
    () => deliveries.some((d) => d.delivery_status != null && d.delivery_status !== ""),
    [deliveries]
  );

  const openDetail = (deliveryId) => {
    setOrderCodeFilter("");
    setStarsFilter("all");
    setSelectedDeliveryId(String(deliveryId));
    setView("detail");
    fetchReviews(String(deliveryId), { orderCode: "", starsFilter: "all" });
  };

  const backToList = () => {
    setView("list");
    setSelectedDeliveryId("");
    setPayload({ reviews: [], stats: {}, delivery: {} });
    setOrderCodeFilter("");
    setStarsFilter("all");
    setError("");
  };

  const filteredReviews = useMemo(() => payload.reviews, [payload.reviews]);

  const avgRating = useMemo(() => {
    if (payload.reviews.length === 0) return 0;
    const total = payload.reviews.reduce((acc, review) => acc + getRating(review), 0);
    return total / payload.reviews.length;
  }, [payload.reviews]);

  const selectedDelivery = deliveries.find((d) => String(d.id) === String(selectedDeliveryId));
  const deliveryName =
    payload.delivery?.name ??
    payload.delivery?.full_name ??
    selectedDelivery?.name ??
    "Repartidor";
  const totalDeliveries = payload.stats?.totalDeliveries ?? payload.stats?.deliveries ?? "—";
  const successRate = payload.stats?.successRate ?? payload.stats?.success_rate ?? "—";
  const email = payload.delivery?.email ?? selectedDelivery?.email ?? "—";
  const phone =
    payload.delivery?.phone ??
    payload.delivery?.phone_number ??
    selectedDelivery?.phone ??
    "—";

  if (loadingSession) {
    return <p style={{ color: "#6b7280", padding: "16px" }}>Cargando...</p>;
  }

  if (error && !storeId) {
    return (
      <div
        style={{
          backgroundColor: "#fff1f2",
          border: "1px solid #fecdd3",
          borderRadius: "10px",
          padding: "12px 16px",
          color: "#be123c",
          fontSize: "14px",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <>
      {view === "list" ? (
        <>
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Reseñas de repartidores</h4>
            <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
              Buscá y filtrá repartidores. Elegí uno para ver calificaciones y comentarios de clientes.
            </p>
          </div>

          <div
            style={{
              ...panelStyle,
              padding: "14px 16px",
              marginBottom: "16px",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "1 1 240px", minWidth: 0 }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#6b7280",
                  margin: "0 0 6px 0",
                  textTransform: "uppercase",
                }}
              >
                Buscar repartidor
              </p>
              <div style={{ position: "relative" }}>
                <Search
                  size={14}
                  color="#9ca3af"
                  style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  placeholder="Nombre, ID, email o teléfono"
                  style={{ ...inputStyle, width: "100%", paddingLeft: "32px" }}
                />
              </div>
            </div>
            {hasStatusColumn && (
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#6b7280",
                    margin: "0 0 6px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Estado
                </p>
                <select
                  value={deliveryStatusFilter}
                  onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer", minWidth: "140px" }}
                >
                  <option value="all">Todos</option>
                  <option value="ACTIVE">Activos</option>
                  <option value="INACTIVE">Inactivos</option>
                  <option value="SUSPENDED">Suspendidos</option>
                </select>
              </div>
            )}
          </div>

          {error && view === "list" && (
            <div
              style={{
                backgroundColor: "#fff1f2",
                border: "1px solid #fecdd3",
                borderRadius: "10px",
                padding: "12px 16px",
                color: "#be123c",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          {loadingDeliveries ? (
            <p style={{ color: "#6b7280", padding: "16px" }}>Cargando repartidores...</p>
          ) : deliveries.length === 0 ? (
            <div style={{ ...panelStyle, padding: "24px", color: "#6b7280" }}>
              No hay repartidores con pedidos enviados o entregados todavía.
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div style={{ ...panelStyle, padding: "24px", color: "#6b7280" }}>
              No hay repartidores que coincidan con la búsqueda o el filtro.
            </div>
          ) : (
            <div style={{ ...panelStyle, overflow: "hidden" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: hasStatusColumn
                    ? "1fr 90px 140px 1fr 120px"
                    : "1fr 90px 1fr 120px",
                  padding: "10px 16px",
                  backgroundColor: "#f9fafb",
                  borderBottom: "1px solid #f3f4f6",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                  Repartidor
                </span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                  ID
                </span>
                {hasStatusColumn && (
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                    Estado
                  </span>
                )}
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                  Contacto
                </span>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>
                  Acción
                </span>
              </div>
              {filteredDrivers.map((d, idx) => (
                <div
                  key={d.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: hasStatusColumn
                      ? "1fr 90px 140px 1fr 120px"
                      : "1fr 90px 1fr 120px",
                    padding: "12px 16px",
                    alignItems: "center",
                    gap: "8px",
                    borderBottom: idx < filteredDrivers.length - 1 ? "1px solid #f9fafb" : "none",
                  }}
                >
                  <span style={{ fontWeight: "600", color: "#111827", fontSize: "14px" }}>{d.name}</span>
                  <span style={{ fontSize: "13px", color: "#374151" }}>{d.id}</span>
                  {hasStatusColumn && (
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>{statusLabel(d.delivery_status)}</span>
                  )}
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    {d.phone || d.email ? (
                      <>
                        {d.phone && <span>{d.phone}</span>}
                        {d.phone && d.email && <span> · </span>}
                        {d.email && <span>{d.email}</span>}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => openDetail(d.id)}
                    style={{
                      border: "none",
                      borderRadius: "8px",
                      backgroundColor: "var(--primary-dark)",
                      color: "white",
                      padding: "7px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      justifySelf: "start",
                    }}
                  >
                    Ver reseñas
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={backToList}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              color: "var(--primary-dark)",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "12px",
              padding: 0,
            }}
          >
            <ChevronLeft size={18} />
            Volver a Repartidores
          </button>

          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontWeight: "600", margin: "0 0 4px 0", fontSize: "20px", color: "#111827" }}>
              Reseñas de {deliveryName}
            </h4>
            <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
              Calificaciones y comentarios de los clientes sobre este repartidor
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#fff1f2",
                border: "1px solid #fecdd3",
                borderRadius: "10px",
                padding: "12px 16px",
                color: "#be123c",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          {loadingReviews ? (
            <p style={{ color: "#6b7280", padding: "16px" }}>Cargando reseñas...</p>
          ) : (
            <>
              <div style={{ ...panelStyle, padding: "16px 18px", marginBottom: "16px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <Star size={22} style={{ color: "#f4a942", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>Calificación Promedio</p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: "700", color: "#111827" }}>
                        {avgRating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <User size={22} style={{ color: "#6b7280", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>Total Reseñas</p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: "700", color: "#111827" }}>
                        {payload.reviews.length}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <Package size={22} style={{ color: "#6b7280", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>Total Entregas</p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: "700", color: "#111827" }}>
                        {totalDeliveries}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <TrendingUp size={22} style={{ color: "#059669", flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>Tasa de Éxito</p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: "700", color: "#059669" }}>
                        {typeof successRate === "number" ? `${successRate}%` : successRate}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                    color: "#6b7280",
                    fontSize: "13px",
                    paddingTop: "8px",
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Phone size={14} /> {phone}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Mail size={14} /> {email}
                  </span>
                </div>
              </div>

              <div
                style={{
                  ...panelStyle,
                  padding: "14px 16px",
                  marginBottom: "14px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <div style={{ position: "relative", flex: "1 1 240px" }}>
                  <Search
                    size={14}
                    color="#9ca3af"
                    style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
                  />
                  <input
                    type="text"
                    value={orderCodeFilter}
                    onChange={(e) => setOrderCodeFilter(e.target.value)}
                    placeholder="Buscar por código de pedido (ID)"
                    style={{ ...inputStyle, width: "100%", paddingLeft: "32px" }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Percent size={14} color="#6b7280" />
                  <select
                    value={starsFilter}
                    onChange={(e) => setStarsFilter(e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="all">Todas las estrellas</option>
                    <option value="5">5 estrellas</option>
                    <option value="4">4 estrellas</option>
                    <option value="3">3 estrellas</option>
                    <option value="2">2 estrellas</option>
                    <option value="1">1 estrella</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => fetchReviews(selectedDeliveryId)}
                  disabled={!selectedDeliveryId || loadingReviews}
                  style={{
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "var(--primary-dark)",
                    color: "white",
                    padding: "9px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: "600",
                    cursor: !selectedDeliveryId || loadingReviews ? "not-allowed" : "pointer",
                    opacity: !selectedDeliveryId || loadingReviews ? 0.7 : 1,
                  }}
                >
                  <Search size={14} />
                  Aplicar filtros
                </button>
              </div>

              <p style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 12px 0" }}>
                Reseñas ({filteredReviews.length})
              </p>

              {filteredReviews.length === 0 ? (
                <div style={{ ...panelStyle, padding: "24px", color: "#6b7280" }}>
                  No hay reseñas que coincidan con los filtros aplicados.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {filteredReviews.map((review, index) => {
                    const stars = getRating(review);
                    const orderCode = getOrderCode(review);
                    return (
                      <div key={`${orderCode}-${index}`} style={{ ...panelStyle, padding: "14px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "10px",
                          }}
                        >
                          <div>
                            <p
                              style={{
                                margin: "0 0 4px 0",
                                fontWeight: "600",
                                color: "#111827",
                                fontSize: "14px",
                              }}
                            >
                              {getCustomerName(review)}
                            </p>
                            <p style={{ margin: "0 0 6px 0", color: "#6b7280", fontSize: "12px" }}>
                              <Package size={12} style={{ verticalAlign: "text-bottom", marginRight: "5px" }} />
                              Orden: ORD-{orderCode || "—"}
                            </p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>{renderStars(stars)}</div>
                        </div>

                        <p style={{ margin: "0 0 6px 0", color: "#374151", fontSize: "14px" }}>
                          {String(review?.comment ?? "").trim() || "Sin comentario."}
                        </p>
                        <p style={{ margin: 0, color: "#9ca3af", fontSize: "12px" }}>{getReviewDate(review)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
