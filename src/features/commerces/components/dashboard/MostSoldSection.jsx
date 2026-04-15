import { formatGuarani } from "../../../../lib/formatGuarani.js";

export const MostSoldSection = ({ products = [] }) => {
    return (
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h6 style={{ fontWeight: "bold", margin: 0 }}>Más Vendidos</h6>
                <span style={{ color: "#3b82f6", fontSize: "13px", cursor: "pointer" }}>
                    Ver todos
                </span>
            </div>

            {products.length === 0 && (
                <p style={{ fontSize: "13px", color: "#6b7280" }}>No hay productos disponibles.</p>
            )}

            {products.map((product, index) => {
                // el back puede devolver image_url o imageUrl según el endpoint
                const imageUrl = product.image_url ?? product.imageUrl ?? null;

                return (
                    <div
                        key={product.id_product}
                        style={{
                            backgroundColor: "var(--background-white)",
                            borderRadius: "8px",
                            padding: "8px",
                            marginBottom: index < products.length - 1 ? "10px" : 0,
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "44px", height: "44px", borderRadius: "6px", flexShrink: 0, overflow: "hidden", backgroundColor: "#e8e0f0" }}>
                                {imageUrl
                                    ? <img src={imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : <div style={{ width: "100%", height: "100%", backgroundColor: "#d5cce0" }} />
                                }
                            </div>
                            <div>
                                <strong style={{ fontSize: "14px" }}>{product.name}</strong>
                                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                                    {formatGuarani(product.price)}
                                </div>
                            </div>
                        </div>
                        <span style={{
                            backgroundColor: "rgba(22,149,80,0.15)",
                            color: "#16a34a",
                            fontSize: "12px",
                            fontWeight: "600",
                            padding: "2px 10px",
                            borderRadius: "12px",
                            flexShrink: 0,
                        }}>
                            Activo
                        </span>
                    </div>
                );
            })}
        </div>
    );
};