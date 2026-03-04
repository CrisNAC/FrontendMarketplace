import React from 'react';

export const OfferCard = ({ storeName, description, price, imageUrl }) => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow gap-4">

            {/* Información del comercio y producto */}
            <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{storeName}</h3>
                <p className="text-gray-600 text-sm mt-1">{description}</p>
            </div>

            {/* Precio y Botón */}
            <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xl font-bold text-[#c94b4b]">
                    {price} Gs.
                </span>
                <button className="bg-[#a5cbf0] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-300 transition-colors">
                    + Ver más
                </button>
            </div>

            {/* Miniatura del producto en la tienda */}
            <div className="shrink-0">
                <img
                    src={imageUrl}
                    alt={`Oferta en ${storeName}`}
                    className="w-20 h-24 object-contain rounded-xl bg-gray-50"
                />
            </div>
        </div>
    );
}