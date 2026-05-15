import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { X, ChevronDown } from "lucide-react"
import { z } from "zod"
import { Spinner } from "../../../components/Spinner"
import MapView from "./Map"

// ─── Esquema de validación ──────────────────────────────────────────────────
const commerceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100, "El nombre no puede superar 100 caracteres"),
  email: z.string().email("Ingresá un correo válido"),
  phone: z.string().regex(/^\+595\d{9}$/, "El teléfono debe tener el formato +595XXXXXXXXX"),
  address: z.string().min(1, "La dirección es obligatoria"),
  description: z.string().min(1, "La descripción es obligatoria"),
  categoryIds: z.array(z.number()).min(1, "Debes seleccionar al menos una categoría"),
  latitude: z.number().nullable().refine((val) => val !== null, { message: "Selecciona un punto en el mapa" }),
  longitude: z.number().nullable().refine((val) => val !== null, { message: "Selecciona un punto en el mapa" }),
  basePrice: z.coerce.number().min(0, "El precio base debe ser mayor o igual a 0"),
  distancePrice: z.coerce.number().min(0, "El precio de distancia debe ser mayor o igual a 0"),
  websiteUrl: z.string().refine((val) => {
    const trimmed = val.trim();
    return !trimmed || /^https?:\/\//.test(trimmed);
  }, "El sitio web debe iniciar con http:// o https://"),
  instagramUrl: z.string().refine((val) => {
    const trimmed = val.trim();
    return !trimmed || /^https?:\/\//.test(trimmed);
  }, "Instagram debe iniciar con http:// o https://"),
  tiktokUrl: z.string().refine((val) => {
    const trimmed = val.trim();
    return !trimmed || /^https?:\/\//.test(trimmed);
  }, "TikTok debe iniciar con http:// o https://"),
});

// Componente para mostrar categoría como chip
const CategoryChip = ({ name, onRemove, disabled }) => (
    <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2">
        {name}
        {!disabled && (
            <button
                type="button"
                onClick={onRemove}
                className="text-purple-700 hover:text-purple-900 font-bold"
                aria-label={`Remover ${name}`}
            >
                ×
            </button>
        )}
    </span>
)

const MAX_CATEGORIES = 3;

// Componente para selector de categorías con chips + dropdown
const CategorySelector = ({ categories, selectedIds, onChange, disabled, error }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const selectedCategories = categories.filter((c) =>
        selectedIds.includes(c.id)
    )

    const handleToggle = (categoryId) => {
        const isSelected = selectedIds.includes(categoryId)
        if (!isSelected && selectedIds.length >= MAX_CATEGORIES) return
        const newIds = isSelected
            ? selectedIds.filter((id) => id !== categoryId)
            : [...selectedIds, categoryId]
        onChange(newIds)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Chips de categorías seleccionadas */}
            <div className="mb-2 min-h-8 flex flex-wrap items-center gap-1">
                {selectedCategories.length > 0 ? (
                    selectedCategories.map((cat) => (
                        <CategoryChip
                            key={cat.id}
                            name={cat.name}
                            disabled={disabled}
                            onRemove={() =>
                                handleToggle(cat.id)
                            }
                        />
                    ))
                ) : (
                    <span className="text-sm text-gray-400">
                        Sin categorías seleccionadas
                    </span>
                )}
            </div>

            {/* Botón dropdown */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full px-3 py-2 border rounded-md bg-white text-left flex items-center justify-between ${
                    error ? "border-red-300 bg-red-50" : "border-green-100 bg-green-50/30"
                } ${disabled ? "cursor-not-allowed opacity-60" : "hover:border-green-300"}`}
            >
                <span className={selectedCategories.length === 0 ? "text-gray-400" : "text-gray-700"}>
                    {selectedCategories.length === 0
                        ? "Selecciona categorías"
                        : `${selectedCategories.length} seleccionada${selectedCategories.length > 1 ? "s" : ""}`}
                </span>
                <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown con checkboxes */}
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-64 overflow-y-auto">
                    {categories.map((cat) => {
                        const catId = cat.id
                        const isSelected = selectedIds.includes(catId)
                        return (
                            <label
                                key={catId}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={!isSelected && selectedIds.length >= MAX_CATEGORIES}
                                    onChange={() => handleToggle(catId)}
                                    className="w-4 h-4 mr-2 shrink-0 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-40"
                                />
                                <span className="ml-1 text-sm text-gray-700">{cat.name}</span>
                            </label>
                        )
                    })}
                </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
                Podés seleccionar hasta {MAX_CATEGORIES} categorías.
                {selectedIds.length >= MAX_CATEGORIES && (
                    <span className="ml-1 font-semibold text-amber-600">Límite alcanzado.</span>
                )}
            </p>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    )
}

const inputCls = "w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D] focus:border-[#5B7B6D] disabled:cursor-not-allowed disabled:opacity-60"
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").trim()
const HTTP_URL_REGEX = /^https?:\/\//i

export const CommerceCreationForm = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [fieldErrors, setFieldErrors] = useState({})
    const errorRef = useRef(null)

    // ── ID del usuario logueado (obtenido de la sesión) ───────────────────────
    const [userId, setUserId] = useState(null)

    // ── Categorías de comercio cargadas desde el backend ─────────────────────
    const [categories, setCategories] = useState([])

    // archivo de logo seleccionado localmente (se sube después de crear el comercio)
    const [logoFile, setLogoFile] = useState(null)
    const [logoPreview, setLogoPreview] = useState(null)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        latitude: null,
        longitude: null,
        categoryIds: [],
        description: "",
        websiteUrl: "",
        instagramUrl: "",
        tiktokUrl: "",
        basePrice: "",
        distancePrice: "",
    })

    // ── Cargar userId y categorías al montar ──────────────────────────────────
    useEffect(() => {
        // 1. Obtener usuario autenticado desde la cookie JWT
        fetch(`${API_BASE_URL}/api/session/user-session`, {
            credentials: "include"  // necesario para enviar la cookie userToken
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setUserId(data.user.id_user)
                } else {
                    setError("No se pudo verificar la sesión. Iniciá sesión nuevamente.")
                }
            })
            .catch(() => setError("No se pudo conectar con el servidor."))

        // 2. Cargar categorías de comercio
        fetch(`${API_BASE_URL}/api/commerces/categories`, {
            credentials: "include"
        })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setCategories(data)
            })
            .catch(() => console.warn("No se pudieron cargar las categorías."))
    }, [])

    const handleChange = (e) => {
        const { name, value, selectedOptions } = e.target
        const nextValue = selectedOptions
            ? Array.from(selectedOptions).map((option) => option.value)
            : value
        setFormData({ ...formData, [name]: nextValue })
        setError("")
        setFieldErrors({})
    }

    const handleMapPointChange = (point) => {
        setFormData((prev) => ({
            ...prev,
            latitude: point?.lat ?? null,
            longitude: point?.lng ?? null,
        }))
        setError("")
        setFieldErrors({})
    }

    // manejo del archivo de logo — preview local y guardado del File
    const handleLogoChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setLogoFile(file)
        setLogoPreview(URL.createObjectURL(file))
    }

    const removeLogo = () => {
        setLogoFile(null)
        setLogoPreview(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setFieldErrors({})

        // Validar con Zod
        const parsed = commerceSchema.safeParse({
          ...formData,
          categoryIds: formData.categoryIds.map(id => Number(id)),
          basePrice: formData.basePrice,
          distancePrice: formData.distancePrice,
        })

        if (!parsed.success) {
          const errors = {}
          for (const issue of parsed.error.issues) {
            const key = issue.path[0]
            if (key && !errors[key]) errors[key] = issue.message
          }
          setFieldErrors(errors)
          setError("Revisá los datos del formulario.")
          setLoading(false)
          errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
          return
        }

        if (!userId) {
            setError("No se pudo obtener el usuario de la sesión. Iniciá sesión nuevamente.")
            setLoading(false)
            return
        }

        try {
            const payload = {
                fk_user: userId,
                category_ids: formData.categoryIds.map((categoryId) => Number(categoryId)),
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                description: formData.description,
                address: formData.address,
                latitude: formData.latitude,
                longitude: formData.longitude,
                website_url: formData.websiteUrl.trim() || null,
                instagram_url: formData.instagramUrl.trim() || null,
                tiktok_url: formData.tiktokUrl.trim() || null,
                base_price: Number(formData.basePrice),
                distance_price: Number(formData.distancePrice),
            }

            const response = await fetch(`${API_BASE_URL}/api/commerces`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || "Error al crear el comercio")
                console.error("Error al crear el comercio:", data)
                setLoading(false)
                return
            }

            // si el usuario seleccionó un logo, lo subimos usando el id del comercio recién creado
            const newStoreId = data?.id_store
            if (logoFile instanceof File && newStoreId) {
                const logoFormData = new FormData()
                logoFormData.append("image", logoFile)
                await fetch(`${API_BASE_URL}/stores/${newStoreId}/image`, {
                    method: "POST",
                    credentials: "include",
                    body: logoFormData,
                }).catch((err) => {
                    // no bloqueamos el éxito del comercio por un fallo de logo
                    console.warn("[WARN] No se pudo subir el logo del comercio:", err)
                })
            }

            console.log("Comercio creado exitosamente:", data)
            navigate("/comercio")

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4" noValidate>

            {error && (
                <div ref={errorRef} className="bg-red-50 text-red-600 p-3 rounded border border-red-200 text-sm">
                    {error}
                </div>
            )}

            {/* Nombre del Comercio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Comercio *</label>
                <input
                    type="text" name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Mi Tienda Online"
                    maxLength={100}
                    disabled={loading}
                    className={inputCls}
                />
                {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>

            {/* Email de Contacto */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto *</label>
                <input
                    type="email" name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contacto@mitienda.com"
                    disabled={loading}
                    className={inputCls}
                />
                {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Teléfono */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                    type="text" name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+595XXXXXXXXX"
                    maxLength={20}
                    disabled={loading}
                    className={inputCls}
                />
                {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
            </div>

            {/* Dirección */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <input
                    type="text" name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Calle Principal 123"
                    disabled={loading}
                    className={inputCls}
                />
                {fieldErrors.address && <p className="text-xs text-red-600 mt-1">{fieldErrors.address}</p>}
            </div>

            {/* Mapa */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación en mapa *</label>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                    <MapView
                        mode="single-point"
                        selectedPoint={
                            formData.latitude !== null && formData.longitude !== null
                                ? { lat: formData.latitude, lng: formData.longitude }
                                : null
                        }
                        onPointChange={handleMapPointChange}
                        heightClass="h-[240px]"
                        allowFullscreen={false}
                        showDistancePanel={false}
                    />
                </div>

                {(fieldErrors.latitude || fieldErrors.longitude) && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.latitude || fieldErrors.longitude}</p>
                )}
                <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-500">
                        {formData.latitude !== null && formData.longitude !== null
                            ? `Punto seleccionado: ${Number(formData.latitude).toFixed(5)}, ${Number(formData.longitude).toFixed(5)}`
                            : "Haz click en el mapa para seleccionar la ubicación exacta."}
                    </p>

                    {formData.latitude !== null && formData.longitude !== null && (
                        <button
                            type="button"
                            onClick={() => handleMapPointChange(null)}
                            className="text-xs text-red-600 hover:text-red-700 font-medium shrink-0"
                            disabled={loading}
                        >
                            Limpiar punto
                        </button>
                    )}
                </div>
            </div>

            {/* Categorías */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categorías del Comercio *</label>
                <CategorySelector
                    categories={categories}
                    selectedIds={formData.categoryIds}
                    onChange={(newIds) =>
                        setFormData({ ...formData, categoryIds: newIds })
                    }
                    disabled={loading}
                    error={fieldErrors.categoryIds}
                />
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Comercio *</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={500}
                    rows="4"
                    disabled={loading}
                    className={inputCls}
                />
                {fieldErrors.description && <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>}
                <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
            </div>

            {/* Precios de envío */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Base de Envío por km (Gs.) *</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    placeholder="Ej: 2500"
                    disabled={loading}
                    className={inputCls}
                />
                {fieldErrors.basePrice && <p className="text-xs text-red-600 mt-1">{fieldErrors.basePrice}</p>}
                <p className="text-xs text-gray-500 mt-1">Se aplica hasta 2 km de distancia.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Envío por km (+2 km) (Gs.) *</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="distancePrice"
                    value={formData.distancePrice}
                    onChange={handleChange}
                    placeholder="Ej: 4000"
                    disabled={loading}
                    className={inputCls}
                />
                {fieldErrors.distancePrice && <p className="text-xs text-red-600 mt-1">{fieldErrors.distancePrice}</p>}
                <p className="text-xs text-gray-500 mt-1">Se aplica cuando la distancia supera los 2 km.</p>
            </div>

            {/* Redes sociales y web */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sitio web</label>
                <input
                    type="url" name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://mi-comercio.com"
                    maxLength={500}
                    disabled={loading}
                    className={inputCls}
                />
                {fieldErrors.websiteUrl && <p className="text-xs text-red-600 mt-1">{fieldErrors.websiteUrl}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                <input
                    type="url" name="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={handleChange}
                    placeholder="https://instagram.com/mi_comercio"
                    maxLength={500}
                    disabled={loading}
                    className={inputCls}
                />
                {fieldErrors.instagramUrl && <p className="text-xs text-red-600 mt-1">{fieldErrors.instagramUrl}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
                <input
                    type="url" name="tiktokUrl"
                    value={formData.tiktokUrl}
                    onChange={handleChange}
                    placeholder="https://tiktok.com/@mi_comercio"
                    maxLength={500}
                    disabled={loading}
                    className={inputCls}
                />
                {fieldErrors.tiktokUrl && <p className="text-xs text-red-600 mt-1">{fieldErrors.tiktokUrl}</p>}
            </div>

            {/* Logo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo del comercio</label>

                {/* preview si se seleccionó un archivo */}
                {logoPreview && (
                    <div className="relative inline-block mb-2">
                        <img
                            src={logoPreview}
                            alt="Preview logo"
                            className="w-24 h-24 object-cover rounded-md border border-gray-200"
                        />
                        <button
                            type="button"
                            onClick={removeLogo}
                            disabled={loading}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-black/70 disabled:cursor-not-allowed"
                            aria-label="Quitar logo"
                        >
                            <X size={10} />
                        </button>
                    </div>
                )}

                <div className="border border-gray-200 rounded flex items-center overflow-hidden">
                    <span className="px-3 py-2 bg-gray-50 border-r border-gray-200 text-gray-600 text-sm">
                        Archivo:
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        disabled={loading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </div>
                <p className="text-xs text-gray-400 mt-1">Formato: 500px x 500px 72ppi. JPG o PNG recomendado.</p>
            </div>

            {/* Botones */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => navigate("/homepage")}
                    disabled={loading}
                    className="bg-white text-gray-800 px-4 py-2 rounded border border-gray-800 hover:bg-green-100! disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading || !userId}
                    className="bg-[#5B7B6D] text-white px-4 py-2 rounded hover:bg-green-800 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? <Spinner size="5" color="text-white" /> : "Registrar Comercio"}
                </button>
            </div>
        </form>
    )
}