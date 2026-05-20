import apiClient from '../../../lib/apiClient';

const BASE = '/api/admin/categories';

// POST /api/admin/categories — acepta { name, icon }
export const createAdminCategory = async (name, icon = null) => {
    const { data } = await apiClient.post(BASE, { name, icon });
    return data; // { id, name, icon, visible, status, createdAt }
};

// GET /api/admin/categories
export const fetchAdminCategories = async ({ visible, searchCategory, categoryPage, categoryLimit } = {}) => {
    const params = {};
    if (visible && visible !== 'all') params.visible = visible;
    if (searchCategory?.trim()) params.searchCategory = searchCategory.trim();
    if (categoryPage) params.categoryPage = categoryPage;
    if (categoryLimit) params.categoryLimit = categoryLimit;

    const { data } = await apiClient.get(BASE, { params });
    return data; // { data, categoryTotal, categoryPage, categoryLimit, categoryTotalPages }
};

// GET /api/admin/categories/:id
export const fetchAdminCategoryById = async (id) => {
    const { data } = await apiClient.get(`${BASE}/${id}`);
    return data; // { id, name, icon, visible, status, productCount, createdAt, updatedAt }
};

// GET /api/admin/categories/filter/withProducts
export const fetchCategoriesWithProducts = async (filters = {}) => {
    const { visible, search, searchCategory, searchProduct, categoryPage, categoryLimit, productPage, productLimit } = filters;
    const params = {};
    if (visible && visible !== 'all') params.visible = visible;
    if (search?.trim())           params.search          = search.trim();
    if (searchCategory?.trim())   params.searchCategory  = searchCategory.trim();
    if (searchProduct?.trim())    params.searchProduct   = searchProduct.trim();
    if (categoryPage)             params.categoryPage    = categoryPage;
    if (categoryLimit)            params.categoryLimit   = categoryLimit;
    if (productPage)              params.productPage     = productPage;
    if (productLimit)             params.productLimit    = productLimit;

    const { data } = await apiClient.get(`${BASE}/filter/withProducts`, { params });
    return data;
};

// PUT /api/admin/categories/:id — acepta { name?, visible?, icon? }
export const updateAdminCategory = async (id, payload) => {
    const { data } = await apiClient.put(`${BASE}/${id}`, payload);
    return data; // { id, name, icon, visible, createdAt, updatedAt }
};

// DELETE /api/admin/categories/:id
export const deleteAdminCategory = async (id) => {
    await apiClient.delete(`${BASE}/${id}`);
};