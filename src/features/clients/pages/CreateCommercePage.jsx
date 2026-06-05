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
        <div className="bg-gray-50 min-h-screen">
            <div className="sticky top-0 z-50">
                <Navbar />
            </div>
            <div className="flex justify-center w-full py-10 px-4">
                <div className="w-full max-w-2xl bg-white p-8 md:p-10 rounded-2xl shadow-xl ring-1 ring-gray-900/5">
                    <p className="text-2xl text-gray-900 font-extrabold tracking-tight">Crear Comercio</p>
                    <p className="text-gray-500 mt-2 mb-6">Completa el formulario para registrar tu comercio y comenzar a vender productos responsables.</p>
                    <CommerceCreationForm />
                    <p className="text-sm text-gray-400 text-center mt-6">Los campos marcados con * son obligatorios.</p>
                </div>
            </div>
        </div>
    );
};
