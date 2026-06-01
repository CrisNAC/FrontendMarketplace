// src/features/commerces/pages/StoreBusinessHoursPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Save, ArrowLeft } from "lucide-react";
import { apiClient, getBackendErrorMessage } from "../services/editCommerceApi";
import { PageLoader } from "../../../components/PageLoader";
import { useStoreAvailability } from "../../../hooks/useStoreAvailability";

const WEEKDAYS = [
    { day_of_week: 0, label: "Lunes" },
    { day_of_week: 1, label: "Martes" },
    { day_of_week: 2, label: "Miércoles" },
    { day_of_week: 3, label: "Jueves" },
    { day_of_week: 4, label: "Viernes" },
    { day_of_week: 5, label: "Sábado" },
    { day_of_week: 6, label: "Domingo" },
];

const card = {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const inputStyle = {
    padding: "8px 10px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "#f9fafb",
};

const mergeSchedules = (apiSchedules = []) => {
    const byDay = new Map(apiSchedules.map((item) => [item.day_of_week, item]));

    return WEEKDAYS.map((day) => {
        const existing = byDay.get(day.day_of_week);
        if (!existing) {
            return {
                day_of_week: day.day_of_week,
                day_label: day.label,
                is_closed: true,
                open_time: "08:00",
                close_time: "18:00",
            };
        }

        return {
            day_of_week: day.day_of_week,
            day_label: day.label,
            is_closed: Boolean(existing.is_closed),
            open_time: existing.open_time || "08:00",
            close_time: existing.close_time || "18:00",
        };
    });
};

export function StoreBusinessHoursPage() {
    const navigate = useNavigate();
    const [storeId, setStoreId] = useState(null);
    const [schedules, setSchedules] = useState(() => mergeSchedules());
    const [apiAvailability, setApiAvailability] = useState({
        is_open: false,
        close_time: null,
        open_time: null,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const sessionRes = await apiClient.get("/api/session/user-session");
                const idStore = sessionRes.data?.user?.id_store;
                if (!idStore) {
                    throw new Error("No tenés un comercio registrado.");
                }

                const res = await apiClient.get(`/api/commerces/${idStore}/business-hours`);
                if (!active) return;

                const data = res.data?.data ?? res.data;
                setStoreId(idStore);
                setSchedules(mergeSchedules(data?.schedules));
                setApiAvailability({
                    is_open: Boolean(data?.is_open),
                    close_time: data?.close_time ?? null,
                    open_time: data?.open_time ?? null,
                });
            } catch (err) {
                if (active) {
                    setError(getBackendErrorMessage(err, "No se pudieron cargar los horarios."));
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        load();
        return () => { active = false; };
    }, []);

    const availability = useStoreAvailability(schedules, apiAvailability);
    const { is_open: isOpen, close_time: closeTime } = availability;

    const statusLabel = useMemo(() => {
        if (isOpen && closeTime) return `Abierto · Cierra a las ${closeTime}`;
        if (isOpen) return "Abierto";
        return "Cerrado";
    }, [isOpen, closeTime]);

    const updateDay = (dayOfWeek, patch) => {
        setSchedules((prev) =>
            prev.map((item) =>
                item.day_of_week === dayOfWeek ? { ...item, ...patch } : item
            )
        );
        setSuccess("");
    };

    const handleSave = async () => {
        if (!storeId) return;

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                schedules: schedules.map((item) => ({
                    day_of_week: item.day_of_week,
                    is_closed: item.is_closed,
                    open_time: item.is_closed ? null : item.open_time,
                    close_time: item.is_closed ? null : item.close_time,
                })),
            };

            const res = await apiClient.put(`/api/commerces/${storeId}/business-hours`, payload);
            const data = res.data?.data ?? res.data;

            setSchedules(mergeSchedules(data?.schedules));
            setApiAvailability({
                is_open: Boolean(data?.is_open),
                close_time: data?.close_time ?? null,
                open_time: data?.open_time ?? null,
            });
            setSuccess("Horarios guardados correctamente.");
        } catch (err) {
            setError(getBackendErrorMessage(err, "No se pudieron guardar los horarios."));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div>
            <div style={{ marginBottom: "20px" }}>
                <button
                    type="button"
                    onClick={() => navigate("/comercio/perfil")}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        border: "none",
                        background: "transparent",
                        color: "#6b7280",
                        cursor: "pointer",
                        fontSize: "14px",
                        marginBottom: "12px",
                    }}
                >
                    <ArrowLeft size={16} />
                    Volver al perfil
                </button>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Horarios de atención</h4>
                        <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                            Configurá cuándo está disponible tu comercio para los compradores.
                        </p>
                    </div>
                    <span style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        backgroundColor: isOpen ? "#dcfce7" : "#fee2e2",
                        color: isOpen ? "#15803d" : "#b91c1c",
                    }}>
                        {statusLabel}
                    </span>
                </div>
            </div>

            {error && (
                <div style={{
                    backgroundColor: "#fff1f2",
                    border: "1px solid #fecdd3",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    color: "#be123c",
                    fontSize: "14px",
                    marginBottom: "16px",
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    backgroundColor: "#ecfdf5",
                    border: "1px solid #bbf7d0",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    color: "#15803d",
                    fontSize: "14px",
                    marginBottom: "16px",
                }}>
                    {success}
                </div>
            )}

            <div style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Clock size={18} color="#6b9080" />
                    <h6 style={{ fontWeight: "700", fontSize: "15px", margin: 0 }}>Horarios por día</h6>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {schedules.map((day) => (
                        <div
                            key={day.day_of_week}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "120px 1fr 1fr 1fr",
                                gap: "12px",
                                alignItems: "center",
                                padding: "12px",
                                borderRadius: "10px",
                                backgroundColor: "#f9fafb",
                            }}
                        >
                            <strong style={{ fontSize: "14px" }}>{day.day_label}</strong>

                            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                                <input
                                    type="checkbox"
                                    checked={day.is_closed}
                                    onChange={(e) => updateDay(day.day_of_week, { is_closed: e.target.checked })}
                                />
                                Cerrado
                            </label>

                            <input
                                type="time"
                                value={day.open_time}
                                disabled={day.is_closed}
                                onChange={(e) => updateDay(day.day_of_week, { open_time: e.target.value })}
                                style={{ ...inputStyle, opacity: day.is_closed ? 0.5 : 1 }}
                            />

                            <input
                                type="time"
                                value={day.close_time}
                                disabled={day.is_closed}
                                onChange={(e) => updateDay(day.day_of_week, { close_time: e.target.value })}
                                style={{ ...inputStyle, opacity: day.is_closed ? 0.5 : 1 }}
                            />
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !storeId}
                    style={{
                        marginTop: "20px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        backgroundColor: "var(--primary-dark)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 18px",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: saving || !storeId ? "not-allowed" : "pointer",
                        opacity: saving || !storeId ? 0.7 : 1,
                    }}
                >
                    <Save size={16} />
                    {saving ? "Guardando..." : "Guardar horarios"}
                </button>
            </div>
        </div>
    );
}
