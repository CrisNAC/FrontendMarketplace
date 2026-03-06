import { useState } from "react"
import Navbar from "../../../components/navbar/Navbar"

export const EditClientProfile = () => {

    const [formData, setFormData] = useState({
        name: "Juan Pérez",
        phone: "+595981123456",
        address: "Calle Principal 123",
        city: "Encarnación",
        photo: null
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <div>
            <Navbar />

            <div className="flex justify-center w-full mt-3 mb-3">
                <div className="w-full max-w-2xl bg-white p-8 rounded-md shadow-md">

                    {/* Título */}
                    <p className="text-xl text-gray-900 font-bold">
                        Editar Perfil
                    </p>

                    <p className="text-gray-700">
                        Actualiza tu información personal para facilitar envíos.
                    </p>

                    {/* Formulario */}
                    <form className="flex flex-col gap-4 mt-6">

                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre *
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D]"
                            />
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Teléfono *
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D]"
                            />
                        </div>

                        {/* Dirección */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dirección *
                            </label>

                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D]"
                            />
                        </div>

                        {/* Ciudad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ciudad *
                            </label>

                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Encarnación"
                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D]"
                            />
                        </div>

                        {/* Foto de perfil */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Foto de perfil
                            </label>

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

                        {/* Botón guardar */}
                        <button
                            type="button"
                            className="bg-[#5B7B6D] text-white px-4 py-2 rounded hover:bg-green-800"
                        >
                            Guardar cambios
                        </button>

                    </form>

                    <p className="text-sm text-gray-500 text-center mt-4">
                        Los campos marcados con * son obligatorios.
                    </p>

                </div>
            </div>
        </div>
    )
}
