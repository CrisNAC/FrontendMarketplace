// src/features/commerces/pages/CommerceProfilePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Mail, Phone, MapPin, Calendar, Star, Zap, Image, Trash2, AlertTriangle, Globe, Instagram, Music2 } from "lucide-react";
import { apiClient, getBackendErrorMessage } from "../services/editCommerceApi";

// ─── Estilos compartidos ──────────────────────────────────────────────────────
const card = {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const sectionTitle = {
    fontWeight: "700",
    fontSize: "15px",
    margin: "0 0 16px 0",
    color: "#111827",
};

const labelStyle = {
    fontSize: "12px",
    color: "#6b7280",
    margin: "0 0 3px 0",
    fontWeight: "500",
};

const valueStyle = {
    fontSize: "14px",
    color: "#111827",
    margin: "0 0 14px 0",
    lineHeight: "1.5",
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, value, iconColor = "#6b9080" }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Icon size={14} color={iconColor} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "14px", color: "#374151" }}>{value || "—"}</span>
        </div>
    );
}

function UrlRow({ icon: Icon, value, iconColor = "#6b9080" }) {
    const url = value?.trim();

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Icon size={14} color={iconColor} style={{ flexShrink: 0 }} />
            {url ? (
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "14px", color: "#2563eb", textDecoration: "underline", wordBreak: "break-all" }}
                >
                    {url}
                </a>
            ) : (
                <span style={{ fontSize: "14px", color: "#9ca3af" }}>—</span>
            )}
        </div>
    );
}

function CategoryChip({ name }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            backgroundColor: "#ede9fe", color: "#6d28d9",
            borderRadius: "20px", padding: "3px 10px",
            fontSize: "12px", fontWeight: "500",
        }}>
            {name}
        </span>
    );
}

function StatRow({ label, children }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>{label}</span>
            <span style={{ fontSize: "13px", fontWeight: "600" }}>{children}</span>
        </div>
    );
}

function OutlineBtn({ onClick, color = "#6b9080", icon: Icon, children, disabled = false, title }) {
    return (
        <button
            type="button"
            onClick={disabled ? undefined : onClick}
            title={title}
            style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: "6px", padding: "8px 12px", marginBottom: "8px",
                backgroundColor: "white", border: `1px solid ${color}`, borderRadius: "8px",
                color, fontSize: "13px", fontWeight: "500",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.45 : 1,
            }}
        >
            {Icon && <Icon size={13} />}
            {children}
        </button>
    );
}

// ─── Modal de confirmación de eliminación ─────────────────────────────────────
function DeleteCommerceModal({ commerceName, isDeleting, onConfirm, onCancel }) {
    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 50,
                backgroundColor: "rgba(0,0,0,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    backgroundColor: "white", borderRadius: "16px", padding: "24px",
                    maxWidth: "440px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px",
                }}>
                    <AlertTriangle size={24} color="#dc2626" />
                </div>

                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>
                    ¿Eliminar comercio?
                </h3>
                <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 6px 0", lineHeight: "1.5" }}>
                    Estás por eliminar <strong>"{commerceName}"</strong> de forma permanente.
                </p>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 24px 0", lineHeight: "1.5" }}>
                    También se eliminarán todos los productos asociados. Esta acción no puede deshacerse.
                </p>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        style={{
                            padding: "8px 20px", borderRadius: "8px",
                            border: "1px solid #d1d5db", backgroundColor: "white",
                            fontSize: "14px", fontWeight: "500", color: "#374151",
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
                            padding: "8px 20px", borderRadius: "8px", border: "none",
                            backgroundColor: "#dc2626", fontSize: "14px", fontWeight: "600", color: "white",
                            cursor: isDeleting ? "not-allowed" : "pointer",
                            opacity: isDeleting ? 0.7 : 1,
                            display: "flex", alignItems: "center", gap: "6px",
                        }}
                    >
                        {isDeleting ? "Eliminando..." : "Eliminar Comercio"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function CommerceProfilePage() {
    const navigate = useNavigate();
    const [commerce, setCommerce] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Estado del modal de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const sessionRes = await apiClient.get("/api/session/user-session");
                const idStore = sessionRes.data?.user?.id_store;
                if (!idStore) throw new Error("No tenés un comercio registrado. Creá tu comercio primero.");
                const res = await apiClient.get(`/api/commerces/${idStore}`);
                if (active) setCommerce(res.data);
            } catch (err) {
                if (active) setError(getBackendErrorMessage(err, "No se pudo cargar el perfil."));
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, []);

    const handleDeleteConfirm = async () => {
        if (!commerce?.id_store) return;
        setIsDeleting(true);
        setDeleteError("");
        try {
            await apiClient.delete(`/api/commerces/${commerce.id_store}`);
            setShowDeleteModal(false);
            navigate("/homepage");
        } catch (err) {
            setDeleteError(getBackendErrorMessage(err, "No se pudo eliminar el comercio. Intentá nuevamente."));
            setIsDeleting(false);
        }
    };

    if (loading) return <p style={{ color: "#6b7280", padding: "16px" }}>Cargando...</p>;

    if (error) return (
        <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px" }}>
            {error}
        </div>
    );

    const address = commerce?.addresses?.[0];
    const addressText = [address?.address, address?.city, address?.region].filter(Boolean).join(", ");
    const createdAt = commerce?.created_at
        ? new Date(commerce.created_at).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" })
        : "—";

    return (
        <>
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Perfil del Comercio</h4>
                    <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>Información general de tu comercio</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/comercio/editar")}
                    style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        backgroundColor: "var(--primary-dark)", color: "white",
                        border: "none", borderRadius: "8px", padding: "8px 16px",
                        fontSize: "14px", fontWeight: "500", cursor: "pointer",
                    }}
                >
                    <Edit size={14} />
                    Editar Perfil
                </button>
            </div>

            {/* ── Error de eliminación ───────────────────────────────────────── */}
            {deleteError && (
                <div style={{
                    backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
                    borderRadius: "10px", padding: "12px 16px", color: "#be123c",
                    fontSize: "14px", marginBottom: "16px",
                }}>
                    {deleteError}
                </div>
            )}

            {/* ── Grid ──────────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px", alignItems: "start" }}>

                {/* Columna izquierda */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                    {/* Información Básica */}
                    <div style={card}>
                        <h6 style={sectionTitle}>Información Básica</h6>
                        <p style={labelStyle}>Nombre del Comercio</p>
                        <p style={valueStyle}>{commerce?.name || "—"}</p>
                        <p style={labelStyle}>Descripción</p>
                        <p style={{ ...valueStyle, lineHeight: "1.6" }}>{commerce?.description || "—"}</p>
                        <p style={{ ...labelStyle, marginBottom: "8px" }}>Categorías de Productos</p>
                        {commerce?.store_category
                            ? <CategoryChip name={commerce.store_category.name} />
                            : <span style={{ fontSize: "13px", color: "#9ca3af" }}>Sin categoría</span>
                        }
                    </div>

                    {/* Información de Contacto */}
                    <div style={card}>
                        <h6 style={sectionTitle}>Información de Contacto</h6>
                        <p style={labelStyle}>Email</p>
                        <InfoRow icon={Mail} value={commerce?.email} iconColor="#3b82f6" />
                        <p style={labelStyle}>Teléfono</p>
                        <InfoRow icon={Phone} value={commerce?.phone} iconColor="#16a34a" />
                        <p style={labelStyle}>Dirección</p>
                        <InfoRow icon={MapPin} value={addressText || "Sin dirección registrada"} iconColor="#ef4444" />
                        <p style={labelStyle}>Sitio web</p>
                        <UrlRow icon={Globe} value={commerce?.website_url} iconColor="#0ea5e9" />
                        <p style={labelStyle}>Instagram</p>
                        <UrlRow icon={Instagram} value={commerce?.instagram_url} iconColor="#db2777" />
                        <p style={labelStyle}>TikTok</p>
                        <UrlRow icon={Music2} value={commerce?.tiktok_url} iconColor="#111827" />
                    </div>
                </div>

                {/* Columna derecha */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                    {/* Imágenes */}
                    <div style={card}>
                        <h6 style={sectionTitle}>Imágenes del Comercio</h6>
                        <p style={labelStyle}>Logo</p>
                        {commerce?.logo ? (
                            <img
                                src={commerce.logo}
                                alt="Logo"
                                style={{ width: "100%", maxHeight: "90px", objectFit: "contain", borderRadius: "8px", border: "1px solid #f3f4f6", marginBottom: "12px" }}
                                onError={e => { e.currentTarget.style.display = "none"; }}
                            />
                        ) : (
                            <div style={{
                                width: "100%", height: "80px", backgroundColor: "#f9fafb",
                                borderRadius: "8px", border: "1px dashed #d1d5db",
                                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px",
                            }}>
                                <Image size={24} color="#9ca3af" />
                            </div>
                        )}
                        <p style={labelStyle}>Banner</p>
                        <div style={{
                            width: "100%", height: "80px", backgroundColor: "#f9fafb",
                            borderRadius: "8px", border: "1px dashed #d1d5db",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Image size={24} color="#9ca3af" />
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div style={card}>
                        <h6 style={sectionTitle}>Estadísticas</h6>
                        <StatRow label="Calificación:">
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f59e0b" }}>
                                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                                {commerce?.average_rating ?? "—"}
                            </span>
                        </StatRow>
                        <StatRow label="Total reseñas:">
                            <span style={{ color: "#3b82f6" }}>{commerce?.total_reviews ?? "—"}</span>
                        </StatRow>
                        <StatRow label="Miembro desde:">
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Calendar size={12} color="#6b7280" />
                                {createdAt}
                            </span>
                        </StatRow>
                        <StatRow label="ID del comercio:">
                            {commerce?.id_store ?? "—"}
                        </StatRow>
                    </div>

                    {/* Acciones Rápidas */}
                    <div style={card}>
                        <h6 style={sectionTitle}>Acciones Rápidas</h6>
                        <OutlineBtn onClick={() => navigate("/comercio/editar")} icon={Image}>
                            Cambiar Logo
                        </OutlineBtn>
                        <OutlineBtn
                            color="#9ca3af"
                            icon={Zap}
                            disabled
                            title="Estadísticas disponibles próximamente"
                        >
                            Ver Estadísticas
                        </OutlineBtn>
                        <OutlineBtn
                            color="#dc2626"
                            icon={Trash2}
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Eliminar Comercio
                        </OutlineBtn>
                    </div>
                </div>
            </div>

            {/* ── Modal de confirmación ──────────────────────────────────────── */}
            {showDeleteModal && (
                <DeleteCommerceModal
                    commerceName={commerce?.name ?? "este comercio"}
                    isDeleting={isDeleting}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => !isDeleting && setShowDeleteModal(false)}
                />
            )}
        </>
    );
}