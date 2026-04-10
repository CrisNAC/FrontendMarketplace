import apiClient from "../lib/apiClient";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
    const navigate = useNavigate();

    const logout = async () => {
        try {
            await apiClient.delete("/api/session");
        } catch (err) {
            console.error("Error al cerrar sesión:", err);
        } finally {
            navigate("/");
        }
    };

    return logout;
};