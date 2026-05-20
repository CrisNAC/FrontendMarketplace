import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";
import BecomeDeliveryModal from "../components/BecomeDeliveryModal";

/**
 * Pantalla mínima: navbar + modal “Quiero ser delivery”.
 * Los datos personales salen del usuario logueado; el modal solo pide tipo de vehículo.
 */
export const BecomeDeliveryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f9f8]">
      <Navbar />
      <BecomeDeliveryModal
        open
        onClose={() => navigate("/", { replace: true })}
        onSuccess={() => navigate("/delivery/perfil", { replace: true })}
      />
    </div>
  );
};

export default BecomeDeliveryPage;
