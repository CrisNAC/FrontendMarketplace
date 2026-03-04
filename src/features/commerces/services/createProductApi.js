import axios from "axios";
import {
  CREATE_PRODUCT_DEFAULT_LIMITS,
  CREATE_PRODUCT_ENDPOINT_PATHS,
} from "./createProductEndpoints";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();
const SELLER_USER_ID = (import.meta.env.VITE_SELLER_USER_ID || "").trim();

const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
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

const parseArrayResponse = (data) => (Array.isArray(data) ? data : []);

export const resolveSellerUserId = () => {
  const localStorageUserId =
    typeof window !== "undefined"
      ? window.localStorage.getItem("seller_user_id")
      : "";

  return (SELLER_USER_ID || localStorageUserId || "").trim();
};

export const fetchProductCategories = async ({
  search = "",
  limit = CREATE_PRODUCT_DEFAULT_LIMITS.categories,
} = {}) => {
  const response = await apiClient.get(CREATE_PRODUCT_ENDPOINT_PATHS.categories, {
    params: buildParams({ search, limit }),
  });

  return parseArrayResponse(response.data);
};

export const fetchProductTags = async ({
  search = "",
  limit = CREATE_PRODUCT_DEFAULT_LIMITS.tags,
} = {}) => {
  const response = await apiClient.get(CREATE_PRODUCT_ENDPOINT_PATHS.tags, {
    params: buildParams({ search, limit }),
  });

  return parseArrayResponse(response.data);
};

export const createProduct = async ({ payload, userId }) => {
  const sellerId = (userId || resolveSellerUserId()).trim();

  if (!sellerId) {
    throw new Error(
      "Falta x-user-id. Configura VITE_SELLER_USER_ID o localStorage.seller_user_id."
    );
  }

  const response = await apiClient.post(CREATE_PRODUCT_ENDPOINT_PATHS.products, payload, {
    headers: {
      "x-user-id": sellerId,
    },
  });

  return response.data;
};

export const getBackendErrorMessage = (error, fallbackMessage) => {
  if (axios.isAxiosError(error)) {
    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail;

    if (backendMessage) {
      return backendMessage;
    }

    if (error.response?.status === 400) {
      return "Datos invalidos. Revisa campos requeridos, categoria y tags.";
    }

    if (error.response?.status === 401) {
      return "Falta x-user-id para crear el producto.";
    }

    if (error.response?.status === 403) {
      return "El usuario no tiene permisos de vendedor.";
    }

    if (error.response?.status === 404) {
      return "Vendedor o comercio no activo.";
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
