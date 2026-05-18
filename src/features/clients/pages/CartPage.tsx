import { useMemo, useState, useEffect, useCallback } from "react";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import Navbar from "../../../components/navbar/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiBase } from "../../../lib/cartApi";
import { formatGuarani } from "../../../lib/formatGuarani.js";

type CartItem = {
  id: number;
  productId: number;
  name: string;
  store: string;
  price: number;
  offerPrice?: number | null;
  isOffer: boolean;
  quantity: number;
  image: string;
  stock: number;
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
      imageUrl?: string | null;
      stock?: number;
    };
  }>;
};

export const CartPage = () => {
  const navigate = useNavigate();
  const { cartId } = useParams();
  const apiBase = getApiBase() || "http://localhost:3000";

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartName, setCartName] = useState("Carrito de Compras");
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "unauthorized">("loading");

  const loadCart = useCallback(async () => {
    try {
      setStatus("loading");

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
        toast.error("Iniciá sesión para ver tu carrito");
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
        setCartItems([]);
        setCartName("Carrito de Compras");
        setStatus("error");
        toast.error("Carrito no encontrado");
        return;
      }

      setCartName(selectedCart.commerce?.name || "Carrito de Compras");

      const mappedItems: CartItem[] = (selectedCart.items || []).map((item) => ({
        id: item.id,
        productId: item.product?.id,
        name: item.product?.name ?? "Producto",
        store: selectedCart.commerce?.name ?? "Comercio",
        price: Number(item.product?.originalPrice ?? item.product?.price ?? 0),
        offerPrice:
          item.product?.offerPrice != null
            ? Number(item.product.offerPrice)
            : null,
        isOffer: Boolean(item.product?.isOffer),
        quantity: Number(item.quantity ?? 1),
        image: item.product?.imageUrl ?? "",
        stock: Number(item.product?.stock ?? 0),
      }));

      setCartItems(mappedItems);
      setStatus("ready");
    } catch (error: any) {
      const code = error?.response?.status;

      if (code === 401) {
        setStatus("unauthorized");
        toast.error("Iniciá sesión para ver tu carrito");
        navigate("/login");
        return;
      }

      setStatus("error");
      toast.error(error?.response?.data?.message || "No se pudo cargar el carrito");
    }
  }, [apiBase, cartId, navigate]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const updateQuantity = (id: number, type: "inc" | "dec") => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (type === "inc" && item.quantity >= item.stock) {
          toast.error(`Solo hay ${item.stock} unidades disponibles de ${item.name}`);
          return item;
        }

        const newQuantity =
          type === "inc" ? item.quantity + 1 : Math.max(1, item.quantity - 1);

        return { ...item, quantity: newQuantity };
      })
    );
  };

  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getFinalPrice = (item: CartItem) => {
    return item.isOffer && item.offerPrice != null ? item.offerPrice : item.price;
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const discount = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      if (item.isOffer && item.offerPrice != null) {
        return acc + (item.price - item.offerPrice) * item.quantity;
      }
      return acc;
    }, 0);
  }, [cartItems]);

  const total = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + getFinalPrice(item) * item.quantity,
      0
    );
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-[#edf6f0]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center gap-4">
          <ArrowLeft
            className="h-6 w-6 cursor-pointer text-[#1f2f2a]"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-2xl font-bold text-[#1f2f2a]">
            {cartName}
          </h1>
        </div>

        {status === "loading" && (
          <div className="rounded-2xl border border-[#d7e8dd] bg-white/70 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Cargando carrito...</p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-[#d7e8dd] bg-white/70 p-6 shadow-sm">
            <p className="text-sm text-gray-500">No se pudo cargar el carrito.</p>
            <button
              onClick={loadCart}
              className="mt-3 rounded-lg bg-[#5B7B6D] px-4 py-2 text-sm text-white"
            >
              Reintentar
            </button>
          </div>
        )}

        {status === "ready" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <section className="space-y-4 lg:col-span-2">
              {cartItems.length === 0 ? (
                <div className="rounded-2xl border border-[#d7e8dd] bg-white/70 p-6 shadow-sm">
                  <p className="text-sm text-gray-500">Tu carrito está vacío.</p>
                </div>
              ) : (
                cartItems.map((item) => {
                  const finalPrice = getFinalPrice(item);
                  const itemSubtotal = finalPrice * item.quantity;

                  return (
                    <article
                      key={item.id}
                      className="relative rounded-2xl border border-[#d7e8dd] bg-white/70 p-4 shadow-sm"
                    >
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute right-4 top-4 rounded-full p-1 text-[#ff7a7a] transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-3">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-200">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                Sin imagen
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col justify-center">
                            <div>
                              <h2 className="pr-8 text-lg font-bold leading-tight text-[#344d45]">
                                {item.name}
                              </h2>
                              {item.quantity > item.stock && (
                                <p className="mt-1 text-sm font-semibold text-red-600">
                                  ⚠️ Stock insuficiente (Disponible: {item.stock})
                                </p>
                              )}
                            </div>

                            <div className="mt-1">
                              {item.isOffer && item.offerPrice != null ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-xl font-extrabold text-[#1f2f2a]">
                                    {formatGuarani(item.offerPrice)}
                                  </p>
                                  <p className="text-sm text-gray-400 line-through">
                                    {formatGuarani(item.price)}
                                  </p>
                                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                    Oferta
                                  </span>
                                </div>
                              ) : (
                                <p className="text-xl font-extrabold text-[#1f2f2a]">
                                  {formatGuarani(item.price)}
                                </p>
                              )}

                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, "dec")}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef4f1] text-[#4e6a60] transition hover:bg-[#dbe9e2]"
                                >
                                  <Minus size={14} />
                                </button>

                                <span className="min-w-[20px] text-center text-sm font-semibold text-[#344d45]">
                                  {item.quantity}
                                </span>

                                <button
                                  onClick={() => updateQuantity(item.id, "inc")}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eef4f1] text-[#4e6a60] transition hover:bg-[#dbe9e2]"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row items-center justify-between md:flex-col md:items-end md:gap-4">
                          <p className="text-xs font-semibold text-[#91a79d]">
                            Subtotal: {formatGuarani(itemSubtotal)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </section>

            <aside className="space-y-5">
              <div className="rounded-2xl border border-[#d7e8dd] bg-white/70 p-5 shadow-sm">
                <h3 className="mb-5 text-xl font-bold text-[#344d45]">
                  Resumen del pedido
                </h3>

                <div className="space-y-4 text-[15px] text-[#546760]">
                  <div className="flex items-center justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatGuarani(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Descuentos:</span>
                      <span className="font-semibold text-green-600">
                        - {formatGuarani(discount)}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-[#d7e8dd] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#344d45]">
                        Total:
                      </span>
                      <span className="text-2xl font-extrabold text-[#1f2f2a]">
                        {formatGuarani(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(`/confirmar-pedido/${cartId}`)}
                    disabled={cartItems.some(item => item.quantity > item.stock)}
                    className="mt-4 w-full rounded-lg bg-[#5B7B6D] py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-[#4e6a5e] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    Ir a Confirmar Pedido
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};