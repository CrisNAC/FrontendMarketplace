import Navbar from "../../../components/navbar/Navbar";
import { formatGuarani } from "../../../lib/formatGuarani.js";
import { CheckCircle2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type OrderItem = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  originalPrice: number;
  isOfferApplied: boolean;
  subtotal: number;
};

type OrderAddress = {
  id: number;
  address: string;
  city: string;
  region: string;
} | null;

type OrderResponse = {
  id: number;
  status: string;
  total: number;
  notes: string | null;
  address: OrderAddress;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

type LocationState = {
  order?: OrderResponse;
  shippingMethod?: string;
  shippingCost?: number;
  subtotal?: number;
  discount?: number;
  total?: number;
};

export default function PedidoConfirmadoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const order = state.order;
  const shippingMethod = state.shippingMethod ?? "pickup";
  const shippingCost = Number(state.shippingCost ?? 0);
  const subtotal = Number(state.subtotal ?? order?.total ?? 0);
  const discount = Number(state.discount ?? 0);
  const total = Number(state.total ?? order?.total ?? 0);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("es-PY", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatStatus = (status?: string) => {
    if (!status) return "—";

    if (status.toLowerCase() === "pending") return "PENDIENTE";

    return status.toUpperCase();
  };

  const shippingLabel =
    shippingMethod === "pickup" ? "Retiro en Local" : "Envío Estándar";

  const shippingEta =
    shippingMethod === "pickup"
      ? "Retira tu pedido en el local"
      : "Entrega en 5-7 días hábiles";

  if (!order) {
    return (
      <div className="min-h-screen bg-[#eef7f1]">
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>

        <main className="mx-auto max-w-7xl px-6 py-6">
          <div className="mx-auto max-w-2xl rounded-2xl border border-[#d8e7de] bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-[#2b3b35]">
              No se encontró información del pedido
            </h1>
            <p className="mt-2 text-sm text-[#7c8d86]">
              Parece que entraste a esta página sin confirmar una compra primero.
            </p>

            <button
              type="button"
              onClick={() => navigate("/pedidos")}
              className="mt-5 rounded-lg bg-[#5f7f71] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#536f63]"
            >
              Ir a Mis Pedidos
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef7f1]">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <section className="mb-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#35c36b] bg-[#ecfff3]">
                <CheckCircle2 className="h-10 w-10 text-[#35c36b]" />
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-[#2b3b35]">
              ¡Pedido Confirmado!
            </h1>
            <p className="mt-2 text-sm text-[#7c8d86]">
              Tu pedido ha sido recibido y está siendo procesado
            </p>
          </section>

          <section className="mb-4 rounded-2xl border border-[#d8e7de] bg-white p-5 shadow-sm">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-[#94a39d]">
                  Número de Pedido
                </p>
                <p className="mt-1 text-3xl font-extrabold text-[#2b3b35]">
                  #{order.id}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-[#94a39d]">
                  Fecha del Pedido
                </p>
                <p className="mt-1 text-3xl font-extrabold text-[#2b3b35]">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            <div className="my-4 border-t border-[#e5efea]" />

            <h2 className="mb-4 text-sm font-bold text-[#2f3d38]">
              Resumen del Pedido
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-[#7f8f88]">
                <span>Subtotal:</span>
                <span className="font-medium text-[#394842]">
                  {formatGuarani(subtotal)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-[#7f8f88]">
                  <span>Descuento:</span>
                  <span className="font-medium text-[#2fb266]">
                    -{formatGuarani(discount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#7f8f88]">
                <span>{shippingLabel}:</span>
                <span className="font-medium text-[#394842]">
                  {shippingCost === 0 ? "Gratis" : formatGuarani(shippingCost)}
                </span>
              </div>

              <div className="border-t border-[#e5efea] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#2f3d38]">
                    Total:
                  </span>
                  <span className="text-2xl font-extrabold text-[#24312c]">
                    {formatGuarani(total)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#d8e7de] bg-white p-4 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-[#2f3d38]">
                {order.address ? "Dirección de Entrega" : "Método de Entrega"}
              </h3>

              <div className="space-y-1 text-sm text-[#7f8f88]">
                {order.address ? (
                  <>
                    <p>{order.address.address}</p>
                    <p>
                      {order.address.city}, {order.address.region}
                    </p>
                  </>
                ) : (
                  <>
                    <p>Retiro en Local</p>
                    <p>No se registró dirección de entrega</p>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#d8e7de] bg-white p-4 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-[#2f3d38]">
                Información de Envío
              </h3>

              <div className="space-y-3 text-sm text-[#7f8f88]">
                <p>{shippingLabel}</p>
                <p>{shippingEta}</p>
                <p>Estado: {formatStatus(order.status)}</p>
              </div>
            </div>
          </section>

          <section className="mb-4 rounded-2xl border border-[#d8e7de] bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-[#2f3d38]">Productos</h3>

            <div className="divide-y divide-[#e8f0eb]">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 py-2"
                >
                  <div>
                    
                    <p className="text-sm font-semibold text-[#2f3d38]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-[#8a9892]">
                      Cantidad: {item.quantity}
                    </p>
                    {item.isOfferApplied && (
                      <p className="mt-1 text-xs text-[#2fb266]">
                        Oferta aplicada
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 text-sm font-bold text-[#4f625a]">
                    {formatGuarani(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {order.notes && (
            <section className="mb-4 rounded-2xl border border-[#d8e7de] bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-[#2f3d38]">
                Notas del Pedido
              </h3>
              <p className="text-sm text-[#7f8f88]">{order.notes}</p>
            </section>
          )}

          <section className="mb-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/pedidos")}
              className="min-w-[170px] rounded-lg bg-[#5f7f71] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#536f63]"
            >
              Ver Mis Pedidos
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}