// src/features/clients/pages/DeliveryEditProfilePage.jsx
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    getDeliveryProfile,
    updateMyDelivery,
    UI_VEHICLE_LABELS,
    getCurrentUserForDeliveryForm,
} from "../../clients/services/deliveryApi";
import {
    getBackendErrorMessage,
    DELIVERY_PHONE_MESSAGE,
    DELIVERY_PHONE_REGEX,
} from "../../commerces/services/editUserProfileApi";

const VEHICLE_OPTIONS = Object.entries(UI_VEHICLE_LABELS);

// ─── Estilos ─────────────
const s = {
    card: {
        backgroundColor: "white",
        borderRadius: "16px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
        overflow: "hidden",
        maxWidth: "820px",
    },
    cardHeader: {
        padding: "24px 32px 20px",
        borderBottom: "1px solid #f3f4f6",
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    cardBody: {
        padding: "28px 32px 32px",
    },
    backBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        backgroundColor: "#f3f4f6",
        border: "none",
        cursor: "pointer",
        color: "#374151",
        flexShrink: 0,
    },
    title: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#111827",
        margin: 0,
    },
    subtitle: {
        fontSize: "13px",
        color: "#6b7280",
        margin: "2px 0 0 0",
    },
    label: {
        display: "block",
        fontSize: "13px",
        fontWeight: "600",
        color: "#374151",
        marginBottom: "6px",
    },
    required: { color: "#dc2626", marginLeft: "2px" },
    input: {
        width: "100%",
        padding: "9px 12px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        fontSize: "14px",
        color: "#111827",
        backgroundColor: "white",
        outline: "none",
        boxSizing: "border-box",
    },
    inputReadonly: {
        backgroundColor: "#f9fafb",
        color: "#6b7280",
        cursor: "default",
    },
    select: {
        width: "100%",
        padding: "9px 12px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        fontSize: "14px",
        color: "#111827",
        backgroundColor: "white",
        outline: "none",
        boxSizing: "border-box",
        cursor: "pointer",
    },
    fieldNote: {
        fontSize: "11px",
        color: "#9ca3af",
        marginTop: "4px",
    },
    divider: {
        border: "none",
        borderTop: "1px solid #f3f4f6",
        margin: "24px 0",
    },
    logoSection: {
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
    },
    avatarThumb: {
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        backgroundColor: "#e5e7eb",
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #e5e7eb",
    },
    fileRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginTop: "8px",
        flexWrap: "wrap",
    },
    fileBtn: {
        padding: "7px 14px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        backgroundColor: "white",
        fontSize: "13px",
        color: "#374151",
        cursor: "pointer",
        fontWeight: "500",
    },
    fileName: { fontSize: "12px", color: "#9ca3af" },
    footer: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        paddingTop: "24px",
        borderTop: "1px solid #f3f4f6",
        marginTop: "8px",
    },
    btnCancel: {
        padding: "9px 20px",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        backgroundColor: "white",
        fontSize: "14px",
        fontWeight: "600",
        color: "#374151",
        cursor: "pointer",
    },
    btnSave: (disabled) => ({
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "9px 22px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: disabled ? "#9cbfa9" : "#5B7B6D",
        color: "white",
        fontSize: "14px",
        fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.75 : 1,
    }),
    errorBox: {
        backgroundColor: "#fff1f2",
        border: "1px solid #fecdd3",
        borderRadius: "10px",
        padding: "12px 16px",
        color: "#be123c",
        fontSize: "13px",
        marginBottom: "20px",
    },
};

export function DeliveryEditProfilePage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Datos del delivery
    const [deliveryId, setDeliveryId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Campos del formulario
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("N/A");
    const [vehicleType, setVehicleType] = useState("MOTORCYCLE");
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    // ── Carga inicial usando session (id_delivery) + getDeliveryProfile ──────
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const { sessionUser, profile } = await getCurrentUserForDeliveryForm();

                if (!mounted) return;

                if (sessionUser?.role !== "DELIVERY") {
                    navigate("/quiero-ser-delivery", { replace: true });
                    return;
                }

                const id = sessionUser?.id_delivery;
                if (!id) {
                    setError("No se encontró el perfil de delivery.");
                    setLoading(false);
                    return;
                }

                setDeliveryId(id);

                const delivery = await getDeliveryProfile(id);
                if (!mounted) return;

                // Preferir datos del perfil de usuario; fallback a session
                setName(delivery.user?.name ?? profile?.name ?? sessionUser?.name ?? "");
                setEmail(delivery.user?.email ?? profile?.email ?? sessionUser?.email ?? "");
                setPhone(delivery.user?.phone ?? profile?.phone ?? sessionUser?.phone ?? "");
                const addresses = profile?.addresses || [];
                const primaryAddress = addresses[0];
                setCity(primaryAddress?.city ?? "N/A");
                setVehicleType(delivery.vehicle_type ?? "MOTORCYCLE");
                setAvatarUrl(delivery.user?.avatar_url ?? null);
            } catch (err) {
                if (!mounted) return;
                setError(getBackendErrorMessage(err, "No se pudo cargar el perfil."));
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [navigate]);

    // ── Avatar ────────────────────────────────────────────────────────────────
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    // ── Cancelar ──────────────────────────────────────────────────────────────
    const handleCancel = () => navigate("/delivery/perfil");

    // ── Guardar ───────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!name.trim()) { setError("El nombre es obligatorio."); return; }
        if (!phone.trim()) { setError("El teléfono es obligatorio."); return; }
        if (!DELIVERY_PHONE_REGEX.test(phone.trim())) {
            setError(DELIVERY_PHONE_MESSAGE);
            return;
        }
        if (!deliveryId) { setError("No se encontró el ID del delivery."); return; }

        setSaving(true);
        setError("");
        try {
            await updateMyDelivery(
                deliveryId,
                { name: name.trim(), phone: phone.trim(), vehicleType },
                avatarFile ?? undefined,
            );
            toast.success("Perfil actualizado correctamente.");
            navigate("/delivery/perfil");
        } catch (err) {
            setError(getBackendErrorMessage(err, "No se pudo guardar el perfil."));
        } finally {
            setSaving(false);
        }
    };

    const displayedAvatar = avatarPreview ?? avatarUrl;

    return (
        <div className="mx-auto w-full max-w-[820px] px-1 sm:px-2">
            <main className="px-3 py-4 sm:px-6 sm:py-8 md:px-10 md:py-8">
                {loading && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                        <Loader2 size={28} color="#9ca3af" style={{ animation: "spin 1s linear infinite" }} />
                    </div>
                )}

                {!loading && error && !deliveryId && (
                    <div style={s.errorBox}>{error}</div>
                )}

                {!loading && deliveryId && (
                    <div style={s.card}>

                        {/* ── Header ── */}
                        <div
                            style={s.cardHeader}
                            className="!px-4 !py-4 sm:!px-8 sm:!py-6"
                        >
                            <button
                                type="button"
                                style={s.backBtn}
                                onClick={handleCancel}
                                aria-label="Volver"
                            >
                                <ArrowLeft size={16} />
                            </button>
                            <div>
                                <p style={s.title}>Editar Perfil</p>
                                <p style={s.subtitle}>Modificá la información de tu perfil de delivery</p>
                            </div>
                        </div>

                        {/* ── Body ── */}
                        <div style={s.cardBody} className="!px-4 !py-5 sm:!px-8 sm:!py-8">
                            {error && <div style={s.errorBox}>{error}</div>}

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-7 md:gap-y-5">

                                {/* Nombre */}
                                <div>
                                    <label htmlFor="delivery-name" style={s.label}>
                                        Nombre completo <span style={s.required}>*</span>
                                    </label>
                                    <input
                                        id="delivery-name"
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        disabled={saving}
                                        placeholder="Tu nombre completo"
                                        style={{ ...s.input, ...(saving ? s.inputReadonly : {}) }}
                                    />
                                </div>

                                {/* Email (solo lectura) */}
                                <div>
                                    <label htmlFor="delivery-email" style={s.label}>Email de Contacto</label>
                                    <input
                                        id="delivery-email"
                                        type="email"
                                        value={email}
                                        readOnly
                                        style={{ ...s.input, ...s.inputReadonly }}
                                    />
                                    <p style={s.fieldNote}>El correo no se puede modificar desde aquí.</p>
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <label htmlFor="delivery-phone" style={s.label}>
                                        Teléfono <span style={s.required}>*</span>
                                    </label>
                                    <input
                                        id="delivery-phone"
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        maxLength={10}
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                        disabled={saving}
                                        placeholder="09xxxxxxxx"
                                        style={{ ...s.input, ...(saving ? s.inputReadonly : {}) }}
                                    />
                                    <p style={s.fieldNote}>10 dígitos, sin + ni espacios.</p>
                                </div>

                                {/* Tipo de vehículo */}
                                <div>
                                    <label htmlFor="vehicle-type" style={s.label}>
                                        Tipo de vehículo <span style={s.required}>*</span>
                                    </label>
                                    <select
                                        id="vehicle-type"
                                        value={vehicleType}
                                        onChange={e => setVehicleType(e.target.value)}
                                        disabled={saving}
                                        style={{ ...s.select, ...(saving ? s.inputReadonly : {}) }}
                                    >
                                        {VEHICLE_OPTIONS.map(([val, label]) => (
                                            <option key={val} value={val}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Ciudad (Dirección base) */}
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                        <label htmlFor="delivery-city" style={{ ...s.label, marginBottom: 0 }}>
                                            Ciudad (Zona Base)
                                        </label>
                                        <button 
                                            type="button" 
                                            onClick={() => navigate("/direcciones")}
                                            style={{ color: "#5B7B6D", background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600", padding: 0 }}
                                        >
                                            Cambiar dirección
                                        </button>
                                    </div>
                                    <input
                                        id="delivery-city"
                                        type="text"
                                        value={city}
                                        readOnly
                                        style={{ ...s.input, ...s.inputReadonly }}
                                    />
                                    <p style={s.fieldNote}>Basado en tu dirección principal de usuario.</p>
                                </div>

                            </div>

                            <hr style={s.divider} />

                            {/* ── Foto de perfil (igual al bloque "Logo" del form de comercio) ── */}
                            <div>
                                <label htmlFor="delivery-avatar" style={s.label}>Foto de perfil</label>
                                <p style={{ ...s.fieldNote, marginBottom: "10px" }}>
                                    JPG, PNG o WebP · Máx. 5 MB
                                </p>
                                <div style={s.logoSection} className="flex-col sm:flex-row">
                                    <div style={s.avatarThumb}>
                                        {displayedAvatar
                                            ? <img src={displayedAvatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            : <span style={{ fontSize: "26px", color: "#9ca3af" }}>👤</span>
                                        }
                                    </div>
                                    <div>
                                        <div style={s.fileRow}>
                                            <button
                                                type="button"
                                                style={s.fileBtn}
                                                disabled={saving}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Seleccionar archivo
                                            </button>
                                            <span style={s.fileName}>
                                                {avatarFile ? avatarFile.name : "Sin archivo seleccionado"}
                                            </span>
                                        </div>
                                        <input
                                            id="delivery-avatar"
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            onChange={handleAvatarChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Botones ── */}
                            <div
                                style={s.footer}
                                className="flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end"
                            >
                                <button
                                    type="button"
                                    style={s.btnCancel}
                                    className="w-full sm:w-auto"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    style={s.btnSave(saving)}
                                    className="w-full justify-center sm:w-auto"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving && (
                                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                                    )}
                                    {saving ? "Guardando…" : "Actualizar Perfil"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default DeliveryEditProfilePage;