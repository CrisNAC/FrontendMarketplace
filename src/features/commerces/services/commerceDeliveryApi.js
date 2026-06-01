import axios from "axios";
import { apiClient } from "./editCommerceApi";

/**
 * GET /api/stores/:storeId/deliveries
 * Retorna: { stats: { total, available, inDelivery, avgRating }, deliveries: [...] }
 * Cada delivery: { id, user: {id, name, email, phone}, status, vehicleType,
 *                  completedDeliveries, successRate, avgRating, reviewCount }
 */
export const fetchStoreDeliveries = async (storeId) => {
    const { data } = await apiClient.get(`/api/stores/${storeId}/deliveries`);
    return data;
};

/**
 * DELETE /api/stores/:storeId/deliveries/:deliveryId
 * Desvincula (fk_store = null). Retorna 204 sin body.
 * Lanza error si el delivery tiene entregas activas.
 */
export const deleteStoreDelivery = async (storeId, deliveryId) => {
    await apiClient.delete(`/api/stores/${storeId}/deliveries/${deliveryId}`);
};

/**
 * Extrae mensaje de error del backend de forma consistente.
 */
export const getDeliveryErrorMessage = (error, fallback = "Ocurrió un error inesperado.") => {
    const data = error?.response?.data;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error?.message === "string") return data.error.message;
    if (typeof data === "string") return data;
    return error?.message || fallback;
};