import { useNavigate } from "react-router-dom";

type Props = {
    name: string;
    price: string;
    imageUrl?: string;
};

export const SearchProductCard = ({ name, price, imageUrl }: Props) => {
    const navigate = useNavigate();

    const handleVerOfertas = () => {
        navigate('/comparar');
    };
    return (
        <div style={{
            backgroundColor: "#FEF7FF",
            height: "320px",
            borderRadius: "12px",
            border: "1px solid #CAC4D0",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
        }}>
            {/* Image */}
            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                backgroundColor: "#f0eaf5",
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
            <div style={{ padding: "8px 12px 12px 12px", flexShrink: 0 }}>
                <p style={{ fontSize: "14px", fontWeight: "600", lineHeight: "1.3", margin: "0 0 4px 0", color: "#000" }}>{name}</p>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px 0" }}>Desde Gs. {price}</p>
                <button
                    onClick={handleVerOfertas}
                    style={{
                        width: "100%",
                        padding: "6px 0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#f5f5f5",
                        backgroundColor: "#6B9080",
                        border: "1px solid #658D7B",
                        cursor: "pointer",
                    }}>
                    Ver Ofertas
                </button>
            </div>
        </div>
    );
};