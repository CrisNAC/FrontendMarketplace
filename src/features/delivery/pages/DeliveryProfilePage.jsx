import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Map, Star, Truck, Calendar, Activity, Clock, Edit } from "lucide-react";
import { getCurrentUserForDeliveryForm, getDeliveryProfile } from "../../clients/services/deliveryApi";
import { getBackendErrorMessage } from "../../commerces/services/editUserProfileApi";

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

function StatRow({ label, children }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>{label}</span>
            <span style={{ fontSize: "13px", fontWeight: "600" }}>{children}</span>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function DeliveryProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const { profile: userProfile, sessionUser } = await getCurrentUserForDeliveryForm();
                
                if (active) {
                    if (sessionUser?.role !== "DELIVERY") {
                        navigate("/quiero-ser-delivery", { replace: true });
                        return;
                    }
                    let deliveryProfile = null;
                    if (sessionUser?.id_delivery) {
                        try {
                            deliveryProfile = await getDeliveryProfile(sessionUser.id_delivery);
                        } catch (err) {
                            console.error("No se pudo obtener el perfil de delivery", err);
                        }
                    }

                    const VEHICLE_MAP = {
                        CAR: "Automóvil",
                        MOTORCYCLE: "Motocicleta",
                        BICYCLE: "Bicicleta",
                        ON_FOOT: "A pie"
                    };

                    setProfile({
                        name: userProfile?.name || sessionUser?.name || "",
                        email: userProfile?.email || sessionUser?.email || "",
                        phone: userProfile?.phone || "",
                        role: userProfile?.role || sessionUser?.role || "DELIVERY",
                        // Datos de la tabla Deliveries y usuarios
                        vehicle_type: deliveryProfile?.vehicle_type ? (VEHICLE_MAP[deliveryProfile.vehicle_type] || deliveryProfile.vehicle_type) : "N/A",
                        delivery_status: deliveryProfile?.delivery_status || "N/A",
                        // Como el backend actualmente no retorna coverage_city en getDeliveryById, se puede usar valores por defecto si no existen
                        coverage_city: deliveryProfile?.coverage_city || "N/A",
                        coverage_region: deliveryProfile?.coverage_region || "N/A",
                        coverage_radius_km: deliveryProfile?.coverage_radius_km || 0,
                        availability_notes: deliveryProfile?.availability_notes || "N/A",
                        average_rating: deliveryProfile?.average_rating || 0,
                        total_deliveries: deliveryProfile?.total_deliveries || 0,
                        reviews_count: deliveryProfile?.reviews_count || 0,
                        created_at: deliveryProfile?.created_at || new Date().toISOString()
                    });
                }
            } catch (err) {
                if (active) setError(getBackendErrorMessage(err, "No se pudo cargar el perfil del delivery."));
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, []);

    if (loading) return <p style={{ color: "#6b7280", padding: "16px" }}>Cargando perfil...</p>;

    if (error) return (
        <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px" }}>
            {error}
        </div>
    );

    const isActive = profile?.delivery_status === "AVAILABLE" || profile?.delivery_status === "ACTIVE";
    const createdAt = profile?.created_at && profile.created_at !== "N/A"
        ? new Date(profile.created_at).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" })
        : "—";

    return (
        <>
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div>
                        <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Perfil del Delivery</h4>
                        <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>Información general de tu cuenta de repartidor</p>
                    </div>
                    {/* Badge de estado del delivery */}
                    <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                        backgroundColor: isActive ? "#dcfce7" : "#fef3c7",
                        color: isActive ? "#15803d" : "#92400e",
                    }}>
                        {isActive ? "Disponible" : "Inactivo"}
                    </span>
                </div>
                <button type="button" onClick={() => {}} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    backgroundColor: "var(--primary-dark)", color: "white",
                    border: "none", borderRadius: "8px", padding: "8px 16px",
                    fontSize: "14px", fontWeight: "500", cursor: "pointer",
                }}>
                    <Edit size={14} /> Editar Perfil
                </button>
            </div>

            {/* ── Grid ──────────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px", alignItems: "start" }}>

                {/* Columna izquierda */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={card}>
                        <h6 style={sectionTitle}>Datos Personales</h6>
                        <p style={labelStyle}>Nombre Completo</p>
                        <InfoRow icon={User} value={profile?.name} iconColor="#6b9080" />
                        
                        <p style={labelStyle}>Email</p>
                        <InfoRow icon={Mail} value={profile?.email} iconColor="#3b82f6" />
                        
                        <p style={labelStyle}>Teléfono (WhatsApp)</p>
                        <InfoRow icon={Phone} value={profile?.phone} iconColor="#16a34a" />
                    </div>

                    <div style={card}>
                        <h6 style={sectionTitle}>Zona y Horarios de Reparto</h6>
                        <p style={labelStyle}>Ciudad</p>
                        <InfoRow icon={MapPin} value={profile?.coverage_city} iconColor="#ef4444" />
                        
                        <p style={labelStyle}>Barrio / Zona Base</p>
                        <InfoRow icon={Map} value={profile?.coverage_region} iconColor="#f59e0b" />
                        
                        <p style={labelStyle}>Radio de Cobertura</p>
                        <InfoRow icon={Activity} value={`${profile?.coverage_radius_km} km`} iconColor="#0ea5e9" />

                        <p style={labelStyle}>Disponibilidad / Horarios</p>
                        <InfoRow icon={Clock} value={profile?.availability_notes} iconColor="#8b5cf6" />
                    </div>
                </div>

                {/* Columna derecha */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={card}>
                        <h6 style={sectionTitle}>Vehículo</h6>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                            <div style={{ width: "40px", height: "40px", backgroundColor: "#f3f4f6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Truck size={20} color="#6b7280" />
                            </div>
                            <div>
                                <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: 0 }}>{profile?.vehicle_type}</p>
                                <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>Tipo de transporte</p>
                            </div>
                        </div>
                    </div>

                    <div style={card}>
                        <h6 style={sectionTitle}>Estadísticas</h6>
                        <StatRow label="Calificación:">
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f59e0b" }}>
                                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                                {profile?.average_rating ?? "—"}
                            </span>
                        </StatRow>
                        <StatRow label="Entregas totales:">
                            <span style={{ color: "#16a34a" }}>{profile?.total_deliveries ?? "—"}</span>
                        </StatRow>
                        <StatRow label="Total reseñas:">
                            <span style={{ color: "#3b82f6" }}>{profile?.reviews_count ?? "—"}</span>
                        </StatRow>
                        <StatRow label="Miembro desde:">
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <Calendar size={12} color="#6b7280" />
                                {createdAt}
                            </span>
                        </StatRow>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DeliveryProfilePage;
