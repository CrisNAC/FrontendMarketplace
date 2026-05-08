import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Star, MessageSquare, UserRound, Truck, Filter } from "lucide-react";
import { apiClient as commerceApiClient } from "../services/editCommerceApi";
import {
  getDeliveryReviewsErrorMessage,
  getStoreDeliveryReviews,
} from "../services/deliveryReviewsApi";

const STAR_OPTIONS = [
  { label: "Todas", value: "all" },
  { label: "5 estrellas", value: "5" },
  { label: "4 estrellas", value: "4" },
  { label: "3 estrellas", value: "3" },
  { label: "2 estrellas", value: "2" },
  { label: "1 estrella", value: "1" },
];

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "14px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const inputStyle = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  fontSize: "14px",
  color: "#111827",
  padding: "10px 12px",
  outline: "none",
  backgroundColor: "white",
};

const renderStars = (rating) => (
  <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={15}
        style={{
          color: star <= rating ? "#fbbf24" : "#d1d5db",
          fill: star <= rating ? "#fbbf24" : "transparent",
        }}
      />
    ))}
  </div>
);

export function CommerceDeliveryReviewsPage() {
  const [storeId, setStoreId] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [deliveryId, setDeliveryId] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [starFilter, setStarFilter] = useState("all");

  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionRes = await commerceApiClient.get("/api/session/user-session");
        const sid = sessionRes.data?.user?.id_store;
        if (!sid) {
          setError("No tenés un comercio registrado.");
          return;
        }
        setStoreId(sid);
      } catch {
        setError("No se pudo cargar la sesión.");
      } finally {
        setLoadingSession(false);
      }
    };

    loadSession();
  }, []);

  const averageRating = useMemo(() => {
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc, review) => acc + Number(review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const handleSearchReviews = useCallback(async () => {
    if (!storeId) return;

    if (!deliveryId.trim()) {
      setError("Ingresá el ID del repartidor para consultar las reseñas.");
      setReviews([]);
      setTotal(0);
      return;
    }

    const parsedDeliveryId = Number(deliveryId);
    if (!Number.isInteger(parsedDeliveryId) || parsedDeliveryId <= 0) {
      setError("El ID del repartidor debe ser un número válido.");
      setReviews([]);
      setTotal(0);
      return;
    }

    const filters = {};

    if (orderSearch.trim()) {
      filters.search = orderSearch.trim();
    }

    if (starFilter !== "all") {
      filters.minRating = Number(starFilter);
      filters.maxRating = Number(starFilter);
    }

    setLoadingReviews(true);
    setError("");
    try {
      const data = await getStoreDeliveryReviews(storeId, parsedDeliveryId, filters);
      setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      setTotal(Number(data?.total || 0));
    } catch (err) {
      setError(getDeliveryReviewsErrorMessage(err));
      setReviews([]);
      setTotal(0);
    } finally {
      setLoadingReviews(false);
    }
  }, [storeId, deliveryId, orderSearch, starFilter]);

  const formatDate = (value) => {
    if (!value) return "Fecha no disponible";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Fecha no disponible";
    return date.toLocaleDateString("es-PY", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loadingSession) {
    return <p style={{ color: "#6b7280", padding: "16px" }}>Cargando reseñas...</p>;
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h4 style={{ margin: "0 0 4px 0", fontWeight: "600" }}>Reseñas de Repartidores</h4>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
          Visualizá puntuaciones y comentarios de los pedidos entregados por tus deliveries.
        </p>
      </div>

      <div style={{ ...cardStyle, padding: "14px 16px", marginBottom: "16px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 180px auto",
            gap: "10px",
            alignItems: "end",
          }}
        >
          <div>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", margin: "0 0 6px 0", textTransform: "uppercase" }}>
              ID repartidor
            </p>
            <div style={{ position: "relative" }}>
              <UserRound size={14} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="number"
                min="1"
                value={deliveryId}
                onChange={(event) => setDeliveryId(event.target.value)}
                placeholder="Ej: 12"
                style={{ ...inputStyle, paddingLeft: "32px" }}
              />
            </div>
          </div>

          <div>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", margin: "0 0 6px 0", textTransform: "uppercase" }}>
              Buscar por pedido
            </p>
            <div style={{ position: "relative" }}>
              <Search size={14} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="number"
                min="1"
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder="Código de pedido"
                style={{ ...inputStyle, paddingLeft: "32px" }}
              />
            </div>
          </div>

          <div>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", margin: "0 0 6px 0", textTransform: "uppercase" }}>
              Filtro de estrellas
            </p>
            <select
              value={starFilter}
              onChange={(event) => setStarFilter(event.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {STAR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSearchReviews}
            disabled={loadingReviews}
            style={{
              border: "none",
              borderRadius: "10px",
              backgroundColor: "var(--primary-dark)",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loadingReviews ? "not-allowed" : "pointer",
              opacity: loadingReviews ? 0.7 : 1,
              padding: "10px 16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              justifyContent: "center",
            }}
          >
            <Filter size={15} />
            {loadingReviews ? "Buscando..." : "Aplicar filtros"}
          </button>
        </div>
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

      {!error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
          <div style={{ ...cardStyle, padding: "14px 16px" }}>
            <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#6b7280" }}>Calificación Promedio</p>
            <p style={{ margin: 0, fontWeight: "700", fontSize: "22px", color: "#111827", display: "flex", gap: "8px", alignItems: "center" }}>
              <Star size={18} color="#fbbf24" fill="#fbbf24" />
              {averageRating ?? "—"}
            </p>
          </div>
          <div style={{ ...cardStyle, padding: "14px 16px" }}>
            <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#6b7280" }}>Total Reseñas</p>
            <p style={{ margin: 0, fontWeight: "700", fontSize: "22px", color: "#111827", display: "flex", gap: "8px", alignItems: "center" }}>
              <MessageSquare size={18} color="#3b82f6" />
              {total}
            </p>
          </div>
          <div style={{ ...cardStyle, padding: "14px 16px" }}>
            <p style={{ margin: "0 0 6px 0", fontSize: "12px", color: "#6b7280" }}>Repartidor Consultado</p>
            <p style={{ margin: 0, fontWeight: "700", fontSize: "22px", color: "#111827", display: "flex", gap: "8px", alignItems: "center" }}>
              <Truck size={18} color="#0f766e" />
              {deliveryId?.trim() || "—"}
            </p>
          </div>
        </div>
      )}

      {!loadingReviews && !error && reviews.length === 0 && (
        <div style={{ ...cardStyle, padding: "48px 20px", textAlign: "center" }}>
          <MessageSquare size={38} color="#d1d5db" style={{ marginBottom: "10px" }} />
          <p style={{ margin: 0, color: "#6b7280" }}>
            No hay reseñas para los filtros aplicados.
          </p>
        </div>
      )}

      {!loadingReviews && !error && reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {reviews.map((review) => (
            <article key={review.id} style={{ ...cardStyle, padding: "14px 16px", border: "1px solid #ecfdf5" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                    {review.customerName || "Cliente"}
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                    Pedido: ORD-{review.orderId}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>{renderStars(review.rating)}</div>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#9ca3af" }}>
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>

              <p style={{ margin: "12px 0 0 0", color: "#374151", fontSize: "14px" }}>
                {review.comment?.trim() || "Sin comentario."}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
