import { useCallback, useEffect, useState } from "react";
import { MapPin, Package, Store, Clock, Phone, Timer } from "lucide-react";
import { PageLoader } from "@/components";
import { formatGuarani } from "@/lib";
import {
  loadDeliveryDashboard,
  getBackendErrorMessage,
  respondToDeliveryOrder,
} from "../services/deliveryOrdersApi";
import { useToast } from "@/hooks";

const STORE_STATUS_LABEL = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  SUSPENDED: "Suspendido",
};

function formatAddress(addr) {
  if (!addr) return "Retiro en comercio / sin dirección";
  const line = [addr.address, addr.city, addr.region].filter(Boolean).join(" · ");
  return line || "Dirección no disponible";
}

function buildItemsSummary(orderItems) {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return { text: "Sin detalle de productos", extraCount: 0 };
  }
  const parts = orderItems.map((row) => {
    const name = row.product?.name ?? "Producto";
    return `${name} × ${row.quantity}`;
  });
  const maxShown = 2;
  if (parts.length <= maxShown) {
    return { text: parts.join(", "), extraCount: 0 };
  }
  return {
    text: parts.slice(0, maxShown).join(", "),
    extraCount: parts.length - maxShown,
  };
}

function estimateDeliveryMinutes(shippingDistanceKm) {
  const baseMin = 8;
  const km = Number(shippingDistanceKm);
  if (!Number.isFinite(km) || km <= 0) return baseMin + 15;
  return Math.max(15, Math.round(baseMin + km * 4));
}

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

function resolveCustomerAvatarUrl(user) {
  if (!user) return null;
  const raw = user.avatar_url?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${API_ORIGIN}${raw}`;
  return raw;
}

function formatRemainingTime(deadlineIso) {
  if (!deadlineIso) return null;
  const ms = new Date(deadlineIso).getTime() - Date.now();
  if (ms <= 0) return "Tiempo agotado";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function isDeadlineExpired(deadlineIso) {
  if (!deadlineIso) return false;
  return new Date(deadlineIso).getTime() <= Date.now();
}

function customerInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function mapAssignmentToCard(assignment, fallbackStore) {
  const order = assignment?.order;
  if (!order) return null;

  const store = order.store ?? fallbackStore;
  const { text, extraCount } = buildItemsSummary(order.order_items);
  const km =
    order.shipping_distance_km === null || order.shipping_distance_km === undefined
      ? null
      : Number(order.shipping_distance_km);

  const customerUser = order.user ?? null;
  const customer = customerUser
    ? {
      id: customerUser.id_user,
      name: customerUser.name?.trim() || "Cliente",
      phone: customerUser.phone?.trim() || null,
      avatarUrl: resolveCustomerAvatarUrl(customerUser),
      initials: customerInitials(customerUser.name),
    }
    : {
      id: null,
      name: "Cliente",
      phone: null,
      avatarUrl: null,
      initials: "?",
    };

  return {
    assignmentId: assignment.id_delivery_assignment,
    orderId: order.id_order,
    responseDeadline: assignment.response_deadline ?? null,
    orderStatus: order.order_status,
    total: Number(order.total),
    shippingDistanceKm: km,
    storeName: store?.name ?? "Comercio",
    storeStatus: store?.store_status ?? null,
    address: order.address ?? null,
    customer,
    itemsSummary: text,
    itemsExtraCount: extraCount,
    estimatedMinutes: estimateDeliveryMinutes(order.shipping_distance_km),
  };
}

export default function DeliveryOrderScreen() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [gateReason, setGateReason] = useState(null);
  const [, setNowTick] = useState(Date.now());
  const { showToast } = useToast();

  const loadOffers = useCallback(async () => {
    try {
      setLoading(true);
      setGateReason(null);
      const { assignments, reason, delivery } = await loadDeliveryDashboard();

      if (reason === "not_delivery") {
        setGateReason("not_delivery");
        setCards([]);
        return;
      }
      if (reason === "no_delivery_profile") {
        setGateReason("no_delivery_profile");
        setCards([]);
        return;
      }

      const fallbackStore = delivery?.store ?? null;
      const mapped = assignments
        .map((a) => mapAssignmentToCard(a, fallbackStore))
        .filter(Boolean);
      setCards(mapped);
    } catch (err) {
      showToast(getBackendErrorMessage(err, "No se pudieron cargar los pedidos."), "error");
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    const timer = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [setNowTick]);

  useEffect(() => {
    const deadlines = cards
      .map((c) => (c.responseDeadline ? new Date(c.responseDeadline).getTime() : null))
      .filter((ts) => Number.isFinite(ts));
    if (deadlines.length === 0) return undefined;

    const now = Date.now();
    const expired = deadlines.some((ts) => ts <= now);
    const future = deadlines.filter((ts) => ts > now);
    const delay = expired ? 800 : Math.max(0, Math.min(...future) - now + 800);

    const refresh = setTimeout(() => loadOffers(), delay);
    return () => clearTimeout(refresh);
  }, [cards, loadOffers]);


  const handleDecision = async (orderId, action) => {
    try {
      setActingId(orderId);
      const result = await respondToDeliveryOrder(orderId, action);
      if (action === "ACCEPT") {
        showToast("Pedido aceptado.", "success");
      } else if (result?.delivery_unavailable) {
        showToast("Pedido rechazado. El comercio fue notificado para reasignar otro repartidor.", "success");
      } else {
        showToast("Pedido rechazado.", "success");
      }
      window.dispatchEvent(new Event("notificationsUpdated"));
      await loadOffers();
    } catch (err) {
      showToast(getBackendErrorMessage(err, "No se pudieron cargar los pedidos."), "error");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="min-h-full w-full bg-[#EAF5F3] text-slate-900">
      <main className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-5 md:px-6 lg:px-8">
        <header className="mb-6 border-b border-[#719783]/25 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="mt-1 text-2xl font-bold text-[#102A43] md:text-3xl">
                Pedidos para aceptar
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-500 md:text-base">
                Tenés entre 5 y 10 minutos para aceptar o rechazar cada pedido asignado.
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadOffers()}
              disabled={loading}
              className="h-11 shrink-0 self-stretch rounded-xl border border-[#719783]/50 bg-white px-5 text-sm font-semibold text-[#102A43] shadow-sm transition hover:bg-[#F3FAF7] disabled:opacity-50 sm:self-center sm:px-6"
            >
              Actualizar
            </button>
          </div>
        </header>
        {gateReason === "not_delivery" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-8 text-center text-sm text-amber-900 sm:px-6 sm:py-10">
            Iniciá sesión con una cuenta de repartidor para ver los pedidos.
          </div>
        )}

        {gateReason === "no_delivery_profile" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-8 text-center text-sm text-amber-900 sm:px-6 sm:py-10">
            Tu usuario no tiene perfil de delivery activo. Registrate como delivery desde el perfil
            de cliente.
          </div>
        )}

        {!gateReason && loading ? <PageLoader /> : null}

        {!gateReason && !loading && cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center shadow-sm sm:px-6 sm:py-16">
            <Package className="mx-auto mb-3 h-10 w-10 text-[#719783]" strokeWidth={1.5} />
            <p className="text-base font-semibold text-[#102A43]">No hay pedidos pendientes</p>
            <p className="mt-2 text-sm text-slate-600">
              Cuando el comercio te asigne un pedido, vas a verlo acá para aceptarlo o rechazarlo.
            </p>
          </div>
        ) : null}

        {!gateReason && !loading && cards.length > 0 ? (
          <ul className="grid list-none grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2">
            {cards.map((o) => {
              const expired = isDeadlineExpired(o.responseDeadline);
              const remaining = formatRemainingTime(o.responseDeadline);
              const actionsDisabled = expired || actingId === o.orderId;

              return (
                <li key={o.assignmentId} className="min-w-0">
                  <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="h-1.5 w-full bg-[#719783]" />
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-2">
                          <Store className="mt-0.5 h-5 w-5 shrink-0 text-[#719783]" strokeWidth={2} />
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-bold text-[#102A43]">{o.storeName}</h2>
                            <p className="text-xs text-slate-500">
                              Pedido #{o.orderId}
                              {o.orderStatus ? (
                                <span className="ml-2 font-mono text-[10px] uppercase text-slate-400">
                                  {o.orderStatus}
                                </span>
                              ) : null}
                              {o.storeStatus ? (
                                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                                  {STORE_STATUS_LABEL[o.storeStatus] ?? o.storeStatus}
                                </span>
                              ) : null}
                            </p>
                          </div>
                        </div>
                        <p className="shrink-0 text-base font-semibold text-[#719783] sm:text-right">
                          {formatGuarani(o.total)}
                        </p>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-100 bg-[#F8FBFA] px-3 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Cliente</p>
                        <div className="mt-2 flex gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#EAF5F3] ring-2 ring-white">
                            <div
                              className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#719783]"
                              aria-hidden
                            >
                              {o.customer.initials}
                            </div>
                            {o.customer.avatarUrl ? (
                              <img
                                src={o.customer.avatarUrl}
                                alt={o.customer.name}
                                className="relative z-10 h-full w-full object-cover"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.style.visibility = "hidden";
                                }}
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#102A43]">{o.customer.name}</p>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                              <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                              <span>{o.customer.phone ?? "Sin teléfono"}</span>
                            </div>
                            <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-600">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                              <span className="leading-snug break-words">
                                <span className="font-medium text-[#102A43]">Envío: </span>
                                {formatAddress(o.address)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {o.responseDeadline ? (
                        <div
                          className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${expired
                              ? "border-amber-200 bg-amber-50 text-amber-900"
                              : "border-[#719783]/30 bg-[#F3FAF7] text-[#102A43]"
                            }`}
                        >
                          <Timer className="h-4 w-4 shrink-0" />
                          <span>
                            {expired
                              ? "El plazo para responder venció"
                              : `Tiempo para responder: ${remaining}`}
                          </span>
                        </div>
                      ) : null}

                      <div className="mt-3 space-y-2 rounded-xl border border-slate-100 bg-white px-3 py-3 text-sm text-slate-800">
                        <div className="flex gap-2">
                          <Package className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                          <p className="min-w-0 leading-snug">
                            <span className="font-semibold text-[#102A43]">Productos: </span>
                            {o.itemsSummary}
                            {o.itemsExtraCount > 0 ? (
                              <span className="text-slate-600"> (+{o.itemsExtraCount} más)</span>
                            ) : null}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                          <p className="min-w-0">
                            <span className="font-semibold text-[#102A43]">Tiempo estimado: </span>~
                            {o.estimatedMinutes} min
                            {o.shippingDistanceKm != null ? (
                              <span className="text-slate-600">
                                {" "}
                                · {Number(o.shippingDistanceKm).toFixed(1)} km
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-1 gap-3 pt-5 sm:grid-cols-2">
                        <button
                          type="button"
                          disabled={actionsDisabled}
                          onClick={() => handleDecision(o.orderId, "REJECT")}
                          className="min-h-[48px] rounded-xl bg-red-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-full"
                        >
                          Rechazar
                        </button>
                        <button
                          type="button"
                          disabled={actionsDisabled}
                          onClick={() => handleDecision(o.orderId, "ACCEPT")}
                          className="min-h-[48px] rounded-xl bg-[#719783] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5e806f] active:bg-[#536b5f] disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-full"
                        >
                          Aceptar
                        </button>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        ) : null}
      </main>
    </div>
  );
}
