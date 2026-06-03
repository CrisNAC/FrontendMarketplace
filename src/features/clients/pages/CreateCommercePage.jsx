import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components";
import { CommerceCreationForm } from "@/features/clients/components/CommerceCreationForm";
import { apiClient } from "@/lib";
import { useToast } from "@/hooks";

export const CreateCommercePage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const checkRole = async () => {
            const { data } = await apiClient.get("/api/session/user-session");
            if (data?.user?.role === "SELLER") {
                showToast("Ya tenés un comercio registrado. 🏪", "info");
                navigate("/comercio", { replace: true });
            }
        };

        checkRole().catch((error) => {
            if (!error?.response) {
                showToast("Error al verificar el rol del usuario.", "error");
                navigate("/error/500", { replace: true });
            }
        });
    }, [navigate, showToast]);

    return (
        <div>
            <div className="sticky top-0 z-50">
                <Navbar />
            </div>
            <div className="flex justify-center w-full mt-3 mb-3">
                <div className="w-full max-w-2xl bg-white p-8 rounded-md shadow-md ">
                    <p className="text-xl text-gray-900 font-bold">Crear Comercio</p>
                    <p className="text-gray-700">Completa el formulario para registrar tu comercio y comenzar a vender productos responsables.</p>
                    <CommerceCreationForm />
                    <p className="text-sm text-gray-500 text-center mt-4">Los campos marcados con * son obligatorios.</p>
                </div>
            </div>
        </div>
    );
};
