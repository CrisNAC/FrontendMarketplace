import { useState,useEffect,useRef } from "react"
import Navbar from "../../../components/navbar/Navbar"

import {
    fetchUserProfile,
    updateUserProfile,
    updateUserAddress,
    getBackendErrorMessage,
    loginTestUser
} from "../../commerces/services/editClientProfileApi"

export const EditClientProfile = () => {

    // SOLO TEST
    const USER_ID =26

    const didLoad = useRef(false)

    const [loading,setLoading] = useState(true)
    const [saving,setSaving] = useState(false)
    const [error,setError] = useState("")

    const [addressId,setAddressId] = useState(null)

    const [formData,setFormData] = useState({

        name:"",
        email:"",
        phone:"",
        address:"",
        city:"",
        photo:null

    })

    const handleChange = (e)=>{

        setFormData({

            ...formData,
            [e.target.name]:e.target.value

        })

    }

    const handleFileChange = (e)=>{

        setFormData({

            ...formData,
            photo:e.target.files[0]

        })

    }

    // CARGAR PERFIL
    useEffect(()=>{

        if(didLoad.current) return
        didLoad.current = true

        const loadUser = async()=>{

            try{

                // LOGIN TEST
                await loginTestUser()

                const response = await fetchUserProfile(USER_ID)

                const user = response.data

                setFormData({

                    name:user.name || "",
                    email:user.email || "",
                    phone:user.phone || "",
                    address:user.addresses?.[0]?.address || "",
                    city:user.addresses?.[0]?.city || "",
                    photo:null

                })

                if(user.addresses?.length){

                    setAddressId(

                        user.addresses[0].id_address

                    )

                }

            }catch(err){

                setError(

                    getBackendErrorMessage(
                        err,
                        "Error cargando perfil"
                    )

                )

            }finally{

                setLoading(false)

            }

        }

        loadUser()

    },[])

    const handleSubmit = async()=>{

        setSaving(true)
        setError("")

        try{

            await updateUserProfile(

                USER_ID,
                {

                    name:formData.name,
                    email:formData.email,
                    phone:formData.phone

                }

            )

            if(addressId){

                await updateUserAddress(

                    USER_ID,
                    addressId,
                    {

                        address:formData.address,
                        city:formData.city

                    }

                )

            }

            alert("Perfil actualizado correctamente")

        }catch(err){

            setError(

                getBackendErrorMessage(
                    err,
                    "Error actualizando perfil"
                )

            )

        }finally{

            setSaving(false)

        }

    }

    if(loading){

        return(

            <div>

                <Navbar/>

                <div className="p-10 text-center">

                    Cargando perfil...

                </div>

            </div>

        )

    }

    return (

        <div>

            <Navbar/>

            <div className="flex justify-center w-full mt-3 mb-3">

                <div className="w-full max-w-2xl bg-white p-8 rounded-md shadow-md">

                    <p className="text-xl text-gray-900 font-bold">

                        Editar Perfil

                    </p>

                    <p className="text-gray-700">

                        Actualiza tu información personal.

                    </p>

                    {error && (

                        <div className="text-red-500 mt-3">

                            {error}

                        </div>

                    )}

                    <form className="flex flex-col gap-4 mt-6">

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-1">

                                Nombre *

                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30"
                            />

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-1">

                                Correo *

                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30"
                            />

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-1">

                                Teléfono *

                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30"
                            />

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-1">

                                Dirección *

                            </label>

                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30"
                            />

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-1">

                                Ciudad *

                            </label>

                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30"
                            />

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Foto

                            </label>

                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="block w-full text-sm"
                            />

                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="bg-[#5B7B6D] text-white px-4 py-2 rounded hover:bg-green-800"
                        >

                            {saving ? "Guardando..." : "Guardar cambios"}

                        </button>

                    </form>

                    <p className="text-sm text-gray-500 text-center mt-4">

                        Los campos con * son obligatorios.

                    </p>

                </div>

            </div>

        </div>

    )

}