import { Pencil } from "lucide-react";

export const CollectionCard = ({ title, description, products, imageUrl }) => {
    return (
        <div style={{
            backgroundColor: "var(--background-white)",
            border: "1px solid var(--primary-light)",
            borderRadius: "12px",
            padding: "14px",
            height: "100%",
            boxSizing: "border-box",
        }}>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <h6 style={{ fontWeight: "600", margin: 0, fontSize: "14px" }}>{title}</h6>
                <Pencil size={14} color="#3b82f6" style={{ cursor: "pointer", flexShrink: 0 }} />
            </div>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 10px 0" }}>{description}</p>

            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "6px", overflow: "hidden", backgroundColor: "#e8e0f0", flexShrink: 0 }}>
                    {imageUrl && <img src={imageUrl} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                </div>
                <span style={{ fontSize: "13px", color: "#3b82f6", fontWeight: "600", cursor: "pointer" }}>
                    {products}
                </span>
            </div>
        </div>
    );
};