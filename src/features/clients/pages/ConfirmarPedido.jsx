import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";


const addresses = [
  {
    id: 1,
    label: "Casa",
    isDefault: true,
    line1: "Av. Presidentes 1234, Apt 5",
    line2: "Santiago, Metropolitana 8320000",
    phone: "Teléfono: +56 9 1234 5678",
  },
  {
    id: 2,
    label: "Oficina",
    isDefault: false,
    line1: "Calle Comercio 567",
    line2: "Santiago, Metropolitana 8320100",
    phone: "Teléfono: +56 2 2123 4567",
  },
];

const shippingOptions = [
  {
    id: "standard",
    label: "Envío Estándar",
    desc: "Entrega en 5-7 días hábiles",
    price: 15.99,
    priceLabel: "$15.99",
    timeLabel: "5-7 días",
  },
  {
    id: "pickup",
    label: "Retirar en Local",
    desc: "Retira tu pedido en nuestro local",
    price: 0,
    priceLabel: "Gratis",
    timeLabel: "Mismo día",
  },
];

export default function ConfirmarPedido() {
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();


  const subtotal = 1509.96;
  const discount = 151.0;
  const shipping =
    shippingOptions.find((o) => o.id === selectedShipping)?.price ?? 15.99;
  const total = subtotal - discount + shipping;

  return (
    <div>
     <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-6 py-6">
        <div className="flex items-center gap-4">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-2xl font-bold">Confirmar Pedido</h1>
        </div>
        
        <div className="min-h-screen bg-[#f0f7f2] font-sans">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Delivery Address */}
           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[#5B7B6D]">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </span>
              <h2 className="font-semibold text-gray-800 text-base">Dirección de Entrega</h2>
            </div>

            <div className="flex flex-col gap-3">
              {addresses.map((addr) => (
                
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                    selectedAddress === addr.id
                      ? "border-[#5B7B6D] bg-[#eef4f1]"
                      : "border-gray-200 hover:border-[#5B7B6D]/40 bg-gray-50/40"
                  }`}
                >
                  <span className="mt-1">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center inline-flex transition-colors ${
                        selectedAddress === addr.id
                          ? "border-[#5B7B6D] bg-[#5B7B6D]"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedAddress === addr.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                      )}
                    </span>
                  </span>

                  <input
                    type="radio"
                    className="hidden"
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{addr.label}</span>

                      {addr.isDefault && (
                        <span className="text-[11px] bg-[#eef4f1] text-[#5B7B6D] font-medium px-2 py-0.5 rounded-full">
                          Por defecto
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">
                      {addr.line1}
                      <br />
                      {addr.line2}
                      <br />
                      {addr.phone}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <button className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-[#5B7B6D]/40 text-[#5B7B6D] text-sm font-medium hover:bg-[#eef4f1] transition-colors">
              + Agregar nueva dirección
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[#5B7B6D]">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="1" y="3" width="15" height="13" rx="1" />
                  <path d="M16 8h4l3 5v3h-7V8z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="5.5" cy="18.5" r="1.5" />
                  <circle cx="18.5" cy="18.5" r="1.5" />
                </svg>
              </span>
              <h2 className="font-semibold text-gray-800 text-base">Opciones de Envío</h2>
            </div>

            <div className="flex flex-col gap-3">
              {shippingOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                    selectedShipping === opt.id
                      ? "border-[#5B7B6D] bg-[#eef4f1]"
                      : "border-gray-200 hover:border-[#5B7B6D]/40 bg-gray-50/40"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                      selectedShipping === opt.id
                        ? "border-[#5B7B6D] bg-[#5B7B6D]"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {selectedShipping === opt.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                    )}
                  </span>

                  <input
                    type="radio"
                    className="hidden"
                    checked={selectedShipping === opt.id}
                    onChange={() => setSelectedShipping(opt.id)}
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-bold text-sm ${
                        opt.price === 0 ? "text-[#5B7B6D]" : "text-gray-800"
                      }`}
                    >
                      {opt.priceLabel}
                    </p>
                    <p className="text-xs text-gray-400">{opt.timeLabel}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

            {/* Delivery Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
              <h2 className="font-semibold text-gray-800 text-base mb-4">Notas para la Entrega</h2>
              <textarea
                className="w-full h-24 rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent placeholder-gray-300 transition"
                placeholder="Instrucciones especiales para el delivery..."
                maxLength={250}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">{notes.length}/250 caracteres</p>
            </div>
          </div>

          {/* Right Column — Order Summary */}
          <div className="lg:w-72 xl:w-80">
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 sticky top-6">
              <h2 className="font-semibold text-gray-800 text-base mb-5">Resumen del Pedido</h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span className="text-gray-700 font-medium">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Descuento:</span>
                  <span className="text-red-500 font-medium">
                    -${discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Envío:</span>
                  <span className="text-gray-700 font-medium">
                    {shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-800 text-base">Total:</span>
                <span className="font-bold text-gray-900 text-xl">
                  ${total.toFixed(2)}
                </span>
              </div>

              <button className="mt-4 w-full py-2 rounded-lg bg-[#5B7B6D] hover:bg-[#4e6a5e] active:scale-[0.98] text-white font-medium text-sm transition-all duration-150 shadow-sm">
                Confirmar Pedido
              </button>

              <button className="mt-2 w-full py-2 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-600 font-medium text-sm transition-all duration-150">
                Volver al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
    </div>
  );
}
