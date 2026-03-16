// src/features/commerces/pages/CommerceProductsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Eye, Pencil, Package } from "lucide-react";
import { apiClient } from "../services/editCommerceApi";

// ─── Estilos compartidos ──────────────────────────────────────────────────────
const card = {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

function StatusPill({ visible }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
            backgroundColor: visible ? "#dcfce7" : "#f1f5f9",
            color: visible ? "#15803d" : "#475569",
        }}>
            {visible ? "Activo" : "Oculto"}
        </span>
    );
}

function EmptyState({ onCreateClick }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "60px 20px", gap: "12px",
        }}>
            <Package size={48} color="#d1d5db" />
            <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>
                Aún no tenés productos
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Creá tu primer producto para que aparezca en el marketplace.
            </p>
            <button
                type="button"
                onClick={onCreateClick}
                style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    marginTop: "8px", padding: "8px 16px",
                    backgroundColor: "var(--primary-dark)", color: "white",
                    border: "none", borderRadius: "8px",
                    fontSize: "14px", fontWeight: "500", cursor: "pointer",
                }}
            >
                <Plus size={14} />
                Crear Producto
            </button>
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

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                // 1. Obtener id_store desde la sesión
                const sessionRes = await apiClient.get("/api/session/user-session");
                const idStore = sessionRes.data?.user?.id_store;
                if (!idStore) throw new Error("No tenés un comercio registrado.");

                // 2. Cargar productos del comercio
                const res = await apiClient.get(`/api/commerces/${idStore}`);
                if (active) setProducts(res.data?.products ?? []);
            } catch (err) {
                if (active) setError(err.response?.data?.message || err.message || "No se pudieron cargar los productos.");
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, []);

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p style={{ color: "#6b7280", padding: "16px" }}>Cargando...</p>;

    return (
        <>
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Productos</h4>
                    <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                        Gestioná el catálogo de tu comercio
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/comercio/productos/nuevo")}
                    style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        backgroundColor: "var(--primary-dark)", color: "white",
                        border: "none", borderRadius: "8px", padding: "8px 16px",
                        fontSize: "14px", fontWeight: "500", cursor: "pointer",
                    }}
                >
                    <Plus size={14} />
                    Nuevo Producto
                </button>
            </div>

            {/* ── Error ──────────────────────────────────────────────────────── */}
            {error && (
                <div style={{
                    backgroundColor: "#fff1f2", border: "1px solid #fecdd3",
                    borderRadius: "10px", padding: "12px 16px", color: "#be123c",
                    fontSize: "14px", marginBottom: "16px",
                }}>
                    {error}
                </div>
            )}

            {/* ── Buscador ───────────────────────────────────────────────────── */}
            <div style={{ ...card, marginBottom: "16px", padding: "12px 16px" }}>
                <div style={{ position: "relative" }}>
                    <Search size={14} color="#9ca3af" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre..."
                        style={{
                            width: "100%", padding: "7px 12px 7px 32px",
                            border: "1px solid #e5e7eb", borderRadius: "8px",
                            fontSize: "13px", backgroundColor: "#f9fafb",
                            outline: "none", boxSizing: "border-box",
                        }}
                    />
                </div>
            </div>

            {/* ── Lista ──────────────────────────────────────────────────────── */}
            <div style={card}>
                {filteredProducts.length === 0 && !search && (
                    <EmptyState onCreateClick={() => navigate("/comercio/productos/nuevo")} />
                )}

                {filteredProducts.length === 0 && search && (
                    <p style={{ textAlign: "center", color: "#6b7280", fontSize: "13px", padding: "32px 0" }}>
                        No se encontraron productos con "{search}".
                    </p>
                )}

                {filteredProducts.length > 0 && (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                                {["Producto", "Precio", "Estado", "Acciones"].map(h => (
                                    <th key={h} style={{
                                        textAlign: h === "Acciones" ? "right" : "left",
                                        fontSize: "11px", fontWeight: "600",
                                        color: "#6b7280", textTransform: "uppercase",
                                        letterSpacing: "0.05em", padding: "8px 12px",
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product, idx) => (
                                <tr
                                    key={product.id_product}
                                    style={{
                                        borderBottom: idx < filteredProducts.length - 1 ? "1px solid #f9fafb" : "none",
                                        transition: "background 0.1s",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f9fafb"}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    {/* Producto */}
                                    <td style={{ padding: "12px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div style={{
                                                width: "40px", height: "40px", borderRadius: "8px",
                                                overflow: "hidden", backgroundColor: "#f3f4f6", flexShrink: 0,
                                            }}>
                                                {product.image_url
                                                    ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <Package size={16} color="#d1d5db" />
                                                    </div>
                                                }
                                            </div>
                                            <div>
                                                <p style={{ fontSize: "13px", fontWeight: "600", color: "#111827", margin: 0 }}>
                                                    {product.name}
                                                </p>
                                                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
                                                    ID: {product.id_product}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Precio */}
                                    <td style={{ padding: "12px", fontSize: "13px", fontWeight: "600", color: "#15803d" }}>
                                        Gs. {Number(product.price).toLocaleString("es-PY")}
                                    </td>

                                    {/* Estado */}
                                    <td style={{ padding: "12px" }}>
                                        <StatusPill visible={product.visible} />
                                    </td>

                                    {/* Acciones */}
                                    <td style={{ padding: "12px", textAlign: "right" }}>
                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/comercio/productos/${product.id_product}`)}
                                                title="Ver detalle"
                                                style={{
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    width: "30px", height: "30px", borderRadius: "6px",
                                                    border: "1px solid #e5e7eb", backgroundColor: "white",
                                                    cursor: "pointer", color: "#374151",
                                                }}
                                            >
                                                <Eye size={13} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/comercio/productos/${product.id_product}/editar`)}
                                                title="Editar"
                                                style={{
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    width: "30px", height: "30px", borderRadius: "6px",
                                                    border: "1px solid #e5e7eb", backgroundColor: "white",
                                                    cursor: "pointer", color: "#374151",
                                                }}
                                            >
                                                <Pencil size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Footer con total ───────────────────────────────────────────── */}
            {filteredProducts.length > 0 && (
                <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "10px", textAlign: "right" }}>
                    {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
                    {search ? ` encontrado${filteredProducts.length !== 1 ? "s" : ""}` : " en total"}
                </p>
            )}
        </>
    );
}