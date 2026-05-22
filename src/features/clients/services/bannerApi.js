import apiClient from "../../../lib/apiClient";

export const fetchActiveBanners = async ({ limit } = {}) => {
  const params = {};
  if (limit) params.limit = limit;

  const { data } = await apiClient.get("/api/banners", { params });
  return Array.isArray(data) ? data : [];
};
