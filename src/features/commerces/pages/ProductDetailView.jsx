import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../../commerces/services/productDetailApi";
import { getProductReviews } from "../../commerces/services/productReviewApi";
import {
    getBackendErrorMessage,
    updateProduct,
} from "../../commerces/services/editProductApi";
import Toggle from "../components/createProduct/Toggle";
import { formatGuarani } from "../../../lib/formatGuarani.js";

//iconos svg
function SvgIcon({ children, className = "w-4 h-4" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {children}
        </svg>
    );
}

const I = {
    back: <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    edit: (
        <>
            <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    calendar: (
        <>
            <path d="M7 2v3M17 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 9h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 5h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </>
    ),
    eye: (
        <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </>
    ),
    package: (
        <>
            <path d="M16.5 9.4l-9-5.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
    ),
    star: (
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
    starFill: (
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
    ),
    check: (
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
};

const TITLE = "text-[#6B9080]";
const BODY = "text-slate-900";
const SUBTLE = "text-slate-600";

function Pill({ children, variant = "indigo" }) {
    const cls = variant === "green"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
        : variant === "gray"
            ? "bg-slate-100 text-slate-600 ring-slate-200"
            : "bg-indigo-50 text-indigo-700 ring-indigo-100";
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-[1px] text-[10px] ring-1 ${cls}`}>
            {children}
        </span>
    );
}

function SideCard({ title, children }) {
    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="px-4 pt-2.5 pb-2">
                <h3 className={`text-[12px] font-semibold ${TITLE} text-center`}>{title}</h3>
            </div>
            <div className="px-4 pb-3">{children}</div>
        </div>
    );
}

function Row({ left, right, rightClass = "" }) {
    return (
        <div className="flex items-center justify-between text-[11px]">
            <span className={SUBTLE}>{left}</span>
            <span className={`${BODY} font-semibold ${rightClass}`}>{right}</span>
        </div>
    );
}

function StarRating({ rating, max = 5 }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: max }).map((_, i) => (
                <span key={i} className={i < Math.round(rating) ? "text-amber-400" : "text-slate-200"}>
                    <SvgIcon className="w-3 h-3">{i < Math.round(rating) ? I.starFill : I.star}</SvgIcon>
                </span>
            ))}
        </div>
    );
}

function ReviewSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl border border-slate-100 p-3 animate-pulse">
                    <div className="flex justify-between mb-2">
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                        <div className="h-3 w-16 bg-slate-100 rounded" />
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded mt-2" />
                    <div className="h-2 w-3/4 bg-slate-100 rounded mt-1" />
                </div>
            ))}
        </div>
    );
}

// pagina principal
export default function ProductDetailView() {
    const navigate = useNavigate();
    const { id } = useParams();

    const STATIC_PRODUCT_ID = id ?? 1;

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(true);
    const [error, setError] = useState("");
    const [offerForm, setOfferForm] = useState({
        isOffer: false,
        offerPrice: "",
    });
    const [offerSaving, setOfferSaving] = useState(false);
    const [offerFeedback, setOfferFeedback] = useState({
        type: "",
        message: "",
    });

    // producto
    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const data = await getProductById(STATIC_PRODUCT_ID);
                if (active) setProduct(data);
            } catch (e) {
                if (active) setError(e.response?.data?.message || "Error cargando producto");
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, [STATIC_PRODUCT_ID]);

    // reviews
    useEffect(() => {
        let active = true;
        const loadReviews = async () => {
            try {
                const data = await getProductReviews(STATIC_PRODUCT_ID);
                if (active) {
                    setReviews(data.reviews || []);
                    setStats(data.stats || {});
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (active) setReviewLoading(false);
            }
        };
        loadReviews();
        return () => { active = false; };
    }, [STATIC_PRODUCT_ID]);

    useEffect(() => {
        if (!product) {
            return;
        }

        setOfferForm({
            isOffer: Boolean(product.isOffer),
            offerPrice:
                product.offerPrice === null || product.offerPrice === undefined
                    ? ""
                    : String(product.offerPrice),
        });
    }, [product]);

    //estados de carga/error
    if (loading) return (
        <div className="min-h-screen bg-[#ECF7F0] flex items-center justify-center">
            <p className="text-slate-500 text-sm">Cargando producto...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#ECF7F0] p-6">
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
        </div>
    );

    if (!product) return null;

    const createdAt = product.createdAt
        ? new Date(product.createdAt).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" })
        : "—";
    const updatedAt = product.updatedAt
        ? new Date(product.updatedAt).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" })
        : "—";
    const isVisible = product.status === "active";
    const isOffer = Boolean(product.isOffer);
    const currentPrice = Number(product.price ?? 0);
    const originalPrice = Number(product.originalPrice ?? currentPrice);
    const offerPrice = product.offerPrice == null ? null : Number(product.offerPrice);
    const hasOfferChanges =
        offerForm.isOffer !== isOffer ||
        String(offerForm.offerPrice ?? "").trim() !==
            String(product.offerPrice ?? "").trim();

    const handleOfferToggle = (nextValue) => {
        setOfferForm((prev) => ({
            ...prev,
            isOffer: nextValue,
        }));
        setOfferFeedback({ type: "", message: "" });
    };

    const handleOfferPriceChange = (event) => {
        setOfferForm((prev) => ({
            ...prev,
            offerPrice: event.target.value,
        }));
        setOfferFeedback({ type: "", message: "" });
    };

    const handleSaveOffer = async () => {
        if (offerSaving) {
            return;
        }

        const normalizedOfferPrice = String(offerForm.offerPrice ?? "").trim();

        if (offerForm.isOffer) {
            const parsedOfferPrice = Number(normalizedOfferPrice);
            if (!normalizedOfferPrice || !Number.isFinite(parsedOfferPrice) || parsedOfferPrice <= 0) {
                setOfferFeedback({
                    type: "error",
                    message: "Ingresá un precio de oferta válido mayor a 0.",
                });
                return;
            }
        }

        setOfferSaving(true);
        setOfferFeedback({ type: "", message: "" });

        try {
            const updatedProduct = await updateProduct({
                productId: STATIC_PRODUCT_ID,
                payload: {
                    isOffer: offerForm.isOffer,
                    offerPrice: offerForm.isOffer
                        ? Number(normalizedOfferPrice)
                        : null,
                },
            });

            setProduct(updatedProduct);
            setOfferFeedback({
                type: "success",
                message: "La oferta del producto se actualizó correctamente.",
            });
        } catch (saveError) {
            setOfferFeedback({
                type: "error",
                message: getBackendErrorMessage(
                    saveError,
                    "No se pudo actualizar la oferta del producto."
                ),
            });
        } finally {
            setOfferSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#ECF7F0]">
            <main className="px-3 py-3 max-w-[1080px]">

                {/* ── Top bar ── */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 text-left">
                        <button
                            type="button"
                            onClick={() => navigate("/comercio/productos")}
                            className="mt-[1px] inline-flex h-7 w-7 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 hover:bg-slate-50"
                            aria-label="Volver"
                        >
                            <SvgIcon className="w-4 h-4 text-[#6B9080]">{I.back}</SvgIcon>
                        </button>
                        <div className="text-left">
                            <h1 className={`text-[18px] font-semibold ${TITLE}`}>{product.name}</h1>
                            <p className="text-[11px] text-slate-500">Vista detallada del producto</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(`/comercio/productos/${STATIC_PRODUCT_ID}/editar`)}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-200/70 px-3 py-1.5 text-[11px] font-semibold text-emerald-900 shadow-sm ring-1 ring-emerald-200 hover:bg-emerald-200"
                    >
                        <SvgIcon className="w-4 h-4">{I.edit}</SvgIcon>
                        Editar Producto
                    </button>
                </div>

                {/* ── Grid ── */}
                <div className="mt-3 grid grid-cols-12 gap-3">

                    {/* Columna izquierda */}
                    <div className="col-span-12 lg:col-span-8 space-y-3">

                        {/* Card producto */}
                        <section className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                            <div className="grid grid-cols-12 gap-3">

                                {/* Imagen — viene directamente del GET /products/:id */}
                                <div className="col-span-5">
                                    <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="h-[145px] w-full object-cover"
                                                onError={e => { e.currentTarget.style.display = "none"; }}
                                            />
                                        ) : (
                                            <div className="h-[145px] w-full flex items-center justify-center bg-slate-100">
                                                <SvgIcon className="w-10 h-10 text-slate-300">{I.package}</SvgIcon>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="col-span-7 text-left">
                                    <h2 className={`text-[14px] font-semibold ${TITLE}`}>{product.name}</h2>
                                    <p className={`mt-1.5 max-w-[420px] text-[11px] leading-relaxed ${BODY}`}>
                                        {product.description || "Sin descripción."}
                                    </p>

                                    <div className="mt-3 space-y-1.5 text-[11px]">
                                        <div className="flex items-center justify-between">
                                            <span className={SUBTLE}>Precio:</span>
                                            <span className="font-semibold text-emerald-700">
                                                {formatGuarani(product.price)}
                                            </span>
                                        </div>

                                        <div className="flex items-start justify-between gap-2">
                                            <span className={`pt-px ${SUBTLE}`}>Categoría:</span>
                                            <div className="flex flex-wrap justify-end gap-1">
                                                {product.categories?.length > 0
                                                    ? product.categories.map((cat) => (
                                                        <Pill key={cat.id} variant="indigo">{cat.name}</Pill>
                                                    ))
                                                    : <Pill variant="indigo">—</Pill>
                                                }
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className={SUBTLE}>Estado:</span>
                                            <Pill variant={isVisible ? "green" : "gray"}>
                                                {isVisible ? "Activo" : "Oculto"}
                                            </Pill>
                                        </div>

                                        {isOffer && offerPrice !== null && (
                                            <div className="flex items-center justify-between">
                                                <span className={SUBTLE}>Precio de oferta:</span>
                                                <span className="font-semibold text-amber-700">
                                                    Gs. {offerPrice.toLocaleString("es-PY")}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className={SUBTLE}>Calificación:</span>
                                            {product.averageRating ? (
                                                <div className="flex items-center gap-1">
                                                    <StarRating rating={product.averageRating} />
                                                    <span className="font-semibold text-amber-600">{product.averageRating}</span>
                                                </div>
                                            ) : (
                                                <span className={`${BODY} font-semibold`}>—</span>
                                            )}
                                        </div>

                                        {product.tags?.length > 0 && (
                                            <div className="flex items-start justify-between">
                                                <span className={`pt-[1px] ${SUBTLE}`}>Etiquetas:</span>
                                                <div className="flex flex-wrap justify-end gap-1.5">
                                                    {product.tags.map(tag => (
                                                        <Pill key={tag.id} variant="indigo">{tag.name}</Pill>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Reviews */}
                        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                            <div className="px-4 pt-3 pb-2 text-left flex items-center justify-between">
                                <h3 className={`text-[12px] font-semibold ${TITLE}`}>
                                    Calificaciones y Comentarios
                                </h3>
                                {!reviewLoading && reviews.length > 0 && (
                                    <span className="text-[10px] text-slate-400">{reviews.length} reseña{reviews.length !== 1 ? "s" : ""}</span>
                                )}
                            </div>

                            <div className="px-4 pb-4">
                                {reviewLoading && <ReviewSkeleton />}

                                {!reviewLoading && reviews.length === 0 && (
                                    <p className="text-[12px] text-slate-400 italic">
                                        Este producto aún no tiene reseñas.
                                    </p>
                                )}

                                {!reviewLoading && reviews.length > 0 && (
                                    <div className="space-y-3">
                                        {reviews.map((r) => (
                                            <div
                                                key={r.id}
                                                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] font-semibold text-slate-800">
                                                            {r.customerName}
                                                        </span>
                                                        {r.isVerified && (
                                                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-[1px] text-[9px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                                                                <SvgIcon className="w-2.5 h-2.5">{I.check}</SvgIcon>
                                                                Verificada
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <StarRating rating={r.rating} />
                                                        <span className="text-[10px] font-semibold text-amber-600">{r.rating}</span>
                                                    </div>
                                                </div>

                                                {r.comment && (
                                                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
                                                        {r.comment}
                                                    </p>
                                                )}

                                                <div className="mt-1.5 text-[10px] text-slate-400">
                                                    {new Date(r.date).toLocaleDateString("es-PY", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric"
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Columna derecha */}
                    <div className="col-span-12 lg:col-span-4 space-y-3">

                        <SideCard title="Información">
                            <div className="space-y-3 text-left text-[11px]">
                                <div className="flex items-start gap-2">
                                    <span className="mt-[1px] text-blue-600">
                                        <SvgIcon className="w-4 h-4">{I.calendar}</SvgIcon>
                                    </span>
                                    <div className="leading-tight">
                                        <div className={`text-[11px] font-semibold ${TITLE}`}>Creado</div>
                                        <div className="mt-0.5 text-[11px] text-slate-600">{createdAt}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <span className="mt-[1px] text-amber-500">
                                        <SvgIcon className="w-4 h-4">{I.edit}</SvgIcon>
                                    </span>
                                    <div className="leading-tight">
                                        <div className={`text-[11px] font-semibold ${TITLE}`}>Última actualización</div>
                                        <div className="mt-0.5 text-[11px] text-slate-600">{updatedAt}</div>
                                    </div>
                                </div>

                                <div className="pt-0.5">
                                    <div className={`text-[11px] font-semibold ${TITLE}`}>ID del producto</div>
                                    <div className="mt-0.5 text-[11px] text-slate-600">{product.id ?? STATIC_PRODUCT_ID}</div>
                                </div>
                            </div>
                        </SideCard>

                        <SideCard title="Oferta">
                            <div className="space-y-3 text-left">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className={`text-[11px] font-semibold ${TITLE}`}>
                                            Estado de oferta
                                        </div>
                                        <div
                                            className={`mt-0.5 text-[11px] font-semibold ${
                                                offerForm.isOffer ? "text-amber-700" : "text-slate-600"
                                            }`}
                                        >
                                            {offerForm.isOffer ? "Activa" : "Desactivada"}
                                        </div>
                                    </div>

                                    <Toggle
                                        isOn={offerForm.isOffer}
                                        onToggle={handleOfferToggle}
                                        disabled={offerSaving}
                                        label="Activar oferta"
                                    />
                                </div>

                                {offerForm.isOffer ? (
                                    <div>
                                        <label
                                            htmlFor="product-offer-price"
                                            className={`mb-1 block text-[11px] font-semibold ${TITLE}`}
                                        >
                                            Precio de oferta
                                        </label>
                                        <input
                                            id="product-offer-price"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={offerForm.offerPrice}
                                            onChange={handleOfferPriceChange}
                                            disabled={offerSaving}
                                            className="w-full rounded-xl border border-[#d2d8d4] bg-[#f8faf9] px-3 py-2 text-[12px] text-slate-800 outline-none transition focus:border-[#8fb6a3] focus:ring-4 focus:ring-[rgba(107,144,128,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
                                            placeholder="Ej: 74990"
                                        />
                                        <p className="mt-1.5 text-[10px] text-slate-500">
                                            Precio regular: Gs. {originalPrice.toLocaleString("es-PY")}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600 ring-1 ring-slate-100">
                                        El producto se mantiene con su precio regular.
                                    </div>
                                )}

                                {offerFeedback.message && (
                                    <div
                                        className={`rounded-xl px-3 py-2 text-[11px] font-medium ${
                                            offerFeedback.type === "success"
                                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                                : "bg-red-50 text-red-700 ring-1 ring-red-100"
                                        }`}
                                    >
                                        {offerFeedback.message}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={handleSaveOffer}
                                    disabled={offerSaving || !hasOfferChanges}
                                    className="flex w-full items-center justify-center rounded-xl bg-[#6B9080] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#5b7b6d] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {offerSaving ? "Guardando oferta..." : "Guardar oferta"}
                                </button>
                            </div>
                        </SideCard>

                        <SideCard title="Estadísticas">
                            <div className="space-y-2.5">
                                <Row
                                    left="Calificación promedio:"
                                    right={stats?.averageRating ?? "—"}
                                />
                                <Row
                                    left="Total de reseñas:"
                                    right={stats?.totalReviews ?? 0}
                                />
                                <Row
                                    left="Verificadas:"
                                    right={stats?.verifiedReviews ?? 0}
                                />
                            </div>
                        </SideCard>

                        <SideCard title="Acciones Rápidas">
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/comercio/productos/${STATIC_PRODUCT_ID}/editar`)}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-100/70 px-3 py-1.5 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100"
                                >
                                    <SvgIcon className="w-4 h-4">{I.edit}</SvgIcon>
                                    Editar Información
                                </button>

                                <button
                                    type="button"
                                    title="Disponible próximamente"
                                    disabled
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-100/60 px-3 py-1.5 text-[11px] font-semibold text-blue-700 opacity-40 cursor-not-allowed"
                                >
                                    <SvgIcon className="w-4 h-4">{I.eye}</SvgIcon>
                                    Ver en Tienda
                                </button>
                            </div>
                        </SideCard>
                    </div>
                </div>
            </main>
        </div>
    );
}