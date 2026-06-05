import apiClient from "../../../lib/apiClient";

// ── Commerce side ────────────────────────────────────────────────────────────

export const getMyBannerRequests = async (storeId, { approvalStatus } = {}) => {
  const params = {};
  if (approvalStatus) params.approval_status = approvalStatus;
  const { data } = await apiClient.get(`/api/stores/${storeId}/banner-requests`, { params, skipGlobalErrorRedirect: true });
  return data.data ?? [];
};

export const createBannerRequest = async (storeId, payload) => {
  const { title, description = null, linkUrl = null, startAt = null, endAt = null } = payload ?? {};
  const { data } = await apiClient.post(`/api/stores/${storeId}/banner-requests`, {
    title,
    description,
    linkUrl,
    startAt,
    endAt,
  }, { skipGlobalErrorRedirect: true });
  return data;
};

export const uploadBannerRequestImage = async (requestId, file) => {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await apiClient.post(
    `/api/banner-requests/${requestId}/image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" }, skipGlobalErrorRedirect: true }
  );
  return data;
};

export const cancelBannerRequest = async (storeId, requestId) => {
  await apiClient.delete(`/api/stores/${storeId}/banner-requests/${requestId}`, { skipGlobalErrorRedirect: true });
};

// ── Admin side ───────────────────────────────────────────────────────────────

export const getAllBannerRequests = async ({ approvalStatus, search, page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  if (approvalStatus) params.approval_status = approvalStatus;
  if (search?.trim()) params.search = search.trim();
  const { data } = await apiClient.get("/api/admin/banners/requests", { params });
  return data;
};

export const reviewBannerRequest = async (requestId, { decision, rejectionReason }) => {
  if (!["APPROVE", "REJECT"].includes(decision)) throw new Error("Decisión inválida");
  const body = { decision };
  if (rejectionReason) body.rejectionReason = rejectionReason;
  const { data } = await apiClient.patch(`/api/admin/banners/requests/${requestId}`, body);
  return data;
};
