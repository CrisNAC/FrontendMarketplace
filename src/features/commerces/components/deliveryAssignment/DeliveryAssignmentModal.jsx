// src/features/commerces/components/deliveryAssignment/DeliveryAssignmentModal.jsx
import { useState, useEffect } from "react";
import { X, Truck, MapPin, User, Phone, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { fetchAvailableDeliveries, createDeliveryAssignment, getAssignmentErrorMessage } from "../../services/deliveryAssignmentApi";

/**
 * Modal para asignar un delivery a un pedido.
 *
 * Props:
 *   order    — { id, address } del pedido a delegar
 *   storeId  — id del comercio autenticado
 *   onClose  — función para cerrar el modal
 *   onSuccess — función llamada cuando la asignación se creó exitosamente
 */
export function DeliveryAssignmentModal({ order, storeId, onClose, onSuccess }) {
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

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

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    setError("");
    try {
      await createDeliveryAssignment(order.id, selected);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(getAssignmentErrorMessage(err, "No se pudo crear la asignación."));
    } finally {
      setAssigning(false);
    }
  };

  // ─── Estilos ──────────────────────────────────────────────────────────────

  const overlay = {
    position: "fixed", inset: 0, zIndex: 1000,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "16px",
  };

  const modal = {
    backgroundColor: "white", borderRadius: "18px",
    width: "100%", maxWidth: "460px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
    overflow: "hidden",
  };

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

  const deliveryCard = (d) => ({
    display: "flex", alignItems: "center", gap: "14px",
    padding: "13px 16px", borderRadius: "12px",
    border: `2px solid ${selected === d.id_delivery ? "var(--primary-dark, #374151)" : "#e5e7eb"}`,
    backgroundColor: selected === d.id_delivery ? "var(--primary-light, #f9fafb)" : "white",
    cursor: "pointer", marginBottom: "10px",
    transition: "border-color 0.15s, background-color 0.15s",
  });

  const avatar = (d) => ({
    width: "40px", height: "40px", borderRadius: "50%",
    objectFit: "cover",
    backgroundColor: "#f3f4f6",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  });

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
    cursor: "pointer",
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal}>

        {/* Header */}
        <div style={header}>
          <div>
            <p style={{ fontSize: "17px", fontWeight: "700", color: "#111827", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <Truck size={18} /> Asignar delivery
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
              Pedido #ORD-{order.id}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "8px", color: "#9ca3af" }}>
            <X size={20} />
          </button>
        </div>

        {/* Dirección de entrega */}
        {deliveryAddress && (
          <div style={{ padding: "12px 24px", backgroundColor: "#f9fafb", borderBottom: "1px solid #f3f4f6", display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <MapPin size={15} color="#6b7280" style={{ marginTop: "2px", flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Dirección de entrega</p>
              <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>
                {deliveryAddress.address}, {deliveryAddress.city}
                {deliveryAddress.region ? `, ${deliveryAddress.region}` : ""}
              </p>
            </div>
          </div>
        )}

        {/* Body */}
        <div style={body}>
          {error && (
            <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "11px 14px", color: "#be123c", fontSize: "13px", marginBottom: "14px", display: "flex", gap: "8px", alignItems: "center" }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", gap: "10px", color: "#9ca3af" }}>
              <Loader size={18} className="spin" />
              <span style={{ fontSize: "14px" }}>Cargando deliveries...</span>
            </div>
          ) : deliveries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <Truck size={36} color="#d1d5db" style={{ marginBottom: "10px" }} />
              <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: "0 0 6px 0" }}>
                No hay deliveries disponibles
              </p>
              <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>
                Esperá a que alguno esté activo o vinculá uno nuevo a tu tienda.
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 14px 0" }}>
                Elegí un delivery para asignar este pedido:
              </p>
              {deliveries.map((d) => (
                <div key={d.id_delivery} style={deliveryCard(d)} onClick={() => setSelected(d.id_delivery)}>
                  {/* Avatar */}
                  <div style={avatar(d)}>
                    {d.avatar_url
                      ? <img src={d.avatar_url} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <User size={18} color="#9ca3af" />
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#111827", margin: "0 0 3px 0" }}>{d.name}</p>
                    {d.phone && (
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                        <Phone size={11} /> {d.phone}
                      </p>
                    )}
                  </div>

                  {/* Checkmark */}
                  {selected === d.id_delivery && (
                    <CheckCircle size={20} color="var(--primary-dark, #111827)" style={{ flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={footer}>
          <button style={btnSecondary} onClick={onClose} disabled={assigning}>
            Cancelar
          </button>
          <button style={btnPrimary} onClick={handleAssign} disabled={assigning || !selected}>
            {assigning ? (
              <><Loader size={14} /> Asignando...</>
            ) : (
              <><Truck size={14} /> Asignar delivery</>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}