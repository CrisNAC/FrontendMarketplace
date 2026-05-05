import axios from "axios";
import { apiClient as commerceApiClient, getBackendErrorMessage } from "./editCommerceApi";

/**
 * GET /api/deliveries/search
 * Sin `q`: lista completa de candidatos disponibles.
 * Con `q`: filtro por correo o teléfono.
 * @returns {Promise<Array>} candidatos { id_user, name, email, phone, ... }
 */
export const searchDeliveries = async (q) => {
    const trimmed = (q || "").trim();
    const config = trimmed ? { params: { q: trimmed } } : {};
    const { data } = await commerceApiClient.get("/api/deliveries/search", config);
    return Array.isArray(data) ? data : [];
};

/**
 * POST /api/stores/:id/deliveries
 * Body: { fk_user }
 */
export const linkDeliveryToStore = async (storeId, fk_user) => {
    const { data } = await commerceApiClient.post(`/api/stores/${storeId}/deliveries`, {
        fk_user,
    });
    return data;
};

export { getBackendErrorMessage };

export const getStoreDeliveryErrorMessage = (error, fallback) => {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message;
        if (typeof msg === "string" && msg.trim()) return msg;
        const status = error.response?.status;
        if (status === 409) return "Ese repartidor ya está vinculado.";
        if (status === 404) return "No se encontró al repartidor o no es válido.";
        if (status === 403) return "No tenés permiso para vincular deliveries a este comercio.";
    }
    return getBackendErrorMessage(error, fallback);
};
