const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");

const ENDPOINT_PATHS = {
    commerces: "/commerces",
    commerceById: (id) => `/commerces/${id}`,
    categories: "/store-categories",
};

export const EDIT_COMMERCE_ENDPOINT_PATHS = ENDPOINT_PATHS;

export const EDIT_COMMERCE_ENDPOINT_LINKS = {
    commerces: API_BASE_URL
        ? `${API_BASE_URL}${ENDPOINT_PATHS.commerces}`
        : ENDPOINT_PATHS.commerces,
    categories: API_BASE_URL
        ? `${API_BASE_URL}${ENDPOINT_PATHS.categories}`
        : ENDPOINT_PATHS.categories,
};