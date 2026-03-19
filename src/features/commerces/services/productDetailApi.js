import axios from "axios";

const apiClient = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3000").trim(),
    withCredentials: true
});

export const getProductById = async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
};