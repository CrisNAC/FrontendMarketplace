// src/features/commerces/pages/CommerceProductsPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Pencil, Trash2, Star, AlertTriangle } from "lucide-react";
import { apiClient as commerceApiClient } from "../services/editCommerceApi";
import { apiClient as productApiClient } from "../services/editProductApi";
import { EDIT_PRODUCT_ENDPOINT_PATHS } from "../services/editProductEndpoints";
import { formatGuarani } from "../../../lib/formatGuarani.js";

// ─── Sub-componentes ──────────────────────────────────────────────────────────
// Normaliza visibilidad para productos que vienen de /api/commerces/:id (campo visible: boolean)
// o de /products/:id via mapProductResponse (campo status: "active"|"pending")
const isProductVisible = (product) => {
    if (typeof product.visible === "boolean") return product.visible;
    if (typeof product.status === "string") return product.status === "active";
    return true;
};

function StatusBadge({ visible }) {
    return (
        <span style={{
            position: "absolute", top: "8px", right: "8px",
            padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "700",
            backgroundColor: visible ? "#dcfce7" : "#f1f5f9",
            color: visible ? "#15803d" : "#475569",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}>
            {visible ? "Activo" : "Oculto"}
        </span>
    );
}

function CategoryPill({ name }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "600",
            backgroundColor: "#ede9fe", color: "#6d28d9",
        }}>
            {name}
        </span>
    );
}

function Stars({ rating }) {
    const count = Math.round(rating ?? 0);
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "1px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={11}
                    fill={i < count ? "#f59e0b" : "none"}
                    color={i < count ? "#f59e0b" : "#d1d5db"}
                />
            ))}
        </div>
    );
}

function ProductCard({ product, onView, onEdit, onDelete }) {
    const [imgError, setImgError] = useState(false);
    const isVisible = isProductVisible(product);
    const productCategories = Array.isArray(product.categories) ? product.categories : [];
    // el back ahora devuelve image_url directamente en el producto
    const imageUrl = product.image_url ?? product.imageUrl ?? null;

    return (
        <div style={{
            backgroundColor: "white", borderRadius: "14px", overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex", flexDirection: "column",
        }}>
            {/* Imagen */}
            <div style={{ position: "relative", height: "160px", backgroundColor: "#f3f4f6", flexShrink: 0 }}>
                {imageUrl && !imgError ? (
                    <img
                        src={imageUrl} alt={product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div style={{
                        width: "100%", height: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: "#e5e7eb",
                    }}>
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>Sin imagen</span>
                    </div>
                )}
                <StatusBadge visible={isVisible} />
            </div>

            {/* Contenido */}
            <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#1f2e27", margin: 0, lineHeight: "1.3" }}>
                    {product.name}
                </h3>
                <p style={{
                    fontSize: "11px", color: "#6b7280", margin: 0, lineHeight: "1.5",
                    display: "-webkit-box", WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                    {product.description || "Sin descripción."}
                </p>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#15803d", margin: 0 }}>
                    {formatGuarani(Number(product.price) || 0)}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Stars rating={product.average_rating} />
                    <span style={{ fontSize: "11px", color: "#6b7280" }}>
                        ({product.total_reviews ?? 0} reseñas)
                    </span>
                </div>
                {productCategories.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {productCategories.map((cat, i) => (
                            <CategoryPill key={cat.id ?? i} name={cat.name} />
                        ))}
                    </div>
                )}
            </div>

            {/* Botones */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "6px", padding: "0 12px 12px" }}>
                <button type="button" onClick={onView} style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                    padding: "6px 0", borderRadius: "8px", fontSize: "11px", fontWeight: "600",
                    backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", cursor: "pointer",
                }}>
                    <Eye size={12} /> Ver
                </button>
                <button type="button" onClick={onEdit} style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                    padding: "6px 0", borderRadius: "8px", fontSize: "11px", fontWeight: "600",
                    backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", cursor: "pointer",
                }}>
                    <Pencil size={12} /> Editar
                </button>
                <button type="button" onClick={onDelete} title="Eliminar producto" style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: "32px", borderRadius: "8px",
                    backgroundColor: "#fff1f2", color: "#dc2626",
                    border: "1px solid #fecdd3", cursor: "pointer",
                }}>
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

// ─── Modal de confirmación ────────────────────────────────────────────────────
function DeleteModal({ product, isDeleting, onConfirm, onCancel, deleteError }) {
    if (!product) return null;
    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 50,
                backgroundColor: "rgba(0,0,0,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    backgroundColor: "white", borderRadius: "16px", padding: "24px",
                    maxWidth: "420px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px",
                }}>
                    <AlertTriangle size={24} color="#dc2626" />
                </div>

                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>
                    ¿Estás seguro?
                </h3>
                <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 6px 0", lineHeight: "1.5" }}>
                    Esta acción eliminará permanentemente el producto{" "}
                    <strong>"{product.name}"</strong>.
                </p>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 24px 0" }}>
                    Esta acción no puede ser deshecha.
                </p>

                {deleteError && (
                    <div style={{
                        backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
                        borderRadius: "8px", padding: "10px 12px",
                        color: "#be123c", fontSize: "13px", marginBottom: "16px",
                    }}>
                        {deleteError}
                    </div>
                )}

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button type="button" onClick={onCancel} disabled={isDeleting} style={{
                        padding: "8px 20px", borderRadius: "8px",
                        border: "1px solid #d1d5db", backgroundColor: "white",
                        fontSize: "14px", fontWeight: "500", color: "#374151",
                        cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.6 : 1,
                    }}>
                        Cancelar
                    </button>
                    <button type="button" onClick={onConfirm} disabled={isDeleting} style={{
                        padding: "8px 20px", borderRadius: "8px", border: "none",
                        backgroundColor: "#dc2626", fontSize: "14px", fontWeight: "600", color: "white",
                        cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.7 : 1,
                        display: "flex", alignItems: "center", gap: "6px",
                    }}>
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function CommerceProductsPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [productToDelete, setProductToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const sessionRes = await commerceApiClient.get("/api/session/user-session");
                const idStore = sessionRes.data?.user?.id_store;
                if (!idStore) throw new Error("No tenés un comercio registrado.");
                const res = await commerceApiClient.get(`/api/commerces/${idStore}`);
                const loadedProducts = res.data?.products ?? [];
                console.log("Primer producto del comercio:", JSON.stringify(loadedProducts[0], null, 2));
                if (active) setProducts(loadedProducts);
            } catch (err) {
                if (active) setError(err.response?.data?.message || err.message || "No se pudieron cargar los productos.");
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, []);

    // Categorías únicas para el filtro (de todos los productos, no solo la primera)
    const categories = useMemo(() => {
        const seen = new Set();
        const result = [];
        for (const p of products) {
            const cats = Array.isArray(p.categories) ? p.categories : [];
            for (const cat of cats) {
                if (cat?.name && !seen.has(cat.name)) {
                    seen.add(cat.name);
                    result.push(cat.name);
                }
            }
        }
        return result;
    }, [products]);

    // Productos filtrados
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
            const isVisible = isProductVisible(p);
            const matchesStatus =
                filterStatus === "all" ||
                (filterStatus === "active" && isVisible) ||
                (filterStatus === "hidden" && !isVisible);
            const productCats = Array.isArray(p.categories) ? p.categories : [];
            const matchesCategory = filterCategory === "all" || productCats.some(cat => cat?.name === filterCategory);
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [products, search, filterStatus, filterCategory]);

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        try {
            await productApiClient.delete(EDIT_PRODUCT_ENDPOINT_PATHS.productById(productToDelete.id_product));
            setProducts(prev => prev.filter(p => p.id_product !== productToDelete.id_product));
            setProductToDelete(null);
        } catch (err) {
            const msg = err.response?.data?.error?.message
                || err.response?.data?.message
                || "No se pudo eliminar el producto. Intentá nuevamente.";
            setDeleteError(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) return <p style={{ color: "#6b7280", padding: "16px" }}>Cargando...</p>;

    const selectStyle = {
        padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "500",
        border: "1px solid #e5e7eb", backgroundColor: "white", color: "#374151",
        cursor: "pointer", outline: "none",
    };
    
    return (
        <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                    <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Gestión de Productos</h4>
                    <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                        Administrá tu catálogo de productos de forma sencilla
                    </p>
                </div>
                <button type="button" onClick={() => navigate("/comercio/productos/nuevo")} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    backgroundColor: "var(--primary-dark)", color: "white",
                    border: "none", borderRadius: "8px", padding: "8px 16px",
                    fontSize: "13px", fontWeight: "500", cursor: "pointer",
                }}>
                    <Plus size={14} /> Nuevo Producto
                </button>
            </div>

            {error && (
                <div style={{
                    backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
                    borderRadius: "10px", padding: "12px 16px", color: "#be123c",
                    fontSize: "14px", marginBottom: "16px",
                }}>
                    {error}
                </div>
            )}

            {/* Barra de búsqueda y filtros */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
                    <Search size={13} color="#9ca3af" style={{
                        position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
                    }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar productos..."
                        style={{
                            width: "100%", padding: "7px 12px 7px 30px",
                            border: "1px solid #e5e7eb", borderRadius: "8px",
                            fontSize: "12px", backgroundColor: "white",
                            outline: "none", boxSizing: "border-box", color: "#374151",
                        }}
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>🔽 Estado:</span>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
                        <option value="all">Todos</option>
                        <option value="active">Activo</option>
                        <option value="hidden">Oculto</option>
                    </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>🔽 Categoría:</span>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={selectStyle}>
                        <option value="all">Todas</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid de cards */}
            {filteredProducts.length === 0 ? (
                <div style={{
                    backgroundColor: "white", borderRadius: "16px", padding: "48px 20px",
                    textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}>
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: "0 0 6px 0" }}>
                        {search || filterStatus !== "all" || filterCategory !== "all"
                            ? "No se encontraron productos con esos filtros."
                            : "Aún no tenés productos."}
                    </p>
                    {!search && filterStatus === "all" && filterCategory === "all" && (
                        <button type="button" onClick={() => navigate("/comercio/productos/nuevo")} style={{
                            marginTop: "12px", padding: "8px 16px",
                            backgroundColor: "var(--primary-dark)", color: "white",
                            border: "none", borderRadius: "8px", fontSize: "13px",
                            fontWeight: "500", cursor: "pointer",
                            display: "inline-flex", alignItems: "center", gap: "6px",
                        }}>
                            <Plus size={13} /> Crear primer producto
                        </button>
                    )}
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "16px",
                }}>
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id_product}
                            product={product}
                            onView={() => navigate(`/comercio/productos/${product.id_product}`)}
                            onEdit={() => navigate(`/comercio/productos/${product.id_product}/editar`)}
                            onDelete={() => { setDeleteError(""); setProductToDelete(product); }}
                        />
                    ))}
                </div>
            )}

            {filteredProducts.length > 0 && (
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "12px", textAlign: "right" }}>
                    {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
                </p>
            )}

            {/* Modal de eliminación */}
            <DeleteModal
                product={productToDelete}
                isDeleting={isDeleting}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    if (isDeleting) return;
                    setProductToDelete(null);
                    setDeleteError("");
                }}
                deleteError={deleteError}
            />
        </>
    );
}