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

const extractItems = (responseData) => {
  if (!responseData || typeof responseData !== "object") return [];
  if (Array.isArray(responseData.data)) return responseData.data;
  if (Array.isArray(responseData.items)) return responseData.items;
  if (Array.isArray(responseData.results)) return responseData.results;
  if (Array.isArray(responseData.rows)) return responseData.rows;
  return [];
};

const getCount = async (url, params = {}) => {
  const { data } = await apiClient.get(url, { params: { page: 1, limit: 1, ...params } });
  return extractTotal(data);
};

const getItems = async (url, params = {}) => {
  const { data } = await apiClient.get(url, { params: { page: 1, limit: 5, ...params } });
  return extractItems(data);
};

const toDateMs = (value) => {
  const date = value ? new Date(value) : null;
  const ms = date instanceof Date ? date.getTime() : NaN;
  return Number.isNaN(ms) ? 0 : ms;
};

const pickEntityName = (entity) => {
  if (!entity || typeof entity !== "object") return "";

  return (
    entity.name ??
    entity.title ??
    entity.businessName ??
    entity.storeName ??
    entity.commerceName ??
    entity.productName ??
    entity.authorName ??
    ""
  );
};

const pickReason = (entity) => {
  if (!entity || typeof entity !== "object") return "";

  return (
    entity.reason ??
    entity.reportReason ??
    entity.reportType ??
    entity.motive ??
    entity.description ??
    ""
  );
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

export const fetchAdminRecentActivity = async () => {
  const requests = await Promise.allSettled([
    getItems("/api/admin/users", { role: "CUSTOMER" }),
    getItems("/api/admin/users", { role: "SELLER" }),
    getItems("/api/admin/products", { status: "PENDING" }),
    getItems("/api/admin/reviews", { status: "PENDING" }),
    getItems("/api/admin/commerces", { status: "PENDING" }),
    getItems("/api/admin/commerces", { status: "APPROVED" }),
  ]);

  const safeItems = (index) =>
    requests[index].status === "fulfilled" ? requests[index].value : [];

  const now = Date.now();

  const activities = [
    ...safeItems(0).map((user) => ({
      id: `info-customer-${user.id ?? Math.random()}`,
      type: "info",
      label: "info",
      description: "Nuevo comprador registrado",
      detail: pickEntityName(user),
      dateMs: toDateMs(user.createdAt ?? user.updatedAt ?? now),
    })),
    ...safeItems(1).map((commerceUser) => ({
      id: `info-seller-${commerceUser.id ?? Math.random()}`,
      type: "info",
      label: "info",
      description: "Nuevo comercio registrado",
      detail: pickEntityName(commerceUser),
      dateMs: toDateMs(commerceUser.createdAt ?? commerceUser.updatedAt ?? now),
    })),
    ...safeItems(2).map((product) => ({
      id: `warn-product-${product.id ?? Math.random()}`,
      type: "warning",
      label: "warning",
      description: "Producto reportado",
      detail: pickEntityName(product),
      dateMs: toDateMs(product.createdAt ?? product.updatedAt ?? now),
    })),
    ...safeItems(4).map((commerce) => ({
      id: `warn-commerce-${commerce.id ?? Math.random()}`,
      type: "warning",
      label: "warning",
      description: "Comercio reportado",
      detail: pickEntityName(commerce),
      dateMs: toDateMs(commerce.createdAt ?? commerce.updatedAt ?? now),
    })),
    ...safeItems(3).map((review) => {
      const reason = pickReason(review);
      return {
        id: `error-review-${review.id ?? Math.random()}`,
        type: "error",
        label: "error",
        description: reason
          ? `Resena reportada por ${String(reason).toLowerCase()}`
          : "Resena reportada",
        detail: pickEntityName(review),
        dateMs: toDateMs(review.createdAt ?? review.updatedAt ?? now),
      };
    }),
    ...safeItems(5).map((commerce) => ({
      id: `success-commerce-${commerce.id ?? Math.random()}`,
      type: "success",
      label: "success",
      description: "Comercio aprobado",
      detail: pickEntityName(commerce),
      dateMs: toDateMs(commerce.approvedAt ?? commerce.updatedAt ?? commerce.createdAt ?? now),
    })),
  ];

  const deduped = new Map();
  activities.forEach((activity) => {
    if (!deduped.has(activity.id)) deduped.set(activity.id, activity);
  });

  return Array.from(deduped.values())
    .sort((a, b) => b.dateMs - a.dateMs)
    .slice(0, 8);
};
