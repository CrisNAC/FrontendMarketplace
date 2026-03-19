import { useState, useEffect, useCallback } from "react";
import axios from "axios";

/**
 * Instancia de axios con configuración base.
 */
const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3000").trim() + "/api/users",
    withCredentials: true,
});

/**
 * Hook para gestionar las direcciones personales del usuario autenticado.
 * Requiere que el userId del usuario autenticado esté disponible.
 *
 * Endpoints:
 *   GET    /api/users/:id/addresses
 *   POST   /api/users/:id/addresses
 *   PUT    /api/users/:id/addresses/:id_address
 *   DELETE /api/users/:id/addresses/:id_address
 */
export const useAddresses = (userId) => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAddresses = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/${userId}/addresses`);
            setAddresses(data.data);
        } catch (err) {
            setError(err.response?.data?.message || "Error al obtener direcciones");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const createAddress = async (payload) => {
        if (!userId) throw new Error("Usuario no autenticado");

        try {
            const { data } = await api.post(`/${userId}/addresses`, payload);
            setAddresses((prev) => [data.data, ...prev]);
            return data.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || "Error al crear dirección");
        }
    };

    const updateAddress = async (addressId, payload) => {
        if (!userId) throw new Error("Usuario no autenticado");

        try {
            const { data } = await api.put(`/${userId}/addresses/${addressId}`, payload);
            setAddresses((prev) =>
                prev.map((a) => (a.id_address === addressId ? data.data : a))
            );
            return data.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || "Error al actualizar dirección");
        }
    };

    const deleteAddress = async (addressId) => {
        if (!userId) throw new Error("Usuario no autenticado");

        try {
            const { data } = await api.delete(`/${userId}/addresses/${addressId}`);
            setAddresses((prev) => prev.filter((a) => a.id_address !== addressId));
            return data.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || "Error al eliminar dirección");
        }
    };

    return {
        addresses,
        loading,
        error,
        refetch: fetchAddresses,
        createAddress,
        updateAddress,
        deleteAddress,
    };
};