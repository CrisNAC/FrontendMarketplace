import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

const apiClient = axios.create({
    baseURL: API_BASE_URL || undefined,
    withCredentials: true
});

export const getProductReviews = async (id) => {
    const response = await apiClient.get(`/products/reviews/${id}`);
    return response.data;
};