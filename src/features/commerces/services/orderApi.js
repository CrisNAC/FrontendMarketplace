import axios from "axios";

const apiClient = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3000").trim(),
    withCredentials: true
});

/**
 * Obtiene el historial de pedidos de un cliente.
 * GET /api/users/:customerId/orders
 */
export const getOrdersByCustomer = async (customerId) => {
    const response = await apiClient.get(`/api/users/${customerId}/orders`);
    return response.data; // array de órdenes
};

/**
 * No hay endpoint individual por orderId, así que se filtra del listado.
 */
export const getOrderById = async (customerId, orderId) => {
    const orders = await getOrdersByCustomer(customerId);
    return orders.find((o) => String(o.id) === String(orderId)) ?? null;
};

/**
 * Cancela un pedido (solo si está en PENDING).
 * PATCH /api/orders/:orderId/status
 */
export const cancelOrder = async (orderId) => {
    const response = await apiClient.patch(`/api/orders/${orderId}/status`, {
        order_status: "CANCELLED",
    });
    return response.data;
};

/**
 * Pedidos entregados sin calificar al delivery.
 * GET /api/orders/pending-delivery-reviews
 */
export const getPendingDeliveryReviews = async () => {
    const response = await apiClient.get("/api/orders/pending-delivery-reviews");
    return response.data;
};

/**
 * Crea la calificación del delivery para un pedido entregado.
 * POST /api/orders/:orderId/delivery-review
 */
export const createDeliveryReview = async (orderId, payload) => {
    const response = await apiClient.post(`/api/orders/${orderId}/delivery-review`, payload);
    return response.data;
};

// Manejo de errores backend (mismo patrón que el proyecto)
export const getBackendErrorMessage = (error, fallback) => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        // data puede ser string, { message }, { error }, { error: { message } }, etc.
        if (typeof data === 'string') return data;
        if (typeof data?.message === 'string') return data.message;
        if (typeof data?.error === 'string') return data.error;
        if (typeof data?.error?.message === 'string') return data.error.message;
        return fallback;
    }
    if (error instanceof Error) return error.message;
    return fallback;
};