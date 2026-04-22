import apiClient from '../../../lib/apiClient';

/**
 * GET /api/admin/products
 * @param {Object} params
 * @param {string} [params.search]         - Búsqueda por nombre de producto o comercio
 * @param {string} [params.approvalStatus] - PENDING | ACTIVE | REJECTED
 * @param {number} [params.page]
 * @param {number} [params.limit]
 */
export const fetchAdminProducts = async ({ search, approvalStatus, page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  if (search?.trim())    params.search         = search.trim();
  if (approvalStatus)    params.approvalStatus = approvalStatus;

  const { data } = await apiClient.get('/api/admin/products', { params });
  return data;
};

/**
 * PATCH /api/admin/products/:id/status — aprueba el producto
 */
export const approveProduct = async (id) => {
  const { data } = await apiClient.patch(`/api/admin/products/${id}/status`, { status: 'ACTIVE' });
  return data;
};

/**
 * PATCH /api/admin/products/:id/status — rechaza el producto con motivo obligatorio
 */
export const rejectProduct = async (id, reason) => {
  const { data } = await apiClient.patch(`/api/admin/products/${id}/status`, { status: 'REJECTED', reason });
  return data;
};
