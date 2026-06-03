import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X } from "lucide-react";
import { Spinner } from "../../../components/Spinner";
import MapView from "../../clients/components/Map";
import { PageLoader } from "../../../components/PageLoader";
import { useEditCommerce } from "@/features/commerces/hooks";
import { useToast } from "@/hooks";

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

const MAX_CATEGORIES = 3;

function CategorySelector({ categories, selectedIds, onChange, disabled, error }) {
    const selectedValues = Array.isArray(selectedIds) ? selectedIds.map(String) : [];

    return (
        <div>
            <div style={{ marginBottom: "8px", minHeight: "28px" }}>
                {selectedValues.length > 0 ? (
                    selectedValues.map((selectedId) => {
                        const category = categories.find((item) => {
                            const categoryId = item.id;
                            return String(categoryId) === selectedId;
                        });

                        if (!category) {
                            return null;
                        }

                        return (
                            <CategoryChip
                                key={category.id}
                                name={category.name}
                                disabled={disabled}
                                onRemove={() => {
                                    onChange({
                                        target: {
                                            name: "categoryIds",
                                            value: selectedValues.filter((categoryId) => {
                                                const categoryIdValue = category.id;
                                                return categoryId !== String(categoryIdValue);
                                            })
                                        }
                                    });
                                }}
                            />
                        );
                    })
                ) : (
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>Sin categorías seleccionadas</span>
                )}
            </div>

            <div style={{
                border: error ? "1px solid #f87171" : "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: error ? "#fff7f7" : "#fff",
                padding: "8px 12px",
                maxHeight: "180px",
                overflowY: "auto",
            }}>
                {categories.map((category) => {
                    const categoryId = String(category.id);
                    const isSelected = selectedValues.includes(categoryId);

                    return (
                        <label
                            key={category.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "6px 0",
                                cursor: disabled ? "not-allowed" : "pointer",
                                opacity: disabled ? 0.6 : 1,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={disabled || (!isSelected && selectedValues.length >= MAX_CATEGORIES)}
                                onChange={() => {
                                    const nextValue = isSelected
                                        ? selectedValues.filter((value) => value !== categoryId)
                                        : [...selectedValues, categoryId];

                                    onChange({
                                        target: {
                                            name: "categoryIds",
                                            value: nextValue
                                        }
                                    });
                                }}
                                style={{ width: "16px", height: "16px" }}
                            />
                            <span style={{ fontSize: "14px", color: "#374151" }}>{category.name}</span>
                        </label>
                    );
                })}
            </div>

            <p style={{ fontSize: "12px", color: "#6b7280", margin: "8px 0 0 0" }}>
                Podés seleccionar hasta {MAX_CATEGORIES} categorías.
                {selectedValues.length >= MAX_CATEGORIES && (
                    <span style={{ marginLeft: "4px", fontWeight: "600", color: "#d97706" }}>Límite alcanzado.</span>
                )}
            </p>
            {error && <p style={errorMsg}>{error}</p>}
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

export function EditCommercePage() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const {
        formData, logoPreview, logoFile, validationErrors, categories,
        isLoadingInitialData, isSubmitting, isFormDisabled, loadError,
        onFieldChange, onLocationChange, onLogoFileChange, removeLogo,
        handleSubmit, errorRef,
    } = useEditCommerce({
        onSuccess: (msg) => {
            showToast(msg, 'success');
            setTimeout(() => navigate("/comercio/perfil"), 1500);
        },
        onError: (msg) => showToast(msg, 'error'),
    });

    if (isLoadingInitialData) return (<PageLoader />);

    if (loadError) return (
        <div style={{
            backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
            borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px",
        }}>
            {loadError}
        </div>
    );

    return (
        <>
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

                        <div style={{ marginBottom: "14px" }}>
                            <label style={labelStyle}>Categorías del Comercio *</label>

                            <CategorySelector
                                categories={categories}
                                selectedIds={formData.categoryIds}
                                onChange={onFieldChange}
                                disabled={isFormDisabled}
                                error={validationErrors.categoryIds}
                            />
                        </div>
                    </div>

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
                                type="url" name="websiteUrl" value={formData.websiteUrl}
                                onChange={onFieldChange} disabled={isFormDisabled}
                                maxLength={500} placeholder="https://mi-comercio.com"
                                style={inputStyle}
                            />
                        </Field>

                        <Field label="Instagram" error={validationErrors.instagramUrl}>
                            <input
                                type="url" name="instagramUrl" value={formData.instagramUrl}
                                onChange={onFieldChange} disabled={isFormDisabled}
                                maxLength={500} placeholder="https://instagram.com/mi_comercio"
                                style={inputStyle}
                            />
                        </Field>

                        <Field label="TikTok" error={validationErrors.tiktokUrl}>
                            <input
                                type="url" name="tiktokUrl" value={formData.tiktokUrl}
                                onChange={onFieldChange} disabled={isFormDisabled}
                                maxLength={500} placeholder="https://tiktok.com/@mi_comercio"
                                style={inputStyle}
                            />
                        </Field>

                        <Field label="Precio Base de Envío por km (Gs.)" required error={validationErrors.basePrice}>
                            <input
                                type="number" name="basePrice" min="0" step="0.01"
                                value={formData.basePrice} onChange={onFieldChange}
                                disabled={isFormDisabled} placeholder="Ej: 2500"
                                style={validationErrors.basePrice ? inputErrorStyle : inputStyle}
                            />
                        </Field>

                        <Field label="Precio por km para Distancia > 2 km (Gs.)" required error={validationErrors.distancePrice}>
                            <input
                                type="number" name="distancePrice" min="0" step="0.01"
                                value={formData.distancePrice} onChange={onFieldChange}
                                disabled={isFormDisabled} placeholder="Ej: 4000"
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
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", gap: "8px" }}>
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
                                        style={{ border: "none", background: "none", color: "#dc2626", fontSize: "12px", fontWeight: "600", cursor: isFormDisabled ? "not-allowed" : "pointer", opacity: isFormDisabled ? 0.6 : 1 }}
                                    >
                                        Limpiar punto
                                    </button>
                                )}
                            </div>
                        </Field>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={card}>
                        <h6 style={sectionTitle}>Imágenes del Comercio</h6>
                        <label style={labelStyle}>Logo</label>

                        {logoPreview ? (
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
                        ) : (
                            <div style={{ width: "100%", height: "80px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                                <span style={{ fontSize: "12px", color: "#9ca3af" }}>Sin logo</span>
                            </div>
                        )}

                        <label style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            backgroundColor: "#6b9080", color: "white",
                            padding: "6px 14px", borderRadius: "8px",
                            fontSize: "13px", fontWeight: "600",
                            cursor: isFormDisabled ? "not-allowed" : "pointer",
                            opacity: isFormDisabled ? 0.6 : 1,
                            pointerEvents: isFormDisabled ? "none" : "auto",
                            marginBottom: "6px",
                        }}>
                            Seleccionar imagen
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                disabled={isFormDisabled}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) onLogoFileChange(file);
                                }}
                            />
                        </label>
                        <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>JPG o PNG recomendado</p>

                        {validationErrors.logoUrl && <p style={errorMsg}>{validationErrors.logoUrl}</p>}

                        <label style={{ ...labelStyle, marginTop: "16px" }}>Banner</label>
                        <input
                            name="bannerUrl"
                            disabled
                            placeholder="Próximamente disponible"
                            style={{ ...inputStyle, fontSize: "12px", opacity: 0.5, cursor: "not-allowed" }}
                        />
                    </div>

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
        </>
    );
}
