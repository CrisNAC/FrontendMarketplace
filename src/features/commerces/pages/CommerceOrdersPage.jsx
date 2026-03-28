// src/features/commerces/pages/CommerceOrdersPage.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, MapPin, ChevronDown, Calendar, Filter } from "lucide-react";
import { Pagination } from "../../clients/components/commerceProfile/Pagination";
import { OrderStepper } from "../../clients/components/OrderStepper";
import { apiClient as commerceApiClient } from "../services/editCommerceApi";
import { ordersApiClient, fetchStoreOrders, updateOrderStatus, getOrderErrorMessage } from "../services/commerceOrdersApi";

const ITEMS_PER_PAGE = 10;

const STATUS_LABELS = {
    PENDING:    "Pendiente",
    PROCESSING: "Procesando",
    SHIPPED:    "Enviado",
    DELIVERED:  "Entregado",
    CANCELLED:  "Cancelado",
};

// Siguiente estado permitido para el SELLER
const NEXT_STATUS = {
    PROCESSING: "SHIPPED",
};

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

function StatusBadge({ status }) {
    const cfg = {
        DELIVERED:  { label: "Entregado",  bg: "#dcfce7", color: "#15803d" },
        CANCELLED:  { label: "Cancelado",  bg: "#fee2e2", color: "#991b1b" },
        PROCESSING: { label: "Procesando", bg: "#dbeafe", color: "#1e40af" },
        SHIPPED:    { label: "Enviado",    bg: "#d1fae5", color: "#065f46" },
        PENDING:    { label: "Pendiente",  bg: "#fef3c7", color: "#92400e" },
    }[status] ?? { label: status, bg: "#f3f4f6", color: "#374151" };

    return (
        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: cfg.bg, color: cfg.color }}>
            {cfg.label}
        </span>
    );
}

// ─── Tab: Pedidos Pendientes ──────────────────────────────────────────────────
function PendingOrderCard({ order, onAccept, onReject, isActioning }) {
    return (
        <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "12px", borderLeft: "3px solid var(--primary-dark)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>
                        #ORD-{order.id}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                            <MapPin size={12} /> {order.address?.city ?? "—"}{order.address?.region ? `, ${order.address.region}` : ""}
                        </span>
                        <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={12} /> {timeAgo(order.createdAt)}
                        </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#374151", margin: "0 0 4px 0" }}>
                        {order.items?.length ?? 0} ítem{order.items?.length !== 1 ? "s" : ""}
                    </p>
                    {order.notes && (
                        <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0, fontStyle: "italic" }}>{order.notes}</p>
                    )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", flexShrink: 0 }}>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "11px", color: "#6b7280", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total del pedido</p>
                        <p style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: 0 }}>{formatGuarani(order.total)}</p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" onClick={() => onAccept(order.id)} disabled={isActioning} style={{
                            display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px",
                            backgroundColor: "var(--primary-dark)", color: "white", border: "none", fontSize: "13px", fontWeight: "600",
                            cursor: isActioning ? "not-allowed" : "pointer", opacity: isActioning ? 0.6 : 1,
                        }}>
                            <CheckCircle size={14} /> Aceptar
                        </button>
                        <button type="button" onClick={() => onReject(order.id)} disabled={isActioning} style={{
                            display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px",
                            backgroundColor: "white", color: "#dc2626", border: "1px solid #fecdd3", fontSize: "13px", fontWeight: "600",
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
    const stepperEstado = STATUS_LABELS[order.status] ?? order.status;
    const canAdvance = !!NEXT_STATUS[order.status];

    return (
        <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "4px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 2px 0" }}>ORD-{order.id}</p>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0" }}>
                        {order.address?.city ?? "—"}{order.address?.region ? `, ${order.address.region}` : ""}
                    </p>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={11} /> {timeAgo(order.createdAt)}
                    </p>
                </div>

                {canAdvance && (
                    <button type="button" onClick={() => onAdvance(order.id, order.status)} disabled={isActioning} style={{
                        display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px",
                        backgroundColor: "var(--primary-dark)", color: "white", border: "none", fontSize: "13px", fontWeight: "600",
                        cursor: isActioning ? "not-allowed" : "pointer", opacity: isActioning ? 0.6 : 1, flexShrink: 0,
                    }}>
                        <Truck size={14} /> Marcar como Enviado
                    </button>
                )}
            </div>

            <OrderStepper estado={stepperEstado} />

            <p style={{ fontSize: "12px", color: "#374151", margin: "8px 0 0 0" }}>
                {order.items?.length ?? 0} ítem{order.items?.length !== 1 ? "s" : ""} — {formatGuarani(order.total)}
            </p>
        </div>
    );
}

// ─── Tab: Historial ───────────────────────────────────────────────────────────
function HistoryTab({ storeId }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");
    const [filterMinAmount, setFilterMinAmount] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchHistory = useCallback(async () => {
        if (!storeId) {
            setOrders([]);
            setTotalPages(1);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError("");
        try {
            const filters = { page, limit: ITEMS_PER_PAGE };
            
            // Siempre filtrar por estados completados
            if (filterStatus === "all") {
                filters.order_status = ["DELIVERED", "CANCELLED"];
            } else {
                filters.order_status = filterStatus;
            }
            
            if (filterFrom) filters.date_from = filterFrom;
            if (filterTo)   filters.date_to   = filterTo;
            
            const data = await fetchStoreOrders(storeId, filters);
            setOrders(data.orders);
            setTotalPages(data.total_page ?? 1);
        } catch (err) {
            setError(getOrderErrorMessage(err, "No se pudo cargar el historial."));
        } finally {
            setLoading(false);
        }
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

            {error && <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px", marginBottom: "16px" }}>{error}</div>}

            {loading ? (
                <p style={{ color: "#6b7280", padding: "16px" }}>Cargando historial...</p>
            ) : visibleOrders.length === 0 ? (
                <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "48px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <Filter size={36} color="#d1d5db" style={{ marginBottom: "12px" }} />
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>No hay pedidos con esos filtros.</p>
                </div>
            ) : (
                <>
                    <div style={{ backgroundColor: "white", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "120px 100px 1fr 80px 150px 110px", padding: "10px 16px", backgroundColor: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                            {["Fecha", "Pedido ID", "Dirección", "Ítems", "Total", "Estado"].map(h => (
                                <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
                            ))}
                        </div>
                        {visibleOrders.map((order, idx) => (
                            <div key={order.id} style={{ display: "grid", gridTemplateColumns: "120px 100px 1fr 80px 150px 110px", padding: "12px 16px", alignItems: "center", borderBottom: idx < visibleOrders.length - 1 ? "1px solid #f9fafb" : "none" }}>
                                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                                    {new Date(order.createdAt).toLocaleDateString("es-PY", { day: "numeric", month: "short", year: "numeric" })}
                                </span>
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

// ─── Página principal ─────────────────────────────────────────────────────────
export function CommerceOrdersPage() {
    const [storeId, setStoreId] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("pending"); // "pending" | "tracking" | "history"
    const [page, setPage] = useState(1);
    const [isActioning, setIsActioning] = useState(false);
    const [actionError, setActionError] = useState("");

    const loadOrders = useCallback(async (sid) => {
        try {
            const data = await fetchStoreOrders(sid, {
                order_status: ["PENDING", "PROCESSING", "SHIPPED"],
                limit: 100
        });
        setOrders(data.orders);
        } catch (err) {
            setError(getOrderErrorMessage(err, "No se pudieron cargar los pedidos."));
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const sessionRes = await commerceApiClient.get("/api/session/user-session");
                const sid = sessionRes.data?.user?.id_store;
                if (!sid) { setError("No tenés un comercio registrado."); setLoading(false); return; }
                setStoreId(sid);
                await loadOrders(sid);
            } catch (err) {
                setError("No se pudo cargar la sesión.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [loadOrders]);

    const pendingOrders  = useMemo(() => orders.filter(o => o.status === "PENDING"), [orders]);
    const trackingOrders = useMemo(() => orders.filter(o => o.status === "PROCESSING" || o.status === "SHIPPED"), [orders]);

    const activeOrders     = activeTab === "pending" ? pendingOrders : trackingOrders;
    const currentTotalPages = Math.ceil(activeOrders.length / ITEMS_PER_PAGE);
    const paginated         = activeOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setIsActioning(true);
        setActionError("");
        try {
            await updateOrderStatus(orderId, newStatus);
            await loadOrders(storeId);
            // Ajustar página si queda vacía
            const leavesActiveList = activeTab === "pending" || (activeTab === "tracking" && newStatus === "DELIVERED");
            if (leavesActiveList) {
                const remaining = activeOrders.length - 1;
                const newTotalPages = Math.ceil(remaining / ITEMS_PER_PAGE);
                if (page > newTotalPages && newTotalPages > 0) setPage(newTotalPages);
            }
        } catch (err) {
            setActionError(getOrderErrorMessage(err, "No se pudo actualizar el pedido."));
        } finally {
            setIsActioning(false);
        }
    };

    const handleAccept  = (id) => handleStatusUpdate(id, "PROCESSING");
    const handleReject  = (id) => handleStatusUpdate(id, "CANCELLED");
    const handleAdvance = (id, currentStatus) => {
        const next = NEXT_STATUS[currentStatus];
        if (next) handleStatusUpdate(id, next);
    };

    const tabStyle = (tab) => ({
        padding: "8px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "600",
        border: "none", cursor: "pointer",
        backgroundColor: activeTab === tab ? "var(--primary-dark)" : "white",
        color: activeTab === tab ? "white" : "#374151",
        boxShadow: activeTab === tab ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
    });

    if (loading) return <p style={{ color: "#6b7280", padding: "16px" }}>Cargando pedidos...</p>;

    return (
        <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>
                        {activeTab === "pending" ? "Pedidos Pendientes" : activeTab === "tracking" ? "Seguimiento de Pedidos" : "Historial de Pedidos"}
                    </h4>
                    <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                        {activeTab === "pending"
                            ? "Gestioná las solicitudes entrantes de tus clientes."
                            : activeTab === "tracking"
                            ? "Gestioná y actualizá el progreso de tus ventas en tiempo real."
                            : "Gestioná y revisá todas tus transacciones pasadas en un solo lugar."}
                    </p>
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
            {actionError && <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px", marginBottom: "16px" }}>{actionError}</div>}
            {error      && <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px", marginBottom: "16px" }}>{error}</div>}

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
            {activeTab === "history" ? (
                <HistoryTab storeId={storeId} />
            ) : paginated.length === 0 ? (
                <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "48px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <Truck size={40} color="#d1d5db" style={{ marginBottom: "12px" }} />
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>
                        {activeTab === "pending" ? "No tenés pedidos pendientes." : "No tenés pedidos en progreso."}
                    </p>
                </div>
            ) : activeTab === "pending" ? (
                paginated.map(order => (
                    <PendingOrderCard key={order.id} order={order} onAccept={handleAccept} onReject={handleReject} isActioning={isActioning} />
                ))
            ) : (
                paginated.map(order => (
                    <TrackingOrderCard key={order.id} order={order} onAdvance={handleAdvance} isActioning={isActioning} />
                ))
            )}

            {activeTab !== "history" && currentTotalPages > 1 && (
                <Pagination totalPages={currentTotalPages} currentPage={page} onPageChange={setPage} />
            )}
        </>
    );
}