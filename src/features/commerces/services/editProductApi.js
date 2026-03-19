// src/features/commerces/services/editProductApi.js
import axios from "axios";
import {
    EDIT_PRODUCT_DEFAULT_LIMITS,
    EDIT_PRODUCT_ENDPOINT_PATHS,
} from "./editProductEndpoints";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

// Usa cookie JWT igual que el resto del proyecto (withCredentials: true)
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

const parseArrayResponse = (data) => (Array.isArray(data) ? data : []);

// ─── Servicios exportados ─────────────────────────────────────────────────────

/**
 * Obtiene los datos de un producto por su ID.
 * GET /products/:id_product
 */
export const fetchProductById = async (productId) => {
    const response = await apiClient.get(
        EDIT_PRODUCT_ENDPOINT_PATHS.productById(productId)
    );
    return response.data;
};

/**
 * Obtiene las categorías de productos disponibles.
 * GET /products/categories
 */
export const fetchProductCategories = async ({
    search = "",
    limit = EDIT_PRODUCT_DEFAULT_LIMITS.categories,
} = {}) => {
    const response = await apiClient.get(
        EDIT_PRODUCT_ENDPOINT_PATHS.categories,
        { params: buildParams({ search, limit }) }
    );
    return parseArrayResponse(response.data);
};

/**
 * Obtiene los tags disponibles.
 * GET /products/tags
 */
export const fetchProductTags = async ({
    search = "",
    limit = EDIT_PRODUCT_DEFAULT_LIMITS.tags,
} = {}) => {
    const response = await apiClient.get(
        EDIT_PRODUCT_ENDPOINT_PATHS.tags,
        { params: buildParams({ search, limit }) }
    );
    return parseArrayResponse(response.data);
};

/**
 * Actualiza un producto existente.
 * PUT /products/:id_product
 * La autenticación se hace via cookie JWT (withCredentials: true).
 */
export const updateProduct = async ({ productId, payload }) => {
    const response = await apiClient.put(
        EDIT_PRODUCT_ENDPOINT_PATHS.productById(productId),
        payload
    );
    return response.data;
};

/**
 * Extrae el mensaje de error del backend de forma legible.
 */
export const getBackendErrorMessage = (error, fallbackMessage) => {
    if (axios.isAxiosError(error)) {
        const backendMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.response?.data?.detail;

        if (backendMessage) return backendMessage;
        if (error.response?.status === 400) return "Datos inválidos. Revisá los campos requeridos.";
        if (error.response?.status === 401) return "Sesión inválida o expirada. Iniciá sesión nuevamente.";
        if (error.response?.status === 403) return "No tenés permiso para editar este producto.";
        if (error.response?.status === 404) return "Producto no encontrado.";
        if (error.response?.status === 500) return "Error interno del servidor.";
    }

    if (error instanceof Error && error.message) return error.message;
    return fallbackMessage;
};