const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");

const ENDPOINT_PATHS = {
  categories: "/products/categories",
  tags: "/products/tags",
  products: "/products",
};

export const CREATE_PRODUCT_ENDPOINT_PATHS = ENDPOINT_PATHS;

// Links centralizados para debug/cambios de entorno.
export const CREATE_PRODUCT_ENDPOINT_LINKS = {
  categories: API_BASE_URL
    ? `${API_BASE_URL}${ENDPOINT_PATHS.categories}`
    : ENDPOINT_PATHS.categories,
  tags: API_BASE_URL
    ? `${API_BASE_URL}${ENDPOINT_PATHS.tags}`
    : ENDPOINT_PATHS.tags,
  products: API_BASE_URL
    ? `${API_BASE_URL}${ENDPOINT_PATHS.products}`
    : ENDPOINT_PATHS.products,
};

export const CREATE_PRODUCT_DEFAULT_LIMITS = {
  categories: 100,
  tags: 100,
};
