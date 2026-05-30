import apiClient from '../../../lib/apiClient';

const BASE = '/api/admin/tags';

// POST /api/admin/tags — acepta { name }
export const createAdminTag = async (name) => {
    const { data } = await apiClient.post(BASE, { name });
    return data; // { id, name, status, createdAt }
};

// GET /api/admin/tags
export const fetchAdminTags = async () => {
    const { data } = await apiClient.get(BASE);
    return data; // [{ id, name, status, productCount, createdAt, updatedAt }]
};

// PATCH /api/admin/tags/:id — acepta { name }
export const updateAdminTag = async (id, name) => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, { name });
    return data; // { id, name, status, createdAt, updatedAt }
};

// DELETE /api/admin/tags/:id
export const deleteAdminTag = async (id) => {
    await apiClient.delete(`${BASE}/${id}`);
};
