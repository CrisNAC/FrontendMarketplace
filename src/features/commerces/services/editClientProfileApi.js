import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").trim();

const apiClient = axios.create({
    baseURL: API_BASE_URL || undefined,
    withCredentials: true
});

// Obtiene el usuario de la sesión activa (cookie JWT)
export const getSession = async () => {
    const response = await apiClient.get("/api/session/user-session");
    return response.data; // { success: true, user: { id_user, name, email, role, ... } }
};

// get perfil usuario
export const fetchUserProfile = async (userId) => {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data;
};

// put actualizar usuario
export const updateUserProfile = async (userId, payload) => {
    const response = await apiClient.put(`/api/users/${userId}`, payload);
    return response.data;
};

// put actualizar dirección
export const updateUserAddress = async (userId, addressId, payload) => {
    const response = await apiClient.put(
        `/api/users/${userId}/addresses/${addressId}`,
        payload
    );
    return response.data;
};

// Manejo de errores backend
export const getBackendErrorMessage = (error, fallback) => {
    if (axios.isAxiosError(error)) {
        return (
            error.response?.data?.message ||
            error.response?.data?.error ||
            fallback
        );
    }
    return fallback;
};