import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import Navbar from "../../../components/navbar/Navbar";
import MapView from "../components/Map.jsx";
import { becomeDelivery, getCurrentUserForDeliveryForm } from "../services/deliveryApi";
import { getBackendErrorMessage } from "../../commerces/services/editUserProfileApi";

const DEFAULT_MAP_CENTER = [-27.334, -55.8655];

const vehicleTypeEnum = z.enum(["BICICLETA", "MOTOCICLETA", "AUTOMOVIL", "A_PIE", "OTRO"]);

const deliveryFormSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
    email: z
      .string()
      .trim()
      .min(1, "El correo es obligatorio")
      .email("Formato de correo inválido")
      .max(100, "Máximo 100 caracteres"),
    phone: z
      .string()
      .trim()
      .min(7, "El teléfono debe tener al menos 7 caracteres")
      .max(20, "Máximo 20 caracteres"),
    documentId: z
      .string()
      .max(20, "Máximo 20 caracteres")
      .refine((s) => s.trim() === "" || s.trim().length >= 5, {
        message: "Si completás el documento, usá al menos 5 caracteres",
      }),
    vehicleType: vehicleTypeEnum,
    vehicleDetails: z.string().max(120, "Máximo 120 caracteres"),
    city: z.string().trim().min(2, "Indicá la ciudad").max(100, "Máximo 100 caracteres"),
    region: z.string().trim().min(2, "Indicá barrio o zona").max(100, "Máximo 100 caracteres"),
    addressReference: z
      .string()
      .trim()
      .min(3, "Agregá una referencia (calle, manzana, etc.)")
      .max(200, "Máximo 200 caracteres"),
    coverageRadiusKm: z.coerce
      .number()
      .refine((n) => [2, 5, 8, 12, 20].includes(n), { message: "Elegí un radio de cobertura" }),
    availabilityNotes: z.string().max(500, "Máximo 500 caracteres"),
    mapLat: z.number().min(-90).max(90),
    mapLng: z.number().min(-180).max(180),
  })
  .superRefine((data, ctx) => {
    if (data.vehicleType === "OTRO" && (data.vehicleDetails?.length ?? 0) < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["vehicleDetails"],
        message: "Describí tu vehículo o medio de transporte",
      });
    }
  });

const VEHICLE_TYPE_LABELS = {
  BICICLETA: "Bicicleta",
  MOTOCICLETA: "Motocicleta / scooter",
  AUTOMOVIL: "Automóvil",
  A_PIE: "A pie",
  OTRO: "Otro (especificar)",
};

function buildVehicleForApi(vehicleType, vehicleDetails) {
  const base = VEHICLE_TYPE_LABELS[vehicleType] ?? vehicleType;
  if (vehicleType === "OTRO" && vehicleDetails?.trim()) {
    return `Otro: ${vehicleDetails.trim()}`.slice(0, 120);
  }
  return base.slice(0, 120);
}

export const BecomeDeliveryPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState(null);
  const [isAlreadyDelivery, setIsAlreadyDelivery] = useState(false);
  const [mapMountKey, setMapMountKey] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    documentId: "",
    vehicleType: "MOTOCICLETA",
    vehicleDetails: "",
    city: "",
    region: "",
    addressReference: "",
    coverageRadiusKm: 5,
    availabilityNotes: "",
    mapLat: null,
    mapLng: null,
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const { userId: currentUserId, sessionUser, profile } = await getCurrentUserForDeliveryForm();
        if (!mounted) return;

        setUserId(currentUserId);
        setIsAlreadyDelivery((sessionUser?.role || profile?.role) === "DELIVERY");
        setForm((prev) => ({
          ...prev,
          name: profile?.name || sessionUser?.name || "",
          email: profile?.email || sessionUser?.email || "",
          phone: profile?.phone || "",
        }));
      } catch (err) {
        if (!mounted) return;
        setError(getBackendErrorMessage(err, "No se pudo cargar la sesión de usuario."));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const isReadOnly = useMemo(() => saving || loading || isAlreadyDelivery, [saving, loading, isAlreadyDelivery]);

  const handleChange = (event) => {
    const { name, value, type } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" || name === "coverageRadiusKm" ? Number(value) : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setError("");
    setSuccess("");
  };

  const handleMapPoint = (point) => {
    if (!point) return;
    setForm((prev) => ({
      ...prev,
      mapLat: point.lat,
      mapLng: point.lng,
    }));
    setFieldErrors((prev) => ({ ...prev, map: undefined }));
    setError("");
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no permite obtener la ubicación.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((prev) => ({
          ...prev,
          mapLat: latitude,
          mapLng: longitude,
        }));
        setMapMountKey((k) => k + 1);
        setError("");
        setFieldErrors((prev) => ({ ...prev, map: undefined }));
      },
      () => {
        setError("No se pudo obtener tu ubicación. Podés marcar un punto haciendo clic en el mapa.");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 0 }
    );
  };

  const clearMapPoint = () => {
    setForm((prev) => ({ ...prev, mapLat: null, mapLng: null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
      setError("No hay sesión activa. Iniciá sesión para continuar.");
      return;
    }

    if (form.mapLat == null || form.mapLng == null) {
      setFieldErrors((prev) => ({ ...prev, map: "Marcá en el mapa el punto base de tu zona (o usá “Mi ubicación”)" }));
      setError("Falta marcar en el mapa dónde vas a operar.");
      return;
    }

    const parsed = deliveryFormSchema.safeParse({
      ...form,
      mapLat: form.mapLat,
      mapLng: form.mapLng,
    });
    if (!parsed.success) {
      const nextErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      setError("Revisá los campos marcados.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const { vehicle, ...restPayload } = {
      ...parsed.data,
      vehicle: buildVehicleForApi(parsed.data.vehicleType, parsed.data.vehicleDetails),
    };

    try {
      const result = await becomeDelivery(userId, {
        name: restPayload.name,
        email: restPayload.email,
        phone: restPayload.phone,
        vehicle,
        documentId: restPayload.documentId?.trim() || undefined,
        city: restPayload.city,
        region: restPayload.region,
        addressReference: restPayload.addressReference,
        coverageRadiusKm: restPayload.coverageRadiusKm,
        availabilityNotes: restPayload.availabilityNotes?.trim() || undefined,
        baseLatitude: restPayload.mapLat,
        baseLongitude: restPayload.mapLng,
      });
      if (result.usedFallback) {
        setSuccess("Tu perfil fue actualizado. El backend aún no expone el alta de delivery; avisá al equipo de API.");
      } else {
        setSuccess("Ahora sos delivery. Tu registro y zona quedaron guardados.");
        setIsAlreadyDelivery(true);
      }
    } catch (err) {
      setError(getBackendErrorMessage(err, "No se pudo completar el alta como delivery."));
    } finally {
      setSaving(false);
    }
  };

  const mapInitialCenter = useMemo(() => {
    if (form.mapLat != null && form.mapLng != null) {
      return [form.mapLat, form.mapLng];
    }
    return DEFAULT_MAP_CENTER;
  }, [form.mapLat, form.mapLng]);

  const mapSelected = form.mapLat != null && form.mapLng != null ? { lat: form.mapLat, lng: form.mapLng } : null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-[#2d4030]">Quiero ser delivery</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            Completá tu información de contacto, el medio con el que vas a repartir y la zona donde podés entregar. El
            mapa es para señalar el <strong>punto de referencia</strong> (base o barrio) de tu cobertura, no hace falta
            poner un domicilio exacto.
          </p>

          {loading && <p className="mt-6 text-gray-700">Cargando datos...</p>}

          {!loading && (
            <form className="mt-8 space-y-10" onSubmit={handleSubmit}>
              <section>
                <h2 className="text-lg font-semibold text-[#2d4030] border-b border-gray-200 pb-2">Datos personales</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                    {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CI / DNI / Documento</label>
                    <input
                      name="documentId"
                      value={form.documentId}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      placeholder="Opcional"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                    {fieldErrors.documentId && <p className="text-xs text-red-600 mt-1">{fieldErrors.documentId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                    {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (WhatsApp) *</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                    {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#2d4030] border-b border-gray-200 pb-2">Vehículo o medio de movilidad</h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                    <select
                      name="vehicleType"
                      value={form.vehicleType}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2"
                    >
                      {Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.vehicleType && <p className="text-xs text-red-600 mt-1">{fieldErrors.vehicleType}</p>}
                  </div>
                  {form.vehicleType === "OTRO" && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (marca, modelo, etc.) *</label>
                      <input
                        name="vehicleDetails"
                        value={form.vehicleDetails}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                      {fieldErrors.vehicleDetails && (
                        <p className="text-xs text-red-600 mt-1">{fieldErrors.vehicleDetails}</p>
                      )}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#2d4030] border-b border-gray-200 pb-2">Zona de reparto</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Esto ayuda a mostrarte pedidos cerca tuyo. Completá ciudad y barrio, y hacé clic en el mapa en el
                  <strong> centro aproximado</strong> de la zona en la que aceptarías entregar.
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      placeholder="Ej. Posadas"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                    {fieldErrors.city && <p className="text-xs text-red-600 mt-1">{fieldErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Barrio o zona *</label>
                    <input
                      name="region"
                      value={form.region}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      placeholder="Ej. Centro, Itaembé…"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                    {fieldErrors.region && <p className="text-xs text-red-600 mt-1">{fieldErrors.region}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referencia de calle o punto cerca *</label>
                    <input
                      name="addressReference"
                      value={form.addressReference}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      placeholder="Ej. cerca de Plaza San Martín, a 2 cuadras de…"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                    {fieldErrors.addressReference && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.addressReference}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Radio aproximado de cobertura *</label>
                    <select
                      name="coverageRadiusKm"
                      value={form.coverageRadiusKm}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option value={2}>2 km</option>
                      <option value={5}>5 km</option>
                      <option value={8}>8 km</option>
                      <option value={12}>12 km</option>
                      <option value={20}>20 km</option>
                    </select>
                    {fieldErrors.coverageRadiusKm && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.coverageRadiusKm}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={isReadOnly}
                    className="text-sm font-medium text-[#2d4030] border border-[#5B7B6D] rounded-md px-3 py-1.5 hover:bg-[#f0f2f1] disabled:opacity-50"
                  >
                    Usar mi ubicación en el mapa
                  </button>
                  {mapSelected && (
                    <button
                      type="button"
                      onClick={clearMapPoint}
                      disabled={isReadOnly}
                      className="text-sm text-gray-600 hover:underline disabled:opacity-50"
                    >
                      Quitar punto
                    </button>
                  )}
                </div>
                {form.mapLat != null && form.mapLng != null && (
                  <p className="text-xs text-gray-500 mt-2">
                    Punto: {form.mapLat.toFixed(5)}, {form.mapLng.toFixed(5)} — radio elegido: {form.coverageRadiusKm} km
                  </p>
                )}
                {fieldErrors.map && <p className="text-sm text-red-600 mt-2">{fieldErrors.map}</p>}

                <div className="mt-3 rounded-xl overflow-hidden border border-gray-200" style={{ minHeight: 320 }}>
                  <MapView
                    key={mapMountKey}
                    mode="single-point"
                    heightClass="h-[min(50vh,420px)]"
                    initialCenter={mapInitialCenter}
                    initialZoom={form.mapLat != null ? 15 : 12}
                    selectedPoint={mapSelected}
                    onPointChange={handleMapPoint}
                    allowFullscreen
                    showDistancePanel={false}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Hacé clic en el mapa para colocar o mover el marcador.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#2d4030] border-b border-gray-200 pb-2">Disponibilidad</h2>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horarios o días en los que preferís recibir ofertas (opcional)
                  </label>
                  <textarea
                    name="availabilityNotes"
                    value={form.availabilityNotes}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    rows={3}
                    placeholder="Ej. Lunes a sábado, 9 a 18 hs; no domingos"
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                  />
                  {fieldErrors.availabilityNotes && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.availabilityNotes}</p>
                  )}
                </div>
              </section>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isReadOnly}
                  className="w-full sm:w-auto bg-[#5B7B6D] text-white px-5 py-2.5 rounded-md hover:bg-[#4f6f61] disabled:opacity-60"
                >
                  {saving ? "Enviando..." : isAlreadyDelivery ? "Ya registrado como delivery" : "Enviar solicitud"}
                </button>
              </div>
            </form>
          )}

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BecomeDeliveryPage;
