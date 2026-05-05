import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, ArrowLeft, User, Phone, Mail, Package, Percent, Star } from "lucide-react";
import { apiClient as commerceApiClient } from "../services/editCommerceApi";
import {
    searchDeliveries,
    linkDeliveryToStore,
    getStoreDeliveryErrorMessage,
} from "../services/commerceStoreDeliveryApi";
import { prependCachedStoreDelivery } from "../utils/storeDeliveriesLocalCache";
import { ConfirmLinkDeliveryModal } from "../components/ConfirmLinkDeliveryModal";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";

function pickStats(c) {
    return {
        deliveries: c.total_deliveries ?? c.deliveries_count ?? c.completed_deliveries ?? null,
        success: c.success_rate ?? c.success_percent ?? null,
        rating: c.average_rating ?? c.rating ?? c.avg_rating ?? null,
    };
}

function formatDeliveriesCount(v) {
    if (v == null || v === "") return "—";
    const n = Number(v);
    return Number.isFinite(n) ? String(Math.round(n)) : "—";
}

function formatSuccess(v) {
    if (v == null || v === "") return "—";
    const n = Number(v);
    if (!Number.isFinite(n)) return "—";
    if (n >= 0 && n <= 1) return `${Math.round(n * 100)} %`;
    return `${Math.round(n)} %`;
}

function formatRating(v) {
    if (v == null || v === "") return "—";
    const n = Number(v);
    if (!Number.isFinite(n)) return "—";
    return `${n.toFixed(1)} / 5`;
}

function buildAvailabilityLabel(displayedLen, candidatesLen) {
    if (displayedLen === candidatesLen) {
        const suffix = candidatesLen === 1 ? "" : "s";
        return `${candidatesLen} disponible${suffix}`;
    }
    return `${displayedLen} de ${candidatesLen}`;
}

function getEmptyListMessage(noCandidatesInList) {
    if (noCandidatesInList) {
        return "No hay repartidores disponibles por ahora.";
    }
    return "Ningún resultado coincide con el filtro.";
}

function ResultCard({ candidate, onAdd }) {
    const stats = useMemo(() => pickStats(candidate), [candidate]);

    const row = (IconCmp, label, value) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#374151" }}>
            <IconCmp size={15} color="#6b7280" style={{ flexShrink: 0 }} />
            <span style={{ color: "#6b7280", minWidth: "88px" }}>{label}</span>
            <span style={{ fontWeight: "600", color: "#111827" }}>{value}</span>
        </div>
    );

    return (
        <div
            style={{
                backgroundColor: "white",
                borderRadius: "14px",
                padding: "16px 18px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "700", color: "#111827" }}>{candidate.name ?? "—"}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {row(Phone, "Teléfono", candidate.phone ?? "—")}
                        {row(Mail, "Correo", candidate.email ?? "—")}
                        {row(Package, "Entregas", formatDeliveriesCount(stats.deliveries))}
                        {row(Percent, "% éxito", formatSuccess(stats.success))}
                        {row(Star, "Calificación", formatRating(stats.rating))}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => onAdd(candidate)}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: "var(--primary-dark)",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        flexShrink: 0,
                        alignSelf: "flex-start",
                    }}
                >
                    Agregar
                </button>
            </div>
        </div>
    );
}

ResultCard.propTypes = {
    candidate: PropTypes.shape({
        id_user: PropTypes.number.isRequired,
        name: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
    }).isRequired,
    onAdd: PropTypes.func.isRequired,
};

export function AddStoreDeliveryPage() {
    const navigate = useNavigate();
    const [storeId, setStoreId] = useState(null);
    const [sessionError, setSessionError] = useState("");
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebouncedValue(query, 200);

    const [candidates, setCandidates] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [listError, setListError] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await commerceApiClient.get("/api/session/user-session");
                const sid = res.data?.user?.id_store;
                if (!active) return;
                if (!sid) {
                    setSessionError("No tenés un comercio registrado.");
                    return;
                }
                setStoreId(sid);
            } catch {
                if (active) setSessionError("No se pudo cargar la sesión.");
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (storeId == null) return;
        let active = true;
        (async () => {
            setLoadingList(true);
            setListError("");
            try {
                const data = await searchDeliveries();
                if (!active) return;
                setCandidates(data);
            } catch (err) {
                if (!active) return;
                setCandidates([]);
                setListError(getStoreDeliveryErrorMessage(err, "No se pudo cargar la lista de repartidores."));
            } finally {
                if (active) setLoadingList(false);
            }
        })();
        return () => {
            active = false;
        };
    }, [storeId]);

    const displayed = useMemo(() => {
        const q = debouncedQuery.trim().toLowerCase();
        if (!q) return candidates;
        return candidates.filter((c) => {
            const name = (c.name || "").toLowerCase();
            const email = (c.email || "").toLowerCase();
            const phone = c.phone || "";
            return name.includes(q) || email.includes(q) || phone.includes(debouncedQuery.trim());
        });
    }, [candidates, debouncedQuery]);

    const handleConfirmLink = async () => {
        if (!selected || storeId == null) return;
        setConfirming(true);
        try {
            const created = await linkDeliveryToStore(storeId, selected.id_user);
            prependCachedStoreDelivery(storeId, {
                id_delivery: created?.id_delivery,
                fk_user: selected.id_user,
                name: selected.name,
                email: selected.email,
                phone: selected.phone,
                delivery_status: created?.delivery_status ?? "INACTIVE",
            });
            toast.success("Repartidor agregado a tu comercio.");
            setModalOpen(false);
            setSelected(null);
            navigate("/delivery");
        } catch (err) {
            toast.error(getStoreDeliveryErrorMessage(err, "No se pudo agregar al repartidor."));
        } finally {
            setConfirming(false);
        }
    };

    if (sessionError) {
        return (
            <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px" }}>
                {sessionError}
            </div>
        );
    }

    return (
        <>
            <div style={{ marginBottom: "20px" }}>
                <button
                    type="button"
                    onClick={() => navigate("/delivery")}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 0",
                        border: "none",
                        background: "none",
                        color: "var(--primary-dark)",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        marginBottom: "12px",
                    }}
                >
                    <ArrowLeft size={18} /> Volver al listado
                </button>
                <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Agregar delivery</h4>
                <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
                    Acá ves todos los repartidores disponibles para vincular. Podés filtrar por nombre, correo o teléfono.
                </p>
            </div>

            <div style={{ position: "relative", marginBottom: "20px" }}>
                <Search size={18} color="#9ca3af" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filtrar por nombre, correo o teléfono…"
                    autoComplete="off"
                    style={{
                        width: "100%",
                        maxWidth: "480px",
                        padding: "12px 14px 12px 44px",
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        fontSize: "15px",
                        outline: "none",
                        boxSizing: "border-box",
                    }}
                />
                {!loadingList && candidates.length > 0 && (
                    <span style={{ marginLeft: "12px", fontSize: "13px", color: "#6b7280" }}>
                        {buildAvailabilityLabel(displayed.length, candidates.length)}
                    </span>
                )}
                {loadingList && (
                    <span style={{ marginLeft: "12px", fontSize: "13px", color: "#6b7280" }}>Cargando lista…</span>
                )}
            </div>

            {listError && (
                <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", color: "#be123c", fontSize: "14px", marginBottom: "16px" }}>
                    {listError}
                </div>
            )}

            {!loadingList && !listError && displayed.length === 0 && (
                <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    <User size={40} color="#d1d5db" style={{ marginBottom: "12px" }} />
                    <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: 0 }}>
                        {getEmptyListMessage(candidates.length === 0)}
                    </p>
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {displayed.map((c) => (
                    <ResultCard key={c.id_user} candidate={c} onAdd={(row) => { setSelected(row); setModalOpen(true); }} />
                ))}
            </div>

            <ConfirmLinkDeliveryModal
                open={modalOpen}
                candidate={selected}
                confirming={confirming}
                onCancel={() => { if (!confirming) { setModalOpen(false); setSelected(null); } }}
                onConfirm={handleConfirmLink}
            />
        </>
    );
}

export default AddStoreDeliveryPage;
