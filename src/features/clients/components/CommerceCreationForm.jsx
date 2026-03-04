
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Spinner } from "../../../components/Spinner" // spinner de carga
import { set } from "zod"
import { useRef } from "react"

export const CommerceCreationForm = () => {

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const errorRef = useRef(null) // referencia para el mensaje de error, para hacer scroll hacia el cuando haya un error

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        category: "",
        description: "",
        logo: null // esto se tiene que ver despues como implementar
    })


    // funcion para manejar el cambio en los campos del formulario
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError("")
    };


    // funcion para manejar el submit del formulario
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        //validacion de campos obligatorios
        if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.description) {
            setError("Por favor completa todos los campos obligatorios.");
            setLoading(false)
            errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) // forzar scroll hacia arriba para que el usuario vea el mensaje de error
            return;
        }

        const phoneRegex = /^\+595\d{9}$/;
        if (!phoneRegex.test(formData.phone)) {
            setError("El número de teléfono debe tener el formato +595XXXXXXXX.");
            setLoading(false)
            errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) // forzar scroll hacia arriba para que el usuario vea el mensaje de error
            return;
        }

        setLoading(true)

        try {
            const payload = {
                fk_user: 6, // esto se tiene que cambiar despues por el id del usuario logueado
                fk_store_category: 1, // esto se tiene que cambiar despues por la categoria seleccionada
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                description: formData.description,
                address: formData.address,
                city: formData.city,
                region: formData.region,
                postal_code: formData.postalCode
            };
            const response = await fetch("http://localhost:3000/api/commerces", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            //manejo de errores
            if (!response.ok) {
                setError(data.message || "Error al crear el comercio");
                console.error("Error al crear el comercio:", data);
            }
            else {
                console.log("Comercio creado exitosamente:", data);
                navigate("/comercio") // redirigir a la pagina de comercios despues de crear el comercio
            }
        }
        catch (error) {
            setError(error.message);
            setLoading(false)
        }
        finally {
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
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ej: Mi Tienda Online"
                    maxLength={100}
                    className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D] focus:border-[#5B7B6D]"
                />
            </div>

            {/* Email de Contacto */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto *</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contacto@mitienda.com"
                    className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D] focus:border-[#5B7B6D]"
                />
            </div>

            {/* Teléfono */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+595XXXXXXXX"
                    maxLength={20}
                    className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D] focus:border-[#5B7B6D]"
                />
            </div>

            {/* Direccion */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Calle Principal 123"
                    className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D] focus:border-[#5B7B6D]"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Ciudad */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Encarnación"
                        className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D] focus:border-[#5B7B6D]"
                    />
                </div>

                {/* Region */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Región *</label>
                    <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        placeholder="Itapúa"
                        className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D] focus:border-[#5B7B6D]"
                    />
                </div>
            </div>

            {/* Codigo Postal */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal *</label>
                <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="16000"
                    className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D] focus:border-[#5B7B6D]"
                />
            </div>

            {/* Categoria Principal */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría Principal *</label>
                <select className="select-category">
                    <option value="">Selecciona una categoría</option>
                    {/* implementar esto de añadir las opciones */}
                </select>
            </div>

            {/* Descripcion del Comercio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Comercio *</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={500}
                    rows="4"
                    className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D] focus:border-[#5B7B6D]"
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
            </div>

            {/** seccion del logo */}
            <p className="text-gray-800 mb-0">Logo del comercio</p>
            {/** selector de archivos (aun no funciona)*/}
            <div className="border border-gray-200 rounded flex items-center overflow-hidden">
                <span className="px-3 py-2 bg-gray-50 border-r border-gray-200 text-gray-600 text-sm">
                    Archivo:
                </span>
                <input
                    type="file"
                    className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:border-0
                                file:text-sm file:font-semibold
                                file:bg-gray-100 file:text-gray-700
                                hover:file:bg-gray-200
                                cursor-pointer"
                />
            </div>
            <p className="text-xs text-gray-400 mt-1">Formato: 500px x 500px 72ppi</p>
            <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => navigate("/homepage")} className="bg-white text-gray-800 px-4 py-2 rounded border border-gray-800 hover:!bg-green-100">Cancelar</button>
                <button className="bg-[#5B7B6D] text-white px-4 py-2 rounded hover:bg-green-800 flex items-center justify-center">
                    {loading ? <Spinner size="5" color="text-white" /> : "Registrar Comercio"}
                </button>
            </div>
        </form>
    )
}