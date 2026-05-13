//createProductApi.js
import axios from "axios";
import {
  CREATE_PRODUCT_DEFAULT_LIMITS,
  CREATE_PRODUCT_ENDPOINT_PATHS,
} from "./createProductEndpoints";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

export const apiClient = axios.create({
  baseURL: API_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});

const buildParams = (params) => {
  const cleaned = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  });

  return cleaned;
};

const parseArrayResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
};

const normalizeId = (item, fallbacks = []) => {
  const keys = ["id", ...fallbacks];

  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null && item?.[key] !== "") {
      return item[key];
    }
  }

  return undefined;
};

const normalizeProductCategory = (category) => ({
  ...category,
  id: category?.id ?? null,
  name: category?.name ?? "",
});

const normalizeProductTag = (tag) => ({
  ...tag,
  id: normalizeId(tag, ["id_product_tag"]),
  name: tag?.name ?? "",
});

const getFriendlyBackendMessage = (message, status) => {
  const normalizedMessage = String(message || "").toLowerCase();

  if (
    status === 401 ||
    normalizedMessage.includes("token") ||
    normalizedMessage.includes("sesion") ||
    normalizedMessage.includes("session") ||
    normalizedMessage.includes("autentic")
  ) {
    return "Necesitas iniciar sesion para publicar un producto.";
  }

  return message;
};

export const fetchCurrentSessionUser = async () => {
  const response = await apiClient.get(CREATE_PRODUCT_ENDPOINT_PATHS.session);
  const sessionUser = response.data?.user ?? response.data?.data?.user ?? null;

  if (!sessionUser?.id_user) {
    throw new Error("Necesitas iniciar sesion para publicar un producto.");
  }

  return sessionUser;
};

export const fetchProductCategories = async ({
  search = "",
  limit = CREATE_PRODUCT_DEFAULT_LIMITS.categories,
} = {}) => {
  const response = await apiClient.get(CREATE_PRODUCT_ENDPOINT_PATHS.categories, {
    params: buildParams({ search, limit }),
  });

  return parseArrayResponse(response.data)
    .map(normalizeProductCategory)
    .filter(
      (category) =>
        category.id !== undefined &&
        category.id !== null &&
        Boolean(category.name)
    );
};

export const fetchProductTags = async ({
  search = "",
  limit = CREATE_PRODUCT_DEFAULT_LIMITS.tags,
} = {}) => {
  const response = await apiClient.get(CREATE_PRODUCT_ENDPOINT_PATHS.tags, {
    params: buildParams({ search, limit }),
  });

  return parseArrayResponse(response.data)
    .map(normalizeProductTag)
    .filter(
      (tag) =>
        tag.id !== undefined &&
        tag.id !== null &&
        Boolean(tag.name)
    );
};

const ensureAuthenticatedUser = async (sessionUser) => {
  const currentSessionUser = await fetchCurrentSessionUser();

  if (sessionUser?.id_user && currentSessionUser.id_user !== sessionUser.id_user) {
    return currentSessionUser;
  }

  return currentSessionUser;
};

export const createProduct = async ({ payload, sessionUser }) => {
  await ensureAuthenticatedUser(sessionUser);

  const response = await apiClient.post(
    CREATE_PRODUCT_ENDPOINT_PATHS.products,
    payload
  );

  return response.data;
};

export const getBackendErrorMessage = (error, fallbackMessage) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string") return data;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
    if (typeof data?.detail === "string") return data.detail;

    const backendMessage = data?.message || data?.error || data?.detail;
    if (backendMessage) {
      return getFriendlyBackendMessage(backendMessage, error.response?.status);
    }

    if (error.response?.status === 400) {
      return "Datos invalidos. Revisa los campos requeridos del producto.";
    }
    if (error.response?.status === 401) {
      return "Necesitas iniciar sesion para publicar un producto.";
    }
    if (error.response?.status === 403) {
      return "No tienes permisos para crear productos con esta cuenta.";
    }
    if (error.response?.status === 404) {
      return "No se encontro el comercio o alguna referencia del producto.";
    }
    if (error.response?.status === 409) {
      return "Ya existe un producto con los datos enviados.";
    }
    if (error.response?.status === 500) {
      return "Error interno del servidor.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

// ─── Imagen del producto ──────────────────────────────────────────────────────

/**
 * Sube la imagen de un producto recién creado.
 * Se llama después del POST /products con el id que devuelve el backend.
 * POST /products/:id/image
 */
export const uploadProductImage = async (productId, file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await apiClient.post(`/products/${productId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data; // { image_url: "https://..." }
};