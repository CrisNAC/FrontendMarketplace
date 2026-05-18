import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../../components/navbar/Navbar";
import { CommerceCreationForm } from "../components/CommerceCreationForm";
import apiClient from "../../../lib/apiClient.js";

export const CreateCommercePage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkRole = async () => {
            const { data } = await apiClient.get("/api/session/user-session");
            if (data?.user?.role === "SELLER") {
                toast("Ya tenés un comercio registrado.", { icon: "🏪" });
                navigate("/comercio", { replace: true });
            }
        };

        checkRole().catch((error) => {
            // apiClient ya maneja errores HTTP
            // Solo se redirige a /error/500 si es un error sin respuesta del servidor
            if (!error?.response) navigate("/error/500", { replace: true });
        });
    }, [navigate]);

    return (
        <div>
            <Navbar />
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
