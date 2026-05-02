/**
 * Modal de confirmación para vincular un repartidor al comercio.
 */
export function ConfirmLinkDeliveryModal({ open, candidate, onCancel, onConfirm, confirming }) {
    if (!open || !candidate) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-link-delivery-title"
            onClick={(e) => {
                if (e.target === e.currentTarget && !confirming) onCancel();
            }}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(15, 23, 42, 0.45)",
                padding: "16px",
            }}
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
        </div>
    );
}
