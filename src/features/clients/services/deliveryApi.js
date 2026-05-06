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
 * Registra al usuario autenticado como delivery; el teléfono se guarda en el perfil con PUT.
 *
 * @param {string} uiVehicleType - BICICLETA | MOTOCICLETA | AUTOMOVIL | A_PIE
 * @param {string} [phone] - Número a guardar en Users.phone
 */
export const becomeDelivery = async (uiVehicleType, phone) => {
  const vehicleType = UI_VEHICLE_TO_API[uiVehicleType];
  if (!vehicleType) {
    throw new Error("Tipo de vehículo no válido.");
  }

  const { data } = await apiClient.post("/api/deliveries/register", { vehicleType });

  const trimmed = typeof phone === "string" ? phone.trim() : "";
  if (trimmed) {
    try {
      const session = await getSession();
      const uid = session?.user?.id_user;
      if (uid) {
        await updateUserProfile(uid, { phone: trimmed });
      }
    } catch (err) {
      // El alta como delivery ya fue exitosa; no invalidar el flujo si falla sesión o guardado de teléfono.
      console.warn("[becomeDelivery] No se pudo actualizar el teléfono en el perfil:", err);
    }
  }

  return data;
};

export const UI_VEHICLE_LABELS = {
    CAR:        "Automóvil",
    MOTORCYCLE: "Motocicleta / scooter",
    BICYCLE:    "Bicicleta",
    ON_FOOT:    "A pie",
};

export const updateMyDelivery = async (deliveryId, { name, phone, vehicleType }, avatarFile) => {
    const form = new FormData();
    if (name)        form.append("name", name);
    if (phone)       form.append("phone", phone);
    if (vehicleType) form.append("vehicleType", vehicleType);
    if (avatarFile)  form.append("avatarUrl", avatarFile);
    const { data } = await apiClient.put(`/api/deliveries/${deliveryId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
};
export const updateDeliveryStatus = async (deliveryId, newStatus) => {
  try {
    const response = await apiClient.patch(`/api/deliveries/${deliveryId}/status`, {
      delivery_status: newStatus
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};