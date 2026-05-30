export const BestRatedSection = ({ products = [], loading = false }) => {
    return (
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h6 style={{ fontWeight: "bold", margin: 0 }}>Mejor Valorados</h6>
            </div>

            {loading && (
                <p style={{ fontSize: "13px", color: "#9ca3af" }}>Cargando...</p>
            )}

            {!loading && products.length === 0 && (
                <p style={{ fontSize: "13px", color: "#6b7280" }}>Aún no hay reseñas de productos.</p>
            )}

            {!loading && products.map(product => (
                <div key={product.id} style={{ backgroundColor: "var(--background-white)", borderRadius: "8px", padding: "8px", marginBottom: "8px", display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "6px", flexShrink: 0, backgroundColor: "#e8e0f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {product.imageUrl
                            ? <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div style={{ width: "100%", height: "100%", backgroundColor: "#d5cce0" }} />
                        }
                    </div>
                    <div>
                        <strong style={{ fontSize: "14px" }}>{product.name}</strong>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            ⭐ {product.averageRating} ({product.reviewCount} reseña{product.reviewCount !== 1 ? "s" : ""})
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};