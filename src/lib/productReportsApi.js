import apiClient from "./apiClient";

/**
 * GET /api/reports/products/filtered
 * Admin ve todos los reportes; el seller solo los de su tienda.
 */
export const fetchFilteredProductReports = async ({
  report_status,
  search,
  page = 1,
  limit = 10,
} = {}) => {
  const params = { page, limit };
  if (report_status) params.report_status = report_status;
  if (search?.trim()) params.search = search.trim();

  const { data } = await apiClient.get("/api/reports/products/filtered", {
    params,
  });
  return data.filteredReports;
};

/**
 * PUT /api/reports/products/:reportId
 * Solo rol seller (comercio). Transiciones: PENDING→IN_PROGRESS; IN_PROGRESS→RESOLVED|REJECTED (con notas).
 */
export const updateProductReport = async (reportId, { report_status, notes }) => {
  const { data } = await apiClient.put(`/api/reports/products/${reportId}`, {
    report_status,
    ...(notes !== undefined && { notes }),
  });
  return data.updatedReport;
};
