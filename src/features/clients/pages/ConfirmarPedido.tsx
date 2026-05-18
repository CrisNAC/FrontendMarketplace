import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiBase } from "../../../lib/cartApi";
import { formatGuarani } from "../../../lib/formatGuarani.js";

const shippingOptions = [
  {
    id: "pickup",
    label: "Retirar en Local",
    desc: "Retira tu pedido en nuestro local",
  },
  {
    id: "standard",
    label: "Envío Estándar",
    desc: "Entrega en 5-7 días hábiles",
  },
];

type ShippingQuote = {
  distance_km: number;
  shipping_cost: number;
  threshold_km: number;
  rate_type: "base_price" | "distance_price";
  rate_per_km: number;
};

type BackendCart = {
  id: number;
  storeId: number;
  commerce: {
    id: number;
    name: string;
  } | null;
  status: string;
  items: Array<{
    id: number;
    quantity: number;
    product: {
      id: number;
      name: string;
      price: number;
      originalPrice?: number | null;
      offerPrice?: number | null;
      isOffer: boolean;
      stock?: number;
    };
  }>;
};

type UserAddress = {
  id_address: number;
  fk_user: number;
  fk_store: number | null;
  address: string;
  city: string;
  region: string;
  postal_code: string | null;
  latitude: number;
  longitude: number;
  status: boolean;
  created_at: string;
  updated_at: string;
};

export default function ConfirmarPedido() {
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [selectedShipping, setSelectedShipping] = useState("pickup");
  const [notes, setNotes] = useState("");
  const [cart, setCart] = useState<BackendCart | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "unauthorized">("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(null);
  const [shippingQuoteStatus, setShippingQuoteStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const submitLockRef = useRef(false);

  const navigate = useNavigate();
  const { cartId } = useParams();
  const apiBase = getApiBase() || "http://localhost:3000";

  const loadCart = useCallback(async () => {
    try {
      if (!cartId) {
        setStatus("error");
        toast.error("Carrito inválido");
        return;
      }

      const sessionRes = await axios.get(`${apiBase}/api/session/user-session`, {
        withCredentials: true,
      });

      const userId = sessionRes.data?.user?.id_user;

      if (!userId) {
        setStatus("unauthorized");
        toast.error("Iniciá sesión para continuar");
        navigate("/login");
        return;
      }

      const cartsRes = await axios.get(`${apiBase}/api/users/${userId}/carts`, {
        withCredentials: true,
      });

      const carts: BackendCart[] = Array.isArray(cartsRes.data?.carts)
        ? cartsRes.data.carts
        : [];

      const selectedCart = carts.find((cart) => Number(cart.id) === Number(cartId));

      if (!selectedCart) {
        setStatus("error");
        toast.error("Carrito no encontrado");
        return;
      }

      setCart(selectedCart);
    } catch (error: any) {
      const code = error?.response?.status;

      if (code === 401) {
        setStatus("unauthorized");
        toast.error("Iniciá sesión para continuar");
        navigate("/login");
        return;
      }

      setStatus("error");
      toast.error(error?.response?.data?.message || "No se pudo cargar el pedido");
    }
  }, [apiBase, cartId, navigate]);

  const loadAddresses = useCallback(async () => {
    try {
      const sessionRes = await axios.get(`${apiBase}/api/session/user-session`, {
        withCredentials: true,
      });

      const userId = sessionRes.data?.user?.id_user;

      if (!userId) {
        toast.error("Iniciá sesión para ver tus direcciones");
        navigate("/login");
        return;
      }

      const addressesRes = await axios.get(`${apiBase}/api/users/${userId}/addresses`, {
        withCredentials: true,
      });

      const addressesData = Array.isArray(addressesRes.data?.data)
        ? addressesRes.data.data
        : [];

      setAddresses(addressesData);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "No se pudieron cargar las direcciones"
      );
      setAddresses([]);
    }
  }, [apiBase, navigate]);

  useEffect(() => {
    const loadInitialData = async () => {
      setStatus("loading");

      try {
        await Promise.all([loadCart(), loadAddresses()]);
        setStatus("ready");
      } catch {
        // los errores ya se manejan adentro
      }
    };

    loadInitialData();
  }, [loadCart, loadAddresses]);

  const requiresAddress = selectedShipping !== "pickup";

  useEffect(() => {
    if (selectedShipping === "pickup") {
      setSelectedAddress(0);
      setShippingQuote(null);
      setShippingQuoteStatus("idle");
    } else if (selectedAddress === 0 && addresses.length > 0) {
      setSelectedAddress(addresses[0].id_address);
    }
  }, [selectedShipping, selectedAddress, addresses]);

  const calculateShippingQuote = useCallback(async () => {
    if (!cart || !selectedAddress || selectedShipping !== "standard") {
      return;
    }

    setShippingQuoteStatus("loading");
    try {
      const response = await axios.post(
        `${apiBase}/api/orders/shipping-quote`,
        {
          cartId: cart.id,
          addressId: selectedAddress,
        },
        {
          withCredentials: true,
        }
      );

      setShippingQuote(response.data);
      setShippingQuoteStatus("ready");
    } catch (error: any) {
      setShippingQuote(null);
      setShippingQuoteStatus("error");
      toast.error(
        error?.response?.data?.message || "No se pudo calcular el costo de envío"
      );
    }
  }, [apiBase, cart, selectedAddress, selectedShipping]);

  useEffect(() => {
    if (selectedShipping !== "standard") {
      return;
    }

    if (!selectedAddress) {
      setShippingQuote(null);
      setShippingQuoteStatus("idle");
      return;
    }

    calculateShippingQuote();
  }, [selectedShipping, selectedAddress, calculateShippingQuote]);

  const subtotal = useMemo(() => {
    if (!cart) return 0;

    return cart.items.reduce((acc, item) => {
      const originalPrice = Number(
        item.product?.originalPrice ?? item.product?.price ?? 0
      );
      return acc + originalPrice * Number(item.quantity ?? 1);
    }, 0);
  }, [cart]);

  const discount = useMemo(() => {
    if (!cart) return 0;

    return cart.items.reduce((acc, item) => {
      const originalPrice = Number(
        item.product?.originalPrice ?? item.product?.price ?? 0
      );
      const offerPrice =
        item.product?.offerPrice != null
          ? Number(item.product.offerPrice)
          : originalPrice;
      const isOffer = Boolean(item.product?.isOffer);
      const quantity = Number(item.quantity ?? 1);

      if (isOffer) {
        return acc + (originalPrice - offerPrice) * quantity;
      }

      return acc;
    }, 0);
  }, [cart]);

  const shipping = selectedShipping === "pickup"
    ? 0
    : Number(shippingQuote?.shipping_cost ?? 0);

  const total = subtotal - discount + shipping;

  const outOfStockItems = useMemo(() => {
    if (!cart) return [];
    return cart.items.filter(item => (item.product.stock ?? 0) < item.quantity);
  }, [cart]);

  const handleConfirmOrder = async () => {
  if (submitLockRef.current) return;

  try {
    if (!cart) {
      toast.error("No se encontró el carrito");
      return;
    }

    if (requiresAddress && !selectedAddress) {
      toast.error("Selecciona una dirección de entrega");
      return;
    }

    if (requiresAddress && shippingQuoteStatus !== "ready") {
      toast.error("Debes calcular el envío antes de confirmar");
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);

    const payload = {
      cartId: cart.id,
      addressId: requiresAddress ? selectedAddress : null,
      shippingMethod: requiresAddress ? "standard" : "pickup",
      shippingCost: requiresAddress ? shipping : 0,
      shippingDistanceKm: requiresAddress ? shippingQuote?.distance_km ?? null : null,
      notes: notes.trim() || null,
    };

    const response = await axios.post(`${apiBase}/api/orders`, payload, {
      withCredentials: true,
    });

    const createdOrder = response.data;

    toast.success("Pedido confirmado correctamente");

    navigate("/pedido-confirmado", {
      state: {
        order: createdOrder,
        shippingMethod: selectedShipping,
        shippingCost: shipping,
        shippingDistanceKm: shippingQuote?.distance_km ?? null,
        subtotal,
        discount,
        total,
      },
    });
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message || "No se pudo confirmar el pedido"
    );
  } finally {
    submitLockRef.current = false;
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-[#f0f7f2] font-sans">
      <div className="max-w-7xl mx-auto w-full px-6 py-6">
        <div className="mb-6 flex items-center gap-4">
          <ArrowLeft
            className="w-6 h-6 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <div>
            <h1 className="text-2xl font-bold">Confirmar Pedido</h1>
          </div>
        </div>

        {status === "loading" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">Cargando pedido...</p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">No se pudo cargar el pedido.</p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                Promise.all([loadCart(), loadAddresses()]).then(() => setStatus("ready"));
              }}
              className="mt-3 rounded-lg bg-[#5B7B6D] px-4 py-2 text-sm text-white"
            >
              Reintentar
            </button>
          </div>
        )}

        {status === "ready" && cart && (
          <div className="mx-auto max-w-6xl px-0 py-2">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="flex-1 flex flex-col gap-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-2">
                    <span className="text-[#5B7B6D]">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="1" y="3" width="15" height="13" rx="1" />
                        <path d="M16 8h4l3 5v3h-7V8z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="5.5" cy="18.5" r="1.5" />
                        <circle cx="18.5" cy="18.5" r="1.5" />
                      </svg>
                    </span>
                    <h2 className="text-base font-semibold text-gray-800">
                      Método de entrega
                    </h2>
                  </div>

                  <div className="flex flex-col gap-2">
                    {shippingOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all duration-150 ${
                          selectedShipping === opt.id
                            ? "border-[#5B7B6D] bg-[#eef4f1]"
                            : "border-gray-200 bg-gray-50/40 hover:border-[#5B7B6D]/40"
                        }`}
                      >
                        <span className="mt-2">
                          <span
                            className={`inline-flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                              selectedShipping === opt.id
                                ? "border-[#5B7B6D] bg-[#5B7B6D]"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {selectedShipping === opt.id && (
                              <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </span>
                        </span>

                        <input
                          type="radio"
                          className="hidden"
                          checked={selectedShipping === opt.id}
                          onChange={() => setSelectedShipping(opt.id)}
                        />

                        <div className="flex-1">
                          <p className="text-sm font-semibold leading-tight text-gray-800">
                            {opt.label}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {opt.desc}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${
                              opt.id === "pickup" ? "text-[#5B7B6D]" : "text-gray-800"
                            }`}
                          >
                            {opt.id === "pickup"
                              ? "Gratis"
                              : shippingQuoteStatus === "loading"
                                ? "Calculando..."
                                : shippingQuoteStatus === "ready"
                                  ? formatGuarani(Number(shippingQuote?.shipping_cost ?? 0))
                                  : "Según distancia"}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {requiresAddress && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                      <span className="text-[#5B7B6D]">
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                      </span>
                      <h2 className="text-base font-semibold text-gray-800">
                        Dirección de Entrega
                      </h2>
                    </div>

                    <div className="flex flex-col gap-3">
                      {addresses.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                          No tienes direcciones registradas.
                        </div>
                      ) : (
                        <>
                          <label className="text-sm font-medium text-gray-700" htmlFor="addressSelect">
                            Selecciona dirección de entrega
                          </label>
                          <select
                            id="addressSelect"
                            value={selectedAddress}
                            onChange={(e) => setSelectedAddress(Number(e.target.value))}
                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                          >
                            {addresses.map((addr) => (
                              <option key={addr.id_address} value={addr.id_address}>
                                {addr.address} - {addr.city}, {addr.region}
                              </option>
                            ))}
                          </select>

                          {selectedAddress !== 0 && (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                              {(() => {
                                const currentAddress = addresses.find(
                                  (addr) => addr.id_address === selectedAddress
                                );
                                if (!currentAddress) return null;

                                return (
                                  <>
                                    <p className="font-semibold text-gray-700">Dirección seleccionada</p>
                                    <p>
                                      {currentAddress.address}, {currentAddress.city}, {currentAddress.region}
                                      {currentAddress.postal_code ? ` ${currentAddress.postal_code}` : ""}
                                    </p>
                                  </>
                                );
                              })()}
                            </div>
                          )}

                          <div className="rounded-xl border border-green-100 bg-green-50/40 p-3 text-xs text-gray-700">
                            <p>
                              Distancia estimada: {shippingQuoteStatus === "ready"
                                ? `${Number(shippingQuote?.distance_km ?? 0).toFixed(2)} km`
                                : shippingQuoteStatus === "loading"
                                  ? "Calculando..."
                                  : "Selecciona una dirección"}
                            </p>
                            <p className="mt-1">
                              Costo de envío: {shippingQuoteStatus === "ready"
                                ? formatGuarani(Number(shippingQuote?.shipping_cost ?? 0))
                                : shippingQuoteStatus === "loading"
                                  ? "Calculando..."
                                  : "Pendiente"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/direcciones")}
                      className="mt-4 w-full rounded-xl border border-dashed border-[#5B7B6D]/40 py-2.5 text-sm font-medium text-[#5B7B6D] transition-colors hover:bg-[#eef4f1]"
                    >
                      + Agregar nueva dirección
                    </button>
                  </div>
                )}

                <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold text-gray-800">
                    Notas para la Entrega
                  </h2>
                  <textarea
                    className="h-24 w-full resize-none rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-sm text-gray-700 transition placeholder-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-300"
                    placeholder={
                      requiresAddress
                        ? "Instrucciones especiales para el delivery..."
                        : "Notas para el retiro en el local..."
                    }
                    maxLength={250}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    {notes.length}/250 caracteres
                  </p>
                </div>
              </div>

              <div className="lg:w-72 xl:w-80">
                <div className="sticky top-6 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-5 text-base font-semibold text-gray-800">
                    Resumen del Pedido
                  </h2>

                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal:</span>
                      <span className="font-medium text-gray-700">
                        {formatGuarani(subtotal)}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-gray-500">
                        <span>Descuento:</span>
                        <span className="font-medium text-red-500">
                          - {formatGuarani(discount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-500">
                      <span>Entrega:</span>
                      <span className="font-medium text-gray-700">
                        {shipping === 0 ? "Gratis" : formatGuarani(shipping)}
                      </span>
                    </div>

                    {selectedShipping === "standard" && shippingQuoteStatus === "ready" && (
                      <div className="flex justify-between text-gray-500">
                        <span>Distancia:</span>
                        <span className="font-medium text-gray-700">
                          {Number(shippingQuote?.distance_km ?? 0).toFixed(2)} km
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-base font-bold text-gray-800">Total:</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatGuarani(total)}
                    </span>
                  </div>

                  {outOfStockItems.length > 0 && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <p className="font-semibold mb-1">⚠️ Stock insuficiente</p>
                      <ul className="list-disc pl-4 text-xs">
                        {outOfStockItems.map((item) => (
                          <li key={item.id}>
                            {item.product.name} (Disp: {item.product.stock ?? 0})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={
                      isSubmitting ||
                      (requiresAddress && (addresses.length === 0 || shippingQuoteStatus !== "ready")) ||
                      outOfStockItems.length > 0
                    }
                    className="mt-4 w-full rounded-lg bg-[#5B7B6D] py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-[#4e6a5e] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Confirmando..." : "Confirmar Pedido"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/carrito/${cartId}`)}
                    className="mt-2 w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 transition-all duration-150 hover:border-gray-400"
                  >
                    Volver al Carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}