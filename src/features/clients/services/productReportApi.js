import axios from "axios";
import { getApiBase } from "../../../lib/cartApi";

/** Valores enviados al backend (contrato estable). */
export const REPORT_REASON_CODES = {
  BAD_CONDITION: "BAD_CONDITION",
  INAPPROPRIATE_PHOTO: "INAPPROPRIATE_PHOTO",
  MISLEADING_DESCRIPTION: "MISLEADING_DESCRIPTION",
  OTHER: "OTHER",
};

export const REPORT_REASON_LABELS = [
  { value: REPORT_REASON_CODES.BAD_CONDITION, label: "Producto en mal estado" },
  { value: REPORT_REASON_CODES.INAPPROPRIATE_PHOTO, label: "Foto inapropiada" },
  { value: REPORT_REASON_CODES.MISLEADING_DESCRIPTION, label: "Descripción engañosa" },
  { value: REPORT_REASON_CODES.OTHER, label: "Otro" },
];

const STORAGE_PREFIX = "marketplace_product_report_";

function storageKey(userId) {
  return `${STORAGE_PREFIX}${userId}`;
}

/** Fallback cuando el GET no existe o falla: productos ya reportados en esta sesión/navegador. */
export function hasLocalReportForProduct(userId, productId) {
  if (userId == null || productId == null) return false;
  try {
    const raw = sessionStorage.getItem(storageKey(userId));
    if (!raw) return false;
    const data = JSON.parse(raw);
    const ids = data?.productIds;
    if (!Array.isArray(ids)) return false;
    return ids.includes(Number(productId));
  } catch {
    return false;
  }
}

export function rememberLocalReport(userId, productId) {
  if (userId == null || productId == null) return;
  try {
    const key = storageKey(userId);
    const raw = sessionStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : { productIds: [] };
    const ids = Array.isArray(data.productIds) ? data.productIds : [];
    const n = Number(productId);
    if (!ids.includes(n)) ids.push(n);
    sessionStorage.setItem(key, JSON.stringify({ productIds: ids }));
  } catch {
    /* ignore */
  }
}

/**
 * GET: indica si el comprador ya tiene un reporte pendiente sobre el producto.
 * Contrato esperado: 200 { hasPendingReport: boolean }.
 * Si el endpoint aún no existe o el body no coincide, devuelve null (fallback sessionStorage).
 */
export async function fetchPendingProductReport(productId) {
  const base = getApiBase() || "http://localhost:3000";
  const res = await axios.get(`${base}/api/customer/product-reports/me/pending`, {
    params: { productId },
    withCredentials: true,
    validateStatus: () => true,
  });

  if (res.status === 200 && typeof res.data?.hasPendingReport === "boolean") {
    return res.data.hasPendingReport;
  }
  return null;
}

/**
 * POST /api/customer/product-reports
 * Body: { productId, reason, description? }
 */
export async function submitProductReport({ productId, reason, description }) {
  const base = getApiBase() || "http://localhost:3000";
  return axios.post(
    `${base}/api/customer/product-reports`,
    {
      productId,
      reason,
      ...(description != null && String(description).trim() !== ""
        ? { description: String(description).trim() }
        : {}),
    },
    { withCredentials: true, validateStatus: () => true }
  );
}
