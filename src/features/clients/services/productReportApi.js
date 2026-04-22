import axios from "axios";
import { getApiBase } from "../../../lib/cartApi";

/**
 * Catálogo alineado con `PRODUCT_REPORT_REASONS` del backend (OM-467).
 * Se usa si GET /api/reports/products/reasons falla.
 */
export const REPORT_REASON_LABELS = [
  { value: "DEFECTIVE", label: "Producto en mal estado" },
  { value: "WRONG_ITEM", label: "Producto incorrecto o no es lo que pedí" },
  { value: "MISSING_ITEM", label: "Producto incompleto o faltante" },
  { value: "LATE_DELIVERY", label: "Entrega tardía o no recibida" },
  { value: "CUSTOMER_SERVICE", label: "Mala atención del vendedor" },
  { value: "OTHER", label: "Otro" },
];

const STORAGE_PREFIX = "marketplace_product_report_";

function storageKey(userId) {
  return `${STORAGE_PREFIX}${userId}`;
}

/** Fallback cuando el GET falla: productos ya reportados en esta sesión/navegador. */
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
 * GET /api/reports/products/reasons — catálogo de motivos (público).
 * @returns {Promise<{ value: string, label: string }[] | null>}
 */
export async function fetchProductReportReasons() {
  const base = getApiBase() || "http://localhost:3000";
  const res = await axios.get(`${base}/api/reports/products/reasons`, {
    validateStatus: () => true,
  });
  if (res.status === 200 && Array.isArray(res.data)) {
    return res.data;
  }
  return null;
}

/**
 * GET /api/reports/products/check?productId= (CUSTOMER + cookie).
 * Respuesta oficial: { hasReport, reportId }.
 * Devuelve `true`/`false` o `null` si el body no coincide (fallback sessionStorage).
 */
export async function fetchPendingProductReport(productId) {
  const base = getApiBase() || "http://localhost:3000";
  const res = await axios.get(`${base}/api/reports/products/check`, {
    params: { productId },
    withCredentials: true,
    validateStatus: () => true,
  });

  if (res.status === 200 && typeof res.data?.hasReport === "boolean") {
    return res.data.hasReport;
  }
  return null;
}

/**
 * POST /api/reports/products (CUSTOMER + cookie).
 * Body: { productId, reason, description? } — `reason` = valor del enum (ej. DEFECTIVE).
 */
export async function submitProductReport({ productId, reason, description }) {
  const base = getApiBase() || "http://localhost:3000";
  return axios.post(
    `${base}/api/reports/products`,
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
