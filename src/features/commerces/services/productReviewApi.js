import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getProductReviews = async (id) => {

const response = await axios.get(
`${API_BASE_URL}/product-reviews/${id}`
);

return response.data;

};