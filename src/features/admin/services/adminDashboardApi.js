import apiClient from "../../../lib/apiClient";

const extractTotal = (responseData) => {
  if (!responseData || typeof responseData !== "object") return 0;

  if (responseData.pagination && typeof responseData.pagination.total === "number") {
    return responseData.pagination.total;
  }

  if (typeof responseData.total === "number") return responseData.total;
  if (Array.isArray(responseData.data)) return responseData.data.length;
  return 0;
};

const getCount = async (url, params = {}) => {
  const { data } = await apiClient.get(url, { params: { page: 1, limit: 1, ...params } });
  return extractTotal(data);
};

export const fetchAdminDashboardStats = async () => {
  const requests = await Promise.allSettled([
    getCount("/api/admin/users"),
    getCount("/api/admin/users", { role: "CUSTOMER", status: "true" }),
    getCount("/api/admin/users", { role: "SELLER" }),
    getCount("/api/admin/products", { status: "PENDING" }),
    getCount("/api/admin/reviews", { status: "PENDING" }),
    getCount("/api/admin/commerces", { status: "PENDING" }),
  ]);

  const safeValue = (index) =>
    requests[index].status === "fulfilled" ? requests[index].value : 0;

  return {
    totalUsers: safeValue(0),
    activeBuyers: safeValue(1),
    registeredCommerces: safeValue(2),
    pendingProducts: safeValue(3),
    pendingReviews: safeValue(4),
    pendingCommerces: safeValue(5),
  };
};
