import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, Image, X } from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import { getAllBannerRequests, reviewBannerRequest } from "../../commerces/services/commerceBannerRequestsApi";

const cardStyle = {
  backgroundColor: "var(--background-white)",
  borderRadius: "14px",
  padding: "20px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const STATUS_BADGE = {
  PENDING:  { label: "Pendiente", color: "#1d4ed8", bg: "#dbeafe" },
  ACTIVE:   { label: "Aprobado",  color: "#15803d", bg: "#dcfce7" },
  REJECTED: { label: "Rechazado", color: "#b91c1c", bg: "#fee2e2" },
};

const RejectModal = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  const [reason, setReason] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setReason("");
    const focusId = setTimeout(() => textareaRef.current?.focus(), 0);
    return () => clearTimeout(focusId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape" && !isSubmitting) onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={-1}
        onClick={isSubmitting ? undefined : onClose}
        style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(0,0,0,0.45)", border: "none", cursor: isSubmitting ? "default" : "pointer" }}
      />
      <dialog
        open
        aria-labelledby="modal-title-reject"
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 61, backgroundColor: "white", borderRadius: "16px", padding: "24px", maxWidth: "440px", width: "calc(100% - 32px)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", border: "none", margin: 0 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 id="modal-title-reject" style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Rechazar solicitud</h3>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Cerrar modal" style={{ background: "none", border: "none", cursor: isSubmitting ? "not-allowed" : "pointer", color: "#6b7280" }}>
            <X size={20} />
          </button>
        </div>

        <div>
          <label htmlFor="reject-reason" style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>Motivo de rechazo (opcional)</label>
          <textarea
            ref={textareaRef}
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explicá brevemente el motivo..."
            rows={3}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", marginTop: "6px", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", fontSize: "14px", cursor: isSubmitting ? "not-allowed" : "pointer" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim() || null)}
            disabled={isSubmitting}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#dc2626", color: "white", fontSize: "14px", fontWeight: "600", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? "Rechazando..." : "Rechazar"}
          </button>
        </div>
      </dialog>
    </>
  );
};

RejectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

export const AdminBannerRequestsPage = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewingId, setReviewingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllBannerRequests(statusFilter ? { approvalStatus: statusFilter } : {});
      setRequests(result.data ?? []);
    } catch (err) {
      showToast(err?.response?.data?.error?.message ?? "No se pudieron cargar las solicitudes", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (requestId) => {
    setReviewingId(requestId);
    try {
      await reviewBannerRequest(requestId, { decision: "APPROVE" });
      showToast("Solicitud aprobada", "success");
      await loadRequests();
    } catch (err) {
      showToast(err?.response?.data?.error?.message ?? "No se pudo aprobar la solicitud", "error");
    } finally {
      setReviewingId(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    setIsSubmitting(true);
    try {
      await reviewBannerRequest(rejectTarget, { decision: "REJECT", rejectionReason: reason });
      showToast("Solicitud rechazada", "success");
      setRejectTarget(null);
      await loadRequests();
    } catch (err) {
      showToast(err?.response?.data?.error?.message ?? "No se pudo rechazar la solicitud", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = requests.filter((r) => r.approvalStatus === "PENDING").length;
  const pluralSuffix = pendingCount === 1 ? "" : "s";

  return (
    <div style={{ maxWidth: "1100px", paddingBottom: "40px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0 }}>Solicitudes de banners</h1>
        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>
          Revisá y gestioná las solicitudes de banners enviadas por los comercios.
        </p>
      </div>

      {pendingCount > 0 && (
        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#92400e" }}>
          Hay <strong>{pendingCount}</strong> solicitud{pluralSuffix} pendiente{pluralSuffix} de revisión.
        </div>
      )}

      <div style={{ ...cardStyle, marginBottom: "16px" }}>
        <p style={{ margin: "0 0 12px", fontWeight: "600", fontSize: "14px" }}>Filtros</p>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", color: "#374151", background: "white", cursor: "pointer" }}
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendientes</option>
          <option value="ACTIVE">Aprobados</option>
          <option value="REJECTED">Rechazados</option>
        </select>
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>
            Cargando solicitudes...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: "14px" }}>
            <Image size={40} color="#d1d5db" style={{ margin: "0 auto 10px", display: "block" }} />
            No hay solicitudes para mostrar.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {requests.map((req) => {
              const badge = STATUS_BADGE[req.approvalStatus] ?? STATUS_BADGE.PENDING;
              const isActioning = isSubmitting || reviewingId === req.id || (rejectTarget === req.id && isSubmitting);
              return (
                <div key={req.id} style={{ display: "flex", gap: "16px", padding: "16px 8px", borderBottom: "1px solid #f3f4f6", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ width: "72px", height: "48px", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden", backgroundColor: "#f3f4f6", flexShrink: 0 }}>
                    <img src={req.imageUrl} alt={req.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  <div style={{ flex: "2", minWidth: "200px" }}>
                    <p style={{ margin: "0 0 2px", fontWeight: "600", fontSize: "14px", color: "#111827" }}>{req.title}</p>
                    {req.description && (
                      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{req.description}</p>
                    )}
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9ca3af" }}>
                      Comercio: <strong style={{ color: "#374151" }}>{req.storeName || req.storeId}</strong>
                    </p>
                    {req.approvalStatus === "REJECTED" && req.rejectionReason && (
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#b91c1c" }}>
                        Motivo: {req.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "160px" }}>
                    <Calendar size={14} color="#6b7280" />
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      {req.startAt ? new Date(req.startAt).toLocaleDateString("es-PY") : "-"}
                      {req.endAt ? ` → ${new Date(req.endAt).toLocaleDateString("es-PY")}` : ""}
                    </span>
                  </div>

                  <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500", color: badge.color, backgroundColor: badge.bg, minWidth: "90px", textAlign: "center", alignSelf: "center" }}>
                    {badge.label}
                  </span>

                  <div style={{ display: "flex", gap: "6px", marginLeft: "auto", alignSelf: "center" }}>
                    {req.approvalStatus === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(req.id)}
                          disabled={isActioning}
                          style={{ padding: "6px 14px", borderRadius: "6px", border: "none", background: "#15803d", color: "white", fontSize: "12px", fontWeight: "600", cursor: isActioning ? "not-allowed" : "pointer", opacity: isActioning ? 0.6 : 1 }}
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectTarget(req.id)}
                          disabled={isActioning}
                          style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #fca5a5", background: "white", color: "#dc2626", fontSize: "12px", fontWeight: "600", cursor: isActioning ? "not-allowed" : "pointer", opacity: isActioning ? 0.6 : 1 }}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RejectModal
        isOpen={rejectTarget !== null}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
