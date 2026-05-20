// src/features/admin/components/CategoryEditModal.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import { CategoryIcon, IconPicker } from "./CategoryIconPicker";
import { z } from "zod";

const categorySchema = z.object({
    name: z
        .string()
        .min(1, "El nombre es requerido.")
        .max(100, "El nombre no puede superar 100 caracteres."),
    visible: z.boolean(),
});

export function CategoryEditModal({ category, onSave, onCancel }) {
    const [name, setName] = useState(category.name);
    const [icon, setIcon] = useState(category.icon ?? "Tag");
    const [visible, setVisible] = useState(category.visible);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const trimmedName = name.trim();

    const handleSubmit = async () => {
        const parsed = categorySchema.safeParse({
            name: trimmedName,
            visible,
        });

        if (!parsed.success) {
            const first = parsed.error.issues[0];
            setError(first?.message ?? "Error en el formulario.");
            return;
        }

        const payload = {};
        if (trimmedName !== category.name) {
            payload.name = trimmedName;
        }
        if (visible !== category.visible) payload.visible = visible;
        if (icon !== (category.icon ?? "Tag")) payload.icon = icon;
        const hasNoChanges = Object.keys(payload).length === 0;

        if (hasNoChanges) {
            onCancel();
            return;
        }

        setIsSubmitting(true);
        setError("");
        try {
            await onSave(category.id, payload);
        } catch (err) {
            setError(err?.response?.data?.message ?? "No se pudo guardar la categoría.");
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Escape") {
            onCancel();
        }
    };

    return (
        <dialog
            open
            aria-modal="true"
            aria-labelledby="edit-modal-title"
            onClose={onCancel}
            onKeyDown={handleKeyDown}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 50,
                backgroundColor: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                border: "none",
                width: "100%",
                height: "100%",
            }}
        >
            {/* Botón invisible que actúa como el overlay de fondo para clics y accesibilidad */}
            <button
                type="button"
                onClick={onCancel}
                aria-label="Cerrar modal"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    background: "transparent",
                    border: "none",
                    cursor: "default",
                }}
            />

            {/* Contenedor del Modal */}
            <div
                style={{
                    position: "relative", // Para quedar por encima del botón invisible del overlay
                    backgroundColor: "white",
                    borderRadius: "16px",
                    padding: "24px",
                    maxWidth: "480px",
                    width: "100%",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 id="edit-modal-title" style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
                        Editar Categoría
                    </h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
                        borderRadius: "8px", padding: "10px 12px",
                        color: "#be123c", fontSize: "13px", marginBottom: "16px",
                    }}>
                        {error}
                    </div>
                )}

                {/* Preview */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    marginBottom: "16px", padding: "12px",
                    backgroundColor: "#f9fafb", borderRadius: "10px",
                }}>
                    <div style={{
                        width: "42px", height: "42px", borderRadius: "10px",
                        backgroundColor: "var(--background-soft)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <CategoryIcon name={icon} size={22} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                            {trimmedName || "Nombre de la categoría"}
                        </p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>Vista previa</p>
                    </div>
                </div>

                {/* Nombre */}
                <div style={{ marginBottom: "16px" }}>
                    <label
                        htmlFor="edit-category-name"
                        style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}
                    >
                        Nombre <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                        id="edit-category-name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={isSubmitting}
                        maxLength={100}
                        style={{
                            width: "100%", padding: "8px 12px",
                            border: "1px solid #e5e7eb", borderRadius: "8px",
                            fontSize: "14px", outline: "none", boxSizing: "border-box",
                        }}
                    />
                </div>

                {/* Ícono */}
                <div style={{ marginBottom: "16px" }}>
                    <IconPicker value={icon} onChange={setIcon} disabled={isSubmitting} />
                </div>

                {/* Visibilidad */}
                <fieldset style={{ border: "none", padding: 0, margin: "0 0 20px 0" }}>
                    <legend style={{
                        fontSize: "13px", fontWeight: "600", color: "#374151",
                        marginBottom: "10px", float: "left", width: "100%",
                    }}>
                        Visibilidad
                    </legend>
                    <div style={{ display: "flex", gap: "10px", clear: "both" }}>
                        {[
                            { value: true, label: "Visible", color: "#15803d", bg: "#dcfce7", border: "#bbf7d0" },
                            { value: false, label: "Oculta", color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
                        ].map(opt => (
                            <button
                                key={String(opt.value)}
                                type="button"
                                onClick={() => setVisible(opt.value)}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1, padding: "8px 12px", borderRadius: "8px",
                                    fontSize: "13px", fontWeight: "600", cursor: "pointer",
                                    backgroundColor: visible === opt.value ? opt.bg : "white",
                                    border: `1px solid ${visible === opt.value ? opt.border : "#e5e7eb"}`,
                                    color: visible === opt.value ? opt.color : "#6b7280",
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </fieldset>

                {/* Acciones */}
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        style={{
                            padding: "8px 20px", borderRadius: "8px",
                            border: "1px solid #d1d5db", backgroundColor: "white",
                            fontSize: "14px", fontWeight: "500", color: "#374151",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{
                            padding: "8px 20px", borderRadius: "8px", border: "none",
                            backgroundColor: "var(--primary-dark)",
                            fontSize: "14px", fontWeight: "600", color: "white",
                            cursor: isSubmitting ? "not-allowed" : "pointer",
                            opacity: isSubmitting ? 0.7 : 1,
                        }}
                    >
                        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>
        </dialog>
    );
}

CategoryEditModal.propTypes = {
    category: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        icon: PropTypes.string,
        visible: PropTypes.bool.isRequired,
    }).isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};