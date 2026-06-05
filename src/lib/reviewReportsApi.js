import apiClient from "./apiClient";

/**
 * POST /api/reports/reviews/:reviewId
 * Usuario autenticado reporta una reseña. Body: { reason, description? }
 * Si reason es OTHER, description es obligatoria en el servidor.
 */
export const reportProductReview = async (reviewId, { reason, description }) => {
  const { data } = await apiClient.post(`/api/reports/reviews/${reviewId}`, {
    reason,
    ...(description?.trim() ? { description: description.trim() } : {}),
  }, { skipGlobalErrorRedirect: true });
  return data.report;
};

/**
 * GET /api/reports/reviews/filtered
 * Solo administradores: reportes de reseñas (usuarios que denunciaron una reseña).
 */
export const fetchFilteredReviewReports = async ({
  report_status,
  search,
  page = 1,
  limit = 10,
} = {}) => {
  const params = { page, limit };
  if (report_status) params.report_status = report_status;
  if (search?.trim()) params.search = search.trim();

  const { data } = await apiClient.get("/api/reports/reviews/filtered", {
    params,
  });
  return data.filteredReviewReports;
};

/**
 * PUT /api/reports/reviews/:reportId
 * decision: KEEP_REVIEW — descarta el reporte; la reseña sigue visible.
 * decision: REMOVE_REVIEW — oculta la reseña (soft delete) y cierra reporte(s).
 */
export const resolveReviewReport = async (reportId, { decision }) => {
  const { data } = await apiClient.put(`/api/reports/reviews/${reportId}`, {
    decision,
  });
  return data.updatedReport;
};
