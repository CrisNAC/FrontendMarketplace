import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from "react";
import { Calendar, Megaphone, Plus, Upload, X } from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import { PageLoader } from "../../../components/PageLoader";
import { apiClient } from "../services/editCommerceApi";
import {
  getMyBannerRequests,
  createBannerRequest,
  cancelBannerRequest,
  uploadBannerRequestImage,
} from "../services/commerceBannerRequestsApi";

const STATUS_BADGE = {
  PENDING:  { label: "Pendiente", color: "#92400e", bg: "#fef3c7" },
  ACTIVE:   { label: "Aprobado",  color: "#15803d", bg: "#dcfce7" },
  REJECTED: { label: "Rechazado", color: "#991b1b", bg: "#fee2e2" },
};

const toLocalInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const fromLocalInputValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

// ─── Modal nueva solicitud ────────────────────────────────────────────────────

const BannerRequestModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(""); setDescription(""); setImageFile(null); setLinkUrl(""); setStartAt(""); setEndAt("");
    const focusId = setTimeout(() => firstInputRef.current?.focus(), 0);
    return () => clearTimeout(focusId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", marginTop: "6px", boxSizing: "border-box" };
  const labelStyle = { fontSize: "12px", fontWeight: "600", color: "#374151" };

  const handleSubmit = () => {
    if (!title.trim()) return showToast("El título es obligatorio", "error");
    if (!imageFile) return showToast("La imagen es obligatoria", "error");
    if (!startAt) return showToast("La fecha de inicio es obligatoria", "error");
    if (endAt && fromLocalInputValue(endAt) <= fromLocalInputValue(startAt)) {
      return showToast("La fecha de fin debe ser posterior a la de inicio", "error");
    }
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      imageFile,
      linkUrl: linkUrl.trim() || null,
      startAt: fromLocalInputValue(startAt),
      endAt: endAt ? fromLocalInputValue(endAt) : null,
    });
  };

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
        aria-labelledby="modal-title-commerce"
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 61, backgroundColor: "white", borderRadius: "16px", padding: "24px", maxWidth: "560px", width: "calc(100% - 32px)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", border: "none", margin: 0 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <h3 id="modal-title-commerce" style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Nueva solicitud de banner</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar modal" style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px" }}>
          Tu solicitud será revisada por un administrador antes de publicarse en el inicio.
        </p>

        <div style={{ display: "grid", gap: "12px" }}>
          <div>
            <label htmlFor="req-title" style={labelStyle}>Título</label>
            <input ref={firstInputRef} id="req-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Oferta de temporada" maxLength={100} style={inputStyle} />
          </div>
          <div>
            <label htmlFor="req-description" style={labelStyle}>Descripción (opcional)</label>
            <textarea id="req-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Texto breve que acompañará el banner" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div>
            <label style={labelStyle}>Imagen del banner</label>
            {imageFile ? (
              <div style={{ position: "relative", marginTop: "6px", borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb", height: "120px", backgroundColor: "#f3f4f6" }}>
                <img src={URL.createObjectURL(imageFile)} alt="Vista previa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button type="button" onClick={() => setImageFile(null)} aria-label="Quitar imagen"
                  style={{ position: "absolute", top: "6px", right: "6px", background: "white", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>
                  <X size={14} color="#ef4444" />
                </button>
              </div>
            ) : (
              <div style={{ marginTop: "6px", height: "80px", border: "2px dashed #e5e7eb", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" }}>
                <span style={{ fontSize: "13px", color: "#9ca3af" }}>Sin imagen</span>
              </div>
            )}
            <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "8px", padding: "7px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px", cursor: "pointer", backgroundColor: "white", fontWeight: "500", color: "#374151" }}>
              <Upload size={14} />
              {imageFile ? "Cambiar imagen" : "Seleccionar imagen"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) setImageFile(f); e.target.value = ""; }} />
            </label>
          </div>
          <div>
            <label htmlFor="req-link-url" style={labelStyle}>URL de destino (opcional)</label>
            <input id="req-link-url" type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
          </div>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label htmlFor="req-start-at" style={labelStyle}>Fecha de inicio</label>
              <input id="req-start-at" type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="req-end-at" style={labelStyle}>Fecha de fin (opcional)</label>
              <input id="req-end-at" type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          <button type="button" onClick={onClose} disabled={isSubmitting}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", fontSize: "14px", cursor: isSubmitting ? "not-allowed" : "pointer" }}>
            Cancelar
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "var(--primary-dark)", color: "white", fontSize: "14px", fontWeight: "600", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? "Enviando..." : "Enviar solicitud"}
          </button>
        </div>
      </dialog>
    </>
  );
};

BannerRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

// ─── Card de solicitud ────────────────────────────────────────────────────────

const RequestCard = ({ req, onCancel }) => {
  const badge = STATUS_BADGE[req.approvalStatus] ?? STATUS_BADGE.PENDING;
  const isPending = req.approvalStatus === "PENDING";

  return (
    <div style={{
      backgroundColor: "white", borderRadius: "14px", padding: "16px 20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "12px",
      borderLeft: isPending ? "3px solid var(--primary-dark)" : "3px solid transparent",
    }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ width: "72px", height: "52px", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden", backgroundColor: "#f3f4f6", flexShrink: 0 }}>
          <img src={req.imageUrl} alt={req.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: "0 0 2px", fontWeight: "700", fontSize: "15px", color: "#111827" }}>{req.title}</p>
          {req.description && (
            <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#6b7280" }}>{req.description}</p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={12} />
              {req.startAt ? new Date(req.startAt).toLocaleDateString("es-PY") : "—"}
              {req.endAt ? ` → ${new Date(req.endAt).toLocaleDateString("es-PY")}` : ""}
            </span>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>
              Enviada {new Date(req.createdAt).toLocaleDateString("es-PY", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          {req.approvalStatus === "REJECTED" && req.rejectionReason && (
            <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#991b1b", backgroundColor: "#fee2e2", padding: "6px 10px", borderRadius: "6px", display: "inline-block" }}>
              Motivo de rechazo: {req.rejectionReason}
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", flexShrink: 0 }}>
          <span style={{ padding: "3px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", color: badge.color, backgroundColor: badge.bg }}>
            {badge.label}
          </span>
          {isPending && (
            <button type="button" onClick={() => onCancel(req.id)}
              style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #fecdd3", background: "white", color: "#dc2626", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

RequestCard.propTypes = {
  req: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    approvalStatus: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    startAt: PropTypes.string,
    endAt: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    rejectionReason: PropTypes.string,
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
};

// ─── Modal de confirmación ────────────────────────────────────────────────────

const ConfirmModal = ({ isOpen, message, onConfirm, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <>
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={-1}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 70, backgroundColor: "rgba(0,0,0,0.45)", border: "none", cursor: "pointer" }}
      />
      <dialog
        open
        aria-labelledby="modal-title-confirm"
        style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 71, backgroundColor: "white", borderRadius: "16px", padding: "24px", maxWidth: "380px", width: "calc(100% - 32px)", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", border: "none", margin: 0 }}
      >
        <h3 id="modal-title-confirm" style={{ fontSize: "16px", fontWeight: "700", margin: "0 0 12px" }}>Confirmar acción</h3>
        <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 20px" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button type="button" onClick={onClose}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", fontSize: "14px", cursor: "pointer" }}>
            No
          </button>
          <button type="button" onClick={onConfirm}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#dc2626", color: "white", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
            Sí, cancelar
          </button>
        </div>
      </dialog>
    </>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

// ─── Página ───────────────────────────────────────────────────────────────────

const extractErrorMessage = (err, fallback) =>
  err?.response?.data?.error?.message ?? err?.response?.data?.message ?? fallback;

export const CommerceBannerRequestsPage = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState(null);
  const [accessError, setAccessError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  const loadRequests = useCallback(async (sid) => {
    try {
      const data = await getMyBannerRequests(sid);
      setRequests(data);
    } catch (err) {
      if (err?.response?.status === 403) {
        setAccessError(extractErrorMessage(err, "Tu comercio no está habilitado para usar esta función."));
      } else {
        showToast(extractErrorMessage(err, "No se pudieron cargar las solicitudes"), "error");
      }
    }
  }, [showToast]);

  useEffect(() => {
    const init = async () => {
      try {
        const sessionRes = await apiClient.get("/api/session/user-session");
        const sid = sessionRes.data?.user?.id_store;
        if (!sid) {
          showToast("No tenés un comercio registrado", "error");
          setStoreId(null);
          setLoading(false);
          return;
        }
        setStoreId(sid);
        await loadRequests(sid);
      } catch (err) {
        showToast(err?.response?.data?.error?.message ?? "Error al cargar la sesión", "error");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadRequests]);

  const handleSubmit = async ({ imageFile, ...fields }) => {
    if (!storeId) { showToast("No se encontró un comercio asociado", "error"); return; }
    setIsSubmitting(true);
    try {
      const created = await createBannerRequest(storeId, fields);
      const requestId = created?.data?.id ?? created?.id;
      if (imageFile instanceof File && requestId) {
        await uploadBannerRequestImage(requestId, imageFile);
      }
      showToast("Solicitud enviada — será revisada por un administrador", "success");
      setIsModalOpen(false);
      await loadRequests(storeId);
    } catch (err) {
      showToast(extractErrorMessage(err, "No se pudo enviar la solicitud"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (requestId) => {
    if (!storeId) { showToast("No se encontró un comercio asociado", "error"); return; }
    setConfirmCancelId(requestId);
  };

  const handleConfirmCancel = async () => {
    const requestId = confirmCancelId;
    setConfirmCancelId(null);
    try {
      await cancelBannerRequest(storeId, requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      showToast("Solicitud cancelada", "success");
    } catch (e) {
      showToast(extractErrorMessage(e, "No se pudo cancelar la solicitud"), "error");
    }
  };

  if (loading) return <PageLoader />;

  const pendingCount = requests.filter((r) => r.approvalStatus === "PENDING").length;
  const pluralSuffix = pendingCount === 1 ? "" : "s";

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h4 style={{ fontWeight: "600", margin: "0 0 4px 0" }}>Banners promocionales</h4>
          <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
            Solicitá la publicación de un banner en la página principal.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={!storeId || !!accessError}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "var(--primary-dark)", color: "white", border: "none", borderRadius: "10px", cursor: (storeId && !accessError) ? "pointer" : "not-allowed", fontSize: "14px", fontWeight: "600", opacity: (storeId && !accessError) ? 1 : 0.5 }}
        >
          <Plus size={16} /> Nueva solicitud
        </button>
      </div>

      {accessError && (
        <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "16px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
          <Megaphone size={20} color="#c2410c" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: "14px", color: "#9a3412" }}>{accessError}</p>
        </div>
      )}

      {pendingCount > 0 && (
        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#92400e" }}>
          Tenés <strong>{pendingCount}</strong> solicitud{pluralSuffix} pendiente{pluralSuffix} de revisión.
        </div>
      )}

      {requests.length === 0 ? (
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "48px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <Megaphone size={40} color="#d1d5db" style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "15px", fontWeight: "600", color: "#374151", margin: "0 0 4px" }}>No tenés solicitudes todavía</p>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>
            Hacé clic en <strong>Nueva solicitud</strong> para comenzar.
          </p>
        </div>
      ) : (
        requests.map((req) => (
          <RequestCard key={req.id} req={req} onCancel={handleCancel} />
        ))
      )}

      <ConfirmModal
        isOpen={confirmCancelId !== null}
        message="¿Cancelar esta solicitud?"
        onConfirm={handleConfirmCancel}
        onClose={() => setConfirmCancelId(null)}
      />
      <BannerRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
