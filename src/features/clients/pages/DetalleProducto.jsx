//DetalleProducto.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, MoreVertical } from "lucide-react";
import axios from "axios";
import apiClient from "../../../lib/apiClient";
import RelatedProducts from "../components/products/RelatedProducts.jsx";
import {
  getWishlists,
  createWishlist,
  addWishlistItem,
} from "../services/wishlistService";
import { addToCartApi } from "../../../lib/cartApi";
import { mergeCartResponseFromApi } from "../../../lib/cartLocalStorage";
import { formatGuarani } from "../../../lib/formatGuarani.js";
import {
  REPORT_REASON_LABELS,
  fetchPendingProductReport,
  fetchProductReportReasons,
  hasLocalReportForProduct,
  rememberLocalReport,
  submitProductReport,
} from "../services/productReportApi.js";

function apiErrorMessage(data) {
  if (!data) return null;
  if (typeof data.message === "string") return data.message;
  if (data.error && typeof data.error.message === "string") return data.error.message;
  return null;
}

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
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [wishlists, setWishlists] = useState([]);
  const [loadingWishlists, setLoadingWishlists] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);

  const [sessionUserId, setSessionUserId] = useState(null);
  const [sessionRole, setSessionRole] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  /** true hasta saber si el usuario ya tiene reporte pendiente (evita mostrar ⋯ antes de tiempo). */
  const [checkingReport, setCheckingReport] = useState(true);
  const [hasPendingReport, setHasPendingReport] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportModalError, setReportModalError] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportReasonOptions, setReportReasonOptions] = useState(REPORT_REASON_LABELS);

  useEffect(() => {
    let active = true;
    const base = apiBase || "http://localhost:3000";
    axios
      .get(`${base}/api/session/user-session`, { withCredentials: true })
      .then((res) => {
        if (!active) return;
        setSessionUserId(res.data?.user?.id_user ?? null);
        setSessionRole(res.data?.user?.role ?? null);
      })
      .catch(() => {
        if (active) {
          setSessionUserId(null);
          setSessionRole(null);
        }
      })
      .finally(() => {
        if (active) setSessionChecked(true);
      });
    return () => {
      active = false;
    };
  }, [apiBase]);

  useEffect(() => {
    if (!sessionChecked || sessionRole !== "CUSTOMER") return;
    let cancelled = false;
    (async () => {
      const list = await fetchProductReportReasons();
      if (!cancelled && list && list.length > 0) {
        setReportReasonOptions(list);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionChecked, sessionRole]);

  useEffect(() => {
    if (!sessionChecked) return;

    if (!sessionUserId || sessionRole !== "CUSTOMER") {
      setHasPendingReport(false);
      setCheckingReport(false);
      return;
    }

    if (!productId || !Number.isFinite(productId)) {
      setHasPendingReport(false);
      setCheckingReport(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setCheckingReport(true);
      try {
        const pending = await fetchPendingProductReport(productId);
        if (cancelled) return;
        if (pending === null) {
          setHasPendingReport(hasLocalReportForProduct(sessionUserId, productId));
        } else {
          setHasPendingReport(Boolean(pending));
        }
      } catch {
        if (!cancelled) {
          setHasPendingReport(hasLocalReportForProduct(sessionUserId, productId));
        }
      } finally {
        if (!cancelled) setCheckingReport(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionChecked, sessionUserId, sessionRole, productId]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!reportModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !submittingReport) {
        setReportModalOpen(false);
        setReportModalError("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reportModalOpen, submittingReport]);

  const showReportMenu =
    sessionChecked
    && sessionUserId
    && sessionRole === "CUSTOMER"
    && !checkingReport
    && status === "success";

  const openReportModal = () => {
    setReportReason("");
    setReportDescription("");
    setReportModalError(hasPendingReport ? "Ya enviaste un reporte para este producto." : "");
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    if (submittingReport) return;
    setReportModalOpen(false);
    setReportModalError("");
  };

  const handleSubmitReport = async () => {
    if (hasPendingReport) {
      setReportModalError("Ya enviaste un reporte para este producto.");
      return;
    }
    if (!reportReason || !productId || !sessionUserId) return;
    setSubmittingReport(true);
    setReportModalError("");
    try {
      const res = await submitProductReport({
        productId,
        reason: reportReason,
        description: reportDescription,
      });

      if (res.status === 201) {
        rememberLocalReport(sessionUserId, productId);
        setHasPendingReport(true);
        setReportModalOpen(false);
        toast.success("Gracias por tu reporte. Lo revisaremos pronto.");
        return;
      }

      if (res.status === 400) {
        setReportModalError(
          apiErrorMessage(res.data) || "Ya enviaste un reporte para este producto."
        );
        return;
      }

      if (res.status === 409) {
        setReportModalError(
          apiErrorMessage(res.data) || "Ya enviaste un reporte para este producto."
        );
        return;
      }

      const msg = apiErrorMessage(res.data);
      toast.error(msg ? String(msg) : "No se pudo enviar el reporte");
    } catch (e) {
      const code = e?.response?.status;
      const msg = apiErrorMessage(e?.response?.data);
      if (code === 400 || code === 409) {
        setReportModalError(msg || "Ya enviaste un reporte para este producto.");
        return;
      }
      toast.error(msg ? String(msg) : "No se pudo enviar el reporte");
    } finally {
      setSubmittingReport(false);
    }
  };

  const openWishlistModal = async () => {
    if (!productId) return;
    setWishlistModalOpen(true);
    setLoadingWishlists(true);
    try {
      const sessionRes = await apiClient.get("/api/session/user-session");
      const uid = sessionRes.data?.user?.id_user;
      if (!uid) {
        toast.error("Iniciá sesión para agregar a tu lista de deseos");
        setWishlistModalOpen(false);
        return;
      }
      setSessionUserId(uid);
      const lists = await getWishlists(uid);
      setWishlists(lists);
    } catch {
      toast.error("No se pudieron cargar las listas");
      setWishlistModalOpen(false);
    } finally {
      setLoadingWishlists(false);
    }
  };

  const handleAddToWishlist = async (wishlistId) => {
    try {
      await addWishlistItem(sessionUserId, wishlistId, productId, cantidad);
      toast.success("Producto agregado a la lista");
      setWishlistModalOpen(false);
    } catch {
      toast.error("No se pudo agregar el producto");
    }
  };

  const handleCreateAndAdd = async () => {
    const name = newListName.trim();
    if (!name) return toast.error("Ingresá un nombre para la lista");
    setCreatingList(true);
    try {
      const newList = await createWishlist(sessionUserId, name);
      try {
        await addWishlistItem(sessionUserId, newList.id, productId, cantidad);
        toast.success(`Producto agregado a "${name}"`);
        setWishlistModalOpen(false);
        setNewListName("");
      } catch {
        toast.error("No se pudo agregar el producto a la lista");
        const lists = await getWishlists(sessionUserId);
        setWishlists(lists);
      }
    } catch {
      toast.error("No se pudo crear la lista");
    } finally {
      setCreatingList(false);
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
    <>
      <div className="min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto w-full px-6 py-6">
          <div className="flex items-center gap-4 mb-8 w-full">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <ArrowLeft className="w-6 h-6 shrink-0 cursor-pointer" onClick={() => navigate(-1)} />
              <h1 className="text-2xl font-bold truncate">{titleText}</h1>
            </div>
            {showReportMenu && (
              <div className="relative shrink-0" ref={menuRef}>
                <button
                  type="button"
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Más opciones"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  <MoreVertical className="w-6 h-6" strokeWidth={2} />
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1 z-30 min-w-[200px] py-1 bg-white rounded-lg border border-gray-200 shadow-lg"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full text-left px-4 py-2.5 text-[13px] text-gray-800 hover:bg-gray-50"
                      onClick={() => {
                        setMenuOpen(false);
                        openReportModal();
                      }}
                    >
                      Reportar producto
                    </button>
                  </div>
                )}
              </div>
            )}
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
                onClick={openWishlistModal}
                disabled={status !== "success"}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-[#D1D5DB] bg-white text-[#EF4444] disabled:opacity-60"
                aria-label="Agregar a favoritos"
              >
                <SvgIcon className="w-4 h-4">
                  {I.heart}
                </SvgIcon>
              </button>
            </div>
          </div>

          {/* ✅ RelatedProducts AGREGADO */}
          {status === "success" && Boolean(productId) && (
            <RelatedProducts productId={productId} limit={8} />
          )}
        </div>

        {reportModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-product-title"
            onClick={closeReportModal}
          >
            <div
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="report-product-title" className="text-lg font-semibold text-gray-900 mb-1">
                Reportar producto
              </h2>
              <p className="text-[13px] text-gray-500 mb-4">
                Ayudanos a moderar el catálogo. Tu reporte será revisado por un administrador.
              </p>

              <label className="block text-[13px] font-semibold text-gray-800 mb-1.5" htmlFor="report-reason">
                Motivo <span className="text-red-600">*</span>
              </label>
              <select
                id="report-reason"
                value={reportReason}
                disabled={hasPendingReport}
                onChange={(e) => {
                  setReportReason(e.target.value);
                  setReportModalError("");
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B9080]/40 focus:border-[#6B9080]"
              >
                <option value="" disabled>
                  Seleccioná un motivo
                </option>
                {reportReasonOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <label className="block text-[13px] font-semibold text-gray-800 mt-4 mb-1.5" htmlFor="report-desc">
                Descripción <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                id="report-desc"
                value={reportDescription}
                disabled={hasPendingReport}
                maxLength={300}
                rows={4}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Contanos más detalles si querés..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 resize-y min-h-[96px] focus:outline-none focus:ring-2 focus:ring-[#6B9080]/40 focus:border-[#6B9080]"
              />
              <div className="text-right text-[11px] text-gray-400 mt-1">
                {reportDescription.length}/300
              </div>

              {reportModalError && (
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[13px] text-amber-900">
                  {reportModalError}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeReportModal}
                  disabled={submittingReport}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={!reportReason || submittingReport || hasPendingReport}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: "#6B9080" }}
                >
                  {submittingReport ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {wishlistModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45"
          role="dialog"
          aria-modal="true"
          onClick={() => setWishlistModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Agregar a lista de deseos
            </h2>
            <p className="text-[13px] text-gray-500 mb-4">
              Elegí una lista o creá una nueva.
            </p>

            {loadingWishlists ? (
              <p className="text-[13px] text-gray-400 text-center py-4">Cargando listas...</p>
            ) : (
              <div className="max-h-[220px] overflow-y-auto flex flex-col gap-2 mb-4">
                {wishlists.length === 0 ? (
                  <p className="text-[13px] text-gray-400 text-center py-4">
                    No tenés listas creadas todavía.
                  </p>
                ) : (
                  wishlists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => handleAddToWishlist(list.id)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-[#C7D6CF] bg-[#F3F5F4] hover:bg-[#E5EAE9] text-[14px] text-[#2f3e39] font-medium transition-colors"
                    >
                      {list.name}
                      <span className="text-[12px] text-[#60706a] font-normal ml-2">
                        {list.itemCount} productos
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <p className="text-[13px] font-semibold text-gray-700 mb-2">Crear nueva lista</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nombre de la lista"
                  className="flex-1 border border-[#C7D6CF] rounded-full px-4 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-[#8BB2A1]"
                />
                <button
                  type="button"
                  onClick={handleCreateAndAdd}
                  disabled={creatingList}
                  className="px-4 py-2 rounded-full text-white text-[13px] font-medium bg-[#2f3e39] hover:opacity-90 disabled:opacity-60"
                >
                  {creatingList ? "Creando..." : "Crear"}
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setWishlistModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}