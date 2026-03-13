import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

const apiClient = axios.create({
    baseURL: API_BASE_URL || undefined,
    withCredentials: true
});

// login test
export const loginTestUser = async () => {

    const response = await apiClient.post(
        "/api/session",
        {
            email: "jorgitorez@gmail.com",
            password: "buenas12345"
        }
    );

    return response.data;

};


// INTERCEPTOR (maneja expiración de sesión)
apiClient.interceptors.response.use(

    response => response,

    async error => {

        if(
            error.response?.status === 401 &&
            !error.config._retry
        ){

            try{

                error.config._retry = true;

                // relogin automático
                await loginTestUser();

                // repetir request original
                return apiClient(error.config);

            }catch(loginError){

                return Promise.reject(loginError);

            }

        }

        return Promise.reject(error);

    }

);


// GET perfil usuario
export const fetchUserProfile = async (userId) => {

    const response = await apiClient.get(
        `/api/users/${userId}`
    );

    return response.data;

};


// PUT actualizar usuario
export const updateUserProfile = async (userId,payload) => {

    const response = await apiClient.put(

        `/api/users/${userId}`,
        payload

    );

    return response.data;

};


// PUT actualizar dirección
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


// Manejo de errores backend
export const getBackendErrorMessage = (

    error,
    fallback

) => {

    if(axios.isAxiosError(error)){

        return (

            error.response?.data?.message ||
            error.response?.data?.error ||
            fallback

        );

    }

    return fallback;

};