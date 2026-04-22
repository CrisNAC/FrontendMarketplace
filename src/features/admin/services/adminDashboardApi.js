import apiClient from "../../../lib/apiClient";

const dashboardReq = (config = {}) => ({
  ...config,
  skipGlobalErrorRedirect: true,
});

const extractTotal = (responseData) => {
  if (!responseData || typeof responseData !== "object") return 0;

  if (responseData.pagination && typeof responseData.pagination.total === "number") {
    return responseData.pagination.total;
  }

  if (typeof responseData.filteredReports?.meta?.total === "number") {
    return responseData.filteredReports.meta.total;
  }

  if (typeof responseData.filteredReviewReports?.meta?.total === "number") {
    return responseData.filteredReviewReports.meta.total;
  }

  if (typeof responseData.total === "number") return responseData.total;
  if (Array.isArray(responseData.data)) return responseData.data.length;
  return 0;
};

const extractItems = (responseData) => {
  if (!responseData || typeof responseData !== "object") return [];
  if (Array.isArray(responseData.data)) return responseData.data;
  if (Array.isArray(responseData.filteredReports?.data)) return responseData.filteredReports.data;
  if (Array.isArray(responseData.filteredReviewReports?.data)) {
    return responseData.filteredReviewReports.data;
  }
  if (Array.isArray(responseData.items)) return responseData.items;
  if (Array.isArray(responseData.results)) return responseData.results;
  if (Array.isArray(responseData.rows)) return responseData.rows;
  return [];
};

const getCount = async (url, params = {}) => {
  const { data } = await apiClient.get(url, dashboardReq({ params: { page: 1, limit: 1, ...params } }));
  return extractTotal(data);
};

const getItems = async (url, params = {}) => {
  const { data } = await apiClient.get(url, dashboardReq({ params: { page: 1, limit: 5, ...params } }));
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

/** Reportes de producto por usuarios (GET /api/reports/products/filtered). */
const getProductReportsPendingCount = async () => {
  try {
    const { data } = await apiClient.get(
      "/api/reports/products/filtered",
      dashboardReq({ params: { page: 1, limit: 1, report_status: "PENDING" } })
    );
    const t = data?.filteredReports?.meta?.total;
    return typeof t === "number" ? t : 0;
  } catch {
    return 0;
  }
};

const getProductReportsPendingItems = async () => {
  try {
    const { data } = await apiClient.get(
      "/api/reports/products/filtered",
      dashboardReq({ params: { page: 1, limit: 8, report_status: "PENDING" } })
    );
    return data?.filteredReports?.data ?? [];
  } catch {
    return [];
  }
};

export const fetchAdminDashboardStats = async () => {
  const requests = await Promise.allSettled([
    getCount("/api/admin/users"),
    getCount("/api/admin/users", { role: "CUSTOMER", status: "true" }),
    getCount("/api/admin/users", { role: "SELLER" }),
    getCount("/api/admin/products", { approvalStatus: "PENDING" }),
    getCount("/api/reports/reviews/filtered", { report_status: "PENDING" }),
    getCount("/api/admin/stores/pending"),
    getProductReportsPendingCount(),
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
    pendingProductReports: safeValue(6),
  };
};

export const fetchAdminRecentActivity = async () => {
  const requests = await Promise.allSettled([
    getItems("/api/admin/users", { role: "CUSTOMER" }),
    getItems("/api/admin/users", { role: "SELLER" }),
    getItems("/api/admin/products", { approvalStatus: "PENDING" }),
    getItems("/api/reports/reviews/filtered", { report_status: "PENDING" }),
    getItems("/api/admin/stores/pending"),
    Promise.resolve([]),
    getProductReportsPendingItems(),
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
      id: `warn-product-approval-${product.id ?? Math.random()}`,
      type: "warning",
      label: "warning",
      description: "Producto pendiente de aprobación",
      detail: pickEntityName(product),
      dateMs: toDateMs(product.createdAt ?? product.updatedAt ?? now),
    })),
    ...safeItems(4).map((commerce) => ({
      id: `warn-commerce-${commerce.id ?? Math.random()}`,
      type: "warning",
      label: "warning",
      description: "Comercio pendiente de aprobación",
      detail: pickEntityName(commerce),
      dateMs: toDateMs(commerce.createdAt ?? commerce.updatedAt ?? now),
    })),
    ...safeItems(3).map((reviewReport) => {
      const reason = pickReason(reviewReport);
      const productName = reviewReport.product_review?.product?.name;
      return {
        id: `error-review-${reviewReport.id_review_report ?? reviewReport.id ?? Math.random()}`,
        type: "error",
        label: "error",
        description: reason
          ? `Reseña reportada (${String(reason).toLowerCase()})`
          : "Reseña reportada",
        detail: productName || pickEntityName(reviewReport) || reviewReport.reporter?.name || "",
        dateMs: toDateMs(reviewReport.created_at ?? reviewReport.createdAt ?? now),
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
    ...safeItems(6).map((report) => ({
      id: `warn-prodreport-${report.id_product_report ?? Math.random()}`,
      type: "warning",
      label: "warning",
      description: "Usuario reportó un producto",
      detail: report.product?.name
        ? `"${report.product.name}"${report.reason ? ` · ${report.reason}` : ""}`
        : pickReason(report),
      dateMs: toDateMs(report.created_at ?? now),
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
