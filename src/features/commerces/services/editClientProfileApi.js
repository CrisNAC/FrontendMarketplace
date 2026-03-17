import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").trim();

const apiClient = axios.create({
    baseURL: API_BASE_URL || undefined,
    withCredentials: true
});




//funcion para loguear automaticamente un usuario de prueba para probar el frontend de editClientProfile.js
export const loginTestUser = async () => {

    const response = await apiClient.post( //hace una peticion post al endpoint /api/session usando el cliente axios configurado
        "/api/session", // Endpoint de login del backend
        {
            email: "jorgitorez@gmail.com",
            password: "buenas12345"
        }
    );
    return response.data; // retorna solamente los datos de la respuesta

};


//maneja expiración de sesión
//si el back devuelve 401, intenta reloguear y repetir la request
apiClient.interceptors.response.use(

    response => response,

    async error => {

        if(
            error.response?.status === 401 &&
            !error.config._retry
        ){

            try{

                error.config._retry = true;

                // hace login automatico para obtener un nuevo jwt valido
                await loginTestUser();

                // repetir request original
                return apiClient(error.config);

            }catch(loginError){
                //si el relogin falla, devuelve error para que lo maneje el frontend
                return Promise.reject(loginError);

            }

        }

        return Promise.reject(error);

    }

);


// get perfil usuario
export const fetchUserProfile = async (userId) => {

    const response = await apiClient.get(
        `/api/users/${userId}`
    );

    return response.data;

};


// put actualizar usuario
export const updateUserProfile = async (userId,payload) => {

    const response = await apiClient.put(

        `/api/users/${userId}`,
        payload

    );

    return response.data;

};


// put actualizar dirección
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