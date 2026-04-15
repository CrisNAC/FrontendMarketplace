import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from '../../../components/navbar/Navbar';
import { formatGuarani } from '../../../lib/formatGuarani.js';

// --- Pantalla Principal ---
export default function PriceComparisonPage() {
    const alternativeText = "Imagen del producto";
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const search = searchParams.get("search") || "";

    const apiBase = useMemo(() => {
        return (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
    }, []);

    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [error, setError] = useState("");
    const [data, setData] = useState(null);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();

        const load = async () => {
            try {
                setStatus("loading");
                setError("");

                const url = new URL(`${apiBase || "http://localhost:3000"}/products/compare/search`);
                if (search) url.searchParams.set("search", search);

                const res = await fetch(url.toString(), {
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });

                if (!res.ok) {
                    throw new Error(`Error HTTP ${res.status}`);
                }

                const json = await res.json();
                if (!active) return;
                setData(json);
                setStatus("success");
            } catch (e) {
                if (e?.name === "AbortError") return;
                if (!active) return;
                setStatus("error");
                setError(e instanceof Error ? e.message : "No se pudo cargar la comparación.");
                setData(null);
            }
        };

        load();

        return () => {
            active = false;
            controller.abort();
        };
    }, [apiBase, search]);

    const offers = Array.isArray(data?.offers) ? data.offers : [];
    const productName = data?.product?.name || search || "Producto";

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="max-w-7xl mx-auto w-full px-6 py-6">
                {/* Titulo */}
                <div className="flex items-center gap-4 mb-8">
                    <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)}/>
                    <h1 className="text-2xl font-bold">Ofertas: {productName}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Columna Izquierda */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        <div className="bg-white rounded-[40px] p-6 shadow-sm w-full aspect-square flex items-center justify-center mb-6 overflow-hidden">
                            {/* mostramos la imagen del primer producto si existe */}
                            {offers[0]?.image_url ? (
                                <img
                                    src={offers[0].image_url}
                                    alt={productName}
                                    className="w-full h-full object-contain rounded-[30px]"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                            ) : (
                                <span className="text-gray-400 text-sm text-center">
                                    Imagen de referencia del producto
                                </span>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 font-bold text-lg">Rango de precios:</p>
                            {offers.length > 0 ? (
                                (() => {
                                    const prices = offers.map(o => Number(o.price)).filter(p => Number.isFinite(p));
                                    const min = Math.min(...prices);
                                    const max = Math.max(...prices);
                                    return (
                                        <p className="text-3xl font-extrabold text-gray-600">
                                            {formatGuarani(min)} / {formatGuarani(max)}
                                        </p>
                                    );
                                })()
                            ) : (
                                <p className="text-sm text-gray-400">Sin precios disponibles</p>
                            )}
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="lg:col-span-7">
                        <h2 className="text-xl font-bold mb-2 text-gray-700">
                            {offers.length > 0
                                ? `Encontramos ${offers.length} ofertas`
                                : "Sin ofertas para este producto"}
                        </h2>
                        {status === "loading" && (
                            <p className="text-sm text-gray-500 mb-4">Cargando ofertas...</p>
                        )}
                        {status === "error" && (
                            <p className="text-sm text-red-600 mb-4">
                                No se pudo cargar la comparación{error ? `: ${error}` : "."}
                            </p>
                        )}

                        <div className="space-y-4">
                            {offers.map((offer, idx) => (
                                <div
                                    key={offer.productId ?? idx}
                                    className="bg-white rounded-[30px] p-6 flex justify-between items-center shadow-sm border border-gray-50"
                                >
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black">
                                            {offer.store?.name || "Comercio"}
                                        </h3>
                                        <p className="text-gray-500 text-sm">
                                            {offer.name || productName}
                                        </p>
                                        <div className="pt-4 flex items-center gap-4">
                                            <span className="text-lg font-bold text-red-600">
                                                {formatGuarani(offer.price)}
                                            </span>
                                            {(() => {
                                                const id = Number(offer.productId);
                                                if (!Number.isFinite(id) || id <= 0) {
                                                    return (
                                                        <button
                                                            type="button"
                                                            className="bg-gray-300 text-white px-4 py-1 rounded-full text-xs font-bold cursor-not-allowed"
                                                            disabled
                                                        >
                                                            + Ver más
                                                        </button>
                                                    );
                                                }

                                                return (
                                                    <Link
                                                        to={`/producto-detalle/${id}`}
                                                        className="no-underline bg-[#a5cbf0] text-white px-4 py-1 rounded-full text-xs font-bold"
                                                        >
                                                        + Ver más
                                                    </Link>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    {/* Sin imagen específica por oferta por ahora */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
