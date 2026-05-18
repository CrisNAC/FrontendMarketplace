// src/features/clients/components/DeleteAllCartsModal.jsx
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { X, Trash2, AlertCircle, Loader } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiBase } from "../../../../lib/cartApi";

export function DeleteAllCartsModal({ userId, totalCarts, totalItems, onClose, onSuccess }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);
  const apiBase = getApiBase() || "http://localhost:3000";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
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
  }, [deleting]);

  const handleDeleteAll = async () => {
    setDeleting(true);
    setError("");
    try {
      await axios.delete(
        `${apiBase}/api/users/${userId}/carts`,
        { withCredentials: true }
      );
      toast.success("Todas las órdenes fueron eliminadas correctamente");
      onSuccess?.();
      handleClose();
    } catch (err) {
      const message = err?.response?.data?.message || "No se pudo eliminar las órdenes";
      setError(message);
      console.error("Error eliminando carritos:", err);
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

  // ─── Estilos ────────────────────────────────────────────────────────────

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
    backgroundColor: "#dc2626",
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

  const deleteButtonContent = deleting
    ? <><Loader size={14} /> Eliminando...</>
    : <><Trash2 size={14} /> Eliminar todas</>;

  // ─── Render ──────────────────────────────────────────────────────────────

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
      <dialog
        ref={dialogRef}
        aria-labelledby="delete-all-modal-title"
      >
        <div>
          {/* Header */}
          <div style={header}>
            <div>
              <p
                id="delete-all-modal-title"
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
                <Trash2 size={18} color="#dc2626" /> Eliminar todas las órdenes
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Acción masiva
              </p>
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

          {/* Body */}
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

            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fee2e2",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "14px",
              }}
            >
              <p style={{ fontSize: "14px", color: "#7f1d1d", margin: 0, lineHeight: "1.5" }}>
                ¿Estás seguro de que deseas eliminar TODAS tus órdenes de compra?
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#b91c1c",
                  margin: "8px 0 0 0",
                }}
              >
                • Se eliminarán {totalCarts} {totalCarts === 1 ? "orden" : "órdenes"}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#b91c1c",
                  margin: "4px 0 0 0",
                }}
              >
                • Contiene {totalItems} {totalItems === 1 ? "producto" : "productos"} en total
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#b91c1c",
                  margin: "4px 0 0 0",
                }}
              >
                • Esta acción no se puede deshacer
              </p>
            </div>

            <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
              Todos los productos de tus órdenes se eliminarán permanentemente.
            </p>
          </div>

          {/* Footer */}
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
              onClick={handleDeleteAll}
              disabled={deleting}
            >
              {deleteButtonContent}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

DeleteAllCartsModal.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  totalCarts: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

DeleteAllCartsModal.defaultProps = {
  onSuccess: null,
};