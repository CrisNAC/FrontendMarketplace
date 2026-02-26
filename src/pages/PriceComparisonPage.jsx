import React from "react";
import { ArrowLeft } from "lucide-react";
import { MarketplaceNavbar } from "../features/clients/components/MarketplaceNavbar";
import { CategoriesBar } from "../features/clients/components/CategoriesBar";

// --- Pantalla Principal ---
export default function PriceComparisonPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <MarketplaceNavbar />
            <CategoriesBar />

            <main className="max-w-7xl mx-auto w-full px-6 py-6">
                {/* Titulo */}
                <div className="flex items-center gap-4 mb-8">
                    <ArrowLeft className="w-6 h-6 cursor-pointer" />
                    <h1 className="text-2xl font-bold">Ofertas: Celular Apple iPhone 17 Pro</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Columna Izquierda */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        <div className="bg-white rounded-[40px] p-12 shadow-sm w-full aspect-square flex items-center justify-center mb-6">
                            <img
                                src="https://media.solotodo.com/media/products/1888204_main_1726002936.webp"
                                alt="iPhone 17 Pro"
                                className="w-full h-auto object-contain"
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-gray-500 font-bold text-lg">Rango de precios:</p>
                            <p className="text-3xl font-extrabold text-gray-600">
                                9.200.000 Gs. / 11.000.000 Gs.
                            </p>
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="lg:col-span-7">
                        <h2 className="text-xl font-bold mb-6 text-gray-700">Encontramos 39 ofertas</h2>

                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="bg-white rounded-[30px] p-6 flex justify-between items-center shadow-sm border border-gray-50"
                                >
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black">Nissei</h3>
                                        <p className="text-gray-500 text-sm">
                                            Apple iPhone 17 Pro A3256 Dual 256 GB - Silver
                                        </p>
                                        <div className="pt-4 flex items-center gap-4">
                                            <span className="text-2xl font-bold text-red-600">9.900.000 Gs.</span>
                                            <button className="bg-[#a5cbf0] text-white px-4 py-1 rounded-full text-xs font-bold">
                                                + Ver mas
                                            </button>
                                        </div>
                                    </div>
                                    <img
                                        src="https://nissei.com/media/catalog/product/cache/16a1529124976ed4a080829871587600/i/p/iphone_15_pro_q423_white_titanium_pdp_image_position-1__en-us_1_2.jpg"
                                        className="w-24 h-24 object-contain"
                                        alt="thumbnail"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
