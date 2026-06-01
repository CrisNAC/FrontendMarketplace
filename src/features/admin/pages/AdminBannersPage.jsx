import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Image, Pencil, Plus, Search, ToggleLeft, ToggleRight, X } from "lucide-react";
import { PageLoader } from "../../../components/PageLoader";
import toast from "react-hot-toast";
import {
  createAdminBanner,
  fetchAdminBanners,
  toggleAdminBanner,
  updateAdminBanner,
} from "../services/adminBannersApi";

const cardStyle = {
  backgroundColor: "var(--background-white)",
  borderRadius: "14px",
  padding: "20px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const toLocalInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const fromLocalInputValue = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const buildScheduleBadge = (banner) => {
  const now = Date.now();
  const startMs = banner.startAt ? new Date(banner.startAt).getTime() : 0;
  const endMs = banner.endAt ? new Date(banner.endAt).getTime() : null;

  if (!banner.isActive) {
    return { label: "Desactivado", color: "#6b7280", bg: "#f3f4f6" };
  }

  if (startMs > now) {
    return { label: "Programado", color: "#1d4ed8", bg: "#dbeafe" };
  }

  if (endMs && endMs < now) {
    return { label: "Finalizado", color: "#b91c1c", bg: "#fee2e2" };
  }

  return { label: "Visible", color: "#15803d", bg: "#dcfce7" };
};

const BannerFormModal = ({ isOpen, initialData, onClose, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialData?.title ?? "");
    setDescription(initialData?.description ?? "");
    setImageUrl(initialData?.imageUrl ?? "");
    setLinkUrl(initialData?.linkUrl ?? "");
    setStartAt(toLocalInputValue(initialData?.startAt));
    setEndAt(toLocalInputValue(initialData?.endAt));
    setIsActive(initialData?.isActive ?? true);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("El titulo es obligatorio");
      return;
    }
    if (!imageUrl.trim()) {
      toast.error("La imagen es obligatoria");
      return;
    }
    if (!startAt) {
      toast.error("La fecha de inicio es obligatoria");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl.trim() || null,
      startAt: fromLocalInputValue(startAt),
      endAt: endAt ? fromLocalInputValue(endAt) : null,
      isActive,
    };

    onSubmit(payload);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", maxWidth: "560px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>
            {initialData ? "Editar banner" : "Nuevo banner"}
          </h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>Titulo</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Semana Eco"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", marginTop: "6px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>Descripcion</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Texto breve del banner"
              rows={3}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", marginTop: "6px", resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>URL de imagen</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", marginTop: "6px" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>URL de destino</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", marginTop: "6px" }}
            />
          </div>

          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>Inicio</label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", marginTop: "6px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>Fin (opcional)</label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", marginTop: "6px" }}
              />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#374151" }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Banner activo
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "#15803d", color: "white", fontSize: "14px", fontWeight: "600", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const loadBanners = useCallback(async (currentPage) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchAdminBanners({ search, active: activeFilter, page: currentPage, limit: 20 });
      setBanners(result.data ?? []);
      setPagination(result.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (err) {
      setError(err?.response?.data?.error?.message || "No se pudieron cargar los banners.");
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    loadBanners(page);
  }, [page, loadBanners]);

  useEffect(() => {
    setPage(1);
  }, [search, activeFilter]);

  const handleCreate = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      if (editingBanner) {
        await updateAdminBanner(editingBanner.id, payload);
        toast.success("Banner actualizado");
      } else {
        await createAdminBanner(payload);
        toast.success("Banner creado");
      }
      setIsModalOpen(false);
      setEditingBanner(null);
      loadBanners(page);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "No se pudo guardar el banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (banner) => {
    try {
      await toggleAdminBanner(banner.id, !banner.isActive);
      toast.success(banner.isActive ? "Banner desactivado" : "Banner activado");
      loadBanners(page);
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || "No se pudo actualizar el banner");
    }
  };

  const emptyState = useMemo(() => !loading && banners.length === 0, [loading, banners.length]);

  return (
    <div style={{ maxWidth: "1100px", paddingBottom: "40px" }}>
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0 }}>Banners promocionales</h1>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>
            Gestiona banners del homepage y programa su visibilidad.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "var(--primary-dark)", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}
        >
          <Plus size={16} /> Nuevo banner
        </button>
      </div>

      <div style={{ ...cardStyle, marginBottom: "16px" }}>
        <p style={{ margin: "0 0 12px", fontWeight: "600", fontSize: "14px" }}>Filtros</p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Buscar por titulo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: "100%", paddingLeft: "32px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", color: "#374151", background: "white", cursor: "pointer" }}
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      <div style={cardStyle}>
        {error && (
          <div style={{ padding: "12px", backgroundColor: "#fee2e2", borderRadius: "8px", color: "#dc2626", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {loading && <PageLoader />}

        {emptyState && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: "14px" }}>
            <Image size={40} color="#d1d5db" style={{ margin: "0 auto 10px", display: "block" }} />
            No hay banners para mostrar.
          </div>
        )}

        {!loading && banners.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {banners.map((banner) => {
              const badge = buildScheduleBadge(banner);
              return (
                <div key={banner.id} style={{ display: "flex", gap: "16px", padding: "16px 8px", borderBottom: "1px solid #f3f4f6", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ width: "72px", height: "48px", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden", backgroundColor: "#f3f4f6", flexShrink: 0 }}>
                    <img src={banner.imageUrl} alt={banner.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: "2", minWidth: "200px" }}>
                    <p style={{ margin: "0 0 4px", fontWeight: "600", fontSize: "14px", color: "#111827" }}>{banner.title}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{banner.description || "Sin descripcion"}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "160px" }}>
                    <Calendar size={14} color="#6b7280" />
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      {banner.startAt ? new Date(banner.startAt).toLocaleDateString("es-PY") : "-"}
                      {banner.endAt ? ` → ${new Date(banner.endAt).toLocaleDateString("es-PY")}` : ""}
                    </span>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500", color: badge.color, backgroundColor: badge.bg, minWidth: "90px", textAlign: "center" }}>
                    {badge.label}
                  </span>
                  <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                    <button
                      type="button"
                      title="Editar banner"
                      onClick={() => handleEdit(banner)}
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "6px", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", color: "#6b7280" }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      title={banner.isActive ? "Desactivar banner" : "Activar banner"}
                      onClick={() => handleToggle(banner)}
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "6px", border: "none", backgroundColor: banner.isActive ? "#dcfce7" : "#fee2e2", color: banner.isActive ? "#15803d" : "#dc2626", cursor: "pointer" }}
                    >
                      {banner.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                  </div>
                </div>
              );
            })}
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

      <BannerFormModal
        isOpen={isModalOpen}
        initialData={editingBanner}
        onClose={() => { setIsModalOpen(false); setEditingBanner(null); }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
