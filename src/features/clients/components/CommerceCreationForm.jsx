import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Spinner } from "../../../components/Spinner"

const inputCls = "w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D] focus:border-[#5B7B6D] disabled:cursor-not-allowed disabled:opacity-60"
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").trim()

export const CommerceCreationForm = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const errorRef = useRef(null)

    // ── ID del usuario logueado (obtenido de la sesión) ───────────────────────
    const [userId, setUserId] = useState(null)

    // ── Categorías de comercio cargadas desde el backend ─────────────────────
    const [categories, setCategories] = useState([])

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        region: "",       // ← estaba ausente del estado inicial, el backend lo requiere
        postalCode: "",
        categoryId: "",   // ← antes era "category" y nunca se enviaba
        description: "",
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
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        // Validación de campos obligatorios
        if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.region || !formData.description) {
            setError("Por favor completá todos los campos obligatorios.")
            setLoading(false)
            errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
            return
        }

        const phoneRegex = /^\+595\d{9}$/
        if (!phoneRegex.test(formData.phone)) {
            setError("El número de teléfono debe tener el formato +595XXXXXXXXX.")
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
                fk_user: userId,                              // ← antes era 6 hardcodeado
                fk_store_category: Number(formData.categoryId) || 1,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                description: formData.description,
                address: formData.address,
                city: formData.city,
                region: formData.region,
                postal_code: formData.postalCode || undefined,
            }

            const response = await fetch(`${API_BASE_URL}/api/commerces`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",  // enviar cookie
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || "Error al crear el comercio")
                console.error("Error al crear el comercio:", data)
            } else {
                console.log("Comercio creado exitosamente:", data)
                navigate("/comercio")
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">

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
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Ciudad */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                    <input
                        type="text" name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Encarnación"
                        disabled={loading}
                        className={inputCls}
                    />
                </div>

                {/* Región */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Región *</label>
                    <input
                        type="text" name="region"
                        value={formData.region}
                        onChange={handleChange}
                        placeholder="Itapúa"
                        disabled={loading}
                        className={inputCls}
                    />
                </div>
            </div>

            {/* Código Postal */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                <input
                    type="text" name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="16000"
                    maxLength={20}
                    disabled={loading}
                    className={inputCls}
                />
            </div>

            {/* Categoría Principal */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Principal *</label>
                <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    disabled={loading}
                    className={`${inputCls} select-category`}
                >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
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
                <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
            </div>

            {/* Logo */}
            <p className="text-gray-800 mb-0">Logo del comercio</p>
            <div className="border border-gray-200 rounded flex items-center overflow-hidden">
                <span className="px-3 py-2 bg-gray-50 border-r border-gray-200 text-gray-600 text-sm">
                    Archivo:
                </span>
                <input
                    type="file"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                />
            </div>
            <p className="text-xs text-gray-400 mt-1">Formato: 500px x 500px 72ppi</p>

            {/* Botones */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => navigate("/homepage")}
                    disabled={loading}
                    className="bg-white text-gray-800 px-4 py-2 rounded border border-gray-800 hover:!bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
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