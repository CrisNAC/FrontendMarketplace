import { CollectionCard } from "./CollectionCard";

export const CollectionsSection = () => {
    return (
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h6 style={{ fontWeight: "bold", margin: 0 }}>Tus Colecciones</h6>
                <span
                    onClick={() => console.log("Gestionar colecciones")}
                    style={{ color: "#3b82f6", fontSize: "13px", cursor: "pointer" }}
                >
                    Gestionar colecciones
                </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <CollectionCard
                    title="Lo Más Vendido"
                    description="Nuestros productos más populares y mejor valorados por los clientes"
                    products="2 productos"
                    imageUrl="https://d22fxaf9t8d39k.cloudfront.net/9e638f0d978894080531a785ce53ff90c423d2e2ae0d3e3d3cf69b4643f0307880262.jpeg"
                />
                <CollectionCard
                    title="Nuevos Productos"
                    description="Las últimas incorporaciones a nuestro catálogo"
                    products="2 productos"
                    imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFqPIKb1XK0Zb7nYj3wOvIwMc6fejtCdi5Sg&s"
                />
            </div>
        </div>
    );
};