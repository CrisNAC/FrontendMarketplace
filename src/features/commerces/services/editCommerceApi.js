// src/features/commerces/services/editCommerceApi.js
import axios from "axios";
import { EDIT_COMMERCE_ENDPOINT_PATHS } from "./editCommerceEndpoints";

// ─── Axios client ─────────────────────────────────────────────────────────────
// withCredentials: true es OBLIGATORIO para que el browser envíe automáticamente
// la cookie httpOnly "userToken" que el middleware authenticate() del backend lee.
// Sin esto, el PUT a /api/commerces/:id devuelve 401.
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

export const apiClient = axios.create({
    // Usa VITE_API_URL si está definido; si no, cae en el puerto por defecto del backend.
    // Igual que CommerceCreationForm que usa fetch("http://localhost:3000/...") directo.
    baseURL: API_BASE_URL || "http://localhost:3000",
    withCredentials: true, // ← envía la cookie userToken en cada petición
});

// ─── fetchCommerceById ────────────────────────────────────────────────────────
/**
 * GET /api/commerces/:id_store  (sin autenticación)
 *
 * El backend devuelve el objeto completo del comercio con la forma:
 * {
 *   id_store, fk_user,
 *   name, email, phone, description, logo,
 *   website_url, instagram_url, tiktok_url,
 *   status, created_at, updated_at,
 *   user: { id_user, name, email, role, status },
 *   categories: [{ id, name, status }],
 *   store_category: { id_store_category, name },
 *   products: [...],
 *   addresses: [{ id_address, address, city, region, postal_code, ... }]
 * }
 *
 * addresses viene ordenado por created_at ASC → [0] es la dirección principal.
 */
export const fetchCommerceById = async (commerceId) => {
    const response = await apiClient.get(
        EDIT_COMMERCE_ENDPOINT_PATHS.commerceById(commerceId)
    );
    return response.data;
};

// ─── fetchCommerceCategories ──────────────────────────────────────────────────
/**
 * GET /api/commerces/categories  (sin autenticación)
 *
 * Devuelve: [{ id, name, status, createdAt, updatedAt }]
 * (el service mapea id_store_category → id)
 */
export const fetchCommerceCategories = async () => {
    const response = await apiClient.get(EDIT_COMMERCE_ENDPOINT_PATHS.categories);
    return Array.isArray(response.data) ? response.data : [];
};

// ─── updateCommerce ───────────────────────────────────────────────────────────
/**
 * PUT /api/commerces/:id_store  (requiere cookie userToken)
 *
 * El backend verifica que req.user.id_user === store.fk_user.
 * Si no coincide → 403 "No tiene permisos para editar este comercio".
 *
 * Campos que acepta el body (todos opcionales, el backend actualiza solo los enviados):
 *   name            String  max 100   (requerido si se envía)
 *   email           String  max 100   (requerido si se envía, único)
 *   phone           String  max 20    (requerido si se envía)
 *   description     String? Text
 *   logo            String? max 500   (URL de imagen)
 *   website_url     String? max 500
 *   instagram_url   String? max 500
 *   tiktok_url      String? max 500
 *   category_ids    Int[]          (IDs de los rubros, validados en BD)
 *   address         String            (dirección principal del comercio)
 *   city            String  max 100
 *   region          String  max 100   (OBLIGATORIO si se envía)
 *   postal_code     String? max 20
 *
 * Respuesta exitosa 200:
 *   { success: true, message: "Comercio actualizado exitosamente", data: { ...store } }
 *
 * Errores posibles:
 *   400 → campo inválido / sin cambios enviados
 *   401 → no autenticado (cookie expirada o ausente)
 *   403 → el usuario autenticado no es dueño del comercio
 *   404 → comercio no encontrado / sin dirección registrada
 *   409 → email ya registrado por otro comercio
 */
export const updateCommerce = async ({ commerceId, payload }) => {
    const response = await apiClient.put(
        EDIT_COMMERCE_ENDPOINT_PATHS.commerceById(commerceId),
        payload
    );
    return response.data; // { success, message, data }
};

// ─── getBackendErrorMessage ───────────────────────────────────────────────────
/**
 * Extrae el mensaje legible de un error de axios siguiendo el mismo patrón
 * que createProductApi.js del proyecto.
 */
export const getBackendErrorMessage = (error, fallbackMessage) => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (typeof data === "string") return data;
        if (typeof data?.message === "string") return data.message;
        if (typeof data?.error === "string") return data.error;
        if (typeof data?.detail === "string") return data.detail;

        switch (error.response?.status) {
            case 400: return "Datos inválidos. Revisá los campos requeridos.";
            case 401: return "No estás autenticado. Iniciá sesión nuevamente.";
            case 403: return "No tenés permiso para editar este comercio.";
            case 404: return "Comercio no encontrado.";
            case 409: return "El email ingresado ya está registrado por otro comercio.";
            case 500: return "Error interno del servidor.";
            default: break;
        }
    }

    if (error instanceof Error && error.message) return error.message;
    return fallbackMessage;
};

// ─── updateStoreStatus ────────────────────────────────────────────────────────
/**
 * PATCH /api/commerces/:id_store/status  (requiere cookie userToken)
 *
 * Habilita o deshabilita el comercio. Al deshabilitar, los productos se ocultan.
 * Body: { store_status: "ACTIVE" | "INACTIVE" }
 */
export const updateStoreStatus = async (commerceId, store_status) => {
    const response = await apiClient.patch(
        `/api/commerces/${commerceId}/status`,
        { store_status }
    );
    return response.data; // { success, message, data }
};

// Misma respuesta que GET público; el backend solo expone GET /api/commerces/:id (no existe /my/:id).
export const fetchMyCommerce = async (commerceId) => {
    const response = await apiClient.get(`/api/commerces/${commerceId}`);
    return response.data;
};

// ─── Imagen del comercio (logo) ───────────────────────────────────────────────

/**
 * GET logo actual del comercio.
 * GET /stores/:id/image
 * Devuelve: { logo: "https://..." | null }
 */
export const getStoreImage = async (storeId) => {
    const response = await apiClient.get(`/stores/${storeId}/image`);
    return response.data; // { logo: "https://..." | null }
};

/**
 * Sube o reemplaza el logo del comercio (upsert).
 * POST /stores/:id/image
 */
export const uploadStoreImage = async (storeId, file) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post(`/stores/${storeId}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // { logo: "https://..." }
};

/**
 * Elimina el logo del comercio.
 * DELETE /stores/:id/image
 */
export const deleteStoreImage = async (storeId) => {
    const response = await apiClient.delete(`/stores/${storeId}/image`);
    return response.data;
};