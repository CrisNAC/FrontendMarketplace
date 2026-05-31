import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { X, AlertCircle, Loader } from "lucide-react";

export function ConfirmationModal({
  isOpen,
  title,
  subtitle,
  warnings,
  description,
  onClose,
  onConfirm,
  confirmText,
  isLoading,
  error,
  icon: Icon,
  variant,
  loadingText,
}) {
  const [deleting, setDeleting] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && isOpen) {
      dialog.showModal();
    }

    const handleCancel = (e) => {
      if (deleting) {
        e.preventDefault();
      }
    };

    dialog?.addEventListener("cancel", handleCancel);

    return () => {
      if (dialog?.open) {
        dialog.close();
      }
      dialog?.removeEventListener("cancel", handleCancel);
    };
  }, [isOpen, deleting]);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!deleting) {
      const dialog = dialogRef.current;
      if (dialog?.open) {
        dialog.close();
      }
      onClose();
    }
  };

  const header = {
    padding: "20px 24px 16px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  };

  const body = { padding: "20px 24px" };

  const footer = {
    padding: "16px 24px",
    borderTop: "1px solid #f3f4f6",
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  };

  const btnPrimary = {
    padding: "9px 20px",
    borderRadius: "10px",
    backgroundColor: variant === "confirm" ? "#16a34a" : "#dc2626",
    color: "white",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: deleting ? "not-allowed" : "pointer",
    opacity: deleting ? 0.55 : 1,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const btnSecondary = {
    padding: "9px 20px",
    borderRadius: "10px",
    backgroundColor: "white",
    color: "#374151",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    fontWeight: "600",
    cursor: deleting ? "not-allowed" : "pointer",
    opacity: deleting ? 0.6 : 1,
  };

  const closeButtonStyle = {
    background: "none",
    border: "none",
    cursor: deleting ? "not-allowed" : "pointer",
    padding: "4px",
    borderRadius: "8px",
    color: "#9ca3af",
    opacity: deleting ? 0.6 : 1,
  };

  const buttonContent = isLoading || deleting
    ? <><Loader size={14} /> {isLoading ? "Cargando..." : (loadingText ?? "Procesando...")}</>
    : <>{Icon && <Icon size={14} />} {confirmText}</>;

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.45);
        }
        dialog {
          margin: auto;
          padding: 0;
          border: none;
          border-radius: 18px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18);
          max-width: 420px;
          width: calc(100% - 32px);
        }
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
        .spin { 
          animation: spin 1s linear infinite; 
        }
      `}</style>
      <dialog ref={dialogRef} aria-labelledby="confirmation-modal-title">
        <div>
          <div style={header}>
            <div>
              <p
                id="confirmation-modal-title"
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "#111827",
                  margin: "0 0 4px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {Icon && <Icon size={18} color="#dc2626" />}
                {title}
              </p>
              {subtitle && (
                <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={deleting}
              style={closeButtonStyle}
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>

          <div style={body}>
            {error && (
              <div
                style={{
                  backgroundColor: "#fff1f2",
                  border: "1px solid #fecdd3",
                  borderRadius: "10px",
                  padding: "11px 14px",
                  color: "#be123c",
                  fontSize: "13px",
                  marginBottom: "14px",
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            {warnings && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fee2e2",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  marginBottom: "14px",
                }}
              >
                {warnings.map((warning, idx) => (
                  <p
                    key={idx}
                    style={{
                      fontSize: idx === 0 ? "14px" : "13px",
                      color: idx === 0 ? "#7f1d1d" : "#b91c1c",
                      margin: idx === 0 ? "0" : "4px 0 0 0",
                      lineHeight: "1.5",
                    }}
                  >
                    {warning}
                  </p>
                ))}
              </div>
            )}

            {description && (
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                {description}
              </p>
            )}
          </div>

          <div style={footer}>
            <button
              type="button"
              style={btnSecondary}
              onClick={handleClose}
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              style={btnPrimary}
              onClick={handleConfirm}
              disabled={deleting || isLoading}
            >
              {buttonContent}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  warnings: PropTypes.arrayOf(PropTypes.string),
  description: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  confirmText: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  icon: PropTypes.elementType,
  variant: PropTypes.oneOf(["danger", "confirm"]),
  loadingText: PropTypes.string,
};

ConfirmationModal.defaultProps = {
  subtitle: null,
  warnings: null,
  description: null,
  isLoading: false,
  error: null,
  icon: null,
  variant: "danger",
  loadingText: "Procesando...",
};