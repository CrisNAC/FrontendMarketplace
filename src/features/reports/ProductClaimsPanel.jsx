import { useCallback, useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Loader2, User, X } from "lucide-react";
import { PageLoader } from "../../components/PageLoader";
import {
  fetchFilteredProductReports,
  updateProductReport,
} from "@/lib";
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

/**
 * @param {object} props
 * @param {boolean} props.canResolve — true solo en panel comercio (seller). El backend no permite PUT a admin.
 * @param {boolean} [props.embedded] — menos padding si va dentro de otra tarjeta
 */
export default function ProductClaimsPanel({ canResolve = false, embedded = false }) {
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
  const [savingId, setSavingId] = useState(null);
  const [closeNotes, setCloseNotes] = useState({});

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
      const filteredReports = await fetchFilteredProductReports({
        report_status: reportStatus || undefined,
        search: debouncedSearch,
        page,
        limit: 10,
      });
      setItems(filteredReports.data ?? []);
      setMeta(
        filteredReports.meta ?? {
          total: 0,
          page: 1,
          limit: 10,
          total_pages: 0,
        }
      );
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        "No se pudieron cargar los reclamos.";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, reportStatus, page]);

  useEffect(() => {
    load();
  }, [load]);

  const setNote = (id, value) => {
    setCloseNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleInProgress = async (id) => {
    setSavingId(id);
    try {
      await updateProductReport(id, { report_status: "IN_PROGRESS" });
      showToast("Reclamo marcado en curso", "success");
      await load();
    } catch (err) {
      showToast(
        err?.response?.data?.error?.message || "No se pudo actualizar"
      , "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleClose = async (id, report_status) => {
    const note = (closeNotes[id] || "").trim();
    if (!note) {
      showToast(
        report_status === "RESOLVED"
          ? "Agregá una nota explicando cómo se resolvió"
          : "Agregá una nota explicando el rechazo"
      );
      return;
    }
    setSavingId(id);
    try {
      await updateProductReport(id, { report_status, notes: note });
      showToast(
        report_status === "RESOLVED" ? "Reclamo resuelto" : "Reclamo rechazado"
      );
      setCloseNotes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await load();
    } catch (err) {
      showToast(
        err?.response?.data?.error?.message || "No se pudo actualizar"
      , "error");
    } finally {
      setSavingId(null);
    }
  };

  const shellClass = embedded ? "" : "bg-white p-4 rounded-xl";

  return (
    <div className={shellClass}>
      {!embedded && canResolve && (
        <p className="text-sm text-gray-500 mb-4">
          Gestioná los reclamos sobre tus productos: primero marcá el caso en
          curso y luego resolvelo o rechazalo con una nota para el cliente.
        </p>
      )}
      {!embedded && !canResolve && (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          Vista de supervisión: podés ver y filtrar todos los reclamos. La
          resolución la realiza cada comercio desde su panel (solo ellos pueden
          cambiar el estado).
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre de quien reportó..."
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
          No hay reclamos con estos criterios.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-4">
          {items.map((r) => {
            const storeName = r.product?.store?.name ?? "—";
            const productName = r.product?.name ?? "—";
            const reporterName = r.reporter?.name ?? "—";
            const st = r.report_status;
            const busy = savingId === r.id_product_report;

            return (
              <div
                key={r.id_product_report}
                className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:justify-between"
              >
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-medium flex-wrap">
                    <User size={16} className="shrink-0" />
                    <span>{reporterName}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600 truncate">{storeName}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{productName}</span>
                    {r.order?.id_order != null && (
                      <span className="text-gray-500">
                        {" "}
                        · Pedido #{r.order.id_order}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded w-fit ${STATUS_STYLE[st] ?? "bg-gray-100"}`}
                  >
                    {STATUS_LABEL[st] ?? st}
                  </span>
                  <p className="text-xs font-semibold text-gray-800">
                    {r.reason}
                  </p>
                  {r.description && (
                    <div className="w-full min-w-0 rounded-xl bg-[#f7faf8] border border-[#dfeae4] px-3 py-2">
                      <p className="text-xs sm:text-sm text-gray-600 leading-6 whitespace-pre-wrap break-words overflow-hidden">
                        {r.description}
                      </p>
                    </div>
                  )}
                  {r.notes && (
                    <p className="text-xs text-gray-600 border-l-2 border-gray-300 pl-2">
                      <span className="font-medium">Nota del comercio: </span>
                      {r.notes}
                    </p>
                  )}
                  {canResolve && st === "IN_PROGRESS" && (
                    <textarea
                      value={closeNotes[r.id_product_report] ?? ""}
                      onChange={(e) =>
                        setNote(r.id_product_report, e.target.value)
                      }
                      placeholder="Nota al resolver o rechazar (obligatoria)"
                      rows={2}
                      className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 mt-1"
                    />
                  )}
                  {canResolve && st === "PENDING" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleInProgress(r.id_product_report)}
                      className="w-fit mt-1 bg-[#6B9080] text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-60"
                    >
                      {busy ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : null}
                      Tomar reclamo (en curso)
                    </button>
                  )}
                  {canResolve && st === "IN_PROGRESS" && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleClose(r.id_product_report, "RESOLVED")
                        }
                        className="bg-emerald-600 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-60"
                      >
                        <Check size={14} /> Resolver
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleClose(r.id_product_report, "REJECTED")
                        }
                        className="bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-60"
                      >
                        <X size={14} /> Rechazar
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 shrink-0 text-right sm:ml-4">
                  <p>{formatDate(r.created_at)}</p>
                  {r.resolved_at && (
                    <p className="mt-1">Cerrado: {formatDate(r.resolved_at)}</p>
                  )}
                </div>
              </div>
            );
          })}
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
