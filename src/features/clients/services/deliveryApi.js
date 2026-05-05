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
    profile: profileResponse ?? null,
  };
};

export const getDeliveryProfile = async (deliveryId) => {
  const { data } = await apiClient.get(`/api/deliveries/${deliveryId}`);
  return data;
};

/** Valores que espera POST /api/deliveries/register (Zod en backend). */
const UI_VEHICLE_TO_API = {
  BICICLETA: "BICYCLE",
  MOTOCICLETA: "MOTORCYCLE",
  AUTOMOVIL: "CAR",
  A_PIE: "ON_FOOT",
};

/**
 * Registra al usuario autenticado como delivery.
 * El backend solo acepta { vehicleType }; el teléfono se guarda después con PUT perfil.
 *
 * @param {string} uiVehicleType - BICICLETA | MOTOCICLETA | AUTOMOVIL | A_PIE
 * @param {string} [phone] - Teléfono a persistir en el perfil (mismo formato que edición de usuario)
 */
export const becomeDelivery = async (uiVehicleType, phone) => {
  const vehicleType = UI_VEHICLE_TO_API[uiVehicleType];
  if (!vehicleType) {
    throw new Error("Tipo de vehículo no válido.");
  }

  const { data } = await apiClient.post("/api/deliveries/register", { vehicleType });

  const session = await getSession();
  const uid = session?.user?.id_user;
  const trimmed = typeof phone === "string" ? phone.trim() : "";
  if (uid && trimmed) {
    await updateUserProfile(uid, { phone: trimmed });
  }

  return data;
};
