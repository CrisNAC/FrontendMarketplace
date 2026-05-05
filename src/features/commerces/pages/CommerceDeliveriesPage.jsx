import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Plus, Phone, Mail, User, Star } from "lucide-react";
import { apiClient as commerceApiClient } from "../services/editCommerceApi";
import { readCachedStoreDeliveries } from "../utils/storeDeliveriesLocalCache";

const STATUS_LABEL = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    AVAILABLE: "Disponible",
    BUSY: "Ocupado",
    OFFLINE: "Fuera de línea",
};

function statusLabel(code) {
    if (!code) return "—";
    return STATUS_LABEL[code] ?? code;
}

export function CommerceDeliveriesPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rows, setRows] = useState([]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await commerceApiClient.get("/api/session/user-session");
                const sid = res.data?.user?.id_store;
                if (!active) return;
                if (!sid) {
                    setError("No tenés un comercio registrado.");
                    setLoading(false);
                    return;
                }
                setRows(readCachedStoreDeliveries(sid));
            } catch {
                if (active) setError("No se pudo cargar la sesión.");
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return <p style={{ color: "#6b7280", padding: "16px" }}>Cargando…</p>;
    }

    if (error) {
        return (
            <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px" }}>
                {error}
            </div>
        );
    }

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                <div>
                    <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Delivery</h4>
                    <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                        Repartidores vinculados a tu comercio. Agregá uno buscando por correo o teléfono.
                    </p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                <button
                    type="button"
                    onClick={() => navigate("/comercio/delivery")}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        backgroundColor: "white",
                        color: "#374151",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                    }}
                >
                    <Star size={18} />
                    Ver reseñas
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/comercio/deliveries/agregar")}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "none",
                        background: "var(--primary-dark)",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        flexShrink: 0,
                    }}
                >
                    <Plus size={18} /> Agregar delivery
                </button>
                </div>
            </div>

            {rows.length === 0 ? (
                <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "48px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <Truck size={40} color="#d1d5db" style={{ marginBottom: "12px" }} />
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>Todavía no agregaste repartidores</p>
                    <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 20px 0" }}>
                        Usá el buscador para encontrar repartidores por correo o teléfono y vincularlos a tu comercio.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/comercio/deliveries/agregar")}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 18px",
                            borderRadius: "10px",
                            border: "none",
                            background: "var(--primary-dark)",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "14px",
                            cursor: "pointer",
                        }}
                    >
                        <Plus size={18} /> Agregar delivery
                    </button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {rows.map((row) => (
                        <div
                            key={row.fk_user ?? row.id_delivery}
                            style={{
                                backgroundColor: "white",
                                borderRadius: "14px",
                                padding: "16px 18px",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                                display: "grid",
                                gridTemplateColumns: "1fr auto",
                                gap: "12px",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <p style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "700", color: "#111827" }}>{row.name ?? "—"}</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 20px", fontSize: "13px", color: "#4b5563" }}>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                        <Phone size={14} color="#9ca3af" /> {row.phone ?? "—"}
                                    </span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                        <Mail size={14} color="#9ca3af" /> {row.email ?? "—"}
                                    </span>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                        <User size={14} color="#9ca3af" /> Estado: {statusLabel(row.delivery_status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

export default CommerceDeliveriesPage;
