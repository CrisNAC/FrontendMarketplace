import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

const apiClient = axios.create({
    baseURL: API_BASE_URL || undefined,
    withCredentials: true
});

export const getProductById = async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
};