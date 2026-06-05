import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { ProductDetailSkeleton, PageLoader } from "@/components";
import axios from "axios";
import { apiClient, addToCartApi, mergeCartResponseFromApi, formatGuarani } from "@/lib";
import RelatedProducts from "@/features/clients/components/products/RelatedProducts.jsx";
import {
  getWishlists,
  createWishlist,
  addWishlistItem,
  REPORT_REASON_LABELS,
  fetchPendingProductReport,
  fetchProductReportReasons,
  hasLocalReportForProduct,
  rememberLocalReport,
  submitProductReport,
} from "@/features/clients/services";
import { useToast } from "@/hooks";

import { RatingsDistribution } from "../components/comments/RatingsDistribution";
import { CommentsList } from "../components/comments/CommentsList";
import { AddReviewModal } from "../components/comments/AddReviewModal";
import { ReportModal } from "../components/comments/ReportModal";
import { reportProductReview } from "../../../lib/reviewReportsApi";

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
  const { showToast } = useToast();
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

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsStats, setCommentsStats] = useState(null);
  const [commentsRatings, setCommentsRatings] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [showCommentReportModal, setShowCommentReportModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [commentReportSubmitting, setCommentReportSubmitting] = useState(false);
  const [reportedReviewIds, setReportedReviewIds] = useState([]);

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

  const fetchComments = async () => {
    if (!productId) return;
    let cancelled = false;
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const { data } = await apiClient.get(`/products/reviews/${productId}`);
      if (cancelled) return;
      const mapped = data.reviews.map((r) => ({
        id: r.id,
        author: r.customerName,
        rating: r.rating,
        title: `${r.rating}/5`,
        content: r.comment,
        verified: r.isVerified,
        location: "",
        date: new Date(r.date).toLocaleDateString("es-PY", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        productDetails: {},
      }));
      setComments(mapped);
      setCommentsStats(data.stats);
      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      data.reviews.forEach((r) => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
      setCommentsRatings(dist);
    } catch (err) {
      if (!cancelled) setCommentsError(err?.response?.data?.message || "No se pudieron cargar las reseñas.");
    } finally {
      if (!cancelled) setCommentsLoading(false);
    }
    return () => { cancelled = true; };
  };

  useEffect(() => {
    if (commentsOpen && productId) fetchComments();
  }, [commentsOpen, productId]);

  const handleAddReview = async (reviewData) => {
    try {
      const { data } = await apiClient.post(`/products/${productId}/reviews`, {
        rating: reviewData.rating,
        comment: reviewData.comment,
      }, { skipGlobalErrorRedirect: true });
      const newComment = {
        id: data.id,
        author: data.customerName,
        rating: data.rating,
        title: `${data.rating}/5`,
        content: data.comment,
        verified: data.isVerified,
        location: "",
        date: new Date().toLocaleDateString("es-PY", { year: "numeric", month: "long", day: "numeric" }),
        productDetails: {},
      };
      setComments((prev) => [newComment, ...prev]);
      setShowAddReviewModal(false);
      await fetchComments();
      showToast("¡Reseña enviada exitosamente!", "success");
    } catch (err) {
      const d = err?.response?.data;
      showToast(d?.errors?.auth?.message || d?.message || "No se pudo enviar la reseña.", "error");
    }
  };

  const handleCommentReport = async ({ reason, description }) => {
    if (!selectedComment?.id) return;
    try {
      setCommentReportSubmitting(true);
      await reportProductReview(selectedComment.id, { reason, description });
      setReportedReviewIds((prev) => prev.includes(selectedComment.id) ? prev : [...prev, selectedComment.id]);
      showToast("Reporte enviado. Gracias por ayudarnos a mejorar la comunidad.", "success");
      setShowCommentReportModal(false);
      setSelectedComment(null);
    } catch (err) {
      const message = err?.response?.data?.error?.message || err?.response?.data?.message || "No se pudo enviar el reporte.";
      showToast(message, "error");
    } finally {
      setCommentReportSubmitting(false);
    }
  };

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
        showToast("Gracias por tu reporte. Lo revisaremos pronto.", "success");
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
      showToast(msg ? String(msg) : "No se pudo enviar el reporte", "error");
    } catch (e) {
      const code = e?.response?.status;
      const msg = apiErrorMessage(e?.response?.data);
      if (code === 400 || code === 409) {
        setReportModalError(msg || "Ya enviaste un reporte para este producto.");
        return;
      }
      showToast(msg ? String(msg) : "No se pudo enviar el reporte", "error");
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
        showToast("Iniciá sesión para agregar a tu lista de deseos", "error");
        setWishlistModalOpen(false);
        return;
      }
      setSessionUserId(uid);
      const lists = await getWishlists(uid);
      setWishlists(lists);
    } catch {
      showToast("No se pudieron cargar las listas", "error");
      setWishlistModalOpen(false);
    } finally {
      setLoadingWishlists(false);
    }
  };

  const handleAddToWishlist = async (wishlistId) => {
    try {
      await addWishlistItem(sessionUserId, wishlistId, productId, cantidad);
      showToast("Producto agregado a la lista", "success");
      setWishlistModalOpen(false);
    } catch {
      showToast("No se pudo agregar el producto", "error");
    }
  };

  const handleCreateAndAdd = async () => {
    const name = newListName.trim();
    if (!name) return showToast("Ingresá un nombre para la lista", "error");
    setCreatingList(true);
    try {
      const newList = await createWishlist(sessionUserId, name);
      try {
        await addWishlistItem(sessionUserId, newList.id, productId, cantidad);
        showToast(`Producto agregado a "${name}"`, "success");
        setWishlistModalOpen(false);
        setNewListName("");
      } catch {
        showToast("No se pudo agregar el producto a la lista", "error");
        const lists = await getWishlists(sessionUserId);
        setWishlists(lists);
      }
    } catch {
      showToast("No se pudo crear la lista", "error");
    } finally {
      setCreatingList(false);
    }
  };

  const agregarAlCarrito = async () => {
    if (addingToCart || !productId) return;
    if (product?.quantity != null && Number(product.quantity) <= 0) {
      showToast("Este producto no tiene stock disponible", "error");
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
        showToast("Iniciá sesión para agregar al carrito", "error");
        return;
      }

      const cart = await addToCartApi(userId, { productId, quantity: cantidad });
      mergeCartResponseFromApi(cart);
      showToast("Producto agregado al carrito", "success");
    } catch (e) {
      const code = e?.response?.status;
      const msg = e?.response?.data?.message;
      if (code === 401) {
        showToast("Iniciá sesión para agregar al carrito", "error");
      } else if (msg) {
        showToast(String(msg), "error");
      } else {
        showToast("No se pudo agregar al carrito", "error");
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

  if (status === "loading") return (
    <div className="max-w-7xl mx-auto w-full px-6 py-6">
      <ProductDetailSkeleton />
    </div>
  );

  return (
    <>
      <div className="min-h-screen flex flex-col bg-[#F0F2F1]">
        <div className="max-w-7xl mx-auto w-full px-6 py-6">

          {/* Header: breadcrumb + menú */}
          <div className="flex items-center gap-4 mb-6 w-full">
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

          {/* Card principal del producto */}
          <div className="bg-[#F7F9F8] rounded-2xl shadow-sm border border-[#e2e8e5] p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
              {/* Imagen */}
              <div className="relative aspect-square bg-white border border-[#e2e8e5] rounded-2xl shadow-sm overflow-hidden">
                {product?.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={productName}
                    className="absolute inset-0 w-full h-full object-contain p-8"
                    draggable={false}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#c8d9d1] text-[#6B9080] text-sm">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-5 py-1">

                {/* Nombre + comercio */}
                <div>
                  {product?.commerce?.name && (
                    <span className="inline-block text-[11px] font-semibold text-[#6B9080] bg-[#EBF2EF] px-3 py-1 rounded-full mb-3 tracking-wide uppercase">
                      {product.commerce.name}
                    </span>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900 leading-snug">{productName}</h2>
                  <button
                    type="button"
                    onClick={() => setCommentsOpen(true)}
                    className="flex items-center gap-1.5 mt-2 text-[13px] w-fit"
                  >
                    {[1,2,3,4,5].map((s) => (
                      <SvgIcon key={s} className={`w-3.5 h-3.5 ${s <= Math.round(product?.averageRating ?? 0) ? "text-yellow-400" : "text-gray-200"}`}>{I.star}</SvgIcon>
                    ))}
                    <span className="text-gray-400 underline ml-1">
                      {product?.reviewCount != null ? `${product.reviewCount} calificaciones` : "Ver calificaciones"}
                    </span>
                  </button>
                </div>

                {/* Precio + stock */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-[34px] font-extrabold text-gray-900 tracking-tight leading-none">
                    {formatGuarani(product?.price)}
                  </div>
                  {inStock !== null && (
                    <span
                      className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full w-fit"
                      style={{
                        backgroundColor: inStock ? "#DCFCE7" : "#FEE2E2",
                        color: inStock ? "#15803D" : "#B91C1C",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: inStock ? "#16A34A" : "#DC2626" }} />
                      {inStock ? "En stock" : "Sin stock"}
                    </span>
                  )}
                  {status === "error" && <div className="mt-3 text-[12px] text-red-600">No se pudo cargar el producto{error ? `: ${error}` : "."}</div>}
                  {!productId && <div className="mt-3 text-[12px] text-gray-500">No se especificó un producto. Volvé a la búsqueda y elegí uno.</div>}
                </div>

                {/* Detalles */}
                {(productDescription || (product?.tags && product.tags.length > 0)) && (
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-[11px] font-bold mb-2 text-gray-400 uppercase tracking-widest">Descripción</h3>
                    {productDescription ? (
                      <p className="text-[14px] text-gray-600 leading-relaxed">{productDescription}</p>
                    ) : (
                      <ul className="text-[14px] text-gray-600 list-disc pl-5 space-y-1">
                        {(product?.tags || []).slice(0, 6).map((t) => <li key={t.id}>{t.name}</li>)}
                      </ul>
                    )}
                  </div>
                )}

                {/* Cantidad + CTA */}
                <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
                  <div>
                    <h3 className="text-[11px] font-bold mb-2 text-gray-400 uppercase tracking-widest">Cantidad</h3>
                    <div className="inline-flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <button type="button" onClick={() => setCantidad((v) => (v > 1 ? v - 1 : 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <SvgIcon className="w-4 h-4 text-gray-600">{I.minus}</SvgIcon>
                      </button>
                      <div className="w-12 h-10 flex items-center justify-center text-[14px] font-semibold text-black border-x border-gray-200">{cantidad}</div>
                      <button type="button" onClick={() => setCantidad((v) => v + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors">
                        <SvgIcon className="w-4 h-4 text-gray-600">{I.plus}</SvgIcon>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={agregarAlCarrito}
                      disabled={addingToCart || status !== "success"}
                      className="flex-1 py-3 rounded-xl text-white text-[14px] font-semibold disabled:opacity-60 transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#6B9080" }}
                    >
                      {addingToCart ? "Agregando..." : "Agregar al carrito"}
                    </button>
                    <button
                      type="button"
                      onClick={openWishlistModal}
                      disabled={status !== "success"}
                      className="w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 bg-white text-[#EF4444] disabled:opacity-60 hover:bg-red-50 transition-colors"
                      aria-label="Agregar a favoritos"
                    >
                      <SvgIcon className="w-5 h-5">{I.heart}</SvgIcon>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer: comentarios */}
            <div className="mt-6 pt-5 border-t border-[#e9edeb]">
              <button
                type="button"
                onClick={() => setCommentsOpen(true)}
                className="flex items-center gap-2 text-[14px] font-medium text-gray-500 hover:text-[#6B9080] transition-colors group"
              >
                <svg className="w-4 h-4 group-hover:text-[#6B9080] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Ver comentarios
                {product?.reviewCount != null && product.reviewCount > 0 && (
                  <span className="text-[12px] text-gray-400">({product.reviewCount})</span>
                )}
              </button>
            </div>
          </div>

          {status === "success" && Boolean(productId) && (
            <div className="mt-6 px-6 pb-8 pt-6 bg-[#F7F9F8] rounded-2xl border-x border-b border-[#e2e8e5] shadow-sm">
              <RelatedProducts productId={productId} limit={8} />
            </div>
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
      {/* Comments drawer backdrop */}
      {commentsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity"
          onClick={() => setCommentsOpen(false)}
        />
      )}

      {/* Comments drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#F5F5F5] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          commentsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-6 py-4 flex items-center gap-4 bg-white border-b border-gray-200 shrink-0">
          <button
            type="button"
            onClick={() => setCommentsOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar comentarios"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">Comentarios</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[280px_1fr] gap-6 px-6 py-6 items-start">
            <aside className="flex flex-col gap-4 sticky top-6">
              <div className="bg-white border border-gray-200 rounded-lg">
                <RatingsDistribution
                  ratings={commentsRatings}
                  averageRating={commentsStats?.averageRating ?? 0}
                />
                <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                  <h3 className="text-base font-bold mb-1 text-gray-800">
                    Escribir opinión de este producto
                  </h3>
                  <p className="text-xs text-gray-500">
                    Comparte tu opinión con otros clientes
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-2.5 px-4 text-white rounded-full text-sm font-semibold transition-all hover:opacity-90 active:translate-y-0.5"
                style={{ background: "#6B9080" }}
                onClick={() => setShowAddReviewModal(true)}
              >
                Escribir mi opinión
              </button>
            </aside>

            <main className="flex flex-col gap-0">
              {commentsLoading && (
                <p className="text-gray-500 text-sm">Cargando reseñas...</p>
              )}
              {commentsError && (
                <p className="text-red-500 text-sm">{commentsError}</p>
              )}
              {!commentsLoading && !commentsError && (
                <CommentsList
                  comments={comments.map((c) => ({
                    ...c,
                    reportedByViewer: reportedReviewIds.includes(c.id),
                  }))}
                  onReport={(comment) => {
                    setSelectedComment(comment);
                    setShowCommentReportModal(true);
                  }}
                />
              )}
            </main>
          </div>
        </div>

        <AddReviewModal
          isOpen={showAddReviewModal}
          onClose={() => setShowAddReviewModal(false)}
          onSubmit={handleAddReview}
        />
        <ReportModal
          isOpen={showCommentReportModal}
          onClose={() => {
            setShowCommentReportModal(false);
            setSelectedComment(null);
          }}
          onSubmit={handleCommentReport}
          isSubmitting={commentReportSubmitting}
        />
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
              <PageLoader />
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