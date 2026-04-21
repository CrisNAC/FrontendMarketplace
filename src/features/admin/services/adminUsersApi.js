import apiClient from '../../../lib/apiClient';

/**
 * GET /api/admin/users
 * @param {Object} params
 * @param {string} [params.search]  - Búsqueda por nombre o email
 * @param {string} [params.role]    - ADMIN | CUSTOMER | SELLER | DELIVERY
 * @param {string} [params.status]  - "true" | "false"
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @returns {{ data: User[], pagination: Pagination }}
 */
export const fetchAdminUsers = async ({ search, role, status, page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  if (search?.trim())  params.search = search.trim();
  if (role)            params.role   = role;
  if (status != null && status !== '') params.status = status;

  const { data } = await apiClient.get('/api/admin/users', { params });
  return data;
};

export const fetchPendingStores = async ({ page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  const { data } = await apiClient.get('/api/admin/stores/pending', { params });
  return data;
};

export const approveStore = async (id) => {
  const { data } = await apiClient.patch(`/api/admin/stores/${id}/approve`);
  return data;
};

export const rejectStore = async (id, reason) => {
  const { data } = await apiClient.patch(`/api/admin/stores/${id}/reject`, { reason });
  return data;
};
