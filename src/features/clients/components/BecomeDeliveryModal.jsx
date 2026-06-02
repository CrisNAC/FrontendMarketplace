import { useEffect, useState } from "react";
import { z } from "zod";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { becomeDelivery, getCurrentUserForDeliveryForm } from "../services/deliveryApi";
import {
  getBackendErrorMessage,
  DELIVERY_PHONE_MESSAGE,
  DELIVERY_PHONE_REGEX,
} from "../../commerces/services/editUserProfileApi";

const formSchema = z.object({
  vehicleType: z.enum(["BICICLETA", "MOTOCICLETA", "AUTOMOVIL", "A_PIE"]),
  phone: z
    .string()
    .trim()
    .regex(DELIVERY_PHONE_REGEX, DELIVERY_PHONE_MESSAGE),
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
 * Modal: tipo de vehículo. Nombre y correo siguen en la cuenta.
 */
export function BecomeDeliveryModal({ open, onClose, onSuccess, showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [userId, setUserId] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [isAlreadyDelivery, setIsAlreadyDelivery] = useState(false);
  const [vehicleType, setVehicleType] = useState("MOTOCICLETA");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setLoading(true);
    setError("");
    setFieldErrors({});

    const load = async () => {
      try {
        const { userId: uid, sessionUser: su, profile } = await getCurrentUserForDeliveryForm();
        if (!mounted) return;
        setUserId(uid);
        const resolved = resolveProfileUser(profile, su);
        setProfileUser(resolved);
        setPhone((resolved.phone ?? "").replace(/\D/g, "").slice(0, 10));
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
      setFieldErrors({});
      setVehicleType("MOTOCICLETA");
      setPhone("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsed = formSchema.safeParse({ vehicleType, phone });
    if (!parsed.success) {
      const next = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key && !next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      setError("Revisá los datos del formulario.");
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

    const { name, email } = profileUser;
    if (!name?.trim() || !email?.trim()) {
      setError("Completá nombre y correo en tu perfil antes de registrarte como delivery.");
      return;
    }

    if (!parsed.data.phone) {
      setError("El teléfono es obligatorio.");
      return;
    }

    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      await becomeDelivery(parsed.data.vehicleType, parsed.data.phone);
      window.dispatchEvent(new Event("deliveryRegistered"));
      await getCurrentUserForDeliveryForm();
      showToast?.("Listo: ahora sos delivery.", "success");
      if (onSuccess) {
        onSuccess();
      } else {
        onClose?.();
      }
    } catch (err) {
      setError(getBackendErrorMessage(err, "No se pudo completar el registro como delivery."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="become-delivery-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200/90 bg-white shadow-[0_25px_50px_-12px_rgba(47,91,72,0.18)]">
        <button
          type="button"
          onClick={() => !saving && onClose?.()}
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="p-6 pt-10">
          <h2 id="become-delivery-title" className="text-xl font-bold text-[#2d4030] pr-8 tracking-tight">
            Quiero ser delivery
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Indicá tu <strong>teléfono</strong> (10 dígitos, sin +) y el <strong>tipo de vehículo</strong>.
            El nombre y el correo son los de tu cuenta.
          </p>

          {loading && <p className="mt-6 text-sm text-slate-600">Cargando…</p>}

          {!loading && (
            <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="become-delivery-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Teléfono (WhatsApp)
                </label>
                <input
                  id="become-delivery-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                    setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                    setError("");
                  }}
                  disabled={saving || isAlreadyDelivery}
                  placeholder="09xxxxxxxx"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#769482]/45 focus:bg-white focus:ring-2 focus:ring-[#769482]/18 disabled:opacity-60"
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="delivery-vehicle" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tipo de vehículo
                </label>
                <select
                  id="delivery-vehicle"
                  value={vehicleType}
                  onChange={(e) => {
                    setVehicleType(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, vehicleType: undefined }));
                    setError("");
                  }}
                  disabled={saving || isAlreadyDelivery}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#769482]/45 focus:bg-white focus:ring-2 focus:ring-[#769482]/18 disabled:opacity-60"
                >
                  {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {fieldErrors.vehicleType && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.vehicleType}</p>
                )}
              </div>

              {profileUser?.email && (
                <p className="text-xs text-slate-500 rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">
                  Cuenta:{" "}
                  <span className="font-medium text-slate-700">{profileUser.email}</span>
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
                <button
                  type="button"
                  onClick={() => !saving && onClose?.()}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || loading || isAlreadyDelivery}
                  className="rounded-xl bg-[#5B7B6D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#5B7B6D]/25 hover:bg-[#4f6f61] disabled:opacity-60 transition-colors"
                >
                  {saving ? "Confirmando…" : isAlreadyDelivery ? "Ya sos delivery" : "Confirmar"}
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BecomeDeliveryModal;