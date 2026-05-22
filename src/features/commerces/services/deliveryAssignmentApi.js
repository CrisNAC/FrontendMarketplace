// src/features/commerces/services/deliveryAssignmentApi.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3000").trim(),
  withCredentials: true,
});

/**
 * Obtiene los deliveries disponibles para un pedido.
 * GET /api/stores/:storeId/orders/:orderId/deliveries
 */
export const fetchAvailableDeliveries = async (storeId, orderId) => {
  const res = await apiClient.get(`/api/stores/${storeId}/orders/${orderId}/deliveries`);
  return res.data;
};

/**
 * Crea una asignación de delivery para un pedido.
 * POST /api/assignments
 * Body: { fk_order, fk_delivery }
 */
export const createDeliveryAssignment = async (fk_order, fk_delivery) => {
  const res = await apiClient.post("/api/assignments", { fk_order, fk_delivery });
  return res.data;
};

/**
 * Verifica si un pedido tiene una asignación activa (pendiente o aceptada).
 * GET /api/assignments/orders/:orderId/assignments
 */
export const checkOrderAssignment = async (orderId) => {
  try {
    const res = await apiClient.get(`/api/assignments/orders/${orderId}/assignments`);
    const assignments = Array.isArray(res.data) ? res.data : [];
    const active = assignments.find(
      (a) => a.assignment_status === "PENDING" || a.assignment_status === "ACCEPTED"
    );
    return {
      has_assignment: Boolean(active),
      assignment_status: active?.assignment_status ?? null,
    };
  } catch (err) {
    if (err.response?.status === 404) {
      return { has_assignment: false };
    }
    throw err;
  }
};

export const getAssignmentErrorMessage = (error, fallback = "Ocurrió un error inesperado.") => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      fallback
    );
  }
  return error?.message || fallback;
};