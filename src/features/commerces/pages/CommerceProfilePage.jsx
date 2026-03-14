// src/features/commerces/pages/CommerceProfilePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Mail, Phone, MapPin, Calendar, Star, Zap, Image } from "lucide-react";
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

function OutlineBtn({ onClick, color = "#6b9080", icon: Icon, children }) {
    return (
        <button type="button" onClick={onClick} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: "6px", padding: "8px 12px", marginBottom: "8px",
            backgroundColor: "white", border: `1px solid ${color}`, borderRadius: "8px",
            color, fontSize: "13px", fontWeight: "500", cursor: "pointer",
        }}>
            {Icon && <Icon size={13} />}
            {children}
        </button>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function CommerceProfilePage() {
    const navigate = useNavigate();
    const [commerce, setCommerce] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const sessionRes = await apiClient.get("/api/session/user-session");
                const idStore = sessionRes.data?.user?.id_store;
                if (!idStore) throw { message: "No tenés un comercio registrado. Creá tu comercio primero." };
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
                        <OutlineBtn color="#3b82f6" icon={Zap}>
                            Ver Estadísticas
                        </OutlineBtn>
                    </div>
                </div>
            </div>
        </>
    );
}