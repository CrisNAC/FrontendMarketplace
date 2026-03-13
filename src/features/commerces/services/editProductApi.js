import axios from "axios";
import {
    EDIT_PRODUCT_DEFAULT_LIMITS,
    EDIT_PRODUCT_ENDPOINT_PATHS,
} from "./editProductEndpoints";

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

const MOCK_TAGS = [
    { id: 1, name: "ergonómica" },
    { id: 2, name: "oficina" },
    { id: 3, name: "silla" },
    { id: 4, name: "trabajo" },
    { id: 5, name: "nuevo" },
    { id: 6, name: "oferta" },
    { id: 7, name: "importado" },
    { id: 8, name: "premium" },
];

// Producto de ejemplo — simula la respuesta de GET /products/:id
const MOCK_PRODUCTS = {
    1: {
        id: 1,
        name: "Silla Ergonómica Oficina",
        description:
            "Silla ergonómica de oficina con soporte lumbar ajustable, reposabrazos acolchados y base giratoria de 360°. Perfecta para largas jornadas de trabajo.",
        price: 89990,
        categoryId: 9,
        quantity: 15,
        imageUrl: "https://admin.consumer.com.py/storage/products/216.jpg",
        visible: true,
        tags: [
            { id: 1, name: "ergonómica" },
            { id: 2, name: "oficina" },
            { id: 3, name: "silla" },
            { id: 4, name: "trabajo" },
        ],
    },
};

// Simulación de delay de red
const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

// ─── API client ───────────────────────────────────────────────────────────────
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

// ─── Servicios exportados ─────────────────────────────────────────────────────

/**
 * Obtiene los datos de un producto por su ID.
 * Al integrar con BE: solo cambiar USE_MOCK a false.
 */
export const fetchProductById = async (productId) => {
    if (USE_MOCK) {
        await delay();
        const product = MOCK_PRODUCTS[productId];
        if (!product) throw new Error(`Producto con id ${productId} no encontrado.`);
        return product;
    }

    const response = await apiClient.get(
        EDIT_PRODUCT_ENDPOINT_PATHS.productById(productId)
    );
    return response.data;
};

/**
 * Obtiene las categorías disponibles.
 * Reutiliza el mismo mock que createProductApi para consistencia.
 */
export const fetchProductCategories = async ({
    search = "",
    limit = EDIT_PRODUCT_DEFAULT_LIMITS.categories,
} = {}) => {
    if (USE_MOCK) {
        await delay(300);
        return MOCK_CATEGORIES;
    }

    const response = await apiClient.get(
        EDIT_PRODUCT_ENDPOINT_PATHS.categories,
        { params: buildParams({ search, limit }) }
    );
    return parseArrayResponse(response.data);
};

/**
 * Obtiene los tags disponibles.
 */
export const fetchProductTags = async ({
    search = "",
    limit = EDIT_PRODUCT_DEFAULT_LIMITS.tags,
} = {}) => {
    if (USE_MOCK) {
        await delay(300);
        return MOCK_TAGS;
    }

    const response = await apiClient.get(
        EDIT_PRODUCT_ENDPOINT_PATHS.tags,
        { params: buildParams({ search, limit }) }
    );
    return parseArrayResponse(response.data);
};

/**
 * Actualiza un producto existente via PUT /products/:id.
 * @param {number|string} productId
 * @param {object} payload - Datos actualizados del producto
 */
export const updateProduct = async ({ productId, payload, userId }) => {
    if (USE_MOCK) {
        await delay(800);
        // Simula respuesta exitosa del backend
        return { ...MOCK_PRODUCTS[productId], ...payload, id: productId };
    }

    const sellerId = (userId || resolveSellerUserId()).trim();
    if (!sellerId) {
        throw new Error(
            "Falta x-user-id. Configura VITE_SELLER_USER_ID o localStorage.seller_user_id."
        );
    }

    const response = await apiClient.put(
        EDIT_PRODUCT_ENDPOINT_PATHS.productById(productId),
        payload,
        { headers: { "x-user-id": sellerId } }
    );
    return response.data;
};

/**
 * Extrae el mensaje de error del backend de forma legible.
 * Reutiliza la misma lógica que createProductApi.
 */
export const getBackendErrorMessage = (error, fallbackMessage) => {
    if (axios.isAxiosError(error)) {
        const backendMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.response?.data?.detail;

        if (backendMessage) return backendMessage;
        if (error.response?.status === 400) return "Datos inválidos. Revisá los campos requeridos.";
        if (error.response?.status === 401) return "Falta x-user-id para editar el producto.";
        if (error.response?.status === 403) return "No tenés permiso para editar este producto.";
        if (error.response?.status === 404) return "Producto no encontrado.";
        if (error.response?.status === 500) return "Error interno del servidor.";
    }

    if (error instanceof Error && error.message) return error.message;
    return fallbackMessage;
};