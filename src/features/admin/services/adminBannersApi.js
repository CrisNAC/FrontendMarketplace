import apiClient from "../../../lib/apiClient";

export const fetchAdminBanners = async ({ search, active, page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  if (search?.trim()) params.search = search.trim();
  if (active !== undefined && active !== "") params.active = active;

  const { data } = await apiClient.get("/api/admin/banners", { params });
  return data;
};

export const createAdminBanner = async (payload) => {
  const { data } = await apiClient.post("/api/admin/banners", payload);
  return data;
};

export const updateAdminBanner = async (id, payload) => {
  const { data } = await apiClient.put(`/api/admin/banners/${id}`, payload);
  return data;
};

export const toggleAdminBanner = async (id, isActive) => {
  const { data } = await apiClient.patch(`/api/admin/banners/${id}/active`, { isActive });
  return data;
};
