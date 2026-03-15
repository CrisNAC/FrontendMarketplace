// src/features/commerces/pages/ComercioVerProducto.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../services/editCommerceApi";

// ─── Íconos SVG inline ────────────────────────────────────────────────────────
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
};

// ─── Estilos constantes ───────────────────────────────────────────────────────
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

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ComercioVerProducto() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        let active = true;
        const load = async () => {
            try {
                const res = await apiClient.get(`/products/${id}`);
                if (active) setProduct(res.data);
            } catch (err) {
                if (active) setError(err.response?.data?.message || "No se pudo cargar el producto.");
            } finally {
                if (active) setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, [id]);

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
                        onClick={() => navigate(`/comercio/productos/${id}/editar`)}
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

                                {/* Imagen */}
                                <div className="col-span-5">
                                    <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100">
                                        {product.image_url || product.imageUrl ? (
                                            <img
                                                src={product.image_url || product.imageUrl}
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
                                                Gs. {Number(product.price).toLocaleString("es-PY")}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className={SUBTLE}>Categoría:</span>
                                            <Pill variant="indigo">{product.category?.name ?? "—"}</Pill>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className={SUBTLE}>Estado:</span>
                                            <Pill variant={isVisible ? "green" : "gray"}>
                                                {isVisible ? "Activo" : "Oculto"}
                                            </Pill>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className={SUBTLE}>Calificación:</span>
                                            <span className={`${BODY} font-semibold`}>—</span>
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

                        {/* Comentarios — placeholder hasta que exista el endpoint */}
                        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                            <div className="px-4 pt-3 pb-2 text-left">
                                <h3 className={`text-[12px] font-semibold ${TITLE}`}>
                                    Calificaciones y Comentarios
                                </h3>
                            </div>
                            <div className="px-4 pb-4">
                                <p className="text-[12px] text-slate-400 italic">
                                    Las reseñas estarán disponibles próximamente.
                                </p>
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
                                    <div className="mt-0.5 text-[11px] text-slate-600">{product.id ?? id}</div>
                                </div>
                            </div>
                        </SideCard>

                        <SideCard title="Estadísticas">
                            <div className="space-y-2.5">
                                <Row left="Calificación promedio:" right="—" />
                                <Row left="Total de reseñas:" right="—" />
                            </div>
                        </SideCard>

                        <SideCard title="Acciones Rápidas">
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/comercio/productos/${id}/editar`)}
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