import React from 'react';
import { OfferCard } from "../components/OfferCard.jsx";
import { ProductSummary } from "../components/ProductSummary.jsx";

// Mock data: Datos falsos para simular las ofertas
const MOCK_OFFERS = [
    {
        id: 1,
        storeName: "Nissei",
        description: "Apple iPhone 17 Pro A3256 Dual 256 GB - Silver",
        price: "9.900.000",
        imageUrl: "https://via.placeholder.com/80x100?text=iPhone" // Reemplaza con tu imagen
    },
    {
        id: 2,
        storeName: "Nissei",
        description: "Apple iPhone 17 Pro A3256 Dual 256 GB - Silver",
        price: "9.900.000",
        imageUrl: "https://via.placeholder.com/80x100?text=iPhone"
    },
    {
        id: 3,
        storeName: "Nissei",
        description: "Apple iPhone 17 Pro A3256 Dual 256 GB - Silver",
        price: "9.900.000",
        imageUrl: "https://via.placeholder.com/80x100?text=iPhone"
    }
];

export default function PriceComparisonPage() {
    return (
        <div className="min-h-screen bg-[#f3f4f6]">
            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">

                {/* Título y botón volver */}
                <div className="flex items-center gap-4 mb-8">
                    <button className="text-xl font-bold hover:text-gray-600">
                        ←
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Ofertas: Celular Apple iPhone 17 Pro
                    </h1>
                </div>

                {/* Layout de 2 columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Columna Izquierda: 4/12 */}
                    <div className="lg:col-span-4">
                        <ProductSummary
                            minPrice="9.200.000"
                            maxPrice="11.000.000"
                            mainImage="https://via.placeholder.com/300x400?text=iPhone+Naranja" // Reemplaza
                        />
                    </div>

                    {/* Columna Derecha: 8/12 */}
                    <div className="lg:col-span-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">
                            Encontramos 39 ofertas
                        </h2>

                        {/* Lista iterando sobre MOCK_OFFERS */}
                        <div className="flex flex-col gap-4">
                            {MOCK_OFFERS.map((offer) => (
                                <OfferCard
                                    key={offer.id}
                                    storeName={offer.storeName}
                                    description={offer.description}
                                    price={offer.price}
                                    imageUrl={offer.imageUrl}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
