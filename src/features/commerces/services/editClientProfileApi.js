import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

const apiClient = axios.create({
    baseURL: API_BASE_URL || undefined,
    withCredentials:true
});

export const fetchUserProfile = async (userId) => {

    const response = await apiClient.get(`/api/users/${userId}`);

    return response.data;

};

export const updateUserProfile = async (userId,payload) => {

    const response = await apiClient.put(
        `/api/users/${userId}`,
        payload
    );

    return response.data;

};

export const updateUserAddress = async (
    userId,
    addressId,
    payload
) => {

    const response = await apiClient.put(
        `/api/users/${userId}/addresses/${addressId}`,
        payload
    );

    return response.data;

};

export const getBackendErrorMessage = (error,fallback) => {

    if(axios.isAxiosError(error)){

        return (
            error.response?.data?.message ||
            error.response?.data?.error ||
            fallback
        );

    }

    return fallback;

};