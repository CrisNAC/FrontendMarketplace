import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2, Eye, AlertTriangle, Tag, Package, Pencil, X } from "lucide-react";
import { fetchCategoriesWithProducts, updateAdminCategory, deleteAdminCategory } from "../services/adminCategoriesApi";

const cardStyle = {
    backgroundColor: "var(--background-white)",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

// ─── Modal: Editar categoría ──────────────────────────────────────────────────
function EditModal({ category, onSave, onCancel }) {
    const [name, setName]       = useState(category.name);
    const [visible, setVisible] = useState(category.visible);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError]     = useState("");

    const handleSubmit = async () => {
        const trimmed = name.trim();
        if (!trimmed) { setError("El nombre es requerido."); return; }
        if (trimmed.length > 100) { setError("El nombre no puede superar 100 caracteres."); return; }

        const payload = {};
        if (trimmed !== category.name) payload.name = trimmed;
        if (visible !== category.visible) payload.visible = visible;
        if (Object.keys(payload).length === 0) { onCancel(); return; }

        setIsSubmitting(true);
        setError("");
        try {
            await onSave(category.id, payload);
        } catch (err) {
            setError(err?.response?.data?.message || "No se pudo guardar la categoría.");
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
            onClick={onCancel}>
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", maxWidth: "460px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Editar Categoría</h3>
                    <button type="button" onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", padding: "10px 12px", color: "#be123c", fontSize: "13px", marginBottom: "16px" }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Nombre *</label>
                    <input value={name} onChange={e => setName(e.target.value)} disabled={isSubmitting} maxLength={100}
                        style={{ width: "100%", padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "10px" }}>Visibilidad</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                        {[
                            { value: true,  label: "Visible", color: "#15803d", bg: "#dcfce7", border: "#bbf7d0" },
                            { value: false, label: "Oculta",  color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
                        ].map(opt => (
                            <button key={String(opt.value)} type="button" onClick={() => setVisible(opt.value)} disabled={isSubmitting}
                                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                                    backgroundColor: visible === opt.value ? opt.bg : "white",
                                    border: `1px solid ${visible === opt.value ? opt.border : "#e5e7eb"}`,
                                    color: visible === opt.value ? opt.color : "#6b7280" }}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button type="button" onClick={onCancel} disabled={isSubmitting}
                        style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "white", fontSize: "14px", fontWeight: "500", color: "#374151", cursor: isSubmitting ? "not-allowed" : "pointer" }}>
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                        style={{ padding: "8px 20px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary-dark)", fontSize: "14px", fontWeight: "600", color: "white", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
                        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Modal: Confirmar borrado ─────────────────────────────────────────────────
function DeleteModal({ category, isDeleting, onConfirm, onCancel }) {
    if (!category) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
            onClick={onCancel}>
            <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", maxWidth: "420px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                onClick={e => e.stopPropagation()}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "#fff1f2", border: "1px solid #fecdd3", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                    <AlertTriangle size={24} color="#dc2626" />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 8px 0" }}>¿Eliminar categoría?</h3>
                <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 6px 0" }}>
                    Estás por eliminar <strong>"{category.name}"</strong>.
                </p>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 24px 0" }}>
                    Los productos asociados serán reasignados a la categoría por defecto. Esta acción no se puede deshacer.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button type="button" onClick={onCancel} disabled={isDeleting}
                        style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "white", fontSize: "14px", fontWeight: "500", color: "#374151", cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.6 : 1 }}>
                        Cancelar
                    </button>
                    <button type="button" onClick={onConfirm} disabled={isDeleting}
                        style={{ padding: "8px 20px", borderRadius: "8px", border: "none", backgroundColor: "#dc2626", fontSize: "14px", fontWeight: "600", color: "white", cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.7 : 1 }}>
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Fila expandible ──────────────────────────────────────────────────────────
function CategoryRow({ cat, onEdit, onDelete }) {
    const navigate = useNavigate();

    return (
            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 8px", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "var(--background-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Tag size={18} color="var(--primary-dark)" />
                </div>

                <div style={{ flex: 1, minWidth: "150px" }}>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>{cat.name}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Package size={11} /> {cat.productCount} producto{cat.productCount !== 1 ? "s" : ""}
                    </p>
                </div>

                <span style={{
                    padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500",
                    backgroundColor: cat.visible ? "#dcfce7" : "#f1f5f9",
                    color: cat.visible ? "#15803d" : "#475569",
                    minWidth: "70px", textAlign: "center",
                }}>
                    {cat.visible ? "Visible" : "Oculta"}
                </span>

                <span style={{
                    padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500",
                    backgroundColor: cat.status ? "#dbeafe" : "#fef3c7",
                    color: cat.status ? "#1d4ed8" : "#92400e",
                    minWidth: "70px", textAlign: "center",
                }}>
                    {cat.status ? "Activa" : "Inactiva"}
                </span>

                <div style={{ display: "flex", gap: "6px" }}>
                    {/* Ver detalle completo */}
                    <button type="button" onClick={() => navigate(`/admin/categorias/${cat.id}`)} title="Ver detalle"
                        style={{ background: "none", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "#2563eb", display: "flex", alignItems: "center" }}>
                        <Eye size={15} />
                    </button>
                    {/* Editar */}
                    <button type="button" onClick={() => onEdit(cat)} title="Editar categoría"
                        style={{ background: "none", border: "1px solid #d1fae5", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "#15803d", display: "flex", alignItems: "center" }}>
                        <Pencil size={15} />
                    </button>
                    {/* Eliminar */}
                    <button type="button" onClick={() => onDelete(cat)} title="Eliminar categoría"
                        style={{ background: "none", border: "1px solid #fecdd3", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center" }}>
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export const AdminCategoriesPage = () => {
    const [categories, setCategories]       = useState([]);
    const [pagination, setPagination]       = useState({ categoryTotal: 0, categoryPage: 1, categoryLimit: 20, categoryTotalPages: 1 });
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);
    const [search, setSearch]               = useState("");
    const [filterVisible, setFilterVisible] = useState("all");
    const [page, setPage]                   = useState(1);

    const [categoryToEdit, setCategoryToEdit]     = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isDeleting, setIsDeleting]             = useState(false);
    const [actionError, setActionError]           = useState("");

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
                categoryTotal:      result.categoryTotal,
                categoryPage:       result.categoryPage,
                categoryLimit:      result.categoryLimit,
                categoryTotalPages: result.categoryTotalPages,
            });
        } catch (err) {
            setError(err?.response?.data?.message || "Error al cargar las categorías.");
        } finally {
            setLoading(false);
        }
    }, [search, filterVisible]);

    useEffect(() => { setPage(1); }, [search, filterVisible]);
    useEffect(() => { load(page); }, [load, page]);

    const handleSaveEdit = async (id, payload) => {
        const updated = await updateAdminCategory(id, payload);
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
        setCategoryToEdit(null);
    };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);
        setActionError("");
        try {
            await deleteAdminCategory(categoryToDelete.id);
            setCategoryToDelete(null);
            load(page);
        } catch (err) {
            setActionError(err?.response?.data?.message || "No se pudo eliminar la categoría.");
        } finally {
            setIsDeleting(false);
        }
    };

    const selectStyle = {
        padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "8px",
        fontSize: "13px", color: "#374151", background: "white", cursor: "pointer",
    };

    return (
        <div style={{ maxWidth: "1100px" }}>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ margin: 0 }}>Gestión de Categorías</h1>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>
                    Administra las categorías de productos de la plataforma
                </p>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "20px" }}>
                {[
                    { label: "Total de Categorías", value: pagination.categoryTotal },
                    { label: "Categorías Visibles", value: categories.filter(c => c.visible).length },
                    { label: "Categorías Ocultas",  value: categories.filter(c => !c.visible).length },
                ].map(({ label, value }) => (
                    <div key={label} style={{ ...cardStyle, textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#6b7280" }}>{label}</p>
                        <p style={{ margin: 0, fontSize: "28px", fontWeight: "700" }}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div style={{ ...cardStyle, marginBottom: "16px" }}>
                <p style={{ margin: "0 0 12px", fontWeight: "600", fontSize: "14px" }}>Buscar Categorías</p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                        <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                        <input type="text" placeholder="Buscar por nombre..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: "100%", paddingLeft: "32px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <select value={filterVisible} onChange={e => setFilterVisible(e.target.value)} style={selectStyle}>
                        <option value="all">Todos los estados</option>
                        <option value="true">Visible</option>
                        <option value="false">Oculta</option>
                    </select>
                </div>
            </div>

            {actionError && (
                <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px", marginBottom: "16px" }}>
                    {actionError}
                </div>
            )}

            {/* Tabla */}
            <div style={cardStyle}>
                <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "15px" }}>
                    Categorías ({pagination.categoryTotal})
                </p>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6b7280" }}>
                    Lista de todas las categorías disponibles en la plataforma
                </p>

                {error && (
                    <div style={{ padding: "12px", backgroundColor: "#fee2e2", borderRadius: "8px", color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>Cargando categorías...</div>
                ) : categories.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>No se encontraron categorías con los filtros seleccionados.</div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {categories.map(cat => (
                            <CategoryRow
                                key={cat.id}
                                cat={cat}
                                onEdit={cat => { setActionError(""); setCategoryToEdit(cat); }}
                                onDelete={cat => { setActionError(""); setCategoryToDelete(cat); }}
                            />
                        ))}
                    </div>
                )}

                {pagination.categoryTotalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1, fontSize: "13px" }}>
                            Anterior
                        </button>
                        <span style={{ fontSize: "13px" }}>{page} / {pagination.categoryTotalPages}</span>
                        <button onClick={() => setPage(p => Math.min(pagination.categoryTotalPages, p + 1))} disabled={page === pagination.categoryTotalPages}
                            style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", cursor: page === pagination.categoryTotalPages ? "not-allowed" : "pointer", opacity: page === pagination.categoryTotalPages ? 0.5 : 1, fontSize: "13px" }}>
                            Siguiente
                        </button>
                    </div>
                )}

                {categories.filter(c => !c.visible).length > 0 && (
                    <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "16px", borderTop: "1px solid #f3f4f6", paddingTop: "12px" }}>
                        👁 Tenés {categories.filter(c => !c.visible).length} categoría{categories.filter(c => !c.visible).length !== 1 ? "s" : ""} oculta{categories.filter(c => !c.visible).length !== 1 ? "s" : ""} que no son visibles para los usuarios. Los productos en estas categorías siguen estando disponibles pero no aparecen en la navegación principal.
                    </p>
                )}
            </div>

            {categoryToEdit && (
                <EditModal
                    category={categoryToEdit}
                    onSave={handleSaveEdit}
                    onCancel={() => setCategoryToEdit(null)}
                />
            )}
            {categoryToDelete && (
                <DeleteModal
                    category={categoryToDelete}
                    isDeleting={isDeleting}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => { if (!isDeleting) setCategoryToDelete(null); }}
                />
            )}
        </div>
    );
};