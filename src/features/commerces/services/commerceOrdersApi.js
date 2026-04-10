// src/features/commerces/services/commerceOrdersApi.js
import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

export const ordersApiClient = axios.create({
    baseURL: API_BASE_URL || "http://localhost:3000",
    withCredentials: true,
});

/**
 * Obtiene los pedidos del comercio con filtros opcionales.
 * GET /api/orders/store/:storeId
 *
 * Response: { orders, total, page, limit, total_page }
 * Cada order: { id, status, total, notes, address, items, createdAt, updatedAt }
 */
export const fetchStoreOrders = async (storeId, filters = {}) => {
    const params = {};

    if (filters.order_status) {
        params.order_status = Array.isArray(filters.order_status)
            ? filters.order_status.join(",")
            : filters.order_status;
    }

    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to)   params.date_to   = filters.date_to;
    if (filters.page)      params.page      = filters.page;
    if (filters.limit)     params.limit     = filters.limit;

    const res = await ordersApiClient.get(`/api/orders/store/${storeId}`, { params });
    return res.data;
};

/**
 * Actualiza el estado de un pedido.
 * PATCH /api/orders/:orderId/status
 * Body: { order_status }
 */
export const updateOrderStatus = async (orderId, order_status) => {
    const res = await ordersApiClient.patch(`/api/orders/${orderId}/status`, { order_status });
    return res.data;
};

/**
 * Extrae el mensaje de error del backend.
 */
export const getOrderErrorMessage = (error, fallback = "Ocurrió un error inesperado.") => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.error?.message
            || error.response?.data?.message
            || fallback;
    }
    return error?.message || fallback;
};