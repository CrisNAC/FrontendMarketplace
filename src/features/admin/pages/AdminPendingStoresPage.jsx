import { useState, useEffect, useCallback } from "react";
import { Store, Eye, Check, X, AlertTriangle } from "lucide-react";
import { fetchPendingStores, approveStore, rejectStore } from "@/features/admin/services";
import { PageLoader } from "@/components/PageLoader";
import { useToast } from "@/hooks";

const cardStyle = {
  backgroundColor: "var(--background-white)",
  borderRadius: "14px",
  padding: "20px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const resolveStoreLogoUrl = (logo) => {
  if (!logo || typeof logo !== "string" || !logo.trim()) return "";

  const value = logo.trim();
  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:3000").trim().replace(/\/$/, "");
  return `${apiBase}${value.startsWith("/") ? "" : "/"}${value}`;
};

const StoreLogoPreview = ({ logo, name, size = 48, iconSize = 20, radius = "8px" }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const logoUrl = resolveStoreLogoUrl(logo);

  useEffect(() => {
    setHasImageError(false);
  }, [logoUrl]);

  const showImage = Boolean(logoUrl) && !hasImageError;

  return (
    <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: radius, overflow: "hidden", border: "1px solid #e5e7eb", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }}>
      {showImage ? (
        <img
          src={logoUrl}
          alt={`Logo de ${name || "comercio"}`}
          onError={() => setHasImageError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Store size={iconSize} color="#9ca3af" />
      )}
    </div>
  );
};

const getStoreCategories = (store) => {
  if (Array.isArray(store?.categories) && store.categories.length > 0) {
    return store.categories;
  }

  return store?.store_category ? [store.store_category] : []; 
};

const RejectReasonModal = ({ isOpen, onClose, onConfirm, isSubmitting, showToast }) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      showToast("El motivo es obligatorio", "error");
      return;
    }
    onConfirm(reason);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={onClose}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Motivo de Rechazo</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
          Ingresá el motivo por el cual se rechaza este comercio. El vendedor recibirá esta información por notificación.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Escribe el motivo..."
          disabled={isSubmitting}
          style={{ width: "100%", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", minHeight: "100px", resize: "vertical", marginBottom: "20px" }}
        />
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} disabled={isSubmitting} style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "white", fontSize: "14px", fontWeight: "500", color: "#374151", cursor: isSubmitting ? "not-allowed" : "pointer" }}>
            Cancelar
          </button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", backgroundColor: "#dc2626", fontSize: "14px", fontWeight: "600", color: "white", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? "Confirmando..." : "Confirmar Rechazo"}
          </button>
        </div>
      </div>
    </div>
  );
};

const StoreDetailsModal = ({ isOpen, store, onClose, onApprove, onReject, isSubmitting }) => {
  if (!isOpen || !store) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={onClose}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", maxWidth: "550px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Detalles del Comercio</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ overflowY: "auto", paddingRight: "8px" }}>
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
            <StoreLogoPreview logo={store.logo} name={store.name} size={96} iconSize={34} radius="12px" />
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "600", color: "#111827" }}>{store.name}</h4>
              <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#6b7280" }}>
                Categorías: {getStoreCategories(store).map((category) => category.name).join(", ") || "Sin categorías"}
              </p>
              <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500", backgroundColor: "#fef08a", color: "#854d0e" }}>
                Pendiente
              </span>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h5 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#374151", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px" }}>Descripción</h5>
            <p style={{ margin: 0, fontSize: "14px", color: "#4b5563", lineHeight: "1.5" }}>{store.description || "Sin descripción provista."}</p>
          </div>

          <div style={{ marginBottom: "30px" }}>
            <h5 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#374151", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px" }}>Datos del Vendedor / Contacto</h5>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <p style={{ margin: "0 0 2px 0", fontSize: "12px", color: "#6b7280" }}>Nombre del vendedor</p>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#111827" }}>{store.user?.name}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px 0", fontSize: "12px", color: "#6b7280" }}>Email</p>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#111827" }}>{store.email}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px 0", fontSize: "12px", color: "#6b7280" }}>Teléfono</p>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#111827" }}>{store.phone}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 2px 0", fontSize: "12px", color: "#6b7280" }}>Registro</p>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#111827" }}>{new Date(store.created_at).toLocaleDateString("es-PY")}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", borderTop: "1px solid #e5e7eb", paddingTop: "20px", marginTop: "auto" }}>
          <button type="button" onClick={onReject} disabled={isSubmitting} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "8px", border: "1px solid #fecdd3", backgroundColor: "#fff1f2", color: "#dc2626", fontSize: "14px", fontWeight: "600", cursor: isSubmitting ? "not-allowed" : "pointer" }}>
            <X size={18} /> Rechazar
          </button>
          <button type="button" onClick={onApprove} disabled={isSubmitting} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "8px", border: "1px solid #bcf0da", backgroundColor: "#dcfce7", color: "#15803d", fontSize: "14px", fontWeight: "600", cursor: isSubmitting ? "not-allowed" : "pointer" }}>
            <Check size={18} /> Aprobar
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminPendingStoresPage = () => {
  const [pendingStores, setPendingStores] = useState([]);
  const [pendingPagination, setPendingPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [pendingPage, setPendingPage] = useState(1);
  const [loadingPending, setLoadingPending] = useState(false);
  const [errorPending, setErrorPending] = useState(null);

  const [selectedStore, setSelectedStore] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isSubmittingAct, setIsSubmittingAct] = useState(false);

  const { showToast } = useToast();
  
  const loadPendingStores = useCallback(async (currentPage) => {
    setLoadingPending(true);
    setErrorPending(null);
    try {
      const result = await fetchPendingStores({ page: currentPage, limit: 20 });
      setPendingStores(result.data);
      setPendingPagination(result.pagination);
    } catch (err) {
      setErrorPending(err?.response?.data?.message || "Error al cargar comercios pendientes.");
    } finally {
      setLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    loadPendingStores(pendingPage);
  }, [pendingPage]);

  const handleApprove = async () => {
    if (!selectedStore) return;
    setIsSubmittingAct(true);
    try {
      await approveStore(selectedStore.id_store);
      showToast("Comercio aprobado exitosamente", "success");
      setIsDetailsOpen(false);
      setSelectedStore(null);
      loadPendingStores(pendingPage);
    } catch (err) {
      showToast(err?.response?.data?.message || "Error al aprobar comercio", "error");
    } finally {
      setIsSubmittingAct(false);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!selectedStore) return;
    setIsSubmittingAct(true);
    try {
      await rejectStore(selectedStore.id_store, reason);
      showToast("Comercio rechazado", "success");
      setIsRejectOpen(false);
      setIsDetailsOpen(false);
      setSelectedStore(null);
      loadPendingStores(pendingPage);
    } catch (err) {
      showToast(err?.response?.data?.message || "Error al rechazar comercio", "error");
    } finally {
      setIsSubmittingAct(false);
    }
  };

  const openApproveConfirm = (store) => {
    setSelectedStore(store);
    setIsDetailsOpen(true);
  };

  const openRejectConfirm = (store) => {
    setSelectedStore(store);
    setIsRejectOpen(true);
  };

  return (
    <div style={{ maxWidth: "1100px", paddingBottom: "40px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0 }}>Comercios por Aprobar</h1>
        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>
          Revisa y aprueba o rechaza solicitudes de nuevos comercios
        </p>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#fef08a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={20} color="#a16207" />
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "15px" }}>Comercios Pendientes ({pendingPagination.total})</p>
            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>Asegurate de revisar la información de cada vendedor antes de aprobar un comercio.</p>
          </div>
        </div>

        {errorPending && <div style={{ padding: "12px", backgroundColor: "#fee2e2", borderRadius: "8px", color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>{errorPending}</div>}

        {loadingPending ? (
          <PageLoader />
        ) : pendingStores.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: "14px" }}>
            <Check size={40} color="#d1d5db" style={{ margin: "0 auto 10px" }} />
            No hay solicitudes de comercios por aprobar.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {pendingStores.map((store) => (
              <div key={store.id_store} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 8px", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap", transition: "background-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                <StoreLogoPreview logo={store.logo} name={store.name} size={45} iconSize={20} />
                <div style={{ flex: "1.5", minWidth: "150px" }}>
                  <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>{store.name}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                    Categorías: {getStoreCategories(store).map((category) => category.name).join(", ") || "Sin categorías"}
                  </p>
                </div>
                <div style={{ flex: "1.5", minWidth: "150px" }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "500", color: "#374151" }}>{store.user?.name}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{store.email}</p>
                </div>
                <span style={{ fontSize: "12px", color: "#6b7280", minWidth: "110px" }}>{new Date(store.created_at).toLocaleDateString("es-PY")}</span>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  <button type="button" onClick={() => openApproveConfirm(store)} title="Ver y Evaluar" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "6px", border: "1px solid #d1d5db", backgroundColor: "white", fontSize: "13px", fontWeight: "500", color: "#374151", cursor: "pointer" }}>
                    <Eye size={16} /> Evaluar
                  </button>
                  <button type="button" onClick={() => { setSelectedStore(store); handleApprove(); }} title="Aprobar rápido" disabled={isSubmittingAct} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "6px", border: "none", backgroundColor: "#15803d", color: "white", cursor: isSubmittingAct ? "not-allowed" : "pointer" }}>
                    <Check size={16} />
                  </button>
                  <button type="button" onClick={() => openRejectConfirm(store)} title="Rechazar rápido" disabled={isSubmittingAct} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "6px", border: "none", backgroundColor: "#dc2626", color: "white", cursor: isSubmittingAct ? "not-allowed" : "pointer" }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pendingPagination.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" }}>
            <button className="btn btn-secondary" onClick={() => setPendingPage(p => Math.max(1, p - 1))} disabled={pendingPage === 1} style={{ opacity: pendingPage === 1 ? 0.5 : 1, cursor: pendingPage === 1 ? "not-allowed" : "pointer" }}>Anterior</button>
            <span style={{ fontSize: "13px" }}>{pendingPage} / {pendingPagination.totalPages}</span>
            <button className="btn btn-secondary" onClick={() => setPendingPage(p => Math.min(pendingPagination.totalPages, p + 1))} disabled={pendingPage === pendingPagination.totalPages} style={{ opacity: pendingPage === pendingPagination.totalPages ? 0.5 : 1, cursor: pendingPage === pendingPagination.totalPages ? "not-allowed" : "pointer" }}>Siguiente</button>
          </div>
        )}
      </div>

      <StoreDetailsModal
        isOpen={isDetailsOpen && !isRejectOpen}
        store={selectedStore}
        onClose={() => { setIsDetailsOpen(false); setSelectedStore(null); }}
        onApprove={handleApprove}
        onReject={() => setIsRejectOpen(true)}
        isSubmitting={isSubmittingAct}
      />

      <RejectReasonModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleRejectConfirm}
        isSubmitting={isSubmittingAct}
        showToast={showToast}
      />
    </div>
  );
};
