import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CategoryIcon } from "../components/CategoryIconPicker";
import { CategoryEditModal } from "../components/CategoryEditModal";
import { ArrowLeft, Package, Pencil } from "lucide-react";
import { fetchAdminCategoryById, fetchCategoriesWithProducts, updateAdminCategory } from "../services/adminCategoriesApi";

const cardStyle = {
    backgroundColor: "var(--background-white)",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

// ─── Página principal ─────────────────────────────────────────────────────────
export const AdminCategoryDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [productPagination, setProductPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loadingCat, setLoadingCat] = useState(true);
    const [loadingProd, setLoadingProd] = useState(true);
    const [error, setError] = useState(null);
    const [productPage, setProductPage] = useState(1);
    const [showEditModal, setShowEditModal] = useState(false);
    const [productError, setProductError] = useState(null);

    // Cargar datos de la categoría
    useEffect(() => {
        setLoadingCat(true);
        setError(null);
        setCategory(null);
        setProducts([]);
        setProductPage(1);
        setProductError(null);
        setProductPagination({ total: 0, page: 1, limit: 10, totalPages: 1 });
        setLoadingProd(true);
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
                    total: cat.products?.total ?? 0,
                    page: cat.products?.productPage ?? 1,
                    limit: cat.products?.productLimit ?? 10,
                    totalPages: cat.products?.productTotalPages ?? 1,
                });
            }
        } catch {
            setProductError("No se pudieron cargar los productos.");
        } finally {
            setLoadingProd(false);
        }
    }, [category]);

    useEffect(() => { loadProducts(productPage); }, [loadProducts, productPage]);

    const handleSaveEdit = async (catId, payload) => {
        const updated = await updateAdminCategory(catId, payload);
        setCategory(prev => ({ ...prev, ...updated }));
        setShowEditModal(false);
    };

    const renderProducts = () => {
        if (loadingProd) {
            return (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>
                    Cargando productos...
                </div>
            );
        }

        if (productError) {
            return (
                <div style={{
                    backgroundColor: "#fff1f2",
                    border: "1px solid #fecdd3",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    color: "#be123c",
                    fontSize: "14px"
                }}>
                    {productError}
                </div>
            );
        }

        if (products.length === 0) {
            return (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>
                    <Package size={32} style={{ marginBottom: "8px", opacity: 0.4 }} />
                    <p style={{ margin: 0 }}>Esta categoría no tiene productos.</p>
                </div>
            );
        }

        return (
            <>
                {/* Header de tabla */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 80px 80px",
                    gap: "12px",
                    padding: "8px 12px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    marginBottom: "4px"
                }}>
                    {["Producto", "Precio", "Estado", "Visible"].map(h => (
                        <span
                            key={h}
                            style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                color: "#6b7280",
                                textTransform: "uppercase"
                            }}
                        >
                            {h}
                        </span>
                    ))}
                </div>

                {products.map(p => (
                    <div
                        key={p.id}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 120px 80px 80px",
                            gap: "12px",
                            padding: "12px",
                            borderBottom: "1px solid #f3f4f6",
                            alignItems: "center"
                        }}
                    >
                        <div>
                            <p style={{
                                margin: 0,
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#111827"
                            }}>
                                {p.name}
                            </p>

                            {p.isOffer && (
                                <span style={{
                                    fontSize: "11px",
                                    backgroundColor: "#fef3c7",
                                    color: "#92400e",
                                    padding: "1px 6px",
                                    borderRadius: "999px"
                                }}>
                                    Oferta
                                </span>
                            )}
                        </div>

                        <div>
                            <p style={{
                                margin: 0,
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "#15803d"
                            }}>
                                Gs. {Number(p.price).toLocaleString("es-PY")}
                            </p>

                            {p.isOffer && (
                                <p style={{
                                    margin: 0,
                                    fontSize: "11px",
                                    color: "#9ca3af",
                                    textDecoration: "line-through"
                                }}>
                                    Gs. {Number(p.originalPrice).toLocaleString("es-PY")}
                                </p>
                            )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span style={{
                                padding: "2px 8px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: "500",
                                backgroundColor: p.status ? "#dcfce7" : "#fee2e2",
                                color: p.status ? "#15803d" : "#dc2626",
                            }}>
                                {p.status ? "Activo" : "Inactivo"}
                            </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center" }}>
                            <span style={{
                                padding: "2px 8px",
                                borderRadius: "999px",
                                fontSize: "11px",
                                fontWeight: "500",
                                backgroundColor: p.visible ? "#dcfce7" : "#f1f5f9",
                                color: p.visible ? "#15803d" : "#475569",
                            }}>
                                {p.visible ? "Visible" : "Oculto"}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Paginación */}
                {productPagination.totalPages > 1 && (
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "20px"
                    }}>
                        <button
                            onClick={() => setProductPage(p => Math.max(1, p - 1))}
                            disabled={productPage === 1}
                        >
                            Anterior
                        </button>

                        <span>
                            {productPage} / {productPagination.totalPages}
                        </span>

                        <button
                            onClick={() => setProductPage(p => Math.min(productPagination.totalPages, p + 1))}
                            disabled={productPage === productPagination.totalPages}
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </>
        );
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
                            <CategoryIcon name={category?.icon} size={24} />
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
                        { label: "Total productos", value: category?.productCount ?? 0 },
                        { label: "Creada", value: category?.createdAt ? new Date(category.createdAt).toLocaleDateString("es-PY") : "—" },
                        { label: "Actualizada", value: category?.updatedAt ? new Date(category.updatedAt).toLocaleDateString("es-PY") : "—" },
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
                {renderProducts()}
            </div>

            {showEditModal && (
                <CategoryEditModal
                    category={category}
                    onSave={handleSaveEdit}
                    onCancel={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
};