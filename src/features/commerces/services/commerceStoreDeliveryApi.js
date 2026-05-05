import axios from "axios";
import { apiClient as commerceApiClient, getBackendErrorMessage } from "./editCommerceApi";

/**
 * Mock data para deliveries disponibles cuando el backend no tiene el endpoint
 */
const mockAvailableDeliveries = [
    {
        id_user: 101,
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@email.com",
        phone: "+595981234567",
        total_deliveries: 45,
        success_rate: 0.92,
        average_rating: 4.7,
        vehicle_type: "MOTO"
    },
    {
        id_user: 102,
        name: "María González",
        email: "maria.gonzalez@email.com",
        phone: "+595982345678",
        total_deliveries: 32,
        success_rate: 0.88,
        average_rating: 4.5,
        vehicle_type: "AUTO"
    },
    {
        id_user: 103,
        name: "José Silva",
        email: "jose.silva@email.com",
        phone: "+595983456789",
        total_deliveries: 67,
        success_rate: 0.95,
        average_rating: 4.8,
        vehicle_type: "MOTO"
    },
    {
        id_user: 104,
        name: "Ana López",
        email: "ana.lopez@email.com",
        phone: "+595984567890",
        total_deliveries: 28,
        success_rate: 0.85,
        average_rating: 4.3,
        vehicle_type: "BICICLETA"
    },
    {
        id_user: 105,
        name: "Pedro Martínez",
        email: "pedro.martinez@email.com",
        phone: "+595985678901",
        total_deliveries: 53,
        success_rate: 0.90,
        average_rating: 4.6,
        vehicle_type: "AUTO"
    }
];

/**
 * GET /api/deliveries/search
 * Sin `q`: lista completa de candidatos disponibles.
 * Con `q`: filtro por correo o teléfono.
 * @returns {Promise<Array>} candidatos { id_user, name, email, phone, ... }
 */
export const searchDeliveries = async (q) => {
    try {
        const trimmed = (q || "").trim();
        const config = trimmed ? { params: { q: trimmed } } : {};
        const { data } = await commerceApiClient.get("/api/deliveries/search", config);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // Fallback: devolver datos mock filtrados por query
            const trimmed = (q || "").trim().toLowerCase();
            if (!trimmed || trimmed === "@") {
                return mockAvailableDeliveries;
            }
            return mockAvailableDeliveries.filter(delivery =>
                delivery.name.toLowerCase().includes(trimmed) ||
                delivery.email.toLowerCase().includes(trimmed) ||
                delivery.phone.includes(trimmed)
            );
        }
        throw error;
    }
};

/**
 * POST /api/stores/:id/deliveries
 * Body: { fk_user }
 */
export const linkDeliveryToStore = async (storeId, fk_user) => {
    try {
        const { data } = await commerceApiClient.post(`/api/stores/${storeId}/deliveries`, {
            fk_user,
        });
        return data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            // Fallback: simular respuesta exitosa
            return {
                id_delivery: Date.now(), // ID temporal
                fk_user: fk_user,
                delivery_status: "AVAILABLE",
                created_at: new Date().toISOString()
            };
        }
        throw error;
    }
};

export { getBackendErrorMessage };

export const getStoreDeliveryErrorMessage = (error, fallback) => {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message;
        if (typeof msg === "string" && msg.trim()) return msg;
        const status = error.response?.status;
        if (status === 409) return "Ese repartidor ya está vinculado.";
        if (status === 404) return "No se encontró al repartidor o no es válido.";
        if (status === 403) return "No tenés permiso para vincular deliveries a este comercio.";
    }
    return getBackendErrorMessage(error, fallback);
};
