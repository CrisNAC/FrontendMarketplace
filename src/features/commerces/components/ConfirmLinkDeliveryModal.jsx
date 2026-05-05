import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

/**
 * Modal de confirmación para vincular un repartidor al comercio.
 * Usa <dialog> nativo para accesibilidad (Sonar: evitar role="dialog" en div).
 */
export function ConfirmLinkDeliveryModal({ open, candidate, onCancel, onConfirm, confirming = false }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        const el = dialogRef.current;
        if (!el) return;
        if (open && candidate) {
            if (!el.open) el.showModal();
        } else if (el.open) {
            el.close();
        }
    }, [open, candidate]);

    useEffect(() => {
        const el = dialogRef.current;
        if (!el) return;
        const handleCancel = (event) => {
            if (confirming) {
                event.preventDefault();
                return;
            }
            onCancel();
        };
        el.addEventListener("cancel", handleCancel);
        return () => el.removeEventListener("cancel", handleCancel);
    }, [confirming, onCancel]);

    if (!candidate) return null;

    return (
        <dialog
            ref={dialogRef}
            className="confirm-link-delivery-modal"
            aria-labelledby="confirm-link-delivery-title"
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "14px",
                    maxWidth: "420px",
                    width: "100%",
                    padding: "22px 24px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                }}
            >
                <h2 id="confirm-link-delivery-title" style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: "700", color: "#111827" }}>
                    ¿Agregar a tu comercio?
                </h2>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#4b5563", lineHeight: 1.5 }}>
                    Se vinculará a <strong>{candidate.name}</strong> como repartidor de tu comercio.
                </p>
                <p style={{ margin: "0 0 18px 0", fontSize: "13px", color: "#6b7280" }}>{candidate.email}</p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        disabled={confirming}
                        onClick={onCancel}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            background: "white",
                            color: "#374151",
                            fontWeight: "600",
                            fontSize: "14px",
                            cursor: confirming ? "not-allowed" : "pointer",
                            opacity: confirming ? 0.6 : 1,
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        disabled={confirming}
                        onClick={onConfirm}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "none",
                            background: "var(--primary-dark)",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "14px",
                            cursor: confirming ? "not-allowed" : "pointer",
                            opacity: confirming ? 0.7 : 1,
                        }}
                    >
                        {confirming ? "Agregando…" : "Confirmar"}
                    </button>
                </div>
            </div>
        </dialog>
    );
}

ConfirmLinkDeliveryModal.propTypes = {
    open: PropTypes.bool.isRequired,
    candidate: PropTypes.shape({
        id_user: PropTypes.number.isRequired,
        name: PropTypes.string,
        email: PropTypes.string,
        phone: PropTypes.string,
    }),
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    confirming: PropTypes.bool,
};
