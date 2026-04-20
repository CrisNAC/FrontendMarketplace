// src/features/commerces/services/categoryRequestApi.js
import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

export const apiClient = axios.create({
  baseURL: API_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});

/**
 * Envía una solicitud de nueva categoría al administrador.
 * POST /api/commerces/category-requests
 *
 * @param {{ name: string, description?: string }} payload
 * @returns {Promise<{ message: string, data: object }>}
 */
export const submitCategoryRequest = async (payload) => {
  const response = await apiClient.post("/api/commerces/category-requests", {
    name: payload.name
    // Nota: el backend actual solo acepta "name", description no está implementada
  });
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

    if (error.response?.status === 400) return "Datos inválidos. Completá el nombre de la categoría.";
    if (error.response?.status === 401) return "Necesitas iniciar sesión para solicitar una categoría.";
    if (error.response?.status === 403) return "Solo los comercios pueden solicitar nuevas categorías.";
    if (error.response?.status === 409) return "Ya existe esa categoría o una solicitud pendiente con ese nombre.";
    if (error.response?.status === 500) return "Error interno del servidor.";
  }

  if (error instanceof Error && error.message) return error.message;
  return fallbackMessage;
};