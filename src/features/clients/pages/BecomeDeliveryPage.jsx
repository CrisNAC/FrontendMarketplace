import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components";
import { BecomeDeliveryModal } from "../components/BecomeDeliveryModal";
import { useToast } from "@/hooks";

/**
 * Pantalla mínima: navbar + modal “Quiero ser delivery”.
 * Los datos personales salen del usuario logueado; el modal solo pide tipo de vehículo.
 */
export const BecomeDeliveryPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  return (
    <div className="min-h-screen bg-[#f7f9f8]">
      <Navbar />
      <BecomeDeliveryModal
        open
        onClose={() => navigate("/", { replace: true })}
        onSuccess={() => navigate("/delivery/perfil", { replace: true })}
        showToast={showToast}
      />
    </div>
  );
};

export default BecomeDeliveryPage;
