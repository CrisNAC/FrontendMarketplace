import React from 'react';

export const ProductSummary = ({ minPrice, maxPrice, mainImage }) => {
    return (
        <div className="flex flex-col items-center w-full">
            {/* Contenedor de la imagen */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 w-full flex justify-center mb-6">
                <img
                    src={mainImage}
                    alt="Apple iPhone 17 Pro"
                    className="w-full max-w-[250px] object-contain"
                />
            </div>

            {/* Rango de precios */}
            <div className="text-center w-full">
                <h3 className="text-gray-500 font-semibold text-lg">Rango de precios:</h3>
                <p className="text-3xl font-bold text-gray-400 mt-1">
                    {minPrice} Gs. / {maxPrice} Gs.
                </p>
            </div>
        </div>
    );
}
