// src/features/commerces/pages/CommerceDeliveriesPage.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Truck, Plus, Phone, Mail, Eye, Trash2, AlertTriangle,
    CheckCircle2, Clock, Users, Star, LayoutGrid, Table2,
    TrendingUp, Loader2, Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import apiClient from '../../../lib/apiClient';
import { fetchStoreDeliveries, deleteStoreDelivery, getDeliveryErrorMessage } from "../services/commerceDeliveryApi";

// ─── Constantes ───────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 8;

const STATUS_CFG = {
    AVAILABLE:   { label: "Disponible",    bg: "#dcfce7", color: "#15803d" },
    IN_DELIVERY: { label: "En entrega",    bg: "#dbeafe", color: "#1e40af" },
    UNAVAILABLE: { label: "No disponible", bg: "#f3f4f6", color: "#4b5563" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] ?? { label: status, bg: "#f3f4f6", color: "#374151" };
    return (
        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: cfg.bg, color: cfg.color, whiteSpace: "nowrap" }}>
            {cfg.label}
        </span>
    );
}

function StarRating({ value }) {
    if (value === null || value === undefined)
        return <span style={{ fontSize: "13px", color: "#9ca3af" }}>—</span>;
    return (
        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{value}</span>
        </span>
    );
}

function StatCard({ label, value, icon: Icon, iconColor }) {
    return (
        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flex: 1, minWidth: 0 }}>
            <div>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 6px 0", fontWeight: "500" }}>{label}</p>
                <p style={{ fontSize: "26px", fontWeight: "800", color: "#111827", margin: 0 }}>{value ?? "—"}</p>
            </div>
            <Icon size={22} color={iconColor} style={{ flexShrink: 0, marginTop: "2px" }} />
        </div>
    );
}

function EmptyState({ onAdd }) {
    return (
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "56px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <Truck size={40} color="#d1d5db" style={{ marginBottom: "12px" }} />
            <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>Todavía no agregaste repartidores</p>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px 0" }}>
                Usá el buscador para encontrar repartidores por correo o teléfono y vincularlos a tu comercio.
            </p>
            <button type="button" onClick={onAdd}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "10px", border: "none", background: "var(--primary-dark)", color: "white", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
                <Plus size={18} /> Agregar delivery
            </button>
        </div>
    );
}

function NoResults() {
    return (
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "48px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <Search size={36} color="#d1d5db" style={{ marginBottom: "12px" }} />
            <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>No se encontraron repartidores.</p>
            <p style={{ fontSize: "13px", color: "#9ca3af", margin: "4px 0 0 0" }}>Intentá con otros filtros.</p>
        </div>
    );
}

// ─── Paginación ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" }}>
            <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", fontSize: "13px", fontWeight: "600", color: page === 1 ? "#d1d5db" : "#374151", cursor: page === 1 ? "not-allowed" : "pointer" }}>
                <ChevronLeft size={14} /> Anterior
            </button>
            <span style={{ fontSize: "13px", color: "#6b7280", padding: "6px 12px" }}>
                {page} / {totalPages}
            </span>
            <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", fontSize: "13px", fontWeight: "600", color: page === totalPages ? "#d1d5db" : "#374151", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
                Siguiente <ChevronRight size={14} />
            </button>
        </div>
    );
}

// ─── Modal eliminación ────────────────────────────────────────────────────────
function DeleteModal({ delivery, onConfirm, onCancel, isDeleting, error }) {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <div style={{ backgroundColor: "white", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", padding: "28px", width: "100%", maxWidth: "420px" }}>
                <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <AlertTriangle size={20} color="#dc2626" />
                    </div>
                    <div>
                        <p style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0" }}>Desvincular repartidor</p>
                        <p style={{ fontSize: "14px", color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
                            ¿Desvincular a <strong>{delivery.user.name}</strong> de tu comercio? El usuario no será eliminado.
                        </p>
                    </div>
                </div>
                {error && (
                    <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", padding: "10px 14px", color: "#be123c", fontSize: "13px", marginBottom: "16px" }}>
                        {error}
                    </div>
                )}
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button type="button" onClick={onCancel} disabled={isDeleting}
                        style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", fontSize: "14px", fontWeight: "600", color: "#374151", cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.6 : 1 }}>
                        Cancelar
                    </button>
                    <button type="button" onClick={onConfirm} disabled={isDeleting}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "8px", border: "none", backgroundColor: "#dc2626", fontSize: "14px", fontWeight: "600", color: "white", cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.75 : 1 }}>
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
function CardView({ deliveries, onReviews, onDelete }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {deliveries.map(d => (
                <div key={d.id} style={{ backgroundColor: "white", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                            <p style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>{d.user.name}</p>
                            <StatusBadge status={d.status} />
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px" }}>
                            <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}><Mail size={12} /> {d.user.email}</span>
                            <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}><Phone size={12} /> {d.user.phone || "—"}</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "24px", flexShrink: 0, flexWrap: "wrap" }}>
                        {[
                            { label: "Cant. Entregas", value: d.completedDeliveries, color: "#111827", prefix: <TrendingUp size={13} color="#6b9080" /> },
                            { label: "% Éxito", value: d.successRate !== null ? `${d.successRate} %` : "—", color: d.successRate !== null ? "#16a34a" : "#9ca3af" },
                        ].map(({ label, value, color, prefix }) => (
                            <div key={label}>
                                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                                <p style={{ fontSize: "15px", fontWeight: "700", color, margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>{prefix}{value}</p>
                            </div>
                        ))}
                        <div>
                            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Calificación</p>
                            <StarRating value={d.avgRating} />
                            {d.reviewCount > 0 && <span style={{ fontSize: "11px", color: "#9ca3af" }}> ({d.reviewCount} reseña{d.reviewCount !== 1 ? "s" : ""})</span>}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                        <button type="button" onClick={() => onReviews(d)}
                            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", backgroundColor: "var(--primary-dark)", color: "white", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                            <Eye size={13} /> Ver Reseñas
                        </button>
                        <button type="button" onClick={() => onDelete(d)}
                            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", backgroundColor: "white", color: "#dc2626", border: "1px solid #fecdd3", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
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
    return (
        <div style={{ backgroundColor: "white", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: COL_WIDTHS, padding: "10px 16px", backgroundColor: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                {HEADERS.map(h => <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>)}
            </div>
            {deliveries.map((d, idx) => (
                <div key={d.id} style={{ display: "grid", gridTemplateColumns: COL_WIDTHS, padding: "12px 16px", alignItems: "center", borderBottom: idx < deliveries.length - 1 ? "1px solid #f9fafb" : "none" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{d.user.name}</span>
                    <StatusBadge status={d.status} />
                    <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}><Phone size={11} /> {d.user.phone || "—"}</span>
                    <span style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.user.email}</span>
                    <span style={{ fontSize: "13px", color: "#374151" }}>{d.completedDeliveries}</span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: d.successRate !== null ? "#16a34a" : "#9ca3af" }}>{d.successRate !== null ? `${d.successRate} %` : "—"}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <StarRating value={d.avgRating} />
                        {d.reviewCount > 0 && <span style={{ fontSize: "11px", color: "#9ca3af" }}>({d.reviewCount})</span>}
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button type="button" onClick={() => onReviews(d)} title="Ver Reseñas"
                            style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "var(--primary-dark)", color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Eye size={14} />
                        </button>
                        <button type="button" onClick={() => onDelete(d)} title="Eliminar"
                            style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#fee2e2", color: "#dc2626", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function CommerceDeliveriesPage() {
    const navigate = useNavigate();
    const [storeId, setStoreId]         = useState(null);
    const [data, setData]               = useState(null);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState("");
    const [view, setView]               = useState("cards");
    const [toDelete, setToDelete]       = useState(null);
    const [isDeleting, setIsDeleting]   = useState(false);
    const [deleteError, setDeleteError] = useState("");

    // Filtros
    const [search, setSearch]           = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage]               = useState(1);

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
                await load(sid).catch(() => {}); // load() ya establece su propio error; swallow el re-throw
            } catch {
                setError("No se pudo cargar la sesión.");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [load]);

    // Filtrado client-side
    const filtered = useMemo(() => {
        const all = data?.deliveries ?? [];
        return all.filter(d => {
            const matchStatus = statusFilter === "all" || d.status === statusFilter;
            const q = search.trim().toLowerCase();
            const matchSearch = !q
                || d.user.name.toLowerCase().includes(q)
                || d.user.email.toLowerCase().includes(q)
                || (d.user.phone ?? "").toLowerCase().includes(q);
            return matchStatus && matchSearch;
        });
    }, [data, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page]);

    // Resetear página al cambiar filtros
    const handleSearch = (val) => { setSearch(val); setPage(1); };
    const handleStatus = (val) => { setStatusFilter(val); setPage(1); };

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

    // Navegar a reseñas pasando los datos del delivery para evitar un fetch extra
    const goToReviews = (d) => navigate(`/comercio/deliveries/resenas?deliveryId=${d.id}`, {
        state: { deliveryData: d },
    });

    const { stats } = data ?? { stats: null };

    const tabBtn = (v, label, Icon) => (
        <button type="button" onClick={() => setView(v)}
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: view === v ? "var(--primary-dark)" : "white", color: view === v ? "white" : "#374151", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            <Icon size={14} /> {label}
        </button>
    );

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <Loader2 size={28} color="#9ca3af" style={{ animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error && !data) return (
        <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px" }}>{error}</div>
    );

    return (
        <>
            {/* Encabezado */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                <div>
                    <h4 style={{ fontWeight: "700", margin: "0 0 4px 0", fontSize: "18px" }}>Gestión de Repartidores</h4>
                    <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>Administrá los repartidores vinculados a tu comercio.</p>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div style={{ display: "flex", gap: "14px", marginBottom: "24px", flexWrap: "wrap" }}>
                    <StatCard label="Disponibles"        value={stats.available}        icon={CheckCircle2} iconColor="#16a34a" />
                    <StatCard label="En Entrega"         value={stats.inDelivery}       icon={Clock}        iconColor="#3b82f6" />
                    <StatCard label="Total Repartidores" value={stats.total}            icon={Users}        iconColor="#6b9080" />
                    <StatCard label="Rating Promedio"    value={stats.avgRating ?? "—"} icon={Star}         iconColor="#f59e0b" />
                </div>
            )}

            {/* Toolbar: filtros + vistas + agregar */}
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "16px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                {/* Filtros izquierda */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    {/* Búsqueda */}
                    <div style={{ position: "relative" }}>
                        <Search size={13} color="#9ca3af" style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)" }} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, correo o teléfono"
                            value={search}
                            onChange={e => handleSearch(e.target.value)}
                            style={{ padding: "7px 10px 7px 28px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", color: "#111827", backgroundColor: "white", outline: "none", width: "260px" }}
                        />
                    </div>
                    {/* Estado */}
                    <select value={statusFilter} onChange={e => handleStatus(e.target.value)}
                        style={{ padding: "7px 10px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px", color: "#374151", backgroundColor: "white", outline: "none", cursor: "pointer" }}>
                        <option value="all">Todos los estados</option>
                        <option value="AVAILABLE">Disponible</option>
                        <option value="IN_DELIVERY">En entrega</option>
                        <option value="UNAVAILABLE">No disponible</option>
                    </select>
                    {/* Contador de resultados */}
                    {(search || statusFilter !== "all") && (
                        <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {/* Vistas + agregar */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {tabBtn("cards", "Cards", LayoutGrid)}
                    {tabBtn("table", "Tabla", Table2)}
                    <button type="button" onClick={() => navigate("/comercio/delivery/agregar")}
                        style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 16px", borderRadius: "8px", backgroundColor: "var(--primary-dark)", color: "white", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                        <Plus size={14} /> Agregar Delivery
                    </button>
                </div>
            </div>

            {/* Contenido */}
            {(data?.deliveries ?? []).length === 0 ? (
                <EmptyState onAdd={() => navigate("/comercio/delivery/agregar")} />
            ) : filtered.length === 0 ? (
                <NoResults />
            ) : (() => {
                if (view === "cards") {
                    return (
                        <CardView
                            deliveries={paginated}
                            onReviews={goToReviews}
                            onDelete={d => { setToDelete(d); setDeleteError(""); }}
                        />
                    );
                }
                return (
                    <TableView
                        deliveries={paginated}
                        onReviews={goToReviews}
                        onDelete={d => { setToDelete(d); setDeleteError(""); }}
                    />
                );
            })()}

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

            {toDelete && (
                <DeleteModal
                    delivery={toDelete}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => { if (!isDeleting) { setToDelete(null); setDeleteError(""); } }}
                    isDeleting={isDeleting}
                    error={deleteError}
                />
            )}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </>
    );
}

export default CommerceDeliveriesPage;