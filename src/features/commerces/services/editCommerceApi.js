import axios from "axios";
import { EDIT_COMMERCE_ENDPOINT_PATHS } from "./editCommerceEndpoints";

// ─── Cambiar a false cuando el backend esté listo ───────────────────────────
const USE_MOCK = true;

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_CATEGORIES = [
    { id: 1, name: "Tecnología" },
    { id: 2, name: "Moda" },
    { id: 3, name: "Coleccionables y Arte" },
    { id: 4, name: "Hogar y Jardín" },
    { id: 5, name: "Salud y Belleza" },
    { id: 6, name: "Entretenimiento" },
    { id: 7, name: "Deportes" },
    { id: 8, name: "Equipo Industrial" },
    { id: 9, name: "Muebles" },
];

// Comercio de ejemplo — simula la respuesta de GET /commerces/:id
const MOCK_COMMERCES = {
    1: {
        id: 1,
        name: "Mi Tienda Online",
        email: "contacto@mitienda.com",
        phone: "+595981234567",
        address: "Calle Principal 123",
        city: "Encarnación",
        region: "Itapúa",
        postalCode: "16000",
        description: "Tienda online con productos de calidad para todos.",
        categoryId: 1,
        logoUrl: "",
    },
};

// Simulación de delay de red
const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

// ─── API client ───────────────────────────────────────────────────────────────
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

const apiClient = axios.create({
    baseURL: API_BASE_URL || undefined,
});

// ─── Servicios exportados ─────────────────────────────────────────────────────

/**
 * Obtiene los datos de un comercio por su ID.
 * Al integrar con BE: solo cambiar USE_MOCK a false.
 */
export const fetchCommerceById = async (commerceId) => {
    if (USE_MOCK) {
        await delay();
        const commerce = MOCK_COMMERCES[commerceId];
        if (!commerce) throw new Error(`Comercio con id ${commerceId} no encontrado.`);
        return commerce;
    }

    const response = await apiClient.get(
        EDIT_COMMERCE_ENDPOINT_PATHS.commerceById(commerceId)
    );
    return response.data;
};

/**
 * Obtiene las categorías disponibles para el comercio.
 */
export const fetchCommerceCategories = async () => {
    if (USE_MOCK) {
        await delay(300);
        return MOCK_CATEGORIES;
    }

    const response = await apiClient.get(EDIT_COMMERCE_ENDPOINT_PATHS.categories);
    return Array.isArray(response.data) ? response.data : [];
};

/**
 * Actualiza un comercio existente via PUT /commerces/:id.
 * @param {number|string} commerceId
 * @param {object} payload - Datos actualizados del comercio
 */
export const updateCommerce = async ({ commerceId, payload }) => {
    if (USE_MOCK) {
        await delay(800);
        // Simula respuesta exitosa del backend
        return { ...MOCK_COMMERCES[commerceId], ...payload, id: commerceId };
    }

    const response = await apiClient.put(
        EDIT_COMMERCE_ENDPOINT_PATHS.commerceById(commerceId),
        payload
    );
    return response.data;
};

/**
 * Extrae el mensaje de error del backend de forma legible.
 * Sigue la misma lógica que editProductApi para consistencia.
 */
export const getBackendErrorMessage = (error, fallbackMessage) => {
    if (axios.isAxiosError(error)) {
        const backendMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.response?.data?.detail;

        if (backendMessage) return backendMessage;
        if (error.response?.status === 400) return "Datos inválidos. Revisá los campos requeridos.";
        if (error.response?.status === 401) return "No estás autenticado.";
        if (error.response?.status === 403) return "No tenés permiso para editar este comercio.";
        if (error.response?.status === 404) return "Comercio no encontrado.";
        if (error.response?.status === 500) return "Error interno del servidor.";
    }

    if (error instanceof Error && error.message) return error.message;
    return fallbackMessage;
};