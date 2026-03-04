import { useNavigate } from "react-router-dom";

export const SellerCTA = () => {
  const navigate = useNavigate();

  const handleCreateCommerce = () => {
    navigate('/crear-comercio');
  };

  return (
    <div className="w-full bg-[#8BB2A1] py-12 px-6 mt-16 flex flex-col items-center justify-center text-center">
      <div className="w-[1254px] mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4">
          ¿Eres vendedor?
        </h2>
        <p className="text-white mb-8 text-lg max-w-2xl mx-auto">
          Crea tu comercio y comienza a vender tus productos responsables a más clientes
        </p>
        <button
          onClick={handleCreateCommerce}
          className="bg-white text-[#8BB2A1] hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors cursor-pointer"
          style={{
            fontSize: "14px",
            fontWeight: "600",
            borderRadius: "8px"
          }}
        >
          Crear comercio
        </button>
      </div>
    </div>
  );
};