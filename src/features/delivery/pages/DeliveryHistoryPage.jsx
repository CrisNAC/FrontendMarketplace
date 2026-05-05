import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { getSession } from "../../commerces/services/editUserProfileApi";
import { getDeliveryOrderHistory, getBackendErrorMessage } from "../services/deliveryOrdersApi";

const PERIOD_TABS = [
  { label: "7 días", value: "7d" },
  { label: "15 días", value: "15d" },
  { label: "Mes", value: "1m" },
  { label: "Todos", value: "all" },
];

const ASSIGNMENT_STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Asignación pendiente" },
  { value: "ACCEPTED", label: "Aceptada" },
  { value: "REJECTED", label: "Rechazada" },
  { value: "DELIVERED", label: "Entregado" },
];

const PAGE_SIZE = 10;

const statusStyles = {
  "En curso": "bg-indigo-100 text-indigo-700",
  Entregado: "bg-green-100 text-green-700",
  Cancelado: "bg-red-100 text-red-700",
};

function customerInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatOrderDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("es-PY", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return "—";
  }
}

/** Etiqueta corta para el pedido (OrderStatus). */
function orderStatusLabel(orderStatus) {
  if (orderStatus === "DELIVERED") return "Entregado";
  if (orderStatus === "CANCELLED") return "Cancelado";
  return "En curso";
}

function orderStatusBadgeClass(orderStatus) {
  return statusStyles[orderStatusLabel(orderStatus)] ?? statusStyles["En curso"];
}

export default function DeliveryHistoryPage() {
  const [gateReason, setGateReason] = useState(null);
  const [deliveryId, setDeliveryId] = useState(null);

  const [periodTab, setPeriodTab] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  useLayoutEffect(() => {
    setPage(1);
  }, [periodTab, assignmentStatus, debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await getSession();
        const user = session?.user;
        if (cancelled) return;
        if (!user || user.role !== "DELIVERY") {
          setGateReason("not_delivery");
          setDeliveryId(null);
          return;
        }
        if (!user.id_delivery) {
          setGateReason("no_delivery_profile");
          setDeliveryId(null);
          return;
        }
        setGateReason(null);
        setDeliveryId(user.id_delivery);
      } catch {
        if (!cancelled) {
          setGateReason("not_delivery");
          setDeliveryId(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadHistory = useCallback(async () => {
    if (!deliveryId) return;
    setLoading(true);
    setError(null);
    try {
      const period = PERIOD_TABS[periodTab].value;
      const q = debouncedSearch;
      const query = {
        page,
        limit: PAGE_SIZE,
        period,
        assignment_status: assignmentStatus || undefined,
      };
      if (q) {
        if (/^\d+$/.test(q)) query.orderId = q;
        else query.userName = q;
      }
      const data = await getDeliveryOrderHistory(deliveryId, query);
      setPayload(data);
    } catch (err) {
      const msg = getBackendErrorMessage(err, "No se pudo cargar el historial.");
      setError(msg);
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [deliveryId, page, periodTab, assignmentStatus, debouncedSearch]);

  useEffect(() => {
    if (deliveryId) loadHistory();
  }, [deliveryId, loadHistory]);

  const content = payload?.content ?? [];
  const totalElements = payload?.total_elements ?? 0;
  const totalPages = Math.max(1, payload?.total_pages ?? 1);
  const currentPage = payload?.page ?? page;
  const size = payload?.size ?? PAGE_SIZE;
  const from = totalElements === 0 ? 0 : (currentPage - 1) * size + 1;
  const to = Math.min(currentPage * size, totalElements);

  return (
    <div className="min-h-screen bg-[#EAF5F3] text-slate-900">
      <main className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-5 md:px-6 lg:px-8">
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-[#102A43] md:text-3xl">
            Historial
          </h1>
          <p className="mt-1 text-sm text-slate-500 md:text-base">
            Consultá el historial de pedidos y entregas realizadas.
          </p>
        </header>

        {gateReason === "not_delivery" && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-900">
            Iniciá sesión con una cuenta de repartidor para ver el historial.
          </div>
        )}

        {gateReason === "no_delivery_profile" && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-900">
            Tu usuario no tiene perfil de delivery. Registrate como delivery desde el perfil de
            cliente.
          </div>
        )}

        {!gateReason && (
          <>
            <section className="mb-4">
              <div className="grid w-full grid-cols-4 overflow-hidden rounded-xl border border-[#719783] bg-white sm:max-w-xl">
                {PERIOD_TABS.map((tab, idx) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setPeriodTab(idx)}
                    className={`h-10 text-xs font-semibold transition sm:text-sm ${
                      idx === periodTab
                        ? "bg-[#719783] text-white"
                        : "text-slate-700 hover:bg-[#F3FAF7]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="flex h-11 items-center rounded-xl border border-slate-100 bg-white px-3 shadow-sm">
                <Search size={18} className="mr-2 shrink-0 text-slate-500" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar por cliente o número de pedido"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                  aria-label="Buscar por cliente o número de pedido"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold shadow-sm ${
                  showFilters || assignmentStatus
                    ? "border-[#719783] bg-[#F3FAF7] text-[#102A43]"
                    : "border-slate-100 bg-white text-slate-700"
                }`}
              >
                <Filter size={18} />
                Filtros
              </button>
            </section>

            {showFilters ? (
              <section className="mb-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Estado de la asignación
                </label>
                <select
                  value={assignmentStatus}
                  onChange={(e) => setAssignmentStatus(e.target.value)}
                  className="mt-2 w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                >
                  {ASSIGNMENT_STATUS_OPTIONS.map((o) => (
                    <option key={o.value || "all"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </section>
            ) : null}

            {error && (
              <p className="mb-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              {loading ? (
                <p className="p-8 text-center text-sm text-slate-600">
                  Cargando historial…
                </p>
              ) : content.length === 0 ? (
                <p className="p-8 text-center text-sm text-slate-600">
                  No hay pedidos que coincidan con los filtros.
                </p>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead className="bg-[#F8FBFA] text-slate-700">
                        <tr>
                          {["#Pedido", "Cliente", "Estado pedido", "Fecha pedido"].map((item) => (
                            <th key={item} className="px-4 py-3 text-left font-bold">
                              <div className="flex items-center gap-1">
                                {item}
                                <ChevronDown size={15} className="opacity-40" aria-hidden />
                              </div>
                            </th>
                          ))}
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>

                      <tbody>
                        {content.map((row) => {
                          const order = row.order;
                          const clientName = order?.user?.name ?? "Cliente";
                          const os = order?.order_status ?? "";
                          return (
                            <tr
                              key={row.id_delivery_assignment}
                              className="border-t border-slate-100 hover:bg-[#F8FBFA]"
                            >
                              <td className="px-4 py-3 font-semibold">
                                #{order?.id_order ?? "—"}
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF5F3] text-xs font-bold text-[#5B7B6D]"
                                    aria-hidden
                                  >
                                    {customerInitials(clientName)}
                                  </div>
                                  <span className="font-medium">{clientName}</span>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex min-w-[92px] justify-center rounded-full px-3 py-1.5 text-xs font-semibold ${orderStatusBadgeClass(
                                    os
                                  )}`}
                                >
                                  {orderStatusLabel(os)}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-slate-600">
                                {formatOrderDate(order?.created_at)}
                              </td>

                              
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden divide-y divide-slate-100">
                    {content.map((row) => {
                      const order = row.order;
                      const clientName = order?.user?.name ?? "Cliente";
                      const os = order?.order_status ?? "";
                      return (
                        <article key={row.id_delivery_assignment} className="p-3">
                          <div className="flex gap-3">
                            <div
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF5F3] text-xs font-bold text-[#5B7B6D]"
                              aria-hidden
                            >
                              {customerInitials(clientName)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-bold">#{order?.id_order ?? "—"}</p>
                                  <p className="truncate text-sm font-medium">{clientName}</p>
                                </div>

                                <button
                                  type="button"
                                  className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                                  aria-label="Detalle"
                                  disabled
                                >
                                  
                                </button>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatusBadgeClass(
                                    os
                                  )}`}
                                >
                                  {orderStatusLabel(os)}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {formatOrderDate(order?.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </section>

            <footer className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-sm font-semibold sm:text-left">
                Mostrando {from} al {to} de {totalElements} resultados
              </p>

              <div className="grid grid-cols-2 gap-3 sm:flex">
                <button
                  type="button"
                  disabled={loading || currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={loading || currentPage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                  <ChevronRight size={18} />
                </button>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
