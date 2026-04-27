import apiClient from "../../../lib/apiClient";
import { getSession, fetchUserProfile, updateUserProfile } from "../../commerces/services/editUserProfileApi";

export const getCurrentUserForDeliveryForm = async () => {
  const session = await getSession();
  const userId = session?.user?.id_user;

  if (!userId) {
    throw new Error("No hay sesión activa.");
  }

  const profileResponse = await fetchUserProfile(userId);
  return {
    userId,
    sessionUser: session.user,
    profile: profileResponse?.data ?? null,
  };
};

/**
 * @param {number} userId
 * @param {Object} payload - Datos del formulario (usuario + cobertura)
 * @param {string} payload.name
 * @param {string} payload.email
 * @param {string} payload.phone
 * @param {string} payload.vehicle - descripción resumida para la tabla delivery
 * @param {string|undefined} payload.documentId
 * @param {string} payload.city
 * @param {string} payload.region
 * @param {string} payload.addressReference
 * @param {number} payload.coverageRadiusKm
 * @param {string|undefined} payload.availabilityNotes
 * @param {number} payload.baseLatitude
 * @param {number} payload.baseLongitude
 */
export const becomeDelivery = async (userId, payload) => {
  await updateUserProfile(userId, {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
  });

  const registerBody = {
    fk_user: userId,
    role: "DELIVERY",
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    vehicle: payload.vehicle,
    // Valores de negocio / sistema: se calculan en backend; el front solo fija iniciales coherentes
    total_deliveries: 0,
    reviews_count: 0,
    average_rating: 0,
    delivery_status: "AVAILABLE",
    // Metadatos de cobertura (el backend puede persistirlos o ignorarlos según DTOs actuales)
    document_id: payload.documentId,
    coverage_city: payload.city,
    coverage_region: payload.region,
    coverage_address_reference: payload.addressReference,
    coverage_radius_km: payload.coverageRadiusKm,
    base_latitude: payload.baseLatitude,
    base_longitude: payload.baseLongitude,
    availability_notes: payload.availabilityNotes,
  };

  try {
    const { data } = await apiClient.post("/api/deliveries/register", registerBody);
    return { data, usedFallback: false };
  } catch (error) {
    const status = Number(error?.response?.status);
    if (status !== 404) {
      throw error;
    }

    const fallback = await apiClient.put(`/api/users/${userId}`, {
      role: "DELIVERY",
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
    });

    return { data: fallback.data, usedFallback: true };
  }
};
