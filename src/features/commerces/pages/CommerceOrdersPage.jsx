// src/features/commerces/pages/CommerceOrdersPage.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, MapPin, Calendar, Filter, ChevronDown, ChevronUp, Package } from "lucide-react";
import { Pagination } from "../../clients/components/commerceProfile/Pagination";
import { OrderStepper } from "../../clients/components/OrderStepper";
import { PageLoader } from "../../../components/PageLoader";
import { apiClient as commerceApiClient } from "../services/editCommerceApi";
import { fetchStoreOrders, updateOrderStatus, getOrderErrorMessage } from "../services/commerceOrdersApi";
import { DeliveryAssignmentModal } from "../components/deliveryAssignment/DeliveryAssignmentModal.jsx";
import { checkOrderAssignment } from "../services/deliveryAssignmentApi.js";
import { formatGuarani } from "../../../lib/formatGuarani.js";

export { formatGuarani };

const ITEMS_PER_PAGE = 10;
const ACTIVE_ORDER_STATUSES = ["PENDING", "PROCESSING", "SHIPPED"];

const STATUS_LABELS = {
  PENDING:    "Pendiente",
  PROCESSING: "Procesando",
  SHIPPED:    "Enviado",
  DELIVERED:  "Entregado",
  CANCELLED:  "Cancelado",
};

const getNextStatus = (order) => {
  if (order.status !== "PROCESSING") return null;
  return order.address ? "SHIPPED" : "DELIVERED";
};

export function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return "hace unos segundos";
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)} días`;
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const STATUS_BADGE_CFG = {
  DELIVERED:  { label: "Entregado",  bg: "#dcfce7", color: "#15803d" },
  CANCELLED:  { label: "Cancelado",  bg: "#fee2e2", color: "#991b1b" },
  PROCESSING: { label: "Procesando", bg: "#dbeafe", color: "#1e40af" },
  SHIPPED:    { label: "Enviado",    bg: "#d1fae5", color: "#065f46" },
  PENDING:    { label: "Pendiente",  bg: "#fef3c7", color: "#92400e" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_BADGE_CFG[status] ?? { label: status, bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

// ─── Botones de acción para PendingOrderCard ──────────────────────────────────

function PickupActions({ orderId, isBusy, isAccepting, isRejecting, onAccept, onReject }) {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        type="button"
        onClick={() => onAccept(orderId)}
        disabled={isBusy}
        style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "7px 14px", borderRadius: "8px",
          backgroundColor: "var(--primary-dark)", color: "white",
          border: "none", fontSize: "13px", fontWeight: "600",
          cursor: isBusy ? "not-allowed" : "pointer",
          opacity: isBusy ? 0.6 : 1,
        }}
      >
        <CheckCircle size={14} /> {isAccepting ? "Aceptando..." : "Aceptar"}
      </button>
      <button
        type="button"
        onClick={() => onReject(orderId)}
        disabled={isBusy}
        style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "7px 14px", borderRadius: "8px",
          backgroundColor: "white", color: "#dc2626",
          border: "1px solid #fecdd3", fontSize: "13px", fontWeight: "600",
          cursor: isBusy ? "not-allowed" : "pointer",
          opacity: isBusy ? 0.6 : 1,
        }}
      >
        <XCircle size={14} /> {isRejecting ? "Rechazando..." : "Rechazar"}
      </button>
    </div>
  );
}

PickupActions.propTypes = {
  orderId:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isBusy:      PropTypes.bool.isRequired,
  isAccepting: PropTypes.bool.isRequired,
  isRejecting: PropTypes.bool.isRequired,
  onAccept:    PropTypes.func.isRequired,
  onReject:    PropTypes.func.isRequired,
};

function DeliveryActions({ order, isBusy, isDelegating, isAssigned, onDelegate }) {
  if (isAssigned) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "7px 14px", borderRadius: "8px",
        backgroundColor: "#dcfce7", color: "#15803d",
        border: "1px solid #bbf7d0", fontSize: "13px", fontWeight: "600",
      }}>
        <CheckCircle size={14} /> Delivery asignado
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onDelegate(order)}
      disabled={isBusy}
      style={{
        display: "flex", alignItems: "center", gap: "5px",
        padding: "7px 14px", borderRadius: "8px",
        backgroundColor: "var(--primary-dark)", color: "white",
        border: "none", fontSize: "13px", fontWeight: "600",
        cursor: isBusy ? "not-allowed" : "pointer",
        opacity: isBusy ? 0.6 : 1,
      }}
    >
      <Truck size={14} /> {isDelegating ? "Abriendo..." : "Añadir delivery"}
    </button>
  );
}

DeliveryActions.propTypes = {
  order:       PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }).isRequired,
  isBusy:      PropTypes.bool.isRequired,
  isDelegating: PropTypes.bool.isRequired,
  isAssigned:  PropTypes.bool.isRequired,
  onDelegate:  PropTypes.func.isRequired,
};

// ─── Tab: Pedidos Pendientes ──────────────────────────────────────────────────

function PendingOrderCard({ order, onAccept, onReject, isAccepting, isRejecting }) {
  const [showDetail, setShowDetail] = useState(false);
  const isPickup = !order.address;
  const isBusy   = isAccepting || isRejecting;
  const itemCount = order.items?.length ?? 0;

  const locationLabel = isPickup
    ? "Retiro en tienda"
    : `${order.address?.city ?? "—"}${order.address?.region ? `, ${order.address.region}` : ""}`;

  return (
    <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "12px", borderLeft: "3px solid var(--primary-dark)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>
            #ORD-{order.id}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={12} /> {locationLabel}
            </span>
            <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={12} /> {timeAgo(order.createdAt)}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "#374151", margin: "0 0 4px 0" }}>
            {itemCount} ítem{itemCount !== 1 ? "s" : ""}
          </p>
          {order.notes && (
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0, fontStyle: "italic" }}>{order.notes}</p>
          )}
          <button
            type="button"
            onClick={() => setShowDetail((prev) => !prev)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "8px",
              padding: "6px 12px", borderRadius: "8px", backgroundColor: "white",
              color: "var(--primary-dark)", border: "1px solid #d1d5db",
              fontSize: "12px", fontWeight: "600", cursor: "pointer",
            }}
          >
            {showDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showDetail ? "Ocultar detalle" : "Ver detalle del pedido"}
          </button>
          {showDetail && <OrderItemsDetail order={order} />}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "11px", color: "#6b7280", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total del pedido</p>
            <p style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: 0 }}>{formatGuarani(order.total)}</p>
          </div>

          <PickupActions
            orderId={order.id}
            isBusy={isBusy}
            isAccepting={isAccepting}
            isRejecting={isRejecting}
            onAccept={onAccept}
            onReject={onReject}
          />
        </div>
      </div>
    </div>
  );
}

PendingOrderCard.propTypes = {
  order: PropTypes.shape({
    id:        PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    address:   PropTypes.shape({ city: PropTypes.string, region: PropTypes.string }),
    createdAt: PropTypes.string,
    items:     PropTypes.array,
    notes:     PropTypes.string,
    total:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onAccept:    PropTypes.func.isRequired,
  onReject:    PropTypes.func.isRequired,
  isAccepting: PropTypes.bool.isRequired,
  isRejecting: PropTypes.bool.isRequired,
};

// ─── Detalle de productos (seguimiento) ───────────────────────────────────────

function OrderItemsDetail({ order }) {
  const items = order.items ?? [];
  const itemsSubtotal = items.reduce((acc, item) => acc + Number(item.subtotal ?? 0), 0);
  const shippingCost = Number(order.shippingCost ?? 0);

  if (items.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "#9ca3af", margin: "12px 0 0 0" }}>
        No hay productos registrados en este pedido.
      </p>
    );
  }

  const gridCols = "1fr 72px 100px 110px";
  const headerStyle = {
    display: "grid",
    gridTemplateColumns: gridCols,
    gap: "8px",
    padding: "8px 12px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px 8px 0 0",
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
  const rowStyle = {
    display: "grid",
    gridTemplateColumns: gridCols,
    gap: "8px",
    padding: "10px 12px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "13px",
    alignItems: "center",
  };

  return (
    <section style={{ marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
        <Package size={14} color="#6b7280" />
        <span style={{ fontSize: "12px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Productos del pedido
        </span>
      </div>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
        <div style={headerStyle}>
          <span>Producto</span>
          <span style={{ textAlign: "center" }}>Cant.</span>
          <span style={{ textAlign: "right" }}>P. unit.</span>
          <span style={{ textAlign: "right" }}>Subtotal</span>
        </div>
        {items.map((item, idx) => (
          <div
            key={item.id ?? idx}
            style={{ ...rowStyle, borderBottom: idx < items.length - 1 ? "1px solid #f3f4f6" : "none" }}
          >
            <div>
              <p style={{ fontWeight: "600", color: "#111827", margin: "0 0 2px 0" }}>
                {item.name ?? "Producto"}
              </p>
              {item.isOfferApplied && (
                <span style={{ fontSize: "11px", color: "#15803d" }}>Oferta aplicada</span>
              )}
            </div>
            <p style={{ textAlign: "center", color: "#374151", margin: 0 }}>{item.quantity}</p>
            <div>
              <p style={{ textAlign: "right", color: "#374151", margin: 0 }}>{formatGuarani(item.price)}</p>
              {item.isOfferApplied && item.originalPrice != null && (
                <p style={{ textAlign: "right", fontSize: "11px", color: "#9ca3af", margin: "2px 0 0 0", textDecoration: "line-through" }}>
                  {formatGuarani(item.originalPrice)}
                </p>
              )}
            </div>
            <p style={{ textAlign: "right", fontWeight: "600", color: "#111827", margin: 0 }}>
              {formatGuarani(item.subtotal)}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "10px", padding: "10px 12px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6b7280", marginBottom: shippingCost > 0 ? "4px" : 0 }}>
          <span>Subtotal productos</span>
          <span>{formatGuarani(itemsSubtotal)}</span>
        </div>
        {shippingCost > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
            <span>Envío</span>
            <span>{formatGuarani(shippingCost)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "700", color: "#111827", paddingTop: "6px", borderTop: "1px solid #e5e7eb" }}>
          <span>Total</span>
          <span>{formatGuarani(order.total)}</span>
        </div>
      </div>
    </section>
  );
}

OrderItemsDetail.propTypes = {
  order: PropTypes.shape({
    items: PropTypes.array,
    total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    shippingCost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};

// ─── Tab: Seguimiento ─────────────────────────────────────────────────────────

function TrackingOrderCard({
  order, onReject, onAdvance, onDelegate, isRejecting, isActioning, isDelegating, isAssigned,
}) {
  const [showDetail, setShowDetail] = useState(false);
  const stepperEstado = STATUS_LABELS[order.status] ?? order.status;
  const isPickup      = !order.address;
  const nextStatus    = getNextStatus(order);
  const canAdvance    = Boolean(nextStatus) && (isPickup || isAssigned);
  const showDelivery  = order.status === "PROCESSING" && !isPickup;
  const isBusy        = isRejecting || isActioning || isDelegating;
  const itemCount     = order.items?.length ?? 0;

  return (
    <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "4px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 2px 0" }}>ORD-{order.id}</p>
          <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0" }}>
            {isPickup ? "Retiro en tienda" : `${order.address?.city ?? "—"}${order.address?.region ? `, ${order.address.region}` : ""}`}
          </p>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={11} /> {timeAgo(order.createdAt)}
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {order.status === "PROCESSING" && (
            <button type="button" onClick={() => onReject(order.id)} disabled={isBusy} style={{
              display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px",
              backgroundColor: "white", color: "#dc2626", border: "1px solid #fecdd3", fontSize: "13px", fontWeight: "600",
              cursor: isBusy ? "not-allowed" : "pointer", opacity: isBusy ? 0.6 : 1,
            }}>
              <XCircle size={14} /> {isRejecting ? "Cancelando..." : "Cancelar"}
            </button>
          )}
          {showDelivery && (
            <DeliveryActions
              order={order}
              isBusy={isBusy}
              isDelegating={isDelegating}
              isAssigned={isAssigned}
              onDelegate={onDelegate}
            />
          )}
          {canAdvance && (
            <button type="button" onClick={() => onAdvance(order)} disabled={isBusy} style={{
              display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px",
              backgroundColor: "var(--primary-dark)", color: "white", border: "none", fontSize: "13px", fontWeight: "600",
              cursor: isBusy ? "not-allowed" : "pointer", opacity: isBusy ? 0.6 : 1,
            }}>
              <Truck size={14} /> {nextStatus === "SHIPPED" ? "Marcar como Enviado" : "Marcar como Entregado"}
            </button>
          )}
        </div>
      </div>

      <OrderStepper estado={stepperEstado} />

      {order.deliveryUnavailable && order.status === "PROCESSING" && (
        <div style={{
          marginTop: "10px", padding: "10px 12px", borderRadius: "8px",
          backgroundColor: "#fff7ed", border: "1px solid #fed7aa",
          fontSize: "12px", color: "#9a3412", fontWeight: "600",
        }}>
          Sin repartidor disponible: un delivery rechazó o no hay más repartidores activos. Asigná manualmente otro delivery.
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", gap: "12px", flexWrap: "wrap" }}>
        <p style={{ fontSize: "12px", color: "#374151", margin: 0 }}>
          {itemCount} ítem{itemCount !== 1 ? "s" : ""} — {formatGuarani(order.total)}
        </p>
        <button
          type="button"
          onClick={() => setShowDetail((prev) => !prev)}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "6px 12px", borderRadius: "8px",
            backgroundColor: "white", color: "var(--primary-dark)",
            border: "1px solid #d1d5db", fontSize: "12px", fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {showDetail ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showDetail ? "Ocultar detalle" : "Ver detalle del pedido"}
        </button>
      </div>

      {showDetail && <OrderItemsDetail order={order} />}
    </div>
  );
}

TrackingOrderCard.propTypes = {
  order: PropTypes.shape({
    id:        PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    status:    PropTypes.string,
    address:   PropTypes.shape({ city: PropTypes.string, region: PropTypes.string }),
    createdAt: PropTypes.string,
    items:     PropTypes.array,
    total:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    shippingCost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onReject:     PropTypes.func.isRequired,
  onAdvance:    PropTypes.func.isRequired,
  onDelegate:   PropTypes.func.isRequired,
  isRejecting:  PropTypes.bool.isRequired,
  isActioning:  PropTypes.bool.isRequired,
  isDelegating: PropTypes.bool.isRequired,
  isAssigned:   PropTypes.bool.isRequired,
};

// ─── Tab: Historial ───────────────────────────────────────────────────────────

function HistoryTab({ storeId }) {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [filterFrom, setFilterFrom]       = useState("");
  const [filterTo, setFilterTo]           = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);

  const fetchHistory = useCallback(async () => {
    if (!storeId) { setOrders([]); setTotalPages(1); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const filters = { page, limit: ITEMS_PER_PAGE };
      if (filterStatus === "all") { filters.order_status = ["DELIVERED", "CANCELLED"]; }
      else { filters.order_status = filterStatus; }
      if (filterFrom) filters.date_from = filterFrom;
      if (filterTo)   filters.date_to   = filterTo;
      const data = await fetchStoreOrders(storeId, filters);
      setOrders(data.orders);
      setTotalPages(data.total_page ?? 1);
    } catch (err) {
      setError(getOrderErrorMessage(err, "No se pudo cargar el historial."));
    } finally { setLoading(false); }
  }, [storeId, filterStatus, filterFrom, filterTo, page]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const inputStyle = { padding: "7px 10px", borderRadius: "8px", fontSize: "13px", border: "1px solid #e5e7eb", backgroundColor: "white", outline: "none" };
  const visibleOrders = filterMinAmount
    ? orders.filter(o => Number(o.total) >= Number(filterMinAmount))
    : orders;

  return (
    <>
      {/* Filtros */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", margin: "0 0 4px 0", textTransform: "uppercase" }}>Desde</p>
          <div style={{ position: "relative" }}>
            <Calendar size={13} color="#9ca3af" style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)" }} />
            <input type="date" value={filterFrom} onChange={e => { setFilterFrom(e.target.value); setPage(1); }} style={{ ...inputStyle, paddingLeft: "28px" }} />
          </div>
        </div>
        <div>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", margin: "0 0 4px 0", textTransform: "uppercase" }}>Hasta</p>
          <div style={{ position: "relative" }}>
            <Calendar size={13} color="#9ca3af" style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)" }} />
            <input type="date" value={filterTo} onChange={e => { setFilterTo(e.target.value); setPage(1); }} style={{ ...inputStyle, paddingLeft: "28px" }} />
          </div>
        </div>
        <div>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", margin: "0 0 4px 0", textTransform: "uppercase" }}>Estado</p>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="all">Todos los estados</option>
            <option value="DELIVERED">Entregados</option>
            <option value="CANCELLED">Cancelados</option>
          </select>
        </div>
        <div>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", margin: "0 0 4px 0", textTransform: "uppercase" }}>Monto mínimo</p>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#9ca3af" }}>Gs.</span>
            <input type="number" min="0" value={filterMinAmount} onChange={e => { setFilterMinAmount(e.target.value); setPage(1); }} placeholder="0" style={{ ...inputStyle, paddingLeft: "32px", width: "110px" }} />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px", marginBottom: "16px" }}>{error}</div>
      )}

      {loading && <PageLoader />}

      {!loading && visibleOrders.length === 0 && (
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "48px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <Filter size={36} color="#d1d5db" style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>No hay pedidos con esos filtros.</p>
        </div>
      )}

      {!loading && visibleOrders.length > 0 && (
        <>
          <div style={{ backgroundColor: "white", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 100px 1fr 80px 150px 110px", padding: "10px 16px", backgroundColor: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
              {["Fecha", "Pedido ID", "Dirección", "Ítems", "Total", "Estado"].map(h => (
                <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
              ))}
            </div>
            {visibleOrders.map((order, idx) => (
              <div key={order.id} style={{ display: "grid", gridTemplateColumns: "120px 100px 1fr 80px 150px 110px", padding: "12px 16px", alignItems: "center", borderBottom: idx < visibleOrders.length - 1 ? "1px solid #f9fafb" : "none" }}>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>{new Date(order.createdAt).toLocaleDateString("es-PY", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>#OM-{order.id}</span>
                <span style={{ fontSize: "13px", color: "#111827" }}>{order.address?.city ?? "—"}</span>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>{order.items?.length ?? 0} ítem{order.items?.length !== 1 ? "s" : ""}</span>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>{formatGuarani(order.total)}</span>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "10px" }}>
            Mostrando {visibleOrders.length} pedido{visibleOrders.length !== 1 ? "s" : ""}
          </p>
          {totalPages > 1 && <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />}
        </>
      )}
    </>
  );
}

HistoryTab.propTypes = {
  storeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

// ─── Página principal ─────────────────────────────────────────────────────────

export function CommerceOrdersPage() {
  const [storeId, setStoreId]               = useState(null);
  const [orders, setOrders]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [activeTab, setActiveTab]           = useState("pending");
  const [page, setPage]                     = useState(1);
  const [actioningSet, setActioningSet]     = useState(new Set());
  const [actionError, setActionError]       = useState("");
  const [assignedOrders, setAssignedOrders] = useState(new Set());
  const [delegatingOrder, setDelegatingOrder] = useState(null);

  const addActioning    = (id, action) => setActioningSet(prev => new Set(prev).add(`${id}:${action}`));
  const removeActioning = (id, action) => setActioningSet(prev => { const s = new Set(prev); s.delete(`${id}:${action}`); return s; });
  const isActioning     = (id, action) => actioningSet.has(`${id}:${action}`);
  const isAnyActioning  = (id) => [`${id}:reject`, `${id}:advance`].some(k => actioningSet.has(k));

  const loadOrders = useCallback(async (sid) => {
    try {
      const data = await fetchStoreOrders(sid, {
        order_status: ACTIVE_ORDER_STATUSES,
        limit: 100,
      });

      setOrders(data.orders);
    } catch (err) {
      setError(getOrderErrorMessage(err, "No se pudieron cargar los pedidos."));
    }
  }, []);

  const checkAssignments = useCallback(async (orderList) => {
    const assigned = new Set();
    const toCheck = orderList.filter(
      (o) => o.address && o.status === "PROCESSING"
    );
    for (const order of toCheck) {
      try {
        const result = await checkOrderAssignment(order.id);
        if (result.has_assignment) assigned.add(order.id);
      } catch (err) {
        console.error(`Error verificando asignación de pedido ${order.id}:`, err);
      }
    }
    setAssignedOrders(assigned);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const sessionRes = await commerceApiClient.get("/api/session/user-session");
        const sid = sessionRes.data?.user?.id_store;
        if (!sid) { setError("No tenés un comercio registrado."); setLoading(false); return; }
        setStoreId(sid);
        await loadOrders(sid);
      } catch {
        setError("No se pudo cargar la sesión.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadOrders]);

  const pendingOrders  = useMemo(() => orders.filter(o => o.status === "PENDING"), [orders]);
  const trackingOrders = useMemo(
    () => orders.filter(o => ["PROCESSING", "SHIPPED"].includes(o.status)),
    [orders]
  );

  const activeOrders      = activeTab === "pending" ? pendingOrders : trackingOrders;
  const currentTotalPages = Math.ceil(activeOrders.length / ITEMS_PER_PAGE);
  const paginated         = activeOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    if (activeTab === "tracking" && activeOrders.length > 0) {
      checkAssignments(activeOrders);
    }
  }, [activeTab, activeOrders, checkAssignments]);

  useEffect(() => {
    if (!storeId || activeTab !== "tracking") return undefined;
    const intervalId = setInterval(() => loadOrders(storeId), 15000);
    return () => clearInterval(intervalId);
  }, [storeId, activeTab, loadOrders]);

  const handleStatusUpdate = async (orderId, newStatus, action) => {
    addActioning(orderId, action);
    setActionError("");
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders(storeId);
    } catch (err) {
      setActionError(getOrderErrorMessage(err, "No se pudo actualizar el pedido."));
    } finally {
      removeActioning(orderId, action);
    }
  };

  const handleReject  = (id) => handleStatusUpdate(id, "CANCELLED", "reject");
  const handleAdvance = (order) => {
    const next = getNextStatus(order);
    if (next) handleStatusUpdate(order.id, next, "advance");
  };
  const handleDelegate          = (order) => setDelegatingOrder(order);
  const handleAssignmentSuccess = () => loadOrders(storeId);

  const tabStyle = (tab) => ({
    padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "600",
    border: "none", cursor: "pointer",
    backgroundColor: activeTab === tab ? "var(--primary-dark)" : "white",
    color: activeTab === tab ? "white" : "#374151",
    boxShadow: activeTab === tab ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
  });

  // Descripciones de tabs extraídas (fix nested ternary Sonar)
  const tabDescriptions = {
    pending:  "Aceptá o rechazá los pedidos entrantes antes de prepararlos.",
    tracking: "Asigná delivery y seguí el progreso hasta la entrega.",
    history:  "Gestioná y revisá todas tus transacciones pasadas en un solo lugar.",
  };

  const tabTitles = {
    pending:  "Pedidos Pendientes",
    tracking: "Seguimiento de Pedidos",
    history:  "Historial de Pedidos",
  };

  const emptyMessage = activeTab === "pending"
    ? "No tenés pedidos pendientes."
    : "No tenés pedidos en progreso.";

  if (loading) return <PageLoader />;

  return (
    <>
      {/* Modal de asignación */}
      {delegatingOrder && storeId && (
        <DeliveryAssignmentModal
          order={delegatingOrder}
          storeId={storeId}
          onClose={() => setDelegatingOrder(null)}
          onSuccess={handleAssignmentSuccess}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>{tabTitles[activeTab]}</h4>
          <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>{tabDescriptions[activeTab]}</p>
        </div>
        {activeTab === "pending" && pendingOrders.length > 0 && (
          <div style={{ backgroundColor: "var(--primary-dark)", color: "white", borderRadius: "12px", padding: "12px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <ShoppingBag size={22} />
            <div>
              <p style={{ fontSize: "11px", margin: "0 0 2px 0", opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.05em" }}>Esperando acción</p>
              <p style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>{pendingOrders.length} Pedido{pendingOrders.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        )}
      </div>

      {/* Errores */}
      {actionError && (
        <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px", marginBottom: "16px" }}>{actionError}</div>
      )}
      {error && (
        <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px", marginBottom: "16px" }}>{error}</div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button type="button" style={tabStyle("pending")} onClick={() => { setActiveTab("pending"); setPage(1); }}>
          Pendientes
          {pendingOrders.length > 0 && (
            <span style={{ marginLeft: "8px", backgroundColor: "#dc2626", color: "white", borderRadius: "20px", padding: "1px 7px", fontSize: "11px", fontWeight: "700" }}>{pendingOrders.length}</span>
          )}
        </button>
        <button type="button" style={tabStyle("tracking")} onClick={() => { setActiveTab("tracking"); setPage(1); }}>
          Seguimiento
          {trackingOrders.length > 0 && (
            <span style={{ marginLeft: "8px", backgroundColor: activeTab === "tracking" ? "rgba(255,255,255,0.3)" : "#6b9080", color: "white", borderRadius: "20px", padding: "1px 7px", fontSize: "11px", fontWeight: "700" }}>{trackingOrders.length}</span>
          )}
        </button>
        <button type="button" style={tabStyle("history")} onClick={() => { setActiveTab("history"); setPage(1); }}>
          Historial
        </button>
      </div>

      {/* Contenido */}
      {activeTab === "history" && <HistoryTab storeId={storeId} />}

      {activeTab !== "history" && paginated.length === 0 && (
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "48px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <Truck size={40} color="#d1d5db" style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>{emptyMessage}</p>
        </div>
      )}

      {activeTab === "pending" && paginated.length > 0 && paginated.map(order => (
        <PendingOrderCard
          key={order.id}
          order={order}
          onAccept={() => handleStatusUpdate(order.id, "PROCESSING", "accept")}
          onReject={handleReject}
          isAccepting={isActioning(order.id, "accept")}
          isRejecting={isActioning(order.id, "reject")}
        />
      ))}

      {activeTab === "tracking" && paginated.length > 0 && paginated.map(order => (
        <TrackingOrderCard
          key={order.id}
          order={order}
          onReject={handleReject}
          onAdvance={handleAdvance}
          onDelegate={handleDelegate}
          isRejecting={isActioning(order.id, "reject")}
          isActioning={isAnyActioning(order.id)}
          isDelegating={delegatingOrder?.id === order.id}
          isAssigned={assignedOrders.has(order.id)}
        />
      ))}

      {activeTab !== "history" && currentTotalPages > 1 && (
        <Pagination totalPages={currentTotalPages} currentPage={page} onPageChange={setPage} />
      )}
    </>
  );
}