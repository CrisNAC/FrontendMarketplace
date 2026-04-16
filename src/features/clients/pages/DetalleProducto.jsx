import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { addToCartApi } from "../../../lib/cartApi";
import { mergeCartResponseFromApi } from "../../../lib/cartLocalStorage";
import { formatGuarani } from "../../../lib/formatGuarani.js";

function SvgIcon({ children, className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {children}
    </svg>
  );
}

const I = {
  star: (
    <path
      d="M12 3l2.9 6 6.6.6-5 4.4 1.5 6.4L12 17l-6 3.4 1.5-6.4-5-4.4 6.6-.6L12 3z"
      fill="currentColor"
    />
  ),
  minus: (
    <path
      d="M5 12h14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  ),
  plus: (
    <>
      <path
        d="M12 5v14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  ),
  heart: (
    <path
      d="M12 21s-7-4.6-9.5-8.4C-0.2 8.5 2.1 3 7 5.5 9 6.5 12 10 12 10s3-3.5 5-4.5c4.9-2.5 7.2 3 4.5 7.1C19 16.4 12 21 12 21z"
      fill="currentColor"
    />
  ),
};

const VERDE = "#8BB2A1";

export default function DetalleProducto() {
  const navigate = useNavigate();
  const { id } = useParams();
  const productId = id ? Number(id) : null;

  const apiBase = useMemo(() => {
    return (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  }, []);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const agregarAListaDeseados = async () => {
    if (addingToWishlist || !productId) return;

    try {
      setAddingToWishlist(true);
      const sessionRes = await axios.get(
        `${apiBase || "http://localhost:3000"}/api/session/user-session`,
        { withCredentials: true }
      );
      const userId = sessionRes.data?.user?.id_user;

      if (!userId) {
        toast.error("Iniciá sesión para agregar a tu lista de deseos");
        return;
      }

      await axios.post(
        `${apiBase || "http://localhost:3000"}/api/users/${userId}/wishlist/items`,
        { productId, quantity: cantidad },
        { withCredentials: true }
      );

      toast.success("Producto agregado a la lista de deseos");
    } catch (e) {
      const code = e?.response?.status;
      if (code === 401) {
        toast.error("Iniciá sesión para agregar a tu lista de deseos");
      } else {
        toast.error("No se pudo agregar el producto");
      }
    } finally {
      setAddingToWishlist(false);
    }
  };

  const agregarAlCarrito = async () => {
    if (addingToCart || !productId) return;
    if (product?.quantity != null && Number(product.quantity) <= 0) {
      toast.error("Este producto no tiene stock disponible");
      return;
    }

    try {
      setAddingToCart(true);
      const sessionRes = await axios.get(
        `${apiBase || "http://localhost:3000"}/api/session/user-session`,
        { withCredentials: true }
      );
      const userId = sessionRes.data?.user?.id_user;

      if (!userId) {
        toast.error("Iniciá sesión para agregar al carrito");
        return;
      }

      const cart = await addToCartApi(userId, { productId, quantity: cantidad });
      mergeCartResponseFromApi(cart);
      toast.success("Producto agregado al carrito");
    } catch (e) {
      const code = e?.response?.status;
      const msg = e?.response?.data?.message;
      if (code === 401) {
        toast.error("Iniciá sesión para agregar al carrito");
      } else if (msg) {
        toast.error(String(msg));
      } else {
        toast.error("No se pudo agregar al carrito");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const load = async () => {
      if (!productId || !Number.isFinite(productId)) {
        setProduct(null);
        setStatus("idle");
        setError("");
        return;
      }

      try {
        setStatus("loading");
        setError("");

        const url = `${apiBase || "http://localhost:3000"}/products/${productId}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

        const data = await res.json();
        if (!isActive) return;
        setProduct(data);
        setStatus("success");
      } catch (e) {
        if (e?.name === "AbortError") return;
        if (!isActive) return;
        setProduct(null);
        setStatus("error");
        setError(e instanceof Error ? e.message : "No se pudo cargar el producto.");
      }
    };

    load();
    return () => { isActive = false; controller.abort(); };
  }, [apiBase, productId]);

  const titleText = product?.commerce?.name && product?.category?.name
    ? `${product.commerce.name} / ${product.category.name}`
    : product?.category?.name ?? "Detalle del producto";

  const productName = product?.name || "Producto";
  const productDescription = product?.description || "";
  const inStock = product?.quantity == null ? null : Number(product.quantity) > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-6 py-6">
        <div className="flex items-center gap-4 mb-8">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-2xl font-bold">{titleText}</h1>
        </div>

        <div className="grid grid-cols-2 gap-16 items-start">

          {/* Imagen del producto */}
          <div className="flex justify-center">
            {product?.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={productName}
                className="w-[400px] object-contain rounded-2xl"
                draggable={false}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div className="w-[400px] h-[400px] flex items-center justify-center rounded-2xl bg-gray-100 text-gray-400 text-sm">
                Sin imagen
              </div>
            )}
          </div>

          <div className="flex flex-col items-start">
            <h2 className="text-[21px] font-semibold text-black">{productName}</h2>

            <button
              type="button"
              onClick={() => navigate(`/comentarios/${productId}`)}
              className="flex items-center gap-2 mt-1 text-[12px] w-fit"
            >
              <span className="flex items-center gap-1 text-yellow-500">
                {product?.averageRating ?? "-"}
                <SvgIcon className="w-4 h-4 text-yellow-500">{I.star}</SvgIcon>
              </span>
              <span className="text-gray-500 underline">
                {product?.reviewCount != null ? `${product.reviewCount} calificaciones` : "Ver calificaciones"}
              </span>
            </button>

            <div className="mt-3 text-[30px] font-semibold text-black">{formatGuarani(product?.price)}</div>

            {inStock !== null && (
              <span
                className="mt-1 text-white text-[10px] px-3 py-[2px] rounded w-fit"
                style={{ backgroundColor: inStock ? VERDE : "#b91c1c" }}
              >
                {inStock ? "En stock" : "Sin stock"}
              </span>
            )}

            {status === "loading" && <div className="mt-3 text-[12px] text-gray-500">Cargando producto...</div>}
            {status === "error" && <div className="mt-3 text-[12px] text-red-600">No se pudo cargar el producto{error ? `: ${error}` : "."}</div>}
            {!productId && <div className="mt-3 text-[12px] text-gray-500">No se especificó un producto. Volvé a la búsqueda y elegí uno.</div>}

            <div className="mt-6">
              <h3 className="text-[13px] font-semibold mb-2 text-black">Detalles</h3>
              {productDescription ? (
                <div className="text-[12px] text-black leading-relaxed max-w-xl">{productDescription}</div>
              ) : (
                <ul className="text-[12px] text-black list-disc pl-5 space-y-1">
                  {(product?.tags || []).slice(0, 6).map((t) => <li key={t.id}>{t.name}</li>)}
                  {(!product?.tags || product.tags.length === 0) && <li>Sin detalles adicionales.</li>}
                </ul>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-[13px] font-semibold mb-2 text-black">Cantidad</h3>
              <div className="inline-flex border border-gray-300 rounded-md overflow-hidden">
                <button type="button" onClick={() => setCantidad((v) => (v > 1 ? v - 1 : 1))} className="w-9 h-9 flex items-center justify-center">
                  <SvgIcon className="w-4 h-4 text-gray-600">{I.minus}</SvgIcon>
                </button>
                <div className="w-10 h-9 flex items-center justify-center text-[12px] text-black">{cantidad}</div>
                <button type="button" onClick={() => setCantidad((v) => v + 1)} className="w-9 h-9 flex items-center justify-center">
                  <SvgIcon className="w-4 h-4 text-gray-600">{I.plus}</SvgIcon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6">
          <button
            type="button"
            onClick={() => navigate(`/comentarios/${productId}`)}
            className="text-[16px] font-semibold text-[#374151] hover:text-[#111827] transition-colors"
          >
            <h1>Comentarios</h1>
          </button>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={agregarAlCarrito}
              disabled={addingToCart || status !== "success"}
              className="px-8 py-2 rounded-md text-white text-[12px] font-medium disabled:opacity-60"
              style={{ backgroundColor: "#6B9080" }}
            >
              {addingToCart ? "Agregando..." : "Agregar al carrito"}
            </button>
            <button
              type="button"
              onClick={agregarAListaDeseados}
              disabled={addingToWishlist}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-[#D1D5DB] bg-white text-[#EF4444] disabled:opacity-60"
              aria-label="Agregar a favoritos"
            >
              <SvgIcon className="w-4 h-4">
                {I.heart}
              </SvgIcon>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}