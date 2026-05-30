import { apiClient } from "./editCommerceApi";

export const fetchStoreDashboard = async (storeId) => {
    const { data } = await apiClient.get(`/api/commerces/${storeId}/dashboard`);
    return data;
};