import apiClient from '../../../lib/apiClient';

const BASE = '/api/admin/tags';

// POST /api/admin/tags — acepta { name }
export const createAdminTag = async (name) => {
    const { data } = await apiClient.post(BASE, { name });
    return data; 
};

// GET /api/admin/tags
export const fetchAdminTags = async () => {
    const { data } = await apiClient.get(BASE);
    return data; 
};

// PATCH /api/admin/tags/:id — acepta { name }
export const updateAdminTag = async (id, name) => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, { name });
    return data; 
};

// DELETE /api/admin/tags/:id
export const deleteAdminTag = async (id) => {
    await apiClient.delete(`${BASE}/${id}`);
};
