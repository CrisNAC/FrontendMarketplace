import { useNavigate } from "react-router-dom";
import { formatGuarani } from "../../../../lib/formatGuarani.js";

type PriceValue = string | number | null | undefined;

type Props = {
    productId?: number;
    name: string;
    price: string | number;
    imageUrl?: string;
    isOffer?: boolean;
    offerPrice?: PriceValue;
    originalPrice?: PriceValue;
    buttonLabel?: string;
    onButtonClick?: () => void;
};

const parsePrice = (value: PriceValue) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export const SearchProductCard = ({
    name,
    price,
    imageUrl,
    isOffer = false,
    offerPrice,
    originalPrice,
    buttonLabel = "Comparar precios",
    onButtonClick,
}: Props) => {
    const navigate = useNavigate();

    const handleCompararPrecios = () => {
        // Usamos el nombre como término de búsqueda para la comparación
        const term = name.trim();
        if (!term) {
            return;
        }
        navigate(`/comparar?search=${encodeURIComponent(term)}`);
    };

    const effectivePrice = parsePrice(offerPrice ?? price);
    const listPrice = parsePrice(originalPrice);
    const hasDiscount =
        (isOffer || offerPrice != null || originalPrice != null) &&
        effectivePrice !== null &&
        listPrice !== null &&
        listPrice > effectivePrice;

    const discountPercentage = hasDiscount
        ? Math.round(((listPrice - effectivePrice) / listPrice) * 100)
        : null;

    const handleButtonClick = () => {
        if (onButtonClick) {
            onButtonClick();
            return;
        }
        handleCompararPrecios();
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
                position: "relative",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                backgroundColor: "#f0eaf5",
            }}>
                {discountPercentage !== null && (
                    <span
                        style={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            zIndex: 1,
                            backgroundColor: "#B91C1C",
                            color: "#fff",
                            borderRadius: "999px",
                            padding: "6px 10px",
                            fontSize: "12px",
                            fontWeight: "700",
                            boxShadow: "0 10px 24px rgba(127, 29, 29, 0.18)",
                        }}
                    >
                        -{discountPercentage}%
                    </span>
                )}
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
                {hasDiscount ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", margin: "0 0 8px 0" }}>
                        <span
                            style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                textDecoration: "line-through",
                            }}
                        >
                            {formatGuarani(originalPrice)}
                        </span>
                        <span
                            style={{
                                fontSize: "18px",
                                fontWeight: "700",
                                color: "#B91C1C",
                            }}
                        >
                            {formatGuarani(offerPrice ?? price)}
                        </span>
                    </div>
                ) : (
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px 0" }}>
                        Desde {formatGuarani(price)}
                    </p>
                )}
                <button
                    onClick={handleButtonClick}
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
                    {buttonLabel}
                </button>
            </div>
        </div>
    );
};
