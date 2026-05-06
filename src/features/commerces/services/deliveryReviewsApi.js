import axios from "axios";

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3000").trim(),
  withCredentials: true,
});

export const getStoreDeliveryReviews = async (storeId, deliveryId, filters = {}) => {
  const params = {};

  if (filters.search) params.search = filters.search;
  if (filters.minRating) params.minRating = filters.minRating;
  if (filters.maxRating) params.maxRating = filters.maxRating;

  const res = await apiClient.get(
    `/api/stores/${storeId}/deliveries/${deliveryId}/reviews`,
    { params }
  );

  return res.data;
};

export const getDeliveryReviewsErrorMessage = (
  error,
  fallback = "No se pudieron cargar las reseñas del repartidor."
) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      fallback
    );
  }

  return error?.message || fallback;
};
