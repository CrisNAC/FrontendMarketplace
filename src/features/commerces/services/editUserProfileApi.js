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
        const data = error.response?.data
        if (typeof data === "string") return data
        if (typeof data?.message === "string") return data.message
        if (Array.isArray(data?.error?.details) && data.error.details.length > 0) {
            const firstDetail = data.error.details[0]
            if (typeof firstDetail?.message === "string") return firstDetail.message
        }
        if (typeof data?.error?.message === "string") return data.error.message
        if (typeof data?.error === "string") return data.error
        return fallback
    }
    return fallback
}

/** Teléfono delivery / usuario: 10 dígitos sin + ni separadores. */
export const DELIVERY_PHONE_REGEX = /^\d{10}$/
export const DELIVERY_PHONE_MESSAGE =
    "El teléfono debe tener exactamente 10 dígitos numéricos (sin espacios, guiones ni +)"
export const getUserImage = async (userId) => {
    const response = await apiClient.get(`/users/${userId}/image`)
    return response.data
}
export const uploadUserImage = async (userId, file) => {
    const formData = new FormData()
    formData.append("image", file)
    const response = await apiClient.post(`/users/${userId}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
}
export const deleteUserImage = async (userId) => {
    const response = await apiClient.delete(`/users/${userId}/image`)
    return response.data
}