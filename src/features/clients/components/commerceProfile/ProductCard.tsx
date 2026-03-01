type Props = {
    name: string;
    price: string;
    imageUrl?: string;
};

export const ProductCard = ({ name, price, imageUrl }: Props) => {
    return (
        <div style={{
            backgroundColor: "#fef7ff",
            border: "1px solid #cac4d0",
            borderRadius: "12px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
        }}>
            {/* Image */}
            <div style={{
                height: "200px",
                backgroundColor: "#f0eaf5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%", backgroundColor: "#e8e0f0" }} />
                )}
            </div>

            {/* Info */}
            <div style={{ padding: "8px 12px 12px 12px" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", lineHeight: "1.3", margin: "0 0 4px 0" }}>{name}</p>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px 0" }}>Gs. {price}</p>
                <button style={{
                    width: "100%",
                    padding: "6px 0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "white",
                    backgroundColor: "#944343",
                    border: "none",
                    cursor: "pointer",
                }}>
                    Ver más
                </button>
            </div>
        </div>
    );
};