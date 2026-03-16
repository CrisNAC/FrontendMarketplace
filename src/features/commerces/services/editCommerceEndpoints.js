// src/features/commerces/services/editCommerceEndpoints.js

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");

const ENDPOINT_PATHS = {
    // GET  /api/commerces/:id_store  → datos completos del comercio (sin auth)
    // PUT  /api/commerces/:id_store  → actualizar comercio (requiere cookie userToken)
    commerceById: (id) => `/api/commerces/${id}`,

    // GET  /api/commerces/categories  → listado de rubros de comercio (sin auth)
    // Registrado ANTES de /api/commerces en index.js, no hay conflicto de rutas.
    categories: "/api/commerces/categories",
};

export const EDIT_COMMERCE_ENDPOINT_PATHS = ENDPOINT_PATHS;

export const EDIT_COMMERCE_ENDPOINT_LINKS = {
    categories: API_BASE_URL
        ? `${API_BASE_URL}${ENDPOINT_PATHS.categories}`
        : ENDPOINT_PATHS.categories,
};