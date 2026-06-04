import axios from "axios";

export function getApiBase() {
  return (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
}

/**
 * POST /api/users/:customerId/cart/items
 * Body: { productId, quantity? }
 * Requiere cookie userToken (withCredentials).
 */
export async function addToCartApi(userId, { productId, quantity = 1 }) {
  const base = getApiBase() || "http://localhost:3000";
  const res = await axios.post(
    `${base}/api/users/${userId}/cart/items`,
    { productId, quantity },
    { withCredentials: true }
  );
  return res.data;
}

/**
 * GET /api/users/:customerId/carts
 * Devuelve { carts: [...] } con ítems y precios desde el servidor.
 */
export async function fetchCartsApi(userId) {
  const base = getApiBase() || "http://localhost:3000";
  const res = await axios.get(`${base}/api/users/${userId}/carts`, {
    withCredentials: true,
  });
  return res.data?.carts ?? [];
}

/**
 * DELETE /api/users/cart/items/:cartItemId
 * Elimina un item del carrito (borrado lógico).
 */
export async function removeCartItemApi(cartItemId) {
  const base = getApiBase() || "http://localhost:3000";
  const res = await axios.delete(`${base}/api/users/cart/items/${cartItemId}`, {
    withCredentials: true,
  });
  return res.data;
}

/**
 * PUT /api/users/cart/items/:cartItemId
 * Body: { quantity }
 * Actualiza la cantidad de un item del carrito.
 */
export async function updateCartItemQuantityApi(cartItemId, quantity) {
  const base = getApiBase() || "http://localhost:3000";
  const res = await axios.put(
    `${base}/api/users/cart/items/${cartItemId}`,
    { quantity },
    { withCredentials: true }
  );
  return res.data;
}
