import { useEffect, useState } from "react";
import { z } from "zod";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { becomeDelivery, getCurrentUserForDeliveryForm } from "../services/deliveryApi";
import { getBackendErrorMessage } from "../../commerces/services/editUserProfileApi";

const vehicleSchema = z.object({
  vehicleType: z.enum(["BICICLETA", "MOTOCICLETA", "AUTOMOVIL", "A_PIE"]),
});

const VEHICLE_TYPE_LABELS = {
  BICICLETA: "Bicicleta",
  MOTOCICLETA: "Motocicleta / scooter",
  AUTOMOVIL: "Automóvil",
  A_PIE: "A pie",
};

function resolveProfileUser(profile, sessionUser) {
  const raw = profile?.id_user != null ? profile : profile?.data ?? null;
  return {
    name: raw?.name ?? sessionUser?.name ?? "",
    email: raw?.email ?? sessionUser?.email ?? "",
    phone: raw?.phone ?? sessionUser?.phone ?? "",
    role: raw?.role ?? sessionUser?.role,
  };
}

/**
 * Modal mínimo: solo tipo de vehículo y confirmar.
 * Nombre, correo y teléfono se toman del usuario ya registrado (perfil / sesión).
 */
export function BecomeDeliveryModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [isAlreadyDelivery, setIsAlreadyDelivery] = useState(false);
  const [vehicleType, setVehicleType] = useState("MOTOCICLETA");

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setLoading(true);
    setError("");

    const load = async () => {
      try {
        const { userId: uid, sessionUser: su, profile } = await getCurrentUserForDeliveryForm();
        if (!mounted) return;
        setUserId(uid);
        setSessionUser(su);
        const resolved = resolveProfileUser(profile, su);
        setProfileUser(resolved);
        setIsAlreadyDelivery(resolved.role === "DELIVERY" || su?.role === "DELIVERY");
      } catch (err) {
        if (!mounted) return;
        setError(getBackendErrorMessage(err, "No se pudo cargar tu sesión."));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setError("");
      setVehicleType("MOTOCICLETA");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = vehicleSchema.safeParse({ vehicleType });
    if (!parsed.success) {
      setError("Elegí un tipo de vehículo.");
      return;
    }

    if (!userId || !profileUser) {
      setError("No hay sesión activa. Iniciá sesión para continuar.");
      return;
    }

    if (isAlreadyDelivery) {
      onClose?.();
      return;
    }

    const { name, email, phone } = profileUser;
    if (!name?.trim() || !email?.trim()) {
      setError("Completá nombre y correo en tu perfil antes de registrarte como delivery.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await becomeDelivery(parsed.data.vehicleType);
      window.dispatchEvent(new Event("deliveryRegistered"));
      toast.success("Listo: ahora sos delivery.");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(getBackendErrorMessage(err, "No se pudo completar el registro como delivery."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="become-delivery-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
        <button
          type="button"
          onClick={() => !saving && onClose?.()}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="p-6 pt-10">
          <h2 id="become-delivery-title" className="text-xl font-bold text-[#2d4030] pr-8">
            Quiero ser delivery
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Usamos los datos de tu cuenta (nombre, correo y teléfono). Solo indicá con qué vas a repartir.
          </p>

          {loading && <p className="mt-6 text-sm text-gray-600">Cargando…</p>}

          {!loading && (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de vehículo</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  disabled={saving || isAlreadyDelivery}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                >
                  {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {profileUser && (
                <p className="text-xs text-gray-500">
                  Cuenta: <span className="font-medium text-gray-700">{profileUser.email}</span>
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={() => !saving && onClose?.()}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || loading || isAlreadyDelivery}
                  className="rounded-lg bg-[#5B7B6D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4f6f61] disabled:opacity-60"
                >
                  {saving ? "Confirmando…" : isAlreadyDelivery ? "Ya sos delivery" : "Confirmar"}
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BecomeDeliveryModal;
