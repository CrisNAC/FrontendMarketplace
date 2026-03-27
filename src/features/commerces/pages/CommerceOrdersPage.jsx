// src/features/commerces/pages/CommerceOrdersPage.jsx
import { useState, useMemo } from "react";
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, User, MapPin, ChevronDown, Calendar, Filter } from "lucide-react";
import { Pagination } from "../../clients/components/commerceProfile/Pagination";
import { OrderStepper } from "../../clients/components/OrderStepper";

// ─── Mock toggle ──────────────────────────────────────────────────────────────
const USE_MOCK = true;
const ITEMS_PER_PAGE = 5;

// Estados del stepper (deben coincidir con los valores que usa OrderStepper)
const STATUS_LABELS = {
    PENDING:    "Pendiente",
    PROCESSING: "Procesando",
    SHIPPED:    "Enviado",
    DELIVERED:  "Entregado",
    CANCELLED:  "Cancelado",
};

// Siguiente estado al avanzar un pedido
const NEXT_STATUS = {
    PROCESSING: "SHIPPED",
    SHIPPED:    "DELIVERED",
};

const MOCK_ORDERS_BASE = [
    {
        id_order: 8824,
        order_status: "PENDING",
        total: "142500",
        notes: null,
        created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        user: { name: "Alejandro Moreno" },
        delivery_type: "Delivery Local",
        order_items: [
            { id_order_item: 1, quantity: 2, product: { name: "Aceite de Oliva Virgen" } },
            { id_order_item: 2, quantity: 1, product: { name: "Queso Manchego Curado" } },
            { id_order_item: 3, quantity: 3, product: { name: "Pack Pasta Integral" } },
        ],
    },
    {
        id_order: 8823,
        order_status: "PENDING",
        total: "68900",
        notes: null,
        created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        user: { name: "Sofía Villalobos" },
        delivery_type: "Recojo en Tienda",
        order_items: [
            { id_order_item: 3, quantity: 1, product: { name: "Caja de Frutas Tropicales Mix" } },
            { id_order_item: 4, quantity: 1, product: { name: "Miel de Abeja Orgánica 500g" } },
        ],
    },
    {
        id_order: 8820,
        order_status: "PENDING",
        total: "210000",
        notes: "Por favor empaquetado especial para regalo",
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        user: { name: "Carlos Ruiz" },
        delivery_type: "Delivery Express",
        order_items: [
            { id_order_item: 5, quantity: 5, product: { name: "Buqué Artesanal" } },
            { id_order_item: 6, quantity: 1, product: { name: "Pack de Café en Grano 1kg" } },
        ],
    },
    {
        id_order: 8810,
        order_status: "PROCESSING",
        total: "95000",
        notes: null,
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        user: { name: "Laura Pérez" },
        delivery_type: "Delivery Local",
        order_items: [
            { id_order_item: 7, quantity: 2, product: { name: "Jabón Artesanal" } },
            { id_order_item: 8, quantity: 1, product: { name: "Crema Hidratante Natural" } },
        ],
    },
    {
        id_order: 8805,
        order_status: "SHIPPED",
        total: "320000",
        notes: null,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        user: { name: "Martín García" },
        delivery_type: "Delivery Express",
        order_items: [
            { id_order_item: 9, quantity: 1, product: { name: "Set de Vinos Premium" } },
        ],
    },
    {
        id_order: 8800,
        order_status: "DELIVERED",
        total: "450000",
        notes: null,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        user: { name: "Market Central" },
        delivery_type: "Delivery Express",
        order_items: [
            { id_order_item: 10, quantity: 5, product: { name: "Aceite de Oliva" } },
            { id_order_item: 11, quantity: 3, product: { name: "Queso Curado" } },
        ],
    },
    {
        id_order: 8799,
        order_status: "CANCELLED",
        total: "583200",
        notes: null,
        created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        user: { name: "Don Sergio Mira" },
        delivery_type: "Recojo en Tienda",
        order_items: [
            { id_order_item: 12, quantity: 4, product: { name: "Pack Gourmet" } },
        ],
    },
    {
        id_order: 8795,
        order_status: "DELIVERED",
        total: "1290000",
        notes: null,
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        user: { name: "La Tasería" },
        delivery_type: "Delivery Local",
        order_items: [
            { id_order_item: 13, quantity: 25, product: { name: "Botella de Vino" } },
        ],
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "hace unos segundos";
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return `hace ${Math.floor(diff / 86400)} días`;
}

function formatGuarani(value) {
    return `Gs. ${Number(value).toLocaleString("es-PY")}`;
}

// ─── Tab: Pedidos Pendientes ──────────────────────────────────────────────────
function PendingOrderCard({ order, onAccept, onReject, isActioning }) {
    const itemsSummary = order.order_items.map(i => `${i.quantity}x ${i.product.name}`).join(", ");

    return (
        <div style={{
            backgroundColor: "white", borderRadius: "14px", padding: "16px 20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "12px",
            borderLeft: "3px solid var(--primary-dark)",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>
                        #ORD-{order.id_order}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                            <User size={12} /> {order.user?.name ?? "—"}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={12} /> {timeAgo(order.created_at)}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                            <MapPin size={12} /> {order.delivery_type ?? "—"}
                        </span>
                    </div>
                    <p style={{
                        fontSize: "12px", color: "#374151", margin: "0 0 4px 0",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "480px",
                    }}>
                        {itemsSummary}
                    </p>
                    {order.notes && (
                        <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0, fontStyle: "italic" }}>
                            {order.notes}
                        </p>
                    )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "11px", color: "#6b7280", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Total del pedido
                        </p>
                        <p style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: 0 }}>
                            {formatGuarani(order.total)}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" onClick={() => onAccept(order.id_order)} disabled={isActioning} style={{
                            display: "flex", alignItems: "center", gap: "5px",
                            padding: "7px 14px", borderRadius: "8px",
                            backgroundColor: "var(--primary-dark)", color: "white",
                            border: "none", fontSize: "13px", fontWeight: "600",
                            cursor: isActioning ? "not-allowed" : "pointer", opacity: isActioning ? 0.6 : 1,
                        }}>
                            <CheckCircle size={14} /> Aceptar
                        </button>
                        <button type="button" onClick={() => onReject(order.id_order)} disabled={isActioning} style={{
                            display: "flex", alignItems: "center", gap: "5px",
                            padding: "7px 14px", borderRadius: "8px",
                            backgroundColor: "white", color: "#dc2626",
                            border: "1px solid #fecdd3", fontSize: "13px", fontWeight: "600",
                            cursor: isActioning ? "not-allowed" : "pointer", opacity: isActioning ? 0.6 : 1,
                        }}>
                            <XCircle size={14} /> Rechazar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Tab: Seguimiento ─────────────────────────────────────────────────────────
function TrackingOrderCard({ order, onAdvance, isActioning }) {
    const itemsSummary = order.order_items.map(i => `${i.quantity}x ${i.product.name}`).join(", ");
    const stepperEstado = STATUS_LABELS[order.order_status] ?? order.order_status;
    const canAdvance = !!NEXT_STATUS[order.order_status];

    return (
        <div style={{
            backgroundColor: "white", borderRadius: "14px", padding: "16px 20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "12px",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "4px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 2px 0" }}>
                        ORD-{order.id_order}
                    </p>
                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0" }}>
                        {order.user?.name ?? "—"}
                    </p>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={11} /> {timeAgo(order.created_at)}
                    </p>
                </div>

                {canAdvance && (
                    <button
                        type="button"
                        onClick={() => onAdvance(order.id_order)}
                        disabled={isActioning}
                        style={{
                            display: "flex", alignItems: "center", gap: "5px",
                            padding: "7px 14px", borderRadius: "8px",
                            backgroundColor: "var(--primary-dark)", color: "white",
                            border: "none", fontSize: "13px", fontWeight: "600",
                            cursor: isActioning ? "not-allowed" : "pointer",
                            opacity: isActioning ? 0.6 : 1, flexShrink: 0,
                        }}
                    >
                        Cambiar Estado <ChevronDown size={13} />
                    </button>
                )}
            </div>

            {/* Stepper reutilizado */}
            <OrderStepper estado={stepperEstado} />

            <p style={{
                fontSize: "12px", color: "#374151", margin: "8px 0 0 0",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
                {itemsSummary}
            </p>
        </div>
    );
}


// ─── Tab: Historial ───────────────────────────────────────────────────────────
const HISTORY_STATUS_CONFIG = {
    DELIVERED: { label: "Entregado", bg: "#dcfce7", color: "#15803d" },
    CANCELLED: { label: "Cancelado", bg: "#fee2e2", color: "#991b1b" },
};

function HistoryStatusBadge({ status }) {
    const cfg = HISTORY_STATUS_CONFIG[status] ?? { label: status, bg: "#f3f4f6", color: "#374151" };
    return (
        <span style={{
            padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
            backgroundColor: cfg.bg, color: cfg.color,
        }}>
            {cfg.label}
        </span>
    );
}

function HistoryTab({ orders }) {
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");
    const [filterMinAmount, setFilterMinAmount] = useState("");
    const [page, setPage] = useState(1);

    const historyOrders = useMemo(() => {
        return orders
            .filter(o => o.order_status === "DELIVERED" || o.order_status === "CANCELLED")
            .filter(o => filterStatus === "all" || o.order_status === filterStatus)
            .filter(o => {
                if (!filterFrom) return true;
                return new Date(o.created_at) >= new Date(filterFrom);
            })
            .filter(o => {
                if (!filterTo) return true;
                return new Date(o.created_at) <= new Date(filterTo + "T23:59:59");
            })
            .filter(o => {
                if (!filterMinAmount) return true;
                return Number(o.total) >= Number(filterMinAmount);
            });
    }, [orders, filterStatus, filterFrom, filterTo, filterMinAmount]);

    const totalPages = Math.ceil(historyOrders.length / ITEMS_PER_PAGE);
    const paginated = historyOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const inputStyle = {
        padding: "7px 10px", borderRadius: "8px", fontSize: "13px",
        border: "1px solid #e5e7eb", backgroundColor: "white", outline: "none",
    };

    const selectStyle = { ...inputStyle, cursor: "pointer" };

    return (
        <>
            {/* Filtros */}
            <div style={{
                backgroundColor: "white", borderRadius: "12px", padding: "14px 16px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "16px",
                display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end",
            }}>
                <div>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", margin: "0 0 4px 0", textTransform: "uppercase" }}>Desde</p>
                    <div style={{ position: "relative" }}>
                        <Calendar size={13} color="#9ca3af" style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)" }} />
                        <input type="date" value={filterFrom} onChange={e => { setFilterFrom(e.target.value); setPage(1); }}
                            style={{ ...inputStyle, paddingLeft: "28px" }} />
                    </div>
                </div>
                <div>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", margin: "0 0 4px 0", textTransform: "uppercase" }}>Hasta</p>
                    <div style={{ position: "relative" }}>
                        <Calendar size={13} color="#9ca3af" style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)" }} />
                        <input type="date" value={filterTo} onChange={e => { setFilterTo(e.target.value); setPage(1); }}
                            style={{ ...inputStyle, paddingLeft: "28px" }} />
                    </div>
                </div>
                <div>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", margin: "0 0 4px 0", textTransform: "uppercase" }}>Estado</p>
                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={selectStyle}>
                        <option value="all">Todos los estados</option>
                        <option value="DELIVERED">Entregados</option>
                        <option value="CANCELLED">Cancelados</option>
                    </select>
                </div>
                <div>
                    <p style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", margin: "0 0 4px 0", textTransform: "uppercase" }}>Monto mínimo</p>
                    <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#9ca3af" }}>Gs.</span>
                        <input type="number" min="0" value={filterMinAmount}
                            onChange={e => { setFilterMinAmount(e.target.value); setPage(1); }}
                            placeholder="0" style={{ ...inputStyle, paddingLeft: "32px", width: "110px" }} />
                    </div>
                </div>
            </div>

            {/* Tabla */}
            {paginated.length === 0 ? (
                <div style={{
                    backgroundColor: "white", borderRadius: "16px", padding: "48px 20px",
                    textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}>
                    <Filter size={36} color="#d1d5db" style={{ marginBottom: "12px" }} />
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>
                        No hay pedidos con esos filtros.
                    </p>
                </div>
            ) : (
                <div style={{ backgroundColor: "white", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                    {/* Header tabla */}
                    <div style={{
                        display: "grid", gridTemplateColumns: "120px 1fr 1fr 80px 140px 110px",
                        padding: "10px 16px", backgroundColor: "#f9fafb",
                        borderBottom: "1px solid #f3f4f6",
                    }}>
                        {["Fecha", "Pedido ID", "Cliente", "Artículos", "Total", "Estado"].map(h => (
                            <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {h}
                            </span>
                        ))}
                    </div>

                    {/* Filas */}
                    {paginated.map((order, idx) => (
                        <div key={order.id_order} style={{
                            display: "grid", gridTemplateColumns: "120px 1fr 1fr 80px 140px 110px",
                            padding: "12px 16px", alignItems: "center",
                            borderBottom: idx < paginated.length - 1 ? "1px solid #f9fafb" : "none",
                        }}>
                            <span style={{ fontSize: "12px", color: "#6b7280" }}>
                                {new Date(order.created_at).toLocaleDateString("es-PY", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                                #OM-{order.id_order}
                            </span>
                            <span style={{ fontSize: "13px", color: "#111827" }}>
                                {order.user?.name ?? "—"}
                            </span>
                            <span style={{ fontSize: "13px", color: "#6b7280" }}>
                                {order.order_items.length} ítem{order.order_items.length !== 1 ? "s" : ""}
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>
                                {formatGuarani(order.total)}
                            </span>
                            <HistoryStatusBadge status={order.order_status} />
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            {historyOrders.length > 0 && (
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "10px" }}>
                    Mostrando {Math.min((page - 1) * ITEMS_PER_PAGE + 1, historyOrders.length)}–{Math.min(page * ITEMS_PER_PAGE, historyOrders.length)} de {historyOrders.length} pedidos
                </p>
            )}

            {totalPages > 1 && (
                <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            )}
        </>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function CommerceOrdersPage() {
    const [orders, setOrders] = useState(MOCK_ORDERS_BASE);
    const [activeTab, setActiveTab] = useState("pending"); // "pending" | "tracking"
    const [page, setPage] = useState(1);
    const [isActioning, setIsActioning] = useState(false);

    const pendingOrders = useMemo(() =>
        orders.filter(o => o.order_status === "PENDING"), [orders]);

    const trackingOrders = useMemo(() =>
        orders.filter(o => o.order_status === "PROCESSING" || o.order_status === "SHIPPED"), [orders]);

    const activeOrders = activeTab === "pending" ? pendingOrders : trackingOrders;
    const totalPages = Math.ceil(activeOrders.length / ITEMS_PER_PAGE);
    const paginated = activeOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const updateOrderStatus = async (orderId, newStatus) => {
        setIsActioning(true);
        try {
            if (USE_MOCK) {
                await new Promise(res => setTimeout(res, 500));
            } else {
                // TODO: await apiClient.put(`/api/orders/${orderId}/status`, { order_status: newStatus });
            }
            setOrders(prev => prev.map(o => o.id_order === orderId ? { ...o, order_status: newStatus } : o));
            // Ajustar página si queda vacía
            const remaining = activeOrders.length - 1;
            const newTotalPages = Math.ceil(remaining / ITEMS_PER_PAGE);
            if (page > newTotalPages && newTotalPages > 0) setPage(newTotalPages);
        } catch (err) {
            console.error("Error al actualizar pedido:", err);
        } finally {
            setIsActioning(false);
        }
    };

    const handleAccept  = (id) => updateOrderStatus(id, "PROCESSING");
    const handleReject  = (id) => updateOrderStatus(id, "CANCELLED");
    const handleAdvance = (id) => {
        const order = orders.find(o => o.id_order === id);
        if (order && NEXT_STATUS[order.order_status]) {
            updateOrderStatus(id, NEXT_STATUS[order.order_status]);
        }
    };

    const tabStyle = (tab) => ({
        padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "600",
        border: "none", cursor: "pointer",
        backgroundColor: activeTab === tab ? "var(--primary-dark)" : "white",
        color: activeTab === tab ? "white" : "#374151",
        boxShadow: activeTab === tab ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
    });

    return (
        <>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>
                        {activeTab === "pending" ? "Pedidos Pendientes" : "Seguimiento de Pedidos"}
                    </h4>
                    <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                        {activeTab === "pending"
                            ? "Gestioná las solicitudes entrantes de tus clientes."
                            : "Gestioná y actualizá el progreso de tus ventas en tiempo real."}
                    </p>
                </div>

                {activeTab === "pending" && pendingOrders.length > 0 && (
                    <div style={{
                        backgroundColor: "var(--primary-dark)", color: "white",
                        borderRadius: "12px", padding: "12px 20px",
                        display: "flex", alignItems: "center", gap: "12px",
                    }}>
                        <ShoppingBag size={22} />
                        <div>
                            <p style={{ fontSize: "11px", margin: "0 0 2px 0", opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Esperando acción
                            </p>
                            <p style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>
                                {pendingOrders.length} Pedido{pendingOrders.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Tabs ───────────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <button type="button" style={tabStyle("pending")} onClick={() => { setActiveTab("pending"); setPage(1); }}>
                    Pendientes
                    {pendingOrders.length > 0 && (
                        <span style={{
                            marginLeft: "8px", backgroundColor: "#dc2626", color: "white",
                            borderRadius: "20px", padding: "1px 7px", fontSize: "11px", fontWeight: "700",
                        }}>
                            {pendingOrders.length}
                        </span>
                    )}
                </button>
                <button type="button" style={tabStyle("tracking")} onClick={() => { setActiveTab("tracking"); setPage(1); }}>
                    Seguimiento
                    {trackingOrders.length > 0 && (
                        <span style={{
                            marginLeft: "8px", backgroundColor: activeTab === "tracking" ? "rgba(255,255,255,0.3)" : "#6b9080",
                            color: "white", borderRadius: "20px", padding: "1px 7px", fontSize: "11px", fontWeight: "700",
                        }}>
                            {trackingOrders.length}
                        </span>
                    )}
                </button>
                <button type="button" style={tabStyle("history")} onClick={() => { setActiveTab("history"); setPage(1); }}>
                    Historial
                </button>
            </div>

            {/* ── Lista ──────────────────────────────────────────────────── */}
            {activeTab !== "history" && paginated.length === 0 ? (
                <div style={{
                    backgroundColor: "white", borderRadius: "16px", padding: "48px 20px",
                    textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}>
                    <Truck size={40} color="#d1d5db" style={{ marginBottom: "12px" }} />
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>
                        {activeTab === "pending"
                            ? "No tenés pedidos pendientes."
                            : "No tenés pedidos en progreso."}
                    </p>
                </div>
            ) : activeTab === "pending" ? (
                paginated.map(order => (
                    <PendingOrderCard
                        key={order.id_order}
                        order={order}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        isActioning={isActioning}
                    />
                ))
            ) : activeTab === "tracking" ? (
                paginated.map(order => (
                    <TrackingOrderCard
                        key={order.id_order}
                        order={order}
                        onAdvance={handleAdvance}
                        isActioning={isActioning}
                    />
                ))
            ) : null}

            {/* ── Paginación ─────────────────────────────────────────────── */}
            {activeTab !== "history" && totalPages > 1 && (
                <Pagination
                    totalPages={totalPages}
                    currentPage={page}
                    onPageChange={setPage}
                />
            )}

            {/* ── Historial ──────────────────────────────────────────────── */}
            {activeTab === "history" && <HistoryTab orders={orders} />}
        </>
    );
}