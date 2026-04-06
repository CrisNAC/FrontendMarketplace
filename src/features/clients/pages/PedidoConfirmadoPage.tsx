import Navbar from "../../../components/navbar/Navbar";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const orderData = {
  orderNumber: "ORD-2024-001543",
  orderDate: "21 de octubre de 2025",
  subtotal: 1509960,
  discountLabel: "Descuento (10%):",
  discount: 150996,
  shippingLabel: "Envío Express:",
  shipping: 29990,
  total: 1388960,
  deliveryAddress: {
    title: "Dirección de Entrega",
    line1: "Av. Presidentes 1234, Apt 5",
    line2: "Santiago, Metropolitana 8320000",
    contact: "Contacto: +56 9 1234 5678",
  },
  shippingInfo: {
    title: "Información de Envío",
    method: "Envío Express",
    eta: "Entrega en 2-3 días hábiles",
  },
  products: [
    { id: 1, name: "Laptop Pro 15", quantity: 1, total: 1289990 },
    { id: 2, name: "Mouse Inalámbrico", quantity: 2, total: 59980 },
    { id: 3, name: "Teclado Mecánico RGB", quantity: 1, total: 149990 },
  ],
  email: "skf.sokc@gmail.com",
};

export default function PedidoConfirmadoPage() {
  const navigate = useNavigate();

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-h-screen bg-[#eef7f1]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <section className="mb-8 text-center">
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

          {/* Main summary card */}
          <section className="mb-5 rounded-2xl border border-[#d8e7de] bg-white p-6 shadow-sm">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-[#94a39d]">
                  Número de Pedido
                </p>
                <p className="mt-1 text-3xl font-extrabold text-[#2b3b35]">
                  {orderData.orderNumber}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-[#94a39d]">
                  Fecha del Pedido
                </p>
                <p className="mt-1 text-3xl font-extrabold text-[#2b3b35]">
                  {orderData.orderDate}
                </p>
              </div>
            </div>

            <div className="my-5 border-t border-[#e5efea]" />

            <h2 className="mb-4 text-sm font-bold text-[#2f3d38]">
              Resumen del Pedido
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-[#7f8f88]">
                <span>Subtotal:</span>
                <span className="font-medium text-[#394842]">
                  {formatPrice(orderData.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#7f8f88]">
                <span>{orderData.discountLabel}</span>
                <span className="font-medium text-[#2fb266]">
                  -{formatPrice(orderData.discount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#7f8f88]">
                <span>{orderData.shippingLabel}</span>
                <span className="font-medium text-[#394842]">
                  {formatPrice(orderData.shipping)}
                </span>
              </div>

              <div className="border-t border-[#e5efea] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#2f3d38]">
                    Total:
                  </span>
                  <span className="text-2xl font-extrabold text-[#24312c]">
                    {formatPrice(orderData.total)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 2 small cards */}
          <section className="mb-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#d8e7de] bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-[#2f3d38]">
                {orderData.deliveryAddress.title}
              </h3>

              <div className="space-y-1 text-sm text-[#7f8f88]">
                <p>{orderData.deliveryAddress.line1}</p>
                <p>{orderData.deliveryAddress.line2}</p>
                <p>{orderData.deliveryAddress.contact}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#d8e7de] bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-[#2f3d38]">
                {orderData.shippingInfo.title}
              </h3>

              <div className="space-y-3 text-sm text-[#7f8f88]">
                <p>{orderData.shippingInfo.method}</p>
                <p>{orderData.shippingInfo.eta}</p>
              </div>
            </div>
          </section>

          {/* products */}
          <section className="mb-5 rounded-2xl border border-[#d8e7de] bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-[#2f3d38]">Productos</h3>

            <div className="divide-y divide-[#e8f0eb]">
              {orderData.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#2f3d38]">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-[#8a9892]">
                      Cantidad: {product.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold text-[#4f625a]">
                    {formatPrice(product.total)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* actions */}
          <section className="mb-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/ordenes-compras")}
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