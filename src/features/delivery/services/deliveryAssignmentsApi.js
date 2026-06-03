import { apiClient } from '@/lib';
import { useToast } from "@/hooks";

/**
 * Obtener todas las asignaciones de un delivery con filtro de estado
 * GET /api/assignments/deliveries/{deliveryId}/assignments?status=ACCEPTED
 */
export const getDeliveryAssignments = async (deliveryId, status = null) => {
  try {
    let url = `/api/assignments/deliveries/${deliveryId}/assignments`;
    if (status) {
      url += `?status=${status}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener las asignaciones ACCEPTED (activas) de un delivery
 * Convenience method que usa getDeliveryAssignments con status=ACCEPTED
 */
export const getActiveDeliveryAssignments = async (deliveryId) => {
  return getDeliveryAssignments(deliveryId, 'ACCEPTED');
};

/**
 * Marcar una asignación como entregada
 * POST /api/assignments/{id}/complete
 */
export const completeDeliveryAssignment = async (assignmentId) => {
  const { showToast } = useToast();
  try {
    const response = await apiClient.post(`/api/assignments/${assignmentId}/complete`);
    showToast('Entrega finalizada correctamente', 'success');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error?.message || 'Error al finalizar la entrega';
    showToast(message, 'error');
    throw error;
  }
};

/**
 * Obtener historial de pedidos del delivery
 * GET /api/assignments/{id}/orders?period=7d&page=1&limit=20
 */
export const getDeliveryOrderHistory = async (deliveryId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.period) params.append('period', filters.period);
    if (filters.assignment_status) params.append('assignment_status', filters.assignment_status);
    if (filters.orderId) params.append('orderId', filters.orderId);
    if (filters.userName) params.append('userName', filters.userName);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const url = `/api/assignments/${deliveryId}/orders${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};
