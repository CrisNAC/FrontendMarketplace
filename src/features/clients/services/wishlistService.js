import apiClient from '@/lib';

const base = (userId) => `/api/users/${userId}/wishlists`;

export const getWishlists = (userId) =>
  apiClient.get(base(userId)).then((r) => r.data);

export const createWishlist = (userId, name) =>
  apiClient.post(base(userId), { name }).then((r) => r.data);

export const deleteWishlist = (userId, wishlistId) =>
  apiClient.delete(`${base(userId)}/${wishlistId}`).then((r) => r.data);

export const getWishlistItems = (userId, wishlistId) =>
  apiClient.get(`${base(userId)}/${wishlistId}/items`).then((r) => r.data);

export const addWishlistItem = (userId, wishlistId, productId, quantity = 1) =>
  apiClient.post(`${base(userId)}/${wishlistId}/items`, { productId, quantity }).then((r) => r.data);

export const updateWishlistItem = (userId, wishlistId, productId, quantity) =>
  apiClient.put(`${base(userId)}/${wishlistId}/items/${productId}`, { quantity }).then((r) => r.data);

export const removeWishlistItem = (userId, wishlistId, productId) =>
  apiClient.delete(`${base(userId)}/${wishlistId}/items/${productId}`).then((r) => r.data);