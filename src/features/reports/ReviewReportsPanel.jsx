import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import { PageLoader } from "@/components";
import {
  fetchFilteredReviewReports,
  resolveReviewReport,
} from "@App/lib";
import { useToast } from "@/hooks";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_PROGRESS", label: "En curso" },
  { value: "RESOLVED", label: "Resuelto" },
  { value: "REJECTED", label: "Rechazado" },
];

const STATUS_LABEL = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En curso",
  RESOLVED: "Resuelto",
  REJECTED: "Rechazado",
};

const STATUS_STYLE = {
  PENDING: "bg-amber-100 text-amber-900",
  IN_PROGRESS: "bg-blue-100 text-blue-900",
  RESOLVED: "bg-emerald-100 text-emerald-900",
  REJECTED: "bg-red-100 text-red-900",
};

const REASON_LABEL = {
  SPAM: "Spam",
  OFFENSIVE: "Contenido ofensivo",
  FAKE: "Posible reseña falsa",
  OTHER: "Otro motivo",
};

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function ReviewReportsPanel({ embedded = false }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [page, setPage] = useState(1);
  const [actingId, setActingId] = useState(null);

  // ESTADOS NUEVOS DEL MODAL
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, reportStatus]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filtered = await fetchFilteredReviewReports({
        report_status: reportStatus || undefined,
        search: debouncedSearch,
        page,
        limit: 10,
      });

      setItems(filtered.data ?? []);
      setMeta(
        filtered.meta ?? {
          total: 0,
          page: 1,
          limit: 10,
          total_pages: 0,
        }
      );
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        "No se pudieron cargar los reportes de reseñas.";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, reportStatus, page]);

  useEffect(() => {
    load();
  }, [load]);

  const openDeleteModal = (reportId) => {
    setReportToDelete(reportId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (actingId) return;
    setShowDeleteModal(false);
    setReportToDelete(null);
  };

  const handleDecision = async (reportId, decision) => {
    setActingId(reportId);

    try {
      await resolveReviewReport(reportId, { decision });

      showToast(
        decision === "KEEP_REVIEW"
          ? "Reporte descartado. La reseña sigue visible."
          : "La reseña fue ocultada. El comentario desaparecerá del producto.",
        "success"
      );

      await load();
    } catch (err) {
      showToast(
        err?.response?.data?.error?.message ||
          "No se pudo actualizar el reporte.",
        "error"
      );
    } finally {
      setActingId(null);
      setShowDeleteModal(false);
      setReportToDelete(null);
    }
  };

  const shellClass = embedded ? "" : "bg-white p-4 rounded-xl";

  return (
    <div className={shellClass}>
      <p className="text-sm text-gray-500 mb-4">
        Reportes sobre reseñas de producto. Podés{" "}
        <strong>aceptar la reseña</strong> (descartar el reporte) o{" "}
        <strong>eliminarla</strong> (ocultarla del sitio).
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por quien reporta, autor de la reseña o producto."
          className="flex-1 bg-gray-100 px-3 py-2 rounded-lg outline-none border border-transparent focus:border-[#6B9080]"
        />

        <select
          value={reportStatus}
          onChange={(e) => setReportStatus(e.target.value)}
          className="bg-gray-100 px-3 py-2 rounded-lg min-w-[180px] border border-transparent focus:border-[#6B9080]"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <PageLoader />}

      {!loading && error && (
        <p className="text-red-600 text-sm py-4">{error}</p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-gray-500 text-sm py-6 text-center">
          No hay reportes de reseñas con estos criterios.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((r) => {
            const pr = r.product_review;
            const productId = pr?.product?.id_product;
            const rating = Number(pr?.rating) || 0;
            const st = r.report_status;
            const open = st === "PENDING" || st === "IN_PROGRESS";
            const reviewHidden = pr?.status === false;
            const busy = actingId === r.id_review_report;

            return (
              <div
                key={r.id_review_report}
                className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:justify-between"
              >
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <User size={16} className="shrink-0" />
                    <span className="font-medium">
                      Reporta: {r.reporter?.name ?? "—"}
                    </span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600">
                      Autor de la reseña: {pr?.user?.name ?? "—"}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium text-gray-800">
                      {pr?.product?.name ?? "Producto"}
                    </span>
                    {pr?.product?.store?.name && (
                      <span className="text-gray-500">
                        {" "}
                        · {pr.product.store.name}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-xs px-2 py-1 rounded w-fit ${
                      STATUS_STYLE[st] ?? "bg-gray-100"
                    }`}
                  >
                    {STATUS_LABEL[st] ?? st}
                  </span>

                  <span className="text-xs font-semibold text-gray-700">
                    Motivo del reporte: {REASON_LABEL[r.reason] ?? r.reason}
                  </span>

                  {r.description && (
                    <p className="text-xs text-gray-600">{r.description}</p>
                  )}

                  <div className="text-yellow-600 text-sm">
                    {"★".repeat(Math.min(5, Math.max(0, rating)))}
                    {"☆".repeat(Math.max(0, 5 - Math.min(5, rating)))}
                  </div>

                  {reviewHidden && (
                    <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 w-fit">
                      Reseña oculta por moderación
                    </p>
                  )}

                  <p className="text-sm text-gray-700 whitespace-pre-wrap border-l-2 border-gray-200 pl-2">
                    {pr?.comment ?? "—"}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {productId != null && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/producto-detalle/${productId}`)
                        }
                        className="w-fit bg-gray-200 text-gray-800 text-sm px-3 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <Eye size={14} /> Ver producto
                      </button>
                    )}

                    {open && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            handleDecision(r.id_review_report, "KEEP_REVIEW")
                          }
                          className="w-fit bg-emerald-600 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-60"
                        >
                          {busy ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <Check size={14} />
                          )}
                          Aceptar reseña
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => openDeleteModal(r.id_review_report)}
                          className="w-fit bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-60"
                        >
                          {busy ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Eliminar reseña
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 shrink-0 text-right sm:ml-4">
                  <p>{formatDate(r.created_at)}</p>
                  {r.resolved_at && (
                    <p className="mt-1">
                      Cerrado: {formatDate(r.resolved_at)}
                      {r.resolver?.name && ` · ${r.resolver.name}`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          
          <div className="w-full max-w-md rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#d7e3dc] overflow-hidden">
            
            {/* HEADER */}
            <div className="bg-[#eef5f1] px-6 py-5 border-b border-[#d7e3dc]">
              <h3 className="text-[#355f4c] text-lg font-semibold">
                Confirmar acción
              </h3>
              <p className="text-sm text-[#6b8f80] mt-1">
                Estás por moderar una reseña
              </p>
            </div>

            {/* BODY */}
            <div className="p-6">
              <p className="text-sm text-gray-700 leading-6">
                ¿Deseas ocultar esta reseña?
              </p>

              <div className="mt-4 bg-[#f7faf8] border border-[#dfeae4] rounded-2xl p-4">
                <p className="text-sm text-[#557565] leading-6">
                  El comentario dejará de mostrarse en el producto y el reporte quedará resuelto.
                </p>
              </div>

              {/* BOTONES */}
              <div className="mt-6 flex justify-end gap-3">
                
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={!!actingId}
                  className="px-4 py-2 rounded-xl bg-[#eef5f1] text-[#355f4c] hover:bg-[#e3eee8] transition disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDecision(reportToDelete, "REMOVE_REVIEW")
                  }
                  disabled={actingId === reportToDelete}
                  className="px-4 py-2 rounded-xl bg-[#f8c8c8] text-[#7a2e2e] hover:bg-[#f4b4b4] transition disabled:opacity-60"
                >
                  {actingId === reportToDelete
                    ? "Eliminando..."
                    : "Sí, ocultar"}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && meta.total_pages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 text-sm text-gray-700 disabled:opacity-40"
          >
            <ChevronLeft size={18} /> Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {meta.page} de {meta.total_pages} ({meta.total} total)
          </span>

          <button
            type="button"
            disabled={page >= meta.total_pages}
            onClick={() =>
              setPage((p) => Math.min(meta.total_pages || p + 1, p + 1))
            }
            className="flex items-center gap-1 text-sm text-gray-700 disabled:opacity-40"
          >
            Siguiente <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}