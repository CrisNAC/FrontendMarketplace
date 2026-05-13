import { useState, useEffect, useCallback } from "react";
import { Search, Package, Flag, Eye, Check, X, AlertTriangle, Store, Tag, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { fetchAdminProducts, approveProduct, rejectProduct } from "../services/adminProductsApi";

// ── Constantes de UI ───────────────────────────────────────────────────────

const cardStyle = {
  backgroundColor: "var(--background-white)",
  borderRadius: "14px",
  padding: "20px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const APPROVAL_STATUS = {
  PENDING:  { label: "pendiente",  color: "#92400e", bg: "#fef3c7" },
  ACTIVE:   { label: "aprobado",   color: "#15803d", bg: "#dcfce7" },
  REJECTED: { label: "rechazado",  color: "#dc2626", bg: "#fee2e2" },
};

// ── Modal de detalle ───────────────────────────────────────────────────────

const ProductDetailModal = ({ isOpen, product, onClose, onApprove, onReject, isSubmitting }) => {
  if (!isOpen || !product) return null;

  const statusConfig = APPROVAL_STATUS[product.approvalStatus] ?? APPROVAL_STATUS.PENDING;
  const isPending    = product.approvalStatus === "PENDING";
  const imageUrl     = product.image_url ?? product.imageUrl ?? null;

  const DetailRow = ({ label, value }) => (
    <div>
      <p style={{ margin: "0 0 2px", fontSize: "12px", color: "#6b7280" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "14px", fontWeight: "500", color: "#111827" }}>{value ?? "—"}</p>
    </div>
  );

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", maxWidth: "560px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>Detalle del Producto</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
            <X size={24} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div style={{ overflowY: "auto", paddingRight: "4px", flex: 1 }}>

          {/* Imagen + nombre + estado */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "10px", border: "1px solid #e5e7eb", backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
              {imageUrl
                ? <img src={imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "block"; }} />
                : null}
              <Package size={30} color="#9ca3af" style={{ display: imageUrl ? "none" : "block" }} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: "700", color: "#111827" }}>{product.name}</h4>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500", color: statusConfig.color, backgroundColor: statusConfig.bg }}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "600", color: "#374151", borderBottom: "1px solid #f3f4f6", paddingBottom: "4px" }}>Descripción</p>
            <p style={{ margin: 0, fontSize: "14px", color: "#4b5563", lineHeight: "1.6" }}>{product.description || "Sin descripción."}</p>
          </div>

          {/* Datos del producto */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "600", color: "#374151", borderBottom: "1px solid #f3f4f6", paddingBottom: "4px" }}>Datos del producto</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <DetailRow label="Precio" value={`Gs. ${Number(product.price ?? 0).toLocaleString("es-PY")}`} />
              <DetailRow label="Visible en tienda" value={product.visible ? "Sí" : "No"} />
              <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", gridColumn: "1 / -1" }}>
                <Tag size={13} color="#6b7280" style={{ marginTop: "16px", flexShrink: 0 }} />
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#6b7280" }}>Categorías</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {product.categories?.length > 0
                      ? product.categories.map((cat) => (
                          <span key={cat.id} style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "12px", fontWeight: "500", backgroundColor: "#e0e7ff", color: "#3730a3" }}>
                            {cat.name}
                          </span>
                        ))
                      : <span style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>—</span>
                    }
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Store size={13} color="#6b7280" />
                <DetailRow label="Comercio" value={product.store?.name} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Calendar size={13} color="#6b7280" />
                <DetailRow
                  label="Publicado el"
                  value={product.createdAt ? new Date(product.createdAt).toLocaleDateString("es-PY") : "—"}
                />
              </div>
            </div>
          </div>

          {/* Reportes */}
          <div style={{ marginBottom: product.rejectionReason ? "20px" : "0" }}>
            <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "600", color: "#374151", borderBottom: "1px solid #f3f4f6", paddingBottom: "4px" }}>
              Reportes
            </p>
            {product.reportCount === 0 ? (
              <p style={{ margin: 0, fontSize: "14px", color: "#9ca3af" }}>Sin reportes activos.</p>
            ) : (
              <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", padding: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <Flag size={14} color="#c2410c" />
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#c2410c" }}>{product.reportCount} reporte(s) activo(s)</span>
                </div>
                {product.latestReport && (
                  <>
                    <p style={{ margin: "0 0 2px", fontSize: "12px", color: "#6b7280" }}>Último motivo</p>
                    <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#374151", fontWeight: "500" }}>{product.latestReport.reason}</p>
                    {product.latestReport.description && (
                      <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#4b5563" }}>{product.latestReport.description}</p>
                    )}
                    <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                      Reportado el {new Date(product.latestReport.reportedAt).toLocaleDateString("es-PY")}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Motivo de rechazo (si aplica) */}
          {product.rejectionReason && (
            <div>
              <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "600", color: "#374151", borderBottom: "1px solid #f3f4f6", paddingBottom: "4px" }}>
                Motivo de rechazo
              </p>
              <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", padding: "12px" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "#9f1239" }}>{product.rejectionReason}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones — solo para PENDING */}
        {isPending && (
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", borderTop: "1px solid #f3f4f6", paddingTop: "20px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => onReject(product)}
              disabled={isSubmitting}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "8px", border: "1px solid #fecdd3", backgroundColor: "#fff1f2", color: "#dc2626", fontSize: "14px", fontWeight: "600", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}
            >
              <X size={16} /> Rechazar
            </button>
            <button
              type="button"
              onClick={() => onApprove(product)}
              disabled={isSubmitting}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#15803d", color: "white", fontSize: "14px", fontWeight: "600", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}
            >
              <Check size={16} /> Aprobar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Modal de rechazo ───────────────────────────────────────────────────────

const RejectModal = ({ isOpen, productName, onClose, onConfirm, isSubmitting }) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error("El motivo es obligatorio");
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", maxWidth: "420px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Motivo de Rechazo</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
            <X size={20} />
          </button>
        </div>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
          Estás rechazando <strong>"{productName}"</strong>. El vendedor recibirá el motivo por notificación.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Escribe el motivo del rechazo..."
          disabled={isSubmitting}
          style={{ width: "100%", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", minHeight: "100px", resize: "vertical", marginBottom: "20px" }}
        />
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} disabled={isSubmitting} style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "white", fontSize: "14px", fontWeight: "500", color: "#374151", cursor: isSubmitting ? "not-allowed" : "pointer" }}>
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm} disabled={isSubmitting} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", backgroundColor: "#dc2626", fontSize: "14px", fontWeight: "600", color: "white", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? "Confirmando..." : "Confirmar Rechazo"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Fila de producto ───────────────────────────────────────────────────────

const ProductRow = ({ product, onViewDetail, onApprove, onReject, isSubmitting }) => {
  const statusConfig = APPROVAL_STATUS[product.approvalStatus] ?? APPROVAL_STATUS.PENDING;
  const isPending    = product.approvalStatus === "PENDING";
  const imageUrl     = product.image_url ?? product.imageUrl ?? null;

  return (
    <div
      style={{ display: "flex", gap: "14px", padding: "16px 8px", borderBottom: "1px solid #f3f4f6", alignItems: "center", flexWrap: "wrap", transition: "background-color 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <div style={{ width: "56px", height: "56px", borderRadius: "8px", border: "1px solid #e5e7eb", flexShrink: 0, backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {imageUrl
          ? <img src={imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }} />
          : null}
        <Package size={24} color="#9ca3af" style={{ display: imageUrl ? "none" : "block" }} />
      </div>

      <div style={{ flex: "2", minWidth: "180px" }}>
        <p style={{ margin: "0 0 2px", fontWeight: "600", fontSize: "14px", color: "#111827" }}>{product.name}</p>
        <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "320px" }}>
          {product.description}
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
          Vendedor: <span style={{ fontWeight: "500", color: "#374151" }}>{product.store?.name ?? "—"}</span>
        </p>
        {product.latestReport && (
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#92400e" }}>
            Motivo del reporte: {product.latestReport.reason}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: "80px" }}>
        <Flag size={13} color="#6b7280" />
        <span style={{ fontSize: "12px", color: "#6b7280" }}>{product.reportCount} reportes</span>
      </div>

      <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500", color: statusConfig.color, backgroundColor: statusConfig.bg, minWidth: "80px", textAlign: "center" }}>
        {statusConfig.label}
      </span>

      <div style={{ minWidth: "120px", textAlign: "right" }}>
        <p style={{ margin: "0 0 2px", fontWeight: "600", fontSize: "13px", color: "#111827" }}>
          Gs. {Number(product.price ?? 0).toLocaleString("es-PY")}
        </p>
      </div>

      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
        <button
          type="button"
          title="Ver detalle"
          onClick={() => onViewDetail(product)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", color: "#6b7280" }}
        >
          <Eye size={16} />
        </button>

        {isPending && (
          <button
            type="button"
            title="Aprobar producto"
            onClick={() => onApprove(product)}
            disabled={isSubmitting}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "6px", border: "none", backgroundColor: "#15803d", color: "white", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}
          >
            <Check size={16} />
          </button>
        )}

        {isPending && (
          <button
            type="button"
            title="Rechazar producto"
            onClick={() => onReject(product)}
            disabled={isSubmitting}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "6px", border: "none", backgroundColor: "#dc2626", color: "white", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// ── Componente principal ───────────────────────────────────────────────────

export const AdminProductsPage = () => {
  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [searchInput,    setSearchInput]    = useState("");
  const [search,         setSearch]         = useState("");
  const [approvalStatus, setApprovalStatus] = useState("PENDING");
  const [page,           setPage]           = useState(1);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen,    setIsDetailOpen]    = useState(false);
  const [isRejectOpen,    setIsRejectOpen]    = useState(false);
  const [isSubmitting,    setIsSubmitting]    = useState(false);

  // ── Debounce del buscador ──────────────────────────────────────────────

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // ── Carga de datos ─────────────────────────────────────────────────────

  const loadProducts = useCallback(async (currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminProducts({ search, approvalStatus, page: currentPage, limit: 20 });
      setProducts(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err?.response?.data?.error?.message || "Error al cargar los productos.");
    } finally {
      setLoading(false);
    }
  }, [search, approvalStatus]);

  // Un solo efecto para el fetch; loadProducts cambia cuando cambian search/approvalStatus.
  useEffect(() => {
    loadProducts(page);
  }, [page, loadProducts]);

  // Resetea a página 1 cuando cambian los filtros; el efecto de arriba ejecuta el fetch.
  useEffect(() => {
    setPage(1);
  }, [search, approvalStatus]);

  // ── Acciones ───────────────────────────────────────────────────────────

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleApprove = async (product) => {
    setIsSubmitting(true);
    try {
      await approveProduct(product.id);
      toast.success(`"${product.name}" aprobado exitosamente`);
      setIsDetailOpen(false);
      setSelectedProduct(null);
      loadProducts(page);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Error al aprobar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectOpen = (product) => {
    setSelectedProduct(product);
    setIsDetailOpen(false);
    setIsRejectOpen(true);
  };

  const handleRejectConfirm = async (reason) => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await rejectProduct(selectedProduct.id, reason);
      toast.success(`"${selectedProduct.name}" rechazado`);
      setIsRejectOpen(false);
      setSelectedProduct(null);
      loadProducts(page);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "Error al rechazar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: "1100px", paddingBottom: "40px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0 }}>Moderación de Productos</h1>
        <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>
          Revisa y modera productos reportados o sospechosos
        </p>
      </div>

      {/* Filtros */}
      <div style={{ ...cardStyle, marginBottom: "16px" }}>
        <p style={{ margin: "0 0 12px", fontWeight: "600", fontSize: "14px" }}>Filtros</p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Buscar por nombre de producto o vendedor..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: "100%", paddingLeft: "32px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <select
            value={approvalStatus}
            onChange={(e) => setApprovalStatus(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", color: "#374151", background: "white", cursor: "pointer" }}
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="ACTIVE">Aprobado</option>
            <option value="REJECTED">Rechazado</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={20} color="#a16207" />
          </div>
          <div>
            <p style={{ margin: "0 0 2px", fontWeight: "600", fontSize: "15px" }}>
              Productos para Revisar ({pagination.total})
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
              Lista de productos reportados o marcados como sospechosos
            </p>
          </div>
        </div>

        {error && (
          <div style={{ padding: "12px", backgroundColor: "#fee2e2", borderRadius: "8px", color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: "14px" }}>
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: "14px" }}>
            <Check size={40} color="#d1d5db" style={{ margin: "0 auto 10px", display: "block" }} />
            No hay productos que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onViewDetail={handleViewDetail}
                onApprove={handleApprove}
                onReject={handleRejectOpen}
                isSubmitting={isSubmitting}
              />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" }}>
            <button className="btn btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }}>Anterior</button>
            <span style={{ fontSize: "13px" }}>{page} / {pagination.totalPages}</span>
            <button className="btn btn-secondary" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} style={{ opacity: page === pagination.totalPages ? 0.5 : 1, cursor: page === pagination.totalPages ? "not-allowed" : "pointer" }}>Siguiente</button>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      <ProductDetailModal
        isOpen={isDetailOpen && !isRejectOpen}
        product={selectedProduct}
        onClose={() => { setIsDetailOpen(false); setSelectedProduct(null); }}
        onApprove={handleApprove}
        onReject={handleRejectOpen}
        isSubmitting={isSubmitting}
      />

      {/* Modal de rechazo */}
      <RejectModal
        isOpen={isRejectOpen}
        productName={selectedProduct?.name ?? ""}
        onClose={() => { setIsRejectOpen(false); setIsDetailOpen(false); setSelectedProduct(null); }}
        onConfirm={handleRejectConfirm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
