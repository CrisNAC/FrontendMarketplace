// src/features/commerces/pages/CommerceOrdersPage.jsx
import { useState } from "react";
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, User, MapPin } from "lucide-react";
import { Pagination } from "../../clients/components/commerceProfile/Pagination";

// ─── Mock toggle ──────────────────────────────────────────────────────────────
// Cambiar a false cuando el backend implemente los endpoints de pedidos
const USE_MOCK = true;
const ITEMS_PER_PAGE = 5;

const MOCK_ORDERS = [
    {
        id_order: 8824,
        order_status: "PENDING",
        total: "142500",
        notes: null,
        created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        user: { name: "Alejandro Moreno" },
        delivery_type: "Delivery Local",
        order_items: [
            { id_order_item: 1, quantity: 2, product: { name: "Aceite de Oliva Virgen" }, subtotal: "45000" },
            { id_order_item: 2, quantity: 1, product: { name: "Queso Manchego Curado" }, subtotal: "62500" },
            { id_order_item: 3, quantity: 3, product: { name: "Pack Pasta Integral" }, subtotal: "35000" },
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
            { id_order_item: 3, quantity: 1, product: { name: "Caja de Frutas Tropicales Mix" }, subtotal: "38900" },
            { id_order_item: 4, quantity: 1, product: { name: "Miel de Abeja Orgánica 500g" }, subtotal: "30000" },
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
            { id_order_item: 5, quantity: 5, product: { name: "Buqué Artesanal" }, subtotal: "125000" },
            { id_order_item: 6, quantity: 1, product: { name: "Pack de Café en Grano 1kg" }, subtotal: "85000" },
        ],
    },
    {
        id_order: 8819,
        order_status: "PENDING",
        total: "95000",
        notes: null,
        created_at: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
        user: { name: "Laura Pérez" },
        delivery_type: "Delivery Local",
        order_items: [
            { id_order_item: 7, quantity: 2, product: { name: "Jabón Artesanal" }, subtotal: "40000" },
            { id_order_item: 8, quantity: 1, product: { name: "Crema Hidratante Natural" }, subtotal: "55000" },
        ],
    },
    {
        id_order: 8818,
        order_status: "PENDING",
        total: "320000",
        notes: null,
        created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        user: { name: "Martín García" },
        delivery_type: "Delivery Express",
        order_items: [
            { id_order_item: 9, quantity: 1, product: { name: "Set de Vinos Premium" }, subtotal: "320000" },
        ],
    },
    {
        id_order: 8817,
        order_status: "PENDING",
        total: "55000",
        notes: null,
        created_at: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
        user: { name: "Ana López" },
        delivery_type: "Recojo en Tienda",
        order_items: [
            { id_order_item: 10, quantity: 2, product: { name: "Mermelada Casera" }, subtotal: "55000" },
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

// ─── Tarjeta de pedido ────────────────────────────────────────────────────────
function OrderCard({ order, onAccept, onReject, isActioning }) {
    const itemsSummary = order.order_items
        .map(i => `${i.quantity}x ${i.product.name}`)
        .join(", ");

    return (
        <div style={{
            backgroundColor: "white", borderRadius: "14px", padding: "16px 20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "12px",
            borderLeft: "3px solid var(--primary-dark)",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>

                {/* Izquierda */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Número de orden */}
                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>
                        #ORD-{order.id_order}
                    </p>

                    {/* Meta */}
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

                    {/* Items */}
                    <p style={{
                        fontSize: "12px", color: "#374151", margin: "0 0 4px 0",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        maxWidth: "480px",
                    }}>
                        {itemsSummary}
                    </p>

                    {order.notes && (
                        <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0, fontStyle: "italic" }}>
                            {order.notes}
                        </p>
                    )}
                </div>

                {/* Derecha — total + acciones */}
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
                        <button
                            type="button"
                            onClick={() => onAccept(order.id_order)}
                            disabled={isActioning}
                            style={{
                                display: "flex", alignItems: "center", gap: "5px",
                                padding: "7px 14px", borderRadius: "8px",
                                backgroundColor: "var(--primary-dark)", color: "white",
                                border: "none", fontSize: "13px", fontWeight: "600",
                                cursor: isActioning ? "not-allowed" : "pointer",
                                opacity: isActioning ? 0.6 : 1,
                            }}
                        >
                            <CheckCircle size={14} /> Aceptar
                        </button>
                        <button
                            type="button"
                            onClick={() => onReject(order.id_order)}
                            disabled={isActioning}
                            style={{
                                display: "flex", alignItems: "center", gap: "5px",
                                padding: "7px 14px", borderRadius: "8px",
                                backgroundColor: "white", color: "#dc2626",
                                border: "1px solid #fecdd3", fontSize: "13px", fontWeight: "600",
                                cursor: isActioning ? "not-allowed" : "pointer",
                                opacity: isActioning ? 0.6 : 1,
                            }}
                        >
                            <XCircle size={14} /> Rechazar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function CommerceOrdersPage() {
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [page, setPage] = useState(1);
    const [isActioning, setIsActioning] = useState(false);

    // Solo mostramos pedidos pendientes (los que llegan del cliente sin acción del comercio)
    const pendingOrders = orders.filter(o => o.order_status === "PENDING");
    const totalPages = Math.ceil(pendingOrders.length / ITEMS_PER_PAGE);
    const paginated = pendingOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const updateOrderStatus = async (orderId, newStatus) => {
        setIsActioning(true);
        try {
            if (USE_MOCK) {
                await new Promise(res => setTimeout(res, 500));
            } else {
                // TODO: await apiClient.put(`/api/orders/${orderId}/status`, { order_status: newStatus });
            }
            setOrders(prev =>
                prev.map(o => o.id_order === orderId ? { ...o, order_status: newStatus } : o)
            );
            // Si la página actual queda vacía, volver a la anterior
            const remaining = pendingOrders.length - 1;
            const newTotalPages = Math.ceil(remaining / ITEMS_PER_PAGE);
            if (page > newTotalPages && newTotalPages > 0) setPage(newTotalPages);
        } catch (err) {
            console.error("Error al actualizar pedido:", err);
        } finally {
            setIsActioning(false);
        }
    };

    const handleAccept = (orderId) => updateOrderStatus(orderId, "PROCESSING");
    const handleReject = (orderId) => updateOrderStatus(orderId, "CANCELLED");

    return (
        <>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Pedidos Pendientes</h4>
                    <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                        Gestioná las solicitudes entrantes de tus clientes.
                    </p>
                </div>

                {pendingOrders.length > 0 && (
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

            {/* ── Lista ──────────────────────────────────────────────────── */}
            {paginated.length === 0 ? (
                <div style={{
                    backgroundColor: "white", borderRadius: "16px", padding: "48px 20px",
                    textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}>
                    <Truck size={40} color="#d1d5db" style={{ marginBottom: "12px" }} />
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>
                        No tenés pedidos pendientes.
                    </p>
                </div>
            ) : (
                paginated.map(order => (
                    <OrderCard
                        key={order.id_order}
                        order={order}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        isActioning={isActioning}
                    />
                ))
            )}

            {/* ── Paginación ─────────────────────────────────────────────── */}
            {totalPages > 1 && (
                <Pagination
                    totalPages={totalPages}
                    currentPage={page}
                    onPageChange={setPage}
                />
            )}
        </>
    );
}