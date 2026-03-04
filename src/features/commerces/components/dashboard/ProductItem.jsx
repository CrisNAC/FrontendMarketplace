export const ProductItem = ({ name, detail, imageUrl }) => {
    return (
        <div style={{
            backgroundColor: "var(--background-white)",
            borderRadius: "8px",
            padding: "8px",
            marginBottom: "8px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
        }}>
            <div style={{
                width: "44px", height: "44px", borderRadius: "6px", flexShrink: 0,
                backgroundColor: "#e8e0f0", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                {imageUrl
                    ? <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", backgroundColor: "#d5cce0" }} />
                }
            </div>
            <div>
                <strong style={{ fontSize: "14px" }}>{name}</strong>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>{detail}</div>
            </div>
        </div>
    );
};