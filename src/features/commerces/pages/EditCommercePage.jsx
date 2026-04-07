// src/features/commerces/pages/EditCommercePage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X } from "lucide-react";
import { Spinner } from "../../../components/Spinner";
import { CreationResultModal } from "../components/createProduct/CreationResultModal";
import { useEditCommerce } from "../hooks/useEditCommerce";
import MapView from "../../clients/components/Map";

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
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "5px",
};

const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#f9fafb",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
};

const inputErrorStyle = {
    ...inputStyle,
    borderColor: "#f87171",
    backgroundColor: "#fff7f7",
};

const errorMsg = { fontSize: "12px", color: "#dc2626", marginTop: "4px" };

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
    return (
        <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>{label}{required && " *"}</label>
            {children}
            {error && <p style={errorMsg}>{error}</p>}
        </div>
    );
}

function CategoryChip({ name, onRemove, disabled }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            backgroundColor: "#ede9fe", color: "#6d28d9",
            borderRadius: "20px", padding: "3px 10px",
            fontSize: "12px", fontWeight: "500", marginRight: "6px",
        }}>
            {name}
            {!disabled && (
                <button type="button" onClick={onRemove} style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#6d28d9", padding: "0 0 0 2px", lineHeight: 1, fontSize: "14px",
                }}>×</button>
            )}
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

// ─── Página principal ─────────────────────────────────────────────────────────
export function EditCommercePage() {
    const navigate = useNavigate();

    const {
        formData, logoPreview, validationErrors, categories,
        isLoadingInitialData, isSubmitting, isFormDisabled,
        loadError, successToast, errorModal, closeErrorModal,
        onFieldChange, onLocationChange, removeLogo, handleSubmit, errorRef,
    } = useEditCommerce();

    // Redirigir a perfil 1.5s después de guardar exitosamente
    useEffect(() => {
        if (successToast) {
            const timer = setTimeout(() => navigate("/comercio/perfil"), 1500);
            return () => clearTimeout(timer);
        }
    }, [successToast]);

    if (isLoadingInitialData) return (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
            <Spinner size="8" />
        </div>
    );

    if (loadError) return (
        <div style={{
            backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
            borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px",
        }}>
            {loadError}
        </div>
    );

    const selectedCategory = categories.find(c => String(c.id) === String(formData.categoryId));

    return (
        <>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Perfil del Comercio</h4>
                    <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>Edita la información de tu comercio</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        type="button"
                        onClick={() => navigate("/comercio/perfil")}
                        disabled={isFormDisabled}
                        style={{
                            padding: "8px 16px", backgroundColor: "white",
                            border: "1px solid #d1d5db", borderRadius: "8px",
                            fontSize: "14px", fontWeight: "500", color: "#374151",
                            cursor: isFormDisabled ? "not-allowed" : "pointer",
                            opacity: isFormDisabled ? 0.6 : 1,
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isFormDisabled}
                        style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "8px 16px", backgroundColor: "var(--primary-dark)",
                            color: "white", border: "none", borderRadius: "8px",
                            fontSize: "14px", fontWeight: "500",
                            cursor: isFormDisabled ? "not-allowed" : "pointer",
                            opacity: isFormDisabled ? 0.7 : 1,
                        }}
                    >
                        {isSubmitting
                            ? <Spinner size="4" color="text-white" />
                            : <><Save size={14} /> Guardar Cambios</>
                        }
                    </button>
                </div>
            </div>

            {/* ── Grid ──────────────────────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px", alignItems: "start" }}>

                {/* Columna izquierda */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                    {/* Información Básica */}
                    <div style={card}>
                        <h6 style={sectionTitle}>Información Básica</h6>

                        <Field label="Nombre de tu comercio" required error={validationErrors.name}>
                            <input
                                name="name" value={formData.name} onChange={onFieldChange}
                                disabled={isFormDisabled} maxLength={100}
                                style={validationErrors.name ? inputErrorStyle : inputStyle}
                            />
                        </Field>

                        <Field label="Descripción" required error={validationErrors.description}>
                            <textarea
                                name="description" value={formData.description} onChange={onFieldChange}
                                disabled={isFormDisabled} maxLength={500} rows={3}
                                style={{ ...inputStyle, resize: "vertical" }}
                            />
                        </Field>

                        {/* Categoría como chip + selector */}
                        <div style={{ marginBottom: "14px" }}>
                            <label style={labelStyle}>Categorías de Productos *</label>

                            <div style={{ marginBottom: "8px", minHeight: "28px" }}>
                                {selectedCategory ? (
                                    <CategoryChip
                                        name={selectedCategory.name}
                                        disabled={isFormDisabled}
                                        onRemove={() => onFieldChange({ target: { name: "categoryId", value: "" } })}
                                    />
                                ) : (
                                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>Sin categoría seleccionada</span>
                                )}
                            </div>

                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <select
                                    name="categoryId" value={formData.categoryId}
                                    onChange={onFieldChange} disabled={isFormDisabled}
                                    style={{ ...inputStyle, flex: 1 }}
                                >
                                    <option value="">Seleccionar categoría...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <div
                                    title="Funcionalidad de múltiples categorías próximamente"
                                    style={{
                                        width: "34px", height: "36px", flexShrink: 0,
                                        backgroundColor: "var(--primary-dark)", color: "white",
                                        border: "none", borderRadius: "8px", fontSize: "20px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        opacity: 0.4, cursor: "not-allowed",
                                    }}
                                >
                                    +
                                </div>
                            </div>
                            {validationErrors.categoryId && <p style={errorMsg}>{validationErrors.categoryId}</p>}
                        </div>
                    </div>

                    {/* Información de Contacto */}
                    <div style={card}>
                        <h6 style={sectionTitle}>Información de Contacto</h6>

                        <Field label="Email" required error={validationErrors.email}>
                            <input
                                type="email" name="email" value={formData.email}
                                onChange={onFieldChange} disabled={isFormDisabled}
                                style={validationErrors.email ? inputErrorStyle : inputStyle}
                            />
                        </Field>

                        <Field label="Teléfono" required error={validationErrors.phone}>
                            <input
                                name="phone" value={formData.phone} onChange={onFieldChange}
                                disabled={isFormDisabled} maxLength={20} placeholder="+595XXXXXXXXX"
                                style={validationErrors.phone ? inputErrorStyle : inputStyle}
                            />
                        </Field>

                        <Field label="Sitio web" error={validationErrors.websiteUrl}>
                            <input
                                type="url"
                                name="websiteUrl"
                                value={formData.websiteUrl}
                                onChange={onFieldChange}
                                disabled={isFormDisabled}
                                maxLength={500}
                                placeholder="https://mi-comercio.com"
                                style={inputStyle}
                            />
                        </Field>

                        <Field label="Instagram" error={validationErrors.instagramUrl}>
                            <input
                                type="url"
                                name="instagramUrl"
                                value={formData.instagramUrl}
                                onChange={onFieldChange}
                                disabled={isFormDisabled}
                                maxLength={500}
                                placeholder="https://instagram.com/mi_comercio"
                                style={inputStyle}
                            />
                        </Field>

                        <Field label="TikTok" error={validationErrors.tiktokUrl}>
                            <input
                                type="url"
                                name="tiktokUrl"
                                value={formData.tiktokUrl}
                                onChange={onFieldChange}
                                disabled={isFormDisabled}
                                maxLength={500}
                                placeholder="https://tiktok.com/@mi_comercio"
                                style={inputStyle}
                            />
                        </Field>

                        <Field label="Precio Base de Envío por km (Gs.)" required error={validationErrors.basePrice}>
                            <input
                                type="number"
                                name="basePrice"
                                min="0"
                                step="0.01"
                                value={formData.basePrice}
                                onChange={onFieldChange}
                                disabled={isFormDisabled}
                                placeholder="Ej: 2500"
                                style={validationErrors.basePrice ? inputErrorStyle : inputStyle}
                            />
                        </Field>

                        <Field label="Precio por km para Distancia > 2 km (Gs.)" required error={validationErrors.distancePrice}>
                            <input
                                type="number"
                                name="distancePrice"
                                min="0"
                                step="0.01"
                                value={formData.distancePrice}
                                onChange={onFieldChange}
                                disabled={isFormDisabled}
                                placeholder="Ej: 4000"
                                style={validationErrors.distancePrice ? inputErrorStyle : inputStyle}
                            />
                        </Field>

                        <Field label="Dirección" required error={validationErrors.address}>
                            <input
                                name="address" value={formData.address} onChange={onFieldChange}
                                disabled={isFormDisabled}
                                style={validationErrors.address ? inputErrorStyle : inputStyle}
                            />
                        </Field>

                        <Field label="Ubicación en mapa" required error={validationErrors.location}>
                            <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
                                <MapView
                                    mode="single-point"
                                    selectedPoint={
                                        formData.latitude !== null && formData.longitude !== null
                                            ? { lat: Number(formData.latitude), lng: Number(formData.longitude) }
                                            : null
                                    }
                                    onPointChange={onLocationChange}
                                    heightClass="h-[240px]"
                                    allowFullscreen={false}
                                    showDistancePanel={false}
                                />
                            </div>

                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "8px",
                                gap: "8px"
                            }}>
                                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                                    {formData.latitude !== null && formData.longitude !== null
                                        ? `Punto seleccionado: ${Number(formData.latitude).toFixed(5)}, ${Number(formData.longitude).toFixed(5)}`
                                        : "Haz click en el mapa para seleccionar la ubicación exacta."}
                                </span>

                                {formData.latitude !== null && formData.longitude !== null && (
                                    <button
                                        type="button"
                                        onClick={() => onLocationChange(null)}
                                        disabled={isFormDisabled}
                                        style={{
                                            border: "none",
                                            background: "none",
                                            color: "#dc2626",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            cursor: isFormDisabled ? "not-allowed" : "pointer",
                                            opacity: isFormDisabled ? 0.6 : 1
                                        }}
                                    >
                                        Limpiar punto
                                    </button>
                                )}
                            </div>
                        </Field>
                    </div>
                </div>

                {/* Columna derecha */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                    {/* Imágenes */}
                    <div style={card}>
                        <h6 style={sectionTitle}>Imágenes del Comercio</h6>

                        <label style={labelStyle}>Logo</label>
                        {logoPreview && (
                            <div style={{ position: "relative", marginBottom: "8px" }}>
                                <img
                                    src={logoPreview} alt="Logo"
                                    style={{ width: "100%", maxHeight: "90px", objectFit: "contain", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                                    onError={e => { e.currentTarget.style.display = "none"; }}
                                />
                                <button type="button" onClick={removeLogo} disabled={isFormDisabled} style={{
                                    position: "absolute", top: "4px", right: "4px",
                                    background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%",
                                    width: "20px", height: "20px", color: "white", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <X size={10} />
                                </button>
                            </div>
                        )}
                        <input
                            name="logoUrl" value={formData.logoUrl} onChange={onFieldChange}
                            disabled={isFormDisabled}
                            placeholder="https://images.unsplash.com/..."
                            style={{ ...inputStyle, fontSize: "12px", marginBottom: validationErrors.logoUrl ? "4px" : "12px" }}
                        />
                        {validationErrors.logoUrl && <p style={errorMsg}>{validationErrors.logoUrl}</p>}

                        <label style={{ ...labelStyle, marginTop: "4px" }}>Banner</label>
                        {/* Banner: campo reservado para sprint futuro, aún no persiste en el backend */}
                        <input
                            name="bannerUrl"
                            disabled
                            placeholder="Próximamente disponible"
                            style={{ ...inputStyle, fontSize: "12px", opacity: 0.5, cursor: "not-allowed" }}
                        />
                    </div>

                    {/* Estadísticas - solo lectura, datos reales cuando el backend los provea */}
                    <div style={card}>
                        <h6 style={sectionTitle}>Estadísticas</h6>
                        <StatRow label="Calificación:">
                            <span style={{ color: "#f59e0b" }}>—</span>
                        </StatRow>
                        <StatRow label="Total reseñas:">
                            <span style={{ color: "#3b82f6" }}>—</span>
                        </StatRow>
                        <StatRow label="Miembro desde:">
                            <span style={{ fontSize: "12px" }}>—</span>
                        </StatRow>
                        <StatRow label="ID del comercio:">—</StatRow>
                    </div>
                </div>
            </div>

            {/* Toast de éxito */}
            {successToast && (
                <div style={{
                    position: "fixed", bottom: "24px", right: "24px", zIndex: 1000,
                    backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
                    borderRadius: "10px", padding: "12px 20px",
                    color: "#15803d", fontSize: "14px", fontWeight: "500",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}>
                    ✓ Comercio actualizado exitosamente
                </div>
            )}

            {/* Modal de error del backend */}
            {errorModal.isOpen && (
                <CreationResultModal
                    isOpen={errorModal.isOpen}
                    title={errorModal.title}
                    message={errorModal.message}
                    type="error"
                    onClose={closeErrorModal}
                />
            )}
        </>
    );
}