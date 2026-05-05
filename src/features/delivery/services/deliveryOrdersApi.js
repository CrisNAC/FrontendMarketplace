import axios from "axios";
import apiClient from "../../../lib/apiClient";
import { getSession } from "../../commerces/services/editUserProfileApi";

/**
 * Perfil de delivery con asignaciones pendientes (incluye pedido, comercio, ítems, dirección).
 * GET /api/deliveries/:id/assignments
 */
export const getDeliveryPendingWithAssignments = async (deliveryId) => {
  const { data } = await apiClient.get(`/api/deliveries/${deliveryId}/assignments`);
  return data;
};

/**
 * Carga sesión y, si hay id_delivery, las asignaciones pendientes.
 */
export const loadDeliveryDashboard = async () => {
  const session = await getSession();
  const user = session?.user;
  const idDelivery = user?.id_delivery;

  if (!user || user.role !== "DELIVERY") {
    return {
      user,
      delivery: null,
      assignments: [],
      reason: "not_delivery",
    };
  }

  if (!idDelivery) {
    return {
      user,
      delivery: null,
      assignments: [],
      reason: "no_delivery_profile",
    };
  }

  const delivery = await getDeliveryPendingWithAssignments(idDelivery);
  const assignments = Array.isArray(delivery?.delivery_assignments)
    ? delivery.delivery_assignments
    : [];

  return { user, delivery, assignments, reason: null };
};

/**
 * Aceptar o rechazar la asignación pendiente del pedido.
 * POST /api/assignments/orders/:orderId/delivery-response
 * @param {number|string} orderId
 * @param {"ACCEPT"|"REJECT"} action
 */
export const respondToDeliveryOrder = async (orderId, action) => {
  const { data } = await apiClient.post(
    `/api/assignments/orders/${orderId}/delivery-response`,
    { action }
  );
  return data;
};

/**
 * Historial de pedidos asignados al delivery (paginado y filtrable).
 * GET /api/assignments/:deliveryId/orders
 *
 * Query (opcional): page, limit, period (7d|15d|1m|all), assignment_status,
 * orderId (solo dígitos), userName (búsqueda por nombre de cliente).
 *
 * @param {number|string} deliveryId
 * @param {Record<string, string|number|undefined>} query
 */
export const getDeliveryOrderHistory = async (deliveryId, query = {}) => {
  const params = {};
  if (query.page != null) params.page = query.page;
  if (query.limit != null) params.limit = query.limit;
  if (query.period != null && query.period !== "") params.period = query.period;
  if (query.assignment_status) params.assignment_status = query.assignment_status;
  if (query.orderId != null && query.orderId !== "") params.orderId = String(query.orderId);
  if (query.userName) params.userName = query.userName;

  const { data } = await apiClient.get(`/api/assignments/${deliveryId}/orders`, {
    params,
  });
  return data;
};

export const getBackendErrorMessage = (error, fallback) => {
  if (axios.isAxiosError(error)) {
    const resData = error.response?.data;
    if (typeof resData === "string") return resData;
    if (typeof resData?.message === "string") return resData.message;
    if (typeof resData?.error === "string") return resData.error;
    if (typeof resData?.error?.message === "string") return resData.error.message;
    return fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
