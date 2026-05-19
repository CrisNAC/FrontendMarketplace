// src/features/delivery/pages/DeliveryProfilePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Map, Star, Truck, Calendar, Activity, Clock, Edit, Power } from "lucide-react";
import toast from "react-hot-toast";
import { getCurrentUserForDeliveryForm, getDeliveryProfile, updateDeliveryStatus, UI_VEHICLE_LABELS } from "../../clients/services/deliveryApi";
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
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [sessionUser, setSessionUser] = useState(null);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const { profile: userProfile, sessionUser: authUser } = await getCurrentUserForDeliveryForm();
                
                if (active) {
                    setSessionUser(authUser);
                    
                    if (authUser?.role !== "DELIVERY") {
                        navigate("/quiero-ser-delivery", { replace: true });
                        return;
                    }
                    let deliveryProfile = null;
                    if (authUser?.id_delivery) {
                        try {
                            deliveryProfile = await getDeliveryProfile(authUser.id_delivery);
                        } catch (err) {
                            console.error("No se pudo obtener el perfil de delivery", err);
                        }
                    }

                    setProfile({
                        id_delivery: authUser?.id_delivery || null,
                        name: deliveryProfile?.user?.name || userProfile?.name || authUser?.name || "",
                        email: deliveryProfile?.user?.email || userProfile?.email || authUser?.email || "",
                        phone: deliveryProfile?.user?.phone || userProfile?.phone || authUser?.phone || "",
                        role: userProfile?.role || authUser?.role || "DELIVERY",
                        vehicle_type: deliveryProfile?.vehicle_type ? (UI_VEHICLE_LABELS[deliveryProfile.vehicle_type] || deliveryProfile.vehicle_type) : "N/A",
                        delivery_status: deliveryProfile?.delivery_status || "INACTIVE",
                        coverage_city: (() => {
                            const addresses = userProfile?.addresses || [];
                            const primaryAddress = addresses.find(a => a.is_primary) || addresses[0];
                            return primaryAddress?.city || "N/A";
                        })(),
                        store_name: deliveryProfile?.store?.name || "Sin comercio vinculado",
                        avatar_url: deliveryProfile?.user?.avatar_url || userProfile?.avatar_url || null,
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

    const handleToggleAvailability = async () => {
        if (!profile?.id_delivery) {
            toast.error("No se encontró tu ID de delivery");
            return;
        }

        setUpdatingStatus(true);
        try {
            const newStatus = profile.delivery_status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
            await updateDeliveryStatus(profile.id_delivery, newStatus);
            
            setProfile(prev => ({
                ...prev,
                delivery_status: newStatus
            }));

            toast.success(newStatus === "ACTIVE" ? "¡Conectado! Ahora recibirás pedidos" : "Desconectado. No recibirás más pedidos");
        } catch (err) {
            console.error("Error al cambiar estado:", err);
            toast.error("No se pudo cambiar tu estado. Intenta nuevamente.");
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) return <p style={{ color: "#6b7280", padding: "16px" }}>Cargando perfil...</p>;

    if (error) return (
        <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px" }}>
            {error}
        </div>
    );

    const isActive = profile?.delivery_status === "ACTIVE";
    const createdAt = profile?.created_at && profile.created_at !== "N/A"
        ? new Date(profile.created_at).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" })
        : "—";

    return (
        <>
            {/* ── Header con Toggle de Disponibilidad ─────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#e5e7eb", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <User size={24} color="#9ca3af" />
                        )}
                    </div>
                    <div>
                        <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Perfil del Delivery</h4>
                        <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>Información general de tu cuenta de repartidor</p>
                    </div>
                    {/* Badge de estado del delivery */}
                    <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                        backgroundColor: isActive ? "#dcfce7" : "#fef3c7",
                        color: isActive ? "#15803d" : "#92400e",
                        whiteSpace: "nowrap",
                    }}>
                        {isActive ? "Disponible" : "Inactivo"}
                    </span>
                </div>
                
                <div style={{ display: "flex", gap: "8px" }}>
                    {/* Botón de conectar/desconectar */}
                    <button
                        type="button"
                        onClick={handleToggleAvailability}
                        disabled={updatingStatus}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: isActive ? "#dc2626" : "#16a34a",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: updatingStatus ? "not-allowed" : "pointer",
                            opacity: updatingStatus ? 0.7 : 1,
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            if (!updatingStatus) {
                                e.target.style.backgroundColor = isActive ? "#b91c1c" : "#15803d";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!updatingStatus) {
                                e.target.style.backgroundColor = isActive ? "#dc2626" : "#16a34a";
                            }
                        }}
                    >
                        <Power size={14} />
                        {updatingStatus ? "..." : isActive ? "Desconectarme" : "Conectarme"}
                    </button>

                    {/* Botón de editar perfil */}
                    <button
                        type="button"
                        onClick={() => navigate("/delivery/perfil/editar")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "var(--primary-dark)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                        }}
                    >
                        <Edit size={14} /> Editar
                    </button>
                </div>
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
                        <h6 style={sectionTitle}>Zona de Reparto y Comercio</h6>
                        <p style={labelStyle}>Ciudad</p>
                        <InfoRow icon={MapPin} value={profile?.coverage_city} iconColor="#ef4444" />
                        
                        <p style={labelStyle}>Comercio Vinculado</p>
                        <InfoRow icon={Map} value={profile?.store_name} iconColor="#f59e0b" />
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

                </div>
            </div>
        </>
    );
}

export default DeliveryProfilePage;