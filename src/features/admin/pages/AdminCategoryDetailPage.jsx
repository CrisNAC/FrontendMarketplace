import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Tag, Package, Eye, EyeOff, Pencil, X } from "lucide-react";
import { fetchAdminCategoryById, fetchCategoriesWithProducts, updateAdminCategory } from "../services/adminCategoriesApi";

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

// ─── Página principal ─────────────────────────────────────────────────────────
export const AdminCategoryDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [category, setCategory]   = useState(null);
    const [products, setProducts]   = useState([]);
    const [productPagination, setProductPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loadingCat, setLoadingCat]   = useState(true);
    const [loadingProd, setLoadingProd] = useState(true);
    const [error, setError]             = useState(null);
    const [productPage, setProductPage] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [productError, setProductError] = useState(null);

    // Cargar datos de la categoría
    useEffect(() => {
        setLoadingCat(true);
        setError(null);
        setCategory(null);
        setProducts([]);
        fetchAdminCategoryById(Number(id))
            .then(setCategory)
            .catch(() => setError("No se pudo cargar la categoría."))
            .finally(() => setLoadingCat(false));
    }, [id]);

    // Cargar productos de la categoría usando withProducts + searchCategory exacto
    const loadProducts = useCallback(async (page) => {
        if (!category) return;
        setLoadingProd(true);
        setProductError(null);
        try {
            const result = await fetchCategoriesWithProducts({
                searchCategory: category.name,
                categoryLimit: 1,
                productPage: page,
                productLimit: 10,
            });
            const cat = result.data?.[0];
            if (cat) {
                setProducts(cat.products?.data ?? []);
                setProductPagination({
                    total:      cat.products?.total ?? 0,
                    page:       cat.products?.productPage ?? 1,
                    limit:      cat.products?.productLimit ?? 10,
                    totalPages: cat.products?.productTotalPages ?? 1,
                });
            }
        } catch {
            setProductError("No se pudieron cargar los productos.");
        } finally {
            setLoadingProd(false);
        }
    }, [category]);

    useEffect(() => { loadProducts(productPage); }, [category, productPage]);

    const handleSaveEdit = async (catId, payload) => {
        const updated = await updateAdminCategory(catId, payload);
        setCategory(prev => ({ ...prev, ...updated }));
        setShowEditModal(false);
    };

    if (loadingCat) return <p style={{ color: "#6b7280", padding: "16px" }}>Cargando...</p>;
    if (error && !category) return (
        <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px" }}>
            {error}
        </div>
    );

    return (
        <div style={{ maxWidth: "1100px" }}>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <button type="button" onClick={() => navigate("/admin/categorias")}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#6b7280", padding: "4px" }}>
                    <ArrowLeft size={20} />
                </button>
                <span style={{ fontSize: "14px", color: "#6b7280" }}>Gestión de Categorías</span>
                <span style={{ fontSize: "14px", color: "#9ca3af" }}>/</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{category?.name}</span>
            </div>

            {/* Header de la categoría */}
            <div style={{ ...cardStyle, marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "var(--background-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Tag size={24} color="var(--primary-dark)" />
                        </div>
                        <div>
                            <h2 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: "700" }}>{category?.name}</h2>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <span style={{
                                    padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500",
                                    backgroundColor: category?.visible ? "#dcfce7" : "#f1f5f9",
                                    color: category?.visible ? "#15803d" : "#475569",
                                }}>
                                    {category?.visible ? "Visible" : "Oculta"}
                                </span>
                                <span style={{
                                    padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500",
                                    backgroundColor: category?.status ? "#dbeafe" : "#fef3c7",
                                    color: category?.status ? "#1d4ed8" : "#92400e",
                                }}>
                                    {category?.status ? "Activa" : "Inactiva"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button type="button" onClick={() => setShowEditModal(true)}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", backgroundColor: "var(--primary-dark)", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                        <Pencil size={14} /> Editar
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #f3f4f6" }}>
                    {[
                        { label: "Total productos",  value: category?.productCount ?? 0 },
                        { label: "Creada",           value: category?.createdAt ? new Date(category.createdAt).toLocaleDateString("es-PY") : "—" },
                        { label: "Actualizada",      value: category?.updatedAt ? new Date(category.updatedAt).toLocaleDateString("es-PY") : "—" },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ textAlign: "center" }}>
                            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#6b7280" }}>{label}</p>
                            <p style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabla de productos */}
            <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                        <p style={{ margin: "0 0 2px", fontWeight: "600", fontSize: "15px" }}>
                            Productos ({productPagination.total})
                        </p>
                        <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                            Productos asociados a esta categoría
                        </p>
                    </div>
                </div>

                {loadingProd ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>Cargando productos...</div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>
                        <Package size={32} style={{ marginBottom: "8px", opacity: 0.4 }} />
                        <p style={{ margin: 0 }}>Esta categoría no tiene productos.</p>
                    </div>
                ) : (
                    <>
                        {/* Header de tabla */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px 80px", gap: "12px", padding: "8px 12px", backgroundColor: "#f9fafb", borderRadius: "8px", marginBottom: "4px" }}>
                            {["Producto", "Precio", "Estado", "Visible"].map(h => (
                                <span key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>{h}</span>
                            ))}
                        </div>

                        {products.map(p => (
                            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 80px 80px", gap: "12px", padding: "12px", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#111827" }}>{p.name}</p>
                                    {p.isOffer && (
                                        <span style={{ fontSize: "11px", backgroundColor: "#fef3c7", color: "#92400e", padding: "1px 6px", borderRadius: "999px" }}>Oferta</span>
                                    )}
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#15803d" }}>
                                        Gs. {Number(p.price).toLocaleString("es-PY")}
                                    </p>
                                    {p.isOffer && (
                                        <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", textDecoration: "line-through" }}>
                                            Gs. {Number(p.originalPrice).toLocaleString("es-PY")}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <span style={{
                                        padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "500",
                                        backgroundColor: p.status ? "#dcfce7" : "#fee2e2",
                                        color: p.status ? "#15803d" : "#dc2626",
                                        display: "inline-block", textAlign: "center", whiteSpace: "nowrap",
                                    }}>
                                        {p.status ? "Activo" : "Inactivo"}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <span style={{
                                        padding: "2px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "500",
                                        backgroundColor: p.visible ? "#dcfce7" : "#f1f5f9",
                                        color: p.visible ? "#15803d" : "#475569",
                                        display: "inline-block", textAlign: "center", whiteSpace: "nowrap",
                                    }}>
                                        {p.visible ? "Visible" : "Oculto"}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Paginación */}
                        {productPagination.totalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" }}>
                                <button onClick={() => setProductPage(p => Math.max(1, p - 1))} disabled={productPage === 1}
                                    style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", cursor: productPage === 1 ? "not-allowed" : "pointer", opacity: productPage === 1 ? 0.5 : 1, fontSize: "13px" }}>
                                    Anterior
                                </button>
                                <span style={{ fontSize: "13px" }}>{productPage} / {productPagination.totalPages}</span>
                                <button onClick={() => setProductPage(p => Math.min(productPagination.totalPages, p + 1))} disabled={productPage === productPagination.totalPages}
                                    style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", backgroundColor: "white", cursor: productPage === productPagination.totalPages ? "not-allowed" : "pointer", opacity: productPage === productPagination.totalPages ? 0.5 : 1, fontSize: "13px" }}>
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showEditModal && (
                <EditModal
                    category={category}
                    onSave={handleSaveEdit}
                    onCancel={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
};