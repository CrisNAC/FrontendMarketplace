// src/features/commerces/pages/CommerceDeliveryPage.jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CheckCircle2, Clock, Users, Star,
    LayoutGrid, Table2, Plus,
    Phone, Mail, Truck, TrendingUp,
    Eye, Trash2, X, AlertTriangle, Loader2,
} from "lucide-react";
import { MyCommerceLayout } from "../../layouts/MyCommerceLayout";
import { apiClient } from "../services/editCommerceApi";
import {
    fetchStoreDeliveries,
    deleteStoreDelivery,
    getDeliveryErrorMessage,
} from "../services/commerceDeliveryApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CFG = {
    AVAILABLE: { label: "Disponible", bg: "#dcfce7", color: "#15803d" },
    IN_DELIVERY: { label: "En entrega", bg: "#dbeafe", color: "#1e40af" },
    UNAVAILABLE: { label: "No disponible", bg: "#f3f4f6", color: "#4b5563" },
};

const VEHICLE_LABELS = {
    CAR: "Automóvil",
    MOTORCYCLE: "Moto",
    BICYCLE: "Bicicleta",
    ON_FOOT: "A pie",
};

function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] ?? { label: status, bg: "#f3f4f6", color: "#374151" };
    return (
        <span style={{
            padding: "3px 10px", borderRadius: "20px",
            fontSize: "11px", fontWeight: "700",
            backgroundColor: cfg.bg, color: cfg.color,
            whiteSpace: "nowrap",
        }}>
            {cfg.label}
        </span>
    );
}

function StarRating({ value }) {
    if (value === null || value === undefined) return <span style={{ fontSize: "13px", color: "#9ca3af" }}>—</span>;
    return (
        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{value}</span>
        </span>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, iconColor }) {
    return (
        <div style={{
            backgroundColor: "white", borderRadius: "12px",
            padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            flex: 1, minWidth: 0,
        }}>
            <div>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 6px 0", fontWeight: "500" }}>{label}</p>
                <p style={{ fontSize: "26px", fontWeight: "800", color: "#111827", margin: 0 }}>{value ?? "—"}</p>
            </div>
            <Icon size={22} color={iconColor} style={{ flexShrink: 0, marginTop: "2px" }} />
        </div>
    );
}

// ─── Modal de confirmación de eliminación ─────────────────────────────────────
function DeleteModal({ delivery, onConfirm, onCancel, isDeleting, error }) {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
        }}>
            <div style={{
                backgroundColor: "white", borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                padding: "28px 28px 24px",
                width: "100%", maxWidth: "420px",
            }}>
                <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
                    <div style={{
                        width: "42px", height: "42px", borderRadius: "50%",
                        backgroundColor: "#fee2e2", display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                        <AlertTriangle size={20} color="#dc2626" />
                    </div>
                    <div>
                        <p style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0" }}>
                            Desvincular repartidor
                        </p>
                        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
                            ¿Desvincular a <strong>{delivery.user.name}</strong> de tu comercio?
                            El usuario no será eliminado.
                        </p>
                    </div>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
                        borderRadius: "8px", padding: "10px 14px",
                        color: "#be123c", fontSize: "13px", marginBottom: "16px",
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        style={{
                            padding: "8px 18px", borderRadius: "8px",
                            border: "1px solid #e5e7eb", backgroundColor: "white",
                            fontSize: "14px", fontWeight: "600", color: "#374151",
                            cursor: isDeleting ? "not-allowed" : "pointer",
                            opacity: isDeleting ? 0.6 : 1,
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "8px 18px", borderRadius: "8px",
                            border: "none", backgroundColor: "#dc2626",
                            fontSize: "14px", fontWeight: "600", color: "white",
                            cursor: isDeleting ? "not-allowed" : "pointer",
                            opacity: isDeleting ? 0.75 : 1,
                        }}
                    >
                        {isDeleting
                            ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Desvinculando…</>
                            : <><Trash2 size={14} /> Desvincular</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Vista Cards ──────────────────────────────────────────────────────────────
function CardView({ deliveries, storeId, onReviews, onDelete }) {
    if (deliveries.length === 0) return <EmptyState />;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {deliveries.map(d => (
                <div key={d.id} style={{
                    backgroundColor: "white", borderRadius: "14px",
                    padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", gap: "16px", flexWrap: "wrap",
                }}>
                    {/* Info principal */}
                    <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                            <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>
                                {d.user.name}
                            </p>
                            <StatusBadge status={d.status} />
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px" }}>
                            <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Mail size={12} /> {d.user.email}
                            </span>
                            <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Phone size={12} /> {d.user.phone || "—"}
                            </span>
                        </div>
                    </div>

                    {/* Métricas */}
                    <div style={{ display: "flex", gap: "24px", flexShrink: 0, flexWrap: "wrap" }}>
                        <div>
                            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Cant. Entregas
                            </p>
                            <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                                <TrendingUp size={13} color="#6b9080" /> {d.completedDeliveries}
                            </p>
                        </div>
                        <div>
                            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                % Éxito
                            </p>
                            <p style={{ fontSize: "15px", fontWeight: "700", color: d.successRate !== null ? "#16a34a" : "#9ca3af", margin: 0 }}>
                                {d.successRate !== null ? `${d.successRate} %` : "—"}
                            </p>
                        </div>
                        <div>
                            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Calificación
                            </p>
                            <div style={{ marginTop: "2px" }}>
                                <StarRating value={d.avgRating} />
                                {d.reviewCount > 0 && (
                                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                                        {" "}({d.reviewCount} reseña{d.reviewCount !== 1 ? "s" : ""})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                        <button
                            type="button"
                            onClick={() => onReviews(d)}
                            style={{
                                display: "flex", alignItems: "center", gap: "5px",
                                padding: "7px 14px", borderRadius: "8px",
                                backgroundColor: "var(--primary-dark)", color: "white",
                                border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                            }}
                        >
                            <Eye size={13} /> Ver Reseñas
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(d)}
                            style={{
                                display: "flex", alignItems: "center", gap: "5px",
                                padding: "7px 14px", borderRadius: "8px",
                                backgroundColor: "white", color: "#dc2626",
                                border: "1px solid #fecdd3", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                            }}
                        >
                            <Trash2 size={13} /> Eliminar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Vista Tabla ──────────────────────────────────────────────────────────────
const COL_WIDTHS = "180px 110px 140px 200px 80px 90px 110px 100px";
const HEADERS = ["Nombre Completo", "Estado", "Teléfono", "Correo", "Entregas", "% Éxito", "Calificación", "Acciones"];

function TableView({ deliveries, onReviews, onDelete }) {
    if (deliveries.length === 0) return <EmptyState />;
    return (
        <div style={{ backgroundColor: "white", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{
                display: "grid", gridTemplateColumns: COL_WIDTHS,
                padding: "10px 16px", backgroundColor: "#f9fafb",
                borderBottom: "1px solid #f3f4f6",
            }}>
                {HEADERS.map(h => (
                    <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {h}
                    </span>
                ))}
            </div>
            {deliveries.map((d, idx) => (
                <div key={d.id} style={{
                    display: "grid", gridTemplateColumns: COL_WIDTHS,
                    padding: "12px 16px", alignItems: "center",
                    borderBottom: idx < deliveries.length - 1 ? "1px solid #f9fafb" : "none",
                }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{d.user.name}</span>
                    <StatusBadge status={d.status} />
                    <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Phone size={11} /> {d.user.phone || "—"}
                    </span>
                    <span style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {d.user.email}
                    </span>
                    <span style={{ fontSize: "13px", color: "#374151" }}>{d.completedDeliveries}</span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: d.successRate !== null ? "#16a34a" : "#9ca3af" }}>
                        {d.successRate !== null ? `${d.successRate} %` : "—"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <StarRating value={d.avgRating} />
                        {d.reviewCount > 0 && (
                            <span style={{ fontSize: "11px", color: "#9ca3af" }}>({d.reviewCount})</span>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button
                            type="button"
                            onClick={() => onReviews(d)}
                            title="Ver Reseñas"
                            style={{
                                width: "32px", height: "32px", borderRadius: "8px",
                                backgroundColor: "var(--primary-dark)", color: "white",
                                border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <Eye size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(d)}
                            title="Eliminar"
                            style={{
                                width: "32px", height: "32px", borderRadius: "8px",
                                backgroundColor: "#fee2e2", color: "#dc2626",
                                border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div style={{
            backgroundColor: "white", borderRadius: "16px",
            padding: "56px 20px", textAlign: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}>
            <Truck size={40} color="#d1d5db" style={{ marginBottom: "12px" }} />
            <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>
                No hay repartidores vinculados.
            </p>
            <p style={{ fontSize: "13px", color: "#9ca3af", margin: "4px 0 0 0" }}>
                Usá "Agregar Delivery" para vincular repartidores a tu comercio.
            </p>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function CommerceDeliveryPage() {
    const navigate = useNavigate();

    const [storeId, setStoreId] = useState(null);
    const [data, setData] = useState(null);   // { stats, deliveries }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [view, setView] = useState("cards"); // "cards" | "table"
    const [toDelete, setToDelete] = useState(null);   // delivery | null
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // ── Carga ─────────────────────────────────────────────────────────────────
    const load = useCallback(async (sid) => {
        try {
            const result = await fetchStoreDeliveries(sid);
            setData(result);
        } catch (err) {
            setError(getDeliveryErrorMessage(err, "No se pudieron cargar los repartidores."));
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await apiClient.get("/api/session/user-session");
                const sid = res.data?.user?.id_store;
                if (!sid) { setError("No tenés un comercio registrado."); setLoading(false); return; }
                setStoreId(sid);
                await load(sid);
            } catch {
                setError("No se pudo cargar la sesión.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [load]);

    // ── Eliminar ──────────────────────────────────────────────────────────────
    const handleDeleteConfirm = async () => {
        if (!toDelete) return;
        setIsDeleting(true);
        setDeleteError("");
        try {
            await deleteStoreDelivery(storeId, toDelete.id);
            setToDelete(null);
            await load(storeId);
        } catch (err) {
            setDeleteError(getDeliveryErrorMessage(err, "No se pudo desvincular el repartidor."));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        if (isDeleting) return;
        setToDelete(null);
        setDeleteError("");
    };

    // ── Render ────────────────────────────────────────────────────────────────
    const { stats, deliveries } = data ?? { stats: null, deliveries: [] };

    const tabBtn = (v, label, Icon) => (
        <button
            type="button"
            onClick={() => setView(v)}
            style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "7px 14px", borderRadius: "8px",
                border: "1px solid #e5e7eb",
                backgroundColor: view === v ? "var(--primary-dark)" : "white",
                color: view === v ? "white" : "#374151",
                fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}
        >
            <Icon size={14} /> {label}
        </button>
    );

    return (
        <MyCommerceLayout>
            {/* ── Header ── */}
            <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontWeight: "700", margin: "0 0 4px 0", fontSize: "18px" }}>
                    Gestión de Repartidores
                </h4>
                <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                    Administrá los repartidores vinculados a tu comercio.
                </p>
            </div>

            {error && (
                <div style={{
                    backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
                    borderRadius: "10px", padding: "12px 16px",
                    color: "#be123c", fontSize: "14px", marginBottom: "20px",
                }}>
                    {error}
                </div>
            )}

            {loading && (
                <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                    <Loader2 size={28} color="#9ca3af" style={{ animation: "spin 1s linear infinite" }} />
                </div>
            )}

            {!loading && data && (
                <>
                    {/* ── Stats ── */}
                    <div style={{ display: "flex", gap: "14px", marginBottom: "24px", flexWrap: "wrap" }}>
                        <StatCard
                            label="Disponibles"
                            value={stats.available}
                            icon={CheckCircle2}
                            iconColor="#16a34a"
                        />
                        <StatCard
                            label="En Entrega"
                            value={stats.inDelivery}
                            icon={Clock}
                            iconColor="#3b82f6"
                        />
                        <StatCard
                            label="Total Repartidores"
                            value={stats.total}
                            icon={Users}
                            iconColor="#6b9080"
                        />
                        <StatCard
                            label="Rating Promedio"
                            value={stats.avgRating ?? "—"}
                            icon={Star}
                            iconColor="#f59e0b"
                        />
                    </div>

                    {/* ── Toolbar ── */}
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px",
                    }}>
                        <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>
                            Repartidores Vinculados
                        </p>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            {tabBtn("cards", "Cards", LayoutGrid)}
                            {tabBtn("table", "Tabla", Table2)}
                            <button
                                type="button"
                                onClick={() => navigate("/comercio/delivery/agregar")}
                                style={{
                                    display: "flex", alignItems: "center", gap: "5px",
                                    padding: "7px 16px", borderRadius: "8px",
                                    backgroundColor: "var(--primary-dark)", color: "white",
                                    border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                                }}
                            >
                                <Plus size={14} /> Agregar Delivery
                            </button>
                        </div>
                    </div>

                    {/* ── Contenido ── */}
                    {view === "cards"
                        ? <CardView
                            deliveries={deliveries}
                            storeId={storeId}
                            onReviews={d => navigate(`/comercio/delivery/${d.id}/resenas`)}
                            onDelete={d => { setToDelete(d); setDeleteError(""); }}
                        />
                        : <TableView
                            deliveries={deliveries}
                            onReviews={d => navigate(`/comercio/delivery/${d.id}/resenas`)}
                            onDelete={d => { setToDelete(d); setDeleteError(""); }}
                        />
                    }
                </>
            )}

            {/* ── Modal confirmación ── */}
            {toDelete && (
                <DeleteModal
                    delivery={toDelete}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleCancelDelete}
                    isDeleting={isDeleting}
                    error={deleteError}
                />
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </MyCommerceLayout>
    );
}

export default CommerceDeliveryPage;