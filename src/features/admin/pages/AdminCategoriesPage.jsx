// src/features/admin/pages/AdminCategoriesPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { CategoryIcon, IconPicker } from "../components/CategoryIconPicker";
import {
    Search, Trash2, Eye, AlertTriangle, Package,
    Pencil, X, Plus, CheckCircle, XCircle, Clock, Tag, Check,
} from "lucide-react";
import PropTypes from "prop-types";
import { CategoryEditModal } from "../components/CategoryEditModal";
import {
    fetchCategoriesWithProducts, updateAdminCategory,
    deleteAdminCategory, createAdminCategory,
} from "../services/adminCategoriesApi";
import {
    fetchAdminTags, createAdminTag,
    updateAdminTag, deleteAdminTag,
} from "../services/adminTagsApi";

const cardStyle = {
    backgroundColor: "var(--background-white)",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const categorySchema = z.object({
    name: z
        .string()
        .min(1, "El nombre es requerido.")
        .max(100, "El nombre no puede superar 100 caracteres."),
});

// ─── COMPONENTE BASE PARA MODALES (Elimina duplicación y arregla accesibilidad ARIA) ───
function BaseModal({ title, isOpen, isSubmitting, error, onCancel, onSubmit, submitText, submitBg = "var(--primary-dark)", children }) {
    if (!isOpen) return null;

    return (
        <dialog
            open
            aria-modal="true"
            aria-labelledby="base-modal-title"
            onClose={onCancel}
            onKeyDown={(e) => e.key === "Escape" && !isSubmitting && onCancel()}
            style={{
                position: "fixed", inset: 0, zIndex: 50,
                backgroundColor: "rgba(0,0,0,0.45)", display: "flex",
                alignItems: "center", justifyContent: "center", padding: "16px",
                border: "none", width: "100%", height: "100%",
            }}
        >
            {/* Botón nativo invisible que actúa como overlay de fondo para clics */}
            <button
                type="button"
                onClick={isSubmitting ? undefined : onCancel}
                aria-label="Cerrar modal"
                disabled={isSubmitting}
                style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    background: "transparent", border: "none",
                    cursor: isSubmitting ? "not-allowed" : "default"
                }}
            />

            {/* Contenedor del contenido */}
            <div style={{
                position: "relative", backgroundColor: "white", borderRadius: "16px",
                padding: "24px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 id="base-modal-title" style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>{title}</h3>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        style={{ background: "none", border: "none", cursor: isSubmitting ? "not-allowed" : "pointer", color: "#6b7280" }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Alerta de Error */}
                {error && (
                    <div style={{
                        backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
                        borderRadius: "8px", padding: "10px 12px", color: "#be123c", fontSize: "13px", marginBottom: "16px",
                    }}>
                        {error}
                    </div>
                )}

                {/* Cuerpo del Modal */}
                <div style={{ marginBottom: "24px" }}>{children}</div>

                {/* Botones de acción */}
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "white", fontSize: "14px", fontWeight: "500", color: "#374151", cursor: isSubmitting ? "not-allowed" : "pointer" }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        style={{ padding: "8px 20px", borderRadius: "8px", border: "none", backgroundColor: submitBg, fontSize: "14px", fontWeight: "600", color: "white", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}
                    >
                        {submitText}
                    </button>
                </div>
            </div>
        </dialog>
    );
}

BaseModal.propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    error: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    submitText: PropTypes.string.isRequired,
    submitBg: PropTypes.string,
    children: PropTypes.node.isRequired,
};

// ─── MODAL: CREAR CATEGORÍA ───────────────────────────────────────────────────
function CreateModal({ onSave, onCancel }) {
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("Tag");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const trimmedName = name.trim();

    const handleSubmit = async () => {
        const parsed = categorySchema.safeParse({ name: trimmedName });
        if (!parsed.success) {
            const first = parsed.error.issues[0];
            setError(first?.message ?? "Error en el formulario.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        try {
            await onSave(trimmedName, icon);
        } catch (err) {
            setError(err?.response?.data?.message ?? "No se pudo crear la categoría.");
            setIsSubmitting(false);
        }
    };

    return (
        <BaseModal
            title="Nueva Categoría"
            isOpen={true}
            isSubmitting={isSubmitting}
            error={error}
            onCancel={onCancel}
            onSubmit={handleSubmit}
            submitText={isSubmitting ? "Creando..." : "Crear Categoría"}
        >
            {/* Preview */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "10px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "var(--background-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CategoryIcon name={icon} size={22} />
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#111827" }}>{trimmedName || "Nombre de la categoría"}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>Vista previa</p>
                </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
                <label htmlFor="create-category-name" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Nombre <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                    id="create-category-name"
                    value={name}
                    onChange={e => { setName(e.target.value); if (error) setError(""); }}
                    disabled={isSubmitting}
                    maxLength={100}
                    placeholder="Ej: Electrónica"
                    autoFocus
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>Se creará como visible y activa por defecto.</p>
            </div>

            <div>
                <IconPicker value={icon} onChange={setIcon} disabled={isSubmitting} />
            </div>
        </BaseModal>
    );
}

CreateModal.propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

// ─── MODAL: CONFIRMAR BORRADO ─────────────────────────────────────────────────
function DeleteModal({ category, isDeleting, onConfirm, onCancel, deleteError }) {
    return (
        <BaseModal
            title="¿Eliminar categoría?"
            isOpen={Boolean(category)}
            isSubmitting={isDeleting}
            error={deleteError}
            onCancel={onCancel}
            onSubmit={onConfirm}
            submitText={isDeleting ? "Eliminando..." : "Eliminar"}
            submitBg="#dc2626"
        >
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#fff1f2", border: "1px solid #fecdd3", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <AlertTriangle size={24} color="#dc2626" />
            </div>
            <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 6px 0" }}>
                Estás por eliminar <strong>&quot;{category?.name}&quot;</strong>.
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Los productos asociados serán reasignados a la categoría por defecto. Esta acción no se puede deshacer.
            </p>
        </BaseModal>
    );
}

DeleteModal.propTypes = {
    category: PropTypes.shape({ id: PropTypes.number.isRequired, name: PropTypes.string.isRequired }),
    isDeleting: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    deleteError: PropTypes.string,
};

// ─── MODAL: APROBAR SOLICITUD ─────────────────────────────────────────────────
function ApproveModal({ request, isSubmitting, onConfirm, onCancel, actionError }) {
    return (
        <BaseModal
            title="¿Aprobar categoría?"
            isOpen={Boolean(request)}
            isSubmitting={isSubmitting}
            error={actionError}
            onCancel={onCancel}
            onSubmit={onConfirm}
            submitText={isSubmitting ? "Aprobando..." : "Aprobar"}
            submitBg="#15803d"
        >
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <CheckCircle size={24} color="#15803d" />
            </div>
            <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 6px 0" }}>
                Estás por aprobar <strong>&quot;{request?.name}&quot;</strong>.
            </p>
            <p style={{ fontSize: "13px", color: "#15803d", margin: 0, backgroundColor: "#f0fdf4", padding: "10px 12px", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                La categoría quedará visible y disponible para todos los comercios.
            </p>
        </BaseModal>
    );
}

ApproveModal.propTypes = {
    request: PropTypes.shape({ name: PropTypes.string.isRequired }),
    isSubmitting: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    actionError: PropTypes.string,
};

// ─── MODAL: RECHAZAR SOLICITUD ────────────────────────────────────────────────
function RejectModal({ request, isSubmitting, onConfirm, onCancel, actionError }) {
    return (
        <BaseModal
            title="¿Rechazar solicitud?"
            isOpen={Boolean(request)}
            isSubmitting={isSubmitting}
            error={actionError}
            onCancel={onCancel}
            onSubmit={onConfirm}
            submitText={isSubmitting ? "Rechazando..." : "Rechazar"}
            submitBg="#dc2626"
        >
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#fee2e2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <XCircle size={24} color="#dc2626" />
            </div>
            <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 6px 0" }}>
                Estás por rechazar <strong>&quot;{request?.name}&quot;</strong>.
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Los productos asociados a esta solicitud serán reasignados a la categoría por defecto. Esta acción no se puede deshacer.
            </p>
        </BaseModal>
    );
}

RejectModal.propTypes = {
    request: PropTypes.shape({ name: PropTypes.string.isRequired }),
    isSubmitting: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    actionError: PropTypes.string,
};

// ─── FILA DE CATEGORÍA ────────────────────────────────────────────────────────
function CategoryRow({ cat, onEdit, onDelete }) {
    const navigate = useNavigate();
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 8px", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "var(--background-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CategoryIcon name={cat.icon} size={18} />
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
                <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>{cat.name}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Package size={11} /> {cat.productCount} producto{cat.productCount === 1 ? "" : "s"}
                </p>
            </div>
            <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500", backgroundColor: cat.visible ? "#dcfce7" : "#f1f5f9", color: cat.visible ? "#15803d" : "#475569", minWidth: "70px", textAlign: "center" }}>
                {cat.visible ? "Visible" : "Oculta"}
            </span>
            <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500", backgroundColor: cat.status ? "#dbeafe" : "#fef3c7", color: cat.status ? "#1d4ed8" : "#92400e", minWidth: "70px", textAlign: "center" }}>
                {cat.status ? "Activa" : "Inactiva"}
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
                <button type="button" onClick={() => navigate(`/admin/categorias/${cat.id}`)} title="Ver detalle" style={{ background: "none", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "#2563eb", display: "flex", alignItems: "center" }}><Eye size={15} /></button>
                <button type="button" onClick={() => onEdit(cat)} title="Editar categoría" style={{ background: "none", border: "1px solid #d1fae5", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "#15803d", display: "flex", alignItems: "center" }}><Pencil size={15} /></button>
                <button type="button" onClick={() => onDelete(cat)} title="Eliminar categoría" style={{ background: "none", border: "1px solid #fecdd3", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center" }}><Trash2 size={15} /></button>
            </div>
        </div>
    );
}

CategoryRow.propTypes = {
    cat: PropTypes.shape({ id: PropTypes.number.isRequired, name: PropTypes.string.isRequired, icon: PropTypes.string, visible: PropTypes.bool.isRequired, status: PropTypes.bool.isRequired, productCount: PropTypes.number.isRequired }).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

// ─── FILA DE SOLICITUD PENDIENTE ──────────────────────────────────────────────
function RequestRow({ request, onApprove, onReject }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 8px", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Clock size={18} color="#92400e" /></div>
            <div style={{ flex: 1, minWidth: "150px" }}>
                <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>{request.name}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>Solicitada el {new Date(request.createdAt).toLocaleDateString("es-PY")}</p>
            </div>
            <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500", backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>Pendiente</span>
            <div style={{ display: "flex", gap: "6px" }}>
                <button type="button" onClick={() => onApprove(request)} title="Aprobar solicitud" style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", borderRadius: "6px", border: "1px solid #bbf7d0", backgroundColor: "white", color: "#15803d", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}><CheckCircle size={13} /> Aprobar</button>
                <button type="button" onClick={() => onReject(request)} title="Rechazar solicitud" style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", borderRadius: "6px", border: "1px solid #fecaca", backgroundColor: "white", color: "#dc2626", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}><XCircle size={13} /> Rechazar</button>
            </div>
        </div>
    );
}

RequestRow.propTypes = {
    request: PropTypes.shape({ id: PropTypes.number.isRequired, name: PropTypes.string.isRequired, createdAt: PropTypes.string.isRequired }).isRequired,
    onApprove: PropTypes.func.isRequired,
    onReject: PropTypes.func.isRequired,
};

// ─── FILA DE ETIQUETA (con edición inline) ────────────────────────────────────
function TagRow({ tag, onSaveEdit, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(tag.name);
    const [isSaving, setIsSaving] = useState(false);
    const [editError, setEditError] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) inputRef.current.focus();
    }, [isEditing]);

    const handleStartEdit = () => {
        setEditName(tag.name);
        setEditError("");
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        if (isSaving) return;
        setIsEditing(false);
        setEditError("");
    };

    const handleSave = async () => {
        const trimmed = editName.trim();
        if (!trimmed) { setEditError("El nombre no puede estar vacío."); return; }
        if (trimmed.length > 20) { setEditError("Máximo 20 caracteres."); return; }
        if (trimmed === tag.name) { setIsEditing(false); return; }

        setIsSaving(true);
        setEditError("");
        try {
            await onSaveEdit(tag.id, trimmed);
            setIsEditing(false);
        } catch (err) {
            setEditError(err?.response?.data?.message ?? "No se pudo guardar.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") handleCancelEdit();
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 8px", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "var(--background-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Tag size={18} color="#6b7280" />
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
                {isEditing ? (
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <input
                                ref={inputRef}
                                value={editName}
                                onChange={e => { setEditName(e.target.value); if (editError) setEditError(""); }}
                                onKeyDown={handleKeyDown}
                                disabled={isSaving}
                                maxLength={20}
                                style={{ flex: 1, padding: "6px 10px", border: editError ? "1px solid #fecdd3" : "1px solid #e5e7eb", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                            />
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                title="Guardar"
                                style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 12px", borderRadius: "6px", border: "1px solid #bbf7d0", backgroundColor: "#15803d", color: "white", fontSize: "12px", fontWeight: "600", cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.7 : 1 }}
                            >
                                <Check size={13} /> {isSaving ? "Guardando..." : "Guardar"}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                title="Cancelar"
                                style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "5px 8px", cursor: isSaving ? "not-allowed" : "pointer", color: "#6b7280", display: "flex", alignItems: "center" }}
                            >
                                <X size={15} />
                            </button>
                        </div>
                        {editError && <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#dc2626" }}>{editError}</p>}
                    </div>
                ) : (
                    <div>
                        <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>{tag.name}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Package size={11} /> {tag.productCount} producto{tag.productCount === 1 ? "" : "s"}
                        </p>
                    </div>
                )}
            </div>
            {!isEditing && (
                <div style={{ display: "flex", gap: "6px" }}>
                    <button type="button" onClick={handleStartEdit} title="Editar etiqueta" style={{ background: "none", border: "1px solid #d1fae5", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "#15803d", display: "flex", alignItems: "center" }}><Pencil size={15} /></button>
                    <button type="button" onClick={() => onDelete(tag)} title="Eliminar etiqueta" style={{ background: "none", border: "1px solid #fecdd3", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center" }}><Trash2 size={15} /></button>
                </div>
            )}
        </div>
    );
}

TagRow.propTypes = {
    tag: PropTypes.shape({ id: PropTypes.number.isRequired, name: PropTypes.string.isRequired, productCount: PropTypes.number.isRequired }).isRequired,
    onSaveEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

// ─── MODAL: CREAR ETIQUETA ────────────────────────────────────────────────────
function CreateTagModal({ onSave, onCancel }) {
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const trimmedName = name.trim();

    const handleSubmit = async () => {
        if (!trimmedName) { setError("El nombre es requerido."); return; }
        if (trimmedName.length > 20) { setError("El nombre no puede superar 20 caracteres."); return; }

        setIsSubmitting(true);
        setError("");
        try {
            await onSave(trimmedName);
        } catch (err) {
            setError(err?.response?.data?.message ?? "No se pudo crear la etiqueta.");
            setIsSubmitting(false);
        }
    };

    return (
        <BaseModal
            title="Nueva Etiqueta"
            isOpen={true}
            isSubmitting={isSubmitting}
            error={error}
            onCancel={onCancel}
            onSubmit={handleSubmit}
            submitText={isSubmitting ? "Guardando..." : "Guardar"}
        >
            {/* Preview */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "10px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "var(--background-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Tag size={22} color="#6b7280" />
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#111827" }}>{trimmedName || "Nombre de la etiqueta"}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>Vista previa</p>
                </div>
            </div>

            <div>
                <label htmlFor="create-tag-name" style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Nombre <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                    id="create-tag-name"
                    value={name}
                    onChange={e => { setName(e.target.value); if (error) setError(""); }}
                    disabled={isSubmitting}
                    maxLength={20}
                    placeholder="Ej: Orgánico"
                    autoFocus
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>Se creará como activa por defecto. Máximo 20 caracteres.</p>
            </div>
        </BaseModal>
    );
}

CreateTagModal.propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

// ─── MODAL: CONFIRMAR BORRADO DE ETIQUETA ─────────────────────────────────────
function DeleteTagModal({ tag, isDeleting, onConfirm, onCancel, deleteError }) {
    return (
        <BaseModal
            title="¿Eliminar etiqueta?"
            isOpen={Boolean(tag)}
            isSubmitting={isDeleting}
            error={deleteError}
            onCancel={onCancel}
            onSubmit={onConfirm}
            submitText={isDeleting ? "Eliminando..." : "Eliminar"}
            submitBg="#dc2626"
        >
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#fff1f2", border: "1px solid #fecdd3", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <AlertTriangle size={24} color="#dc2626" />
            </div>
            <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 6px 0" }}>
                Estás por eliminar <strong>&quot;{tag?.name}&quot;</strong>.
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Los productos asociados a esta etiqueta perderán la asociación. Esta acción no se puede deshacer.
            </p>
        </BaseModal>
    );
}

DeleteTagModal.propTypes = {
    tag: PropTypes.shape({ id: PropTypes.number.isRequired, name: PropTypes.string.isRequired }),
    isDeleting: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    deleteError: PropTypes.string,
};

// ─── PESTAÑA DE ETIQUETAS ─────────────────────────────────────────────────────
function TagsTab() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [tagToDelete, setTagToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const loadTags = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchAdminTags();
            setTags(result);
        } catch (err) {
            setError(err?.response?.data?.message ?? "Error al cargar las etiquetas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadTags(); }, [loadTags]);

    const handleCreate = async (name) => {
        const created = await createAdminTag(name);
        setShowCreateModal(false);
        setTags(prev => [...prev, { ...created, productCount: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const handleSaveEdit = async (id, name) => {
        const updated = await updateAdminTag(id, name);
        setTags(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t).sort((a, b) => a.name.localeCompare(b.name)));
    };

    const handleDeleteConfirm = async () => {
        if (!tagToDelete) return;
        setIsDeleting(true);
        setDeleteError("");
        try {
            await deleteAdminTag(tagToDelete.id);
            setTags(prev => prev.filter(t => t.id !== tagToDelete.id));
            setTagToDelete(null);
        } catch (err) {
            setDeleteError(err?.response?.data?.message ?? "No se pudo eliminar la etiqueta.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => { if (!isDeleting) { setTagToDelete(null); setDeleteError(""); } };

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Etiquetas</h2>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#6b7280" }}>Gestiona las etiquetas de productos</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", backgroundColor: "var(--primary-dark)", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}
                >
                    <Plus size={14} /> Nueva Etiqueta
                </button>
            </div>

            <div style={cardStyle}>
                <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "15px" }}>Etiquetas ({tags.length})</p>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6b7280" }}>Lista de todas las etiquetas disponibles en la plataforma</p>

                {error && <div style={{ padding: "12px", backgroundColor: "#fee2e2", borderRadius: "8px", color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{error}</div>}

                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>Cargando etiquetas...</div>
                ) : tags.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>
                        <Tag size={32} style={{ marginBottom: "8px", opacity: 0.4 }} />
                        <p style={{ margin: 0 }}>No hay etiquetas creadas todavía.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {tags.map(tag => (
                            <TagRow key={tag.id} tag={tag} onSaveEdit={handleSaveEdit} onDelete={t => { setDeleteError(""); setTagToDelete(t); }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Modales */}
            {showCreateModal && <CreateTagModal onSave={handleCreate} onCancel={() => setShowCreateModal(false)} />}
            {tagToDelete && <DeleteTagModal tag={tagToDelete} isDeleting={isDeleting} onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} deleteError={deleteError} />}
        </>
    );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export const AdminCategoriesPage = () => {
    const [activeTab, setActiveTab] = useState("categories");

    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({ categoryTotal: 0, categoryPage: 1, categoryLimit: 20, categoryTotalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filterVisible, setFilterVisible] = useState("all");
    const [page, setPage] = useState(1);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [requestsError, setRequestsError] = useState(null);
    const [requestPage, setRequestPage] = useState(1);
    const [requestPagination, setRequestPagination] = useState({ categoryTotal: 0, categoryTotalPages: 1 });
    const [requestToApprove, setRequestToApprove] = useState(null);
    const [requestToReject, setRequestToReject] = useState(null);
    const [isActioning, setIsActioning] = useState(false);
    const [actionError, setActionError] = useState("");

    const load = useCallback(async (currentPage) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchCategoriesWithProducts({
                visible: filterVisible,
                searchCategory: search,
                categoryPage: currentPage,
                categoryLimit: 20,
                productLimit: 5,
            });
            setCategories(result.data);
            setPagination({
                categoryTotal: result.categoryTotal,
                categoryPage: result.categoryPage,
                categoryLimit: result.categoryLimit,
                categoryTotalPages: result.categoryTotalPages,
            });
        } catch (err) {
            setError(err?.response?.data?.message ?? "Error al cargar las categorías.");
        } finally {
            setLoading(false);
        }
    }, [search, filterVisible]);

    const loadRequests = useCallback(async (currentPage) => {
        setRequestsLoading(true);
        setRequestsError(null);
        try {
            const result = await fetchCategoriesWithProducts({ status: false, categoryPage: currentPage, categoryLimit: 20, productLimit: 0 });
            setRequests(result.data);
            setRequestPagination({ categoryTotal: result.categoryTotal, categoryTotalPages: result.categoryTotalPages });
        } catch (err) {
            setRequestsError(err?.response?.data?.message ?? "Error al cargar las solicitudes.");
        } finally {
            setRequestsLoading(false);
        }
    }, []);

    useEffect(() => { setPage(1); }, [search, filterVisible]);
    useEffect(() => { load(page); }, [load, page]);
    useEffect(() => { if (activeTab === "requests") loadRequests(requestPage); }, [activeTab, requestPage, loadRequests]);
    useEffect(() => {
        if (activeTab === "requests") setActionError("");
        if (activeTab === "categories") setDeleteError("");
    }, [activeTab]);

    const handleCreate = async (name, icon) => {
        await createAdminCategory(name, icon);
        setShowCreateModal(false);
        setPage(1);
        load(1);
    };

    const handleSaveEdit = async (id, payload) => {
        const updated = await updateAdminCategory(id, payload);
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
        setCategoryToEdit(null);
    };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);
        setDeleteError("");
        try {
            await deleteAdminCategory(categoryToDelete.id);
            const nextPage = categories.length === 1 && page > 1 ? page - 1 : page;
            setCategoryToDelete(null);
            if (nextPage !== page) setPage(nextPage);
            else load(page);
        } catch (err) {
            setDeleteError(err?.response?.data?.message ?? "No se pudo eliminar la categoría.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleApproveConfirm = async () => {
        if (!requestToApprove) return;
        setIsActioning(true);
        setActionError("");
        try {
            await updateAdminCategory(requestToApprove.id, { status: true, visible: true });
            setRequests(prev => prev.filter(r => r.id !== requestToApprove.id));
            setRequestPagination(prev => ({ ...prev, categoryTotal: Math.max(0, prev.categoryTotal - 1) }));
            setRequestToApprove(null);
            await load(page);
            if (requestPage > 1 && requests.length === 1) setRequestPage(prev => prev - 1);
        } catch (err) {
            setActionError(err?.response?.data?.message ?? "No se pudo aprobar la solicitud.");
        } finally {
            setIsActioning(false);
        }
    };

    const handleRejectConfirm = async () => {
        if (!requestToReject) return;
        setIsActioning(true);
        setActionError("");
        try {
            await deleteAdminCategory(requestToReject.id);
            setRequests(prev => prev.filter(r => r.id !== requestToReject.id));
            setRequestPagination(prev => ({ ...prev, categoryTotal: Math.max(0, prev.categoryTotal - 1) }));
            setRequestToReject(null);
            if (requestPage > 1 && requests.length === 1) setRequestPage(prev => prev - 1);
        } catch (err) {
            setActionError(err?.response?.data?.message ?? "No se pudo rechazar la solicitud.");
        } finally {
            setIsActioning(false);
        }
    };

    const hiddenCount = categories.reduce(
        (acc, category) => category.visible === false ? acc + 1 : acc,
        0
    );

    const selectStyle = {
        padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "8px",
        fontSize: "13px", color: "#374151", background: "white", cursor: "pointer",
    };

    const handleDeleteCancel = () => { if (!isDeleting) { setCategoryToDelete(null); setDeleteError(""); } };
    const handleApproveCancel = () => { if (!isActioning) { setRequestToApprove(null); setActionError(""); } };
    const handleRejectCancel = () => { if (!isActioning) { setRequestToReject(null); setActionError(""); } };

    // SOLUCIÓN LÍNEA 1062: Extraer el operador ternario anidado en un bloque condicional simple e independiente
    let hiddenCountMessage = null;
    if (hiddenCount === 1) {
        hiddenCountMessage = (
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "16px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
                👁 Tenés {hiddenCount} categoría oculta que no es visible para los usuarios.
            </p>
        );
    } else if (hiddenCount > 1) {
        hiddenCountMessage = (
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "16px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
                👁 Tenés {hiddenCount} categorías ocultas que no son visibles para los usuarios.
            </p>
        );
    }

    return (
        <div style={{ maxWidth: "1100px" }}>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ margin: 0 }}>Gestión de Categorías y Etiquetas</h1>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>Administra las categorías y etiquetas de productos de la plataforma</p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                {[
                    { key: "categories", label: "Categorías" },
                    { key: "tags", label: "Etiquetas" },
                    { key: "requests", label: "Solicitudes pendientes", badge: requestPagination.categoryTotal || null },
                ].map(tab => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                display: "flex", alignItems: "center", gap: "7px", padding: "8px 18px",
                                border: isActive ? "1px solid var(--primary-dark)" : "1px solid #e5e7eb",
                                borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                                backgroundColor: isActive ? "var(--primary-dark)" : "var(--background-white)",
                                color: isActive ? "white" : "#6b7280", transition: "all 0.15s",
                            }}
                        >
                            {tab.label}
                            {tab.badge > 0 && (
                                <span style={{ backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#fef3c7", color: isActive ? "white" : "#92400e", border: isActive ? "1px solid rgba(255,255,255,0.35)" : "1px solid #fde68a", borderRadius: "999px", fontSize: "11px", fontWeight: "700", padding: "1px 7px" }}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ══ TAB: CATEGORÍAS ══ */}
            {activeTab === "categories" && (
                <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Categorías</h2>
                            <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#6b7280" }}>Gestiona las categorías de productos</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", backgroundColor: "var(--primary-dark)", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}
                        >
                            <Plus size={14} /> Nueva Categoría
                        </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
                        {[
                            { label: "Total de Categorías", value: pagination.categoryTotal },
                            { label: "Categorías Visibles", value: categories.filter(c => c.visible).length },
                            { label: "Categorías Ocultas", value: hiddenCount },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ ...cardStyle, textAlign: "center" }}>
                                <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#6b7280" }}>{label}</p>
                                <p style={{ margin: 0, fontSize: "28px", fontWeight: "700" }}>{value}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ ...cardStyle, marginBottom: "16px" }}>
                        <p style={{ margin: "0 0 12px", fontWeight: "600", fontSize: "14px" }}>Buscar Categorías</p>
                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                                <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                                <input
                                    id="search-categories"
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ width: "100%", paddingLeft: "32px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                                Aminities
                                />
                            </div>
                            <label htmlFor="filter-visible" style={{ display: "none" }}>Filtrar por visibilidad</label>
                            <select id="filter-visible" value={filterVisible} onChange={e => setFilterVisible(e.target.value)} style={selectStyle}>
                                <option value="all">Todos los estados</option>
                                <option value="true">Visible</option>
                                <option value="false">Oculta</option>
                            </select>
                        </div>
                    </div>

                    <div style={cardStyle}>
                        <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "15px" }}>Categorías ({pagination.categoryTotal})</p>
                        <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6b7280" }}>Lista de todas las categorías disponibles en la plataforma</p>

                        {error && <div style={{ padding: "12px", backgroundColor: "#fee2e2", borderRadius: "8px", color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{error}</div>}

                        {loading ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>Cargando categorías...</div>
                        ) : categories.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>No se encontraron categorías con los filtros seleccionados.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                {categories.map(cat => (
                                    <CategoryRow key={cat.id} cat={cat} onEdit={c => { setDeleteError(""); setCategoryToEdit(c); }} onDelete={c => { setDeleteError(""); setCategoryToDelete(c); }} />
                                ))}
                            </div>
                        )}

                        {pagination.categoryTotalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" }}>
                                <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1, fontSize: "13px" }}>Anterior</button>
                                <span style={{ fontSize: "13px" }}>{page} / {pagination.categoryTotalPages}</span>
                                <button type="button" onClick={() => setPage(p => Math.min(pagination.categoryTotalPages, p + 1))} disabled={page === pagination.categoryTotalPages} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", cursor: page === pagination.categoryTotalPages ? "not-allowed" : "pointer", opacity: page === pagination.categoryTotalPages ? 0.5 : 1, fontSize: "13px" }}>Siguiente</button>
                            </div>
                        )}

                        {/* Renderizado limpio del mensaje sin ternarios anidados */}
                        {hiddenCountMessage}
                    </div>
                </>
            )}

            {/* ══ TAB: ETIQUETAS ══ */}
            {activeTab === "tags" && (
                <TagsTab />
            )}

            {/* ══ TAB: SOLICITUDES PENDIENTES ══ */}
            {activeTab === "requests" && (
                <div style={cardStyle}>
                    <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "15px" }}>Solicitudes pendientes ({requestPagination.categoryTotal})</p>
                    <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6b7280" }}>Categorías solicitadas por comercios que esperan tu aprobación</p>

                    {requestsError && <div style={{ padding: "12px", backgroundColor: "#fee2e2", borderRadius: "8px", color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{requestsError}</div>}

                    {requestsLoading ? (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>Cargando solicitudes...</div>
                    ) : requests.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>
                            <CheckCircle size={32} style={{ marginBottom: "8px", opacity: 0.4 }} />
                            <p style={{ margin: 0 }}>No hay solicitudes pendientes. ¡Todo al día!</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {requests.map(req => (
                                <RequestRow key={req.id} request={req} onApprove={r => { setActionError(""); setRequestToApprove(r); }} onReject={r => { setActionError(""); setRequestToReject(r); }} />
                            ))}
                        </div>
                    )}

                    {requestPagination.categoryTotalPages > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" }}>
                            <button type="button" onClick={() => setRequestPage(p => Math.max(1, p - 1))} disabled={requestPage === 1} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", cursor: requestPage === 1 ? "not-allowed" : "pointer", opacity: requestPage === 1 ? 0.5 : 1, fontSize: "13px" }}>Anterior</button>
                            <span style={{ fontSize: "13px" }}>{requestPage} / {requestPagination.categoryTotalPages}</span>
                            <button type="button" onClick={() => setRequestPage(p => Math.min(requestPagination.categoryTotalPages, p + 1))} disabled={requestPage === requestPagination.categoryTotalPages} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", cursor: requestPage === requestPagination.categoryTotalPages ? "not-allowed" : "pointer", opacity: requestPage === requestPagination.categoryTotalPages ? 0.5 : 1, fontSize: "13px" }}>Siguiente</button>
                        </div>
                    )}
                </div>
            )}

            {/* Modales: Categorías */}
            {showCreateModal && <CreateModal onSave={handleCreate} onCancel={() => setShowCreateModal(false)} />}
            {categoryToEdit && <CategoryEditModal category={categoryToEdit} onSave={handleSaveEdit} onCancel={() => setCategoryToEdit(null)} />}
            {categoryToDelete && <DeleteModal category={categoryToDelete} isDeleting={isDeleting} onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} deleteError={deleteError} />}

            {/* Modales: Solicitudes */}
            <ApproveModal request={requestToApprove} isSubmitting={isActioning} onConfirm={handleApproveConfirm} onCancel={handleApproveCancel} actionError={actionError} />
            <RejectModal request={requestToReject} isSubmitting={isActioning} onConfirm={handleRejectConfirm} onCancel={handleRejectCancel} actionError={actionError} />
        </div>
    );
};