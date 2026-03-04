import { ProductItem } from "./ProductItem";

export const BestRatedSection = () => {
    return (
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h6 style={{ fontWeight: "bold", margin: 0 }}>Mejor Valorados</h6>
                <span
                    onClick={() => console.log("Ver todos - Mejor Valorados")}
                    style={{ color: "#3b82f6", fontSize: "13px", cursor: "pointer" }}
                >
                    Ver todos
                </span>
            </div>

            <ProductItem
                name="Silla Ergonómica Oficina"
                detail="⭐ 4.7 (3 reseñas)"
                imageUrl="https://admin.consumer.com.py/storage/products/216.jpg"
            />
            <ProductItem
                name="Organizador de Escritorio"
                detail="⭐ 4.5 (2 reseñas)"
                imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbEkYCGXtGzDqsKdbBMTot8PdgcwW1wldjXw&s"
            />
        </div>
    );
};