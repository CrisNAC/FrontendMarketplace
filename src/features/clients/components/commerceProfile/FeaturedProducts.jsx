import { ProductCard } from "../search/ProductCard";

export const FeaturedProducts = ({ products }) => {
    return (
        <div style={{ flexGrow: 1 }}>
            <h5 style={{ fontWeight: "bold", marginBottom: "16px" }}>
                Productos Destacados
            </h5>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "16px",
                }}
            >
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        name={product.name}
                        price={product.price}
                        imageUrl={product.imageUrl}
                    />
                ))}
            </div>
        </div>
    );
};