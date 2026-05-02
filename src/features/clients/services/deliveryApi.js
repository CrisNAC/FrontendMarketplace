import apiClient from "../../../lib/apiClient";
import { getSession, fetchUserProfile } from "../../commerces/services/editUserProfileApi";

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

/** Valores que espera POST /api/deliveries/register (Zod en backend). */
const UI_VEHICLE_TO_API = {
  BICICLETA: "BICYCLE",
  MOTOCICLETA: "MOTORCYCLE",
  AUTOMOVIL: "CAR",
  A_PIE: "ON_FOOT",
};

/**
 * Registra al usuario autenticado como delivery.
 * El backend solo acepta { vehicleType: CAR | MOTORCYCLE | BICYCLE | ON_FOOT }; la identidad sale de la cookie JWT.
 *
 * @param {string} uiVehicleType - BICICLETA | MOTOCICLETA | AUTOMOVIL | A_PIE
 */
export const becomeDelivery = async (uiVehicleType) => {
  const vehicleType = UI_VEHICLE_TO_API[uiVehicleType];
  if (!vehicleType) {
    throw new Error("Tipo de vehículo no válido.");
  }

  const { data } = await apiClient.post("/api/deliveries/register", { vehicleType });
  return data;
};
