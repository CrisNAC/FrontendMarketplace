// Mocked service — replace with real API calls once the BannerRequests migration runs.
// Data is persisted in localStorage under the key below so state survives page reloads.
const STORAGE_KEY = "mock_banner_requests";

const delay = (ms = 350) => new Promise((res) => setTimeout(res, ms));

const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
};

const writeAll = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const uid = () => `br_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ── Commerce side ────────────────────────────────────────────────────────────

export const getMyBannerRequests = async (storeId) => {
  await delay();
  return readAll()
    .filter((r) => r.storeId === storeId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const createBannerRequest = async (storeId, storeName, payload) => {
  await delay();
  const request = {
    id: uid(),
    storeId,
    storeName,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    reviewedAt: null,
    rejectionReason: null,
    ...payload,
  };
  writeAll([...readAll(), request]);
  return request;
};

export const cancelBannerRequest = async (storeId, requestId) => {
  await delay();
  const all = readAll();
  const target = all.find((r) => r.id === requestId && r.storeId === storeId);
  if (!target) throw new Error("Solicitud no encontrada");
  if (target.status !== "PENDING") throw new Error("Solo se pueden cancelar solicitudes pendientes");
  writeAll(all.filter((r) => r.id !== requestId));
};

// ── Admin side ───────────────────────────────────────────────────────────────

export const getAllBannerRequests = async () => {
  await delay();
  return readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const reviewBannerRequest = async (requestId, { status, rejectionReason }) => {
  await delay();
  const all = readAll();
  const idx = all.findIndex((r) => r.id === requestId);
  if (idx === -1) throw new Error("Solicitud no encontrada");
  all[idx] = {
    ...all[idx],
    status,
    rejectionReason: rejectionReason ?? null,
    reviewedAt: new Date().toISOString(),
  };
  writeAll(all);
  return all[idx];
};
