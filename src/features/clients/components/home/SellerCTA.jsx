// src/features/clients/components/home/SellerCTA.jsx
import { useNavigate } from "react-router-dom";

export const SellerCTA = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#8BB2A1] py-10 sm:py-12 px-6 mt-12 sm:mt-16 flex flex-col items-center justify-center text-center">
      <div className="w-full max-w-[1254px] mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
          ¿Eres vendedor?
        </h2>
        <p className="text-white mb-6 sm:mb-8 text-base sm:text-lg max-w-2xl mx-auto">
          Crea tu comercio y comienza a vender tus productos responsables a más clientes
        </p>
        <button
          type="button"
          onClick={() => navigate("/crear-comercio")}
          className="bg-white text-[#8BB2A1] hover:bg-gray-100 px-7 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors cursor-pointer text-sm"
        >
          Crear comercio
        </button>
      </div>
    </div>
  );
};