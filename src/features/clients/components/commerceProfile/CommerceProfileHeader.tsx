import { useState } from "react";
import { Phone, Mail, MapPin, Search, X } from "lucide-react";

type Props = {
    name: string;
    category: string;
    isOpen: boolean;
    rating: number;
    reviews: number;
    closesAt: string;
    logoUrl?: string;
};

export const CommerceProfileHeader = ({
    name,
    category,
    isOpen,
    rating,
    reviews,
    closesAt,
    logoUrl,
}: Props) => {
    const [search, setSearch] = useState("");
    return (
        <div style={{
            backgroundColor: "rgba(159, 7, 18, 0.12)",
            borderRadius: "24px",
            padding: "24px",
            marginBottom: "16px",
            marginLeft: "16px",
            marginRight: "16px",
            position: "relative",
        }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "24px" }}>

                {/* Logo */}
                <div style={{
                    width: "155px",
                    height: "152px",
                    flexShrink: 0,
                    borderRadius: "50%",
                    backgroundColor: "white",
                    border: "3px solid white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}>
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={name}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                    ) : (
                        <span style={{ fontSize: "48px", fontWeight: "bold", color: "#9ca3af" }}>
                            {name[0]}
                        </span>
                    )}
                </div>

                {/* Info */}
                <div>
                    {/* Name + badges */}
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <h2 style={{ fontWeight: "bold", margin: 0, fontSize: "32px" }}>{name}</h2>
                        <span style={{
                            backgroundColor: "#944343",
                            color: "#f5f5f5",
                            fontSize: "13px",
                            fontWeight: "bold",
                            padding: "4px 12px",
                            borderRadius: "15px",
                        }}>
                            {category}
                        </span>
                        <span style={{
                            backgroundColor: isOpen ? "rgba(22,149,80,0.5)" : "rgba(200,50,50,0.2)",
                            color: isOpen ? "#245339" : "#8b1a1a",
                            fontSize: "13px",
                            fontWeight: "bold",
                            padding: "4px 16px",
                            borderRadius: "15px",
                        }}>
                            {isOpen ? "Abierto" : "Cerrado"}
                        </span>
                    </div>

                    {/* Rating */}
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <span>⭐</span>
                        <span style={{ fontWeight: "bold" }}>{rating}</span>
                        <span style={{ fontSize: "14px", color: "#6b7280" }}>{reviews} reseñas</span>
                        <span style={{ fontSize: "14px", color: "#6b7280" }}>· Cierra a las {closesAt}</span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", flexDirection: "row", gap: "12px" }}>
                        <button style={{
                            display: "flex", flexDirection: "row", alignItems: "center", gap: "6px",
                            backgroundColor: "#944343", color: "white", border: "none",
                            borderRadius: "8px", padding: "6px 12px", fontSize: "14px", cursor: "pointer",
                        }}>
                            <Phone size={16} />
                            Llamar
                        </button>
                        <button style={{
                            display: "flex", flexDirection: "row", alignItems: "center", gap: "6px",
                            backgroundColor: "#944343", color: "white", border: "none",
                            borderRadius: "8px", padding: "6px 16px", fontSize: "14px", cursor: "pointer",
                        }}>
                            <Mail size={16} />
                            Email
                        </button>
                        <button style={{
                            display: "flex", flexDirection: "row", alignItems: "center", gap: "6px",
                            backgroundColor: "rgba(148,67,67,0.8)", color: "white", border: "none",
                            borderRadius: "8px", padding: "6px 12px", fontSize: "14px", cursor: "pointer",
                        }}>
                            <MapPin size={16} />
                            Cómo llegar
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating search bar */}
            <div style={{
                position: "absolute",
                bottom: "-18px",
                right: "40px",
                backgroundColor: "white",
                borderRadius: "9999px",
                paddingTop: "4px",
                paddingBottom: "4px",
                paddingLeft: "20px",
                paddingRight: "4px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                minWidth: "260px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}>
                <input
                    type="text"
                    placeholder={`Buscar en ${name}`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        border: "none",
                        outline: "none",
                        fontSize: "14px",
                        color: "#111827",
                        backgroundColor: "transparent",
                        flex: 1,
                        minWidth: 0,
                    }}
                />
                {search && (
                    <X
                        size={16}
                        style={{ color: "#9ca3af", cursor: "pointer", marginRight: "8px", flexShrink: 0 }}
                        onClick={() => setSearch("")}
                    />
                )}
                <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                }}>
                    <Search size={18} color="white" />
                </div>
            </div>
        </div>
    );
};