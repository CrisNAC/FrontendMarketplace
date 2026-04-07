import { useState, useEffect, useRef } from "react"
import Navbar from "../../../components/navbar/Navbar"
import {
    getSession,
    fetchUserProfile,
    updateUserProfile,
    uploadUserImage,
    getBackendErrorMessage,
} from "../../commerces/services/editUserProfileApi"

export const EditClientProfile = () => {

    const didLoad = useRef(false)
    const [userId, setUserId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [preview, setPreview] = useState(null)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        photo: null
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setFormData({ ...formData, photo: file })
        setPreview(URL.createObjectURL(file))
    }

    useEffect(() => {
        if (didLoad.current) return
        didLoad.current = true

        const loadUser = async () => {
            try {
                const sessionData = await getSession()
                const loggedUserId = sessionData.user?.id_user

                if (!loggedUserId) {
                    setError("No hay sesión activa. Por favor iniciá sesión.")
                    setLoading(false)
                    return
                }

                setUserId(loggedUserId)

                const response = await fetchUserProfile(loggedUserId)
                const user = response.data

                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    photo: null
                })

                if (user.avatar_url) {
                    setPreview(user.avatar_url)
                }

            } catch (err) {
                const status = err.response?.status
                if (status === 401) {
                    setError("Tu sesión expiró o no estás logueado. Por favor iniciá sesión.")
                } else {
                    setError(getBackendErrorMessage(err, "Error cargando perfil"))
                }
            } finally {
                setLoading(false)
            }
        }

        loadUser()
    }, [])

    const validateForm = () => {
        if (!formData.name.trim()) return "Nombre obligatorio"
        if (!formData.email.trim()) return "Email obligatorio"
        if (!formData.phone.trim()) return "Teléfono obligatorio"
        if (!formData.email.includes("@")) return "Email inválido"
        return null
    }

    const handleSubmit = async () => {
        if (!userId) {
            setError("No hay sesión activa. Por favor iniciá sesión.")
            return
        }

        setSaving(true)
        setError("")
        setSuccess("")

        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            setSaving(false)
            return
        }

        try {
            await updateUserProfile(userId, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            })

            if (formData.photo instanceof File) {
                const { avatar_url } = await uploadUserImage(userId, formData.photo)
                setPreview(avatar_url)
                setFormData(prev => ({ ...prev, photo: null }))
            }

            setSuccess("Perfil actualizado correctamente")

        } catch (err) {
            setError(getBackendErrorMessage(err, "Error actualizando perfil"))
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="p-10 text-center">Cargando perfil...</div>
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <div className="flex justify-center w-full mt-3 mb-3">
                <div className="w-full max-w-2xl bg-white p-8 rounded-md shadow-md">
                    <p className="text-xl text-gray-900 font-bold">Editar Perfil</p>
                    <p className="text-gray-700">Actualiza tu información personal.</p>

                    <form className="flex flex-col gap-4 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                            <input
                                type="text" name="name" value={formData.name}
                                onChange={handleChange} required
                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo *</label>
                            <input
                                type="email" name="email" value={formData.email}
                                onChange={handleChange} required
                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                            <input
                                type="text" name="phone" value={formData.phone}
                                onChange={handleChange} required
                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Foto de perfil</label>
                            <div className="flex flex-col items-start gap-2">
                                <label className="cursor-pointer bg-[#5B7B6D] text-white px-4 py-2 rounded hover:bg-green-800 transition text-sm font-medium">
                                    Seleccionar foto
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </label>
                                <span className="text-xs text-gray-500">JPG o PNG recomendado</span>
                            </div>
                            {preview && (
                                <img src={preview} alt="Vista previa" className="w-24 h-24 rounded-full mt-3 object-cover border" />
                            )}
                        </div>

                        <button
                            type="button" onClick={handleSubmit} disabled={saving}
                            className="bg-[#5B7B6D] text-white px-4 py-2 rounded hover:bg-green-800 transition"
                        >
                            {saving ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </form>

                    {error && <div className="text-red-500 mt-3">{error}</div>}
                    {success && <div className="text-green-600 mt-3">{success}</div>}
                </div>
            </div>
        </div>
    )
}