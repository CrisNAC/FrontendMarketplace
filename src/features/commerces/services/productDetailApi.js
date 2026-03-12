import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getProductById = async (id) => {

const response = await axios.get(`${API_BASE_URL}/products/${id}`);

return response.data;

};