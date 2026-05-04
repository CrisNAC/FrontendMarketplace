// src/features/commerces/components/deliveryAssignment/DeliveryAssignmentModal.jsx
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { X, Truck, MapPin, User, Phone, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { fetchAvailableDeliveries, createDeliveryAssignment, getAssignmentErrorMessage } from "../../services/deliveryAssignmentApi";

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function DeliveryAddress({ address }) {
  if (!address) return null;
  return (
    <div style={{ padding: "12px 24px", backgroundColor: "#f9fafb", borderBottom: "1px solid #f3f4f6", display: "flex", gap: "8px", alignItems: "flex-start" }}>
      <MapPin size={15} color="#6b7280" style={{ marginTop: "2px", flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Dirección de entrega
        </p>
        <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>
          {address.address}, {address.city}
          {address.region ? `, ${address.region}` : ""}
        </p>
      </div>
    </div>
  );
}

DeliveryAddress.propTypes = {
  address: PropTypes.shape({
    address: PropTypes.string,
    city: PropTypes.string,
    region: PropTypes.string,
  }),
};

DeliveryAddress.defaultProps = {
  address: null,
};

function DeliveryCard({ delivery, isSelected, onSelect }) {
  const cardStyle = {
    display: "flex", alignItems: "center", gap: "14px",
    padding: "13px 16px", borderRadius: "12px",
    border: `2px solid ${isSelected ? "var(--primary-dark, #374151)" : "#e5e7eb"}`,
    backgroundColor: isSelected ? "var(--primary-light, #f9fafb)" : "white",
    cursor: "pointer", marginBottom: "10px",
    transition: "border-color 0.15s, background-color 0.15s",
  };

  const avatarStyle = {
    width: "40px", height: "40px", borderRadius: "50%",
    backgroundColor: "#f3f4f6",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, overflow: "hidden",
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <button
      type="button"
      style={cardStyle}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
    >
      <div style={avatarStyle}>
        {delivery.avatar_url
          ? <img src={delivery.avatar_url} alt={delivery.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <User size={18} color="#9ca3af" />
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: "0 0 3px 0" }}>{delivery.name}</p>
        {delivery.phone && (
          <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
            <Phone size={11} /> {delivery.phone}
          </p>
        )}
      </div>

      {isSelected && (
        <CheckCircle size={20} color="var(--primary-dark, #111827)" style={{ flexShrink: 0 }} />
      )}
    </button>
  );
}

DeliveryCard.propTypes = {
  delivery: PropTypes.shape({
    id_delivery: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    avatar_url: PropTypes.string,
    phone: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

function BodyContent({ loading, deliveries, selected, onSelect }) {
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", gap: "10px", color: "#9ca3af" }}>
        <Loader size={18} className="spin" />
        <span style={{ fontSize: "14px" }}>Cargando deliveries...</span>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 16px" }}>
        <Truck size={36} color="#d1d5db" style={{ marginBottom: "10px" }} />
        <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: "0 0 6px 0" }}>
          No hay deliveries disponibles
        </p>
        <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>
          Esperá a que alguno esté activo o vinculá uno nuevo a tu tienda.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 14px 0" }}>
        Elegí un delivery para asignar este pedido:
      </p>
      {deliveries.map((d) => (
        <DeliveryCard
          key={d.id_delivery}
          delivery={d}
          isSelected={selected === d.id_delivery}
          onSelect={() => onSelect(d.id_delivery)}
        />
      ))}
    </div>
  );
}

BodyContent.propTypes = {
  loading: PropTypes.bool.isRequired,
  deliveries: PropTypes.arrayOf(
    PropTypes.shape({ id_delivery: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) })
  ).isRequired,
  selected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelect: PropTypes.func.isRequired,
};

BodyContent.defaultProps = {
  selected: null,
};

// ─── Modal principal ──────────────────────────────────────────────────────────

export function DeliveryAssignmentModal({ order, storeId, onClose, onSuccess }) {
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAvailableDeliveries(storeId, order.id);
        setDeliveries(data.available_deliveries ?? []);
        setDeliveryAddress(data.delivery_address ?? null);
      } catch (err) {
        setError(getAssignmentErrorMessage(err, "No se pudieron cargar los deliveries."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storeId, order.id]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.showModal();
    }

    const handleCancel = (e) => {
      if (assigning) {
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
  }, [assigning]);

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    setError("");
    try {
      await createDeliveryAssignment(order.id, selected);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(getAssignmentErrorMessage(err, "No se pudo crear la asignación."));
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    if (!assigning) {
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
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
  };

  const body = { padding: "20px 24px", maxHeight: "55vh", overflowY: "auto" };

  const footer = {
    padding: "16px 24px",
    borderTop: "1px solid #f3f4f6",
    display: "flex", gap: "10px", justifyContent: "flex-end",
  };

  const btnPrimary = {
    padding: "9px 20px", borderRadius: "10px",
    backgroundColor: "var(--primary-dark, #111827)", color: "white",
    border: "none", fontSize: "14px", fontWeight: "600",
    cursor: assigning || !selected ? "not-allowed" : "pointer",
    opacity: assigning || !selected ? 0.55 : 1,
    display: "flex", alignItems: "center", gap: "6px",
  };

  const btnSecondary = {
    padding: "9px 20px", borderRadius: "10px",
    backgroundColor: "white", color: "#374151",
    border: "1px solid #e5e7eb", fontSize: "14px", fontWeight: "600",
    cursor: assigning ? "not-allowed" : "pointer",
    opacity: assigning ? 0.6 : 1,
  };

  const closeButtonStyle = {
    background: "none",
    border: "none",
    cursor: assigning ? "not-allowed" : "pointer",
    padding: "4px",
    borderRadius: "8px",
    color: "#9ca3af",
    opacity: assigning ? 0.6 : 1,
  };

  // Ternario extraído a variable independiente (fix Sonar)
  const assignButtonContent = assigning
    ? <><Loader size={14} /> Asignando...</>
    : <><Truck size={14} /> Asignar delivery</>;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.45);
        }
        dialog {
          padding: 0;
          border: none;
          border-radius: 18px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18);
          max-width: 460px;
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
        aria-labelledby="modal-title"
      >
        <div>
          {/* Header */}
          <div style={header}>
            <div>
              <p id="modal-title" style={{ fontSize: "17px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={18} /> Asignar delivery
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
                Pedido #ORD-{order.id}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={assigning}
              style={closeButtonStyle}
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Dirección de entrega */}
          <DeliveryAddress address={deliveryAddress} />

          {/* Body */}
          <div style={body}>
            {error && (
              <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "11px 14px", color: "#be123c", fontSize: "13px", marginBottom: "14px", display: "flex", gap: "8px", alignItems: "center" }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}
            <BodyContent
              loading={loading}
              deliveries={deliveries}
              selected={selected}
              onSelect={setSelected}
            />
          </div>

          {/* Footer */}
          <div style={footer}>
            <button
              type="button"
              style={btnSecondary}
              onClick={handleClose}
              disabled={assigning}
            >
              Cancelar
            </button>
            <button
              type="button"
              style={btnPrimary}
              onClick={handleAssign}
              disabled={assigning || !selected}
            >
              {assignButtonContent}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

DeliveryAssignmentModal.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  storeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

DeliveryAssignmentModal.defaultProps = {
  onSuccess: null,
};