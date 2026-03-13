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

    // para testear, solo usamos el id=26, para ver si funciona el post, despues implementamos con el user logeado
    const USER_ID =28
    const didLoad = useRef(false)
    const [loading,setLoading] = useState(true)
    const [saving,setSaving] = useState(false)
    const [error,setError] = useState("")
    const [success,setSuccess]=useState("")
    const [addressId,setAddressId] = useState(null)
    const [preview,setPreview]=useState(null)
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
        const file=e.target.files[0]
        if(!file) return setFormData({...formData, photo:file})
        
        setPreview(URL.createObjectURL(file))

    }

    // cargar perfil
    useEffect(()=>{
        if(didLoad.current) return
        didLoad.current = true
        const loadUser = async()=>{
            try{
                // hacer un login test para que funcione la pagina
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
    const validateForm=()=>{
        if(!formData.name.trim()) return "Nombre obligatorio"
        if(!formData.email.trim()) return "Email obligatorio"
        if(!formData.phone.trim()) return "Teléfono obligatorio"
        if(!formData.address.trim()) return "Direccion obligatoria"
        if(!formData.city.trim()) return "Ciudad obligatoria"
        if(!formData.email.includes("@")) return "Email inválido"
        return null
    }

    const handleSubmit = async()=>{

        setSaving(true)
        setError("")
        setSuccess("")
        const validationError= validateForm()
        if(validationError){
            setError(validationError)
            setSaving(false)
            return
        }
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
            setSuccess("Perfil actualizado correctamente")

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
                                required

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
                                required

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
                                required

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
                                required

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
                                required

                                className="w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30"

                            />

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Foto

                            </label>

                            <div className="flex flex-col items-start gap-2">

                                <label className="cursor-pointer bg-[#5B7B6D] text-white px-4 py-2 rounded hover:bg-green-800 transition text-sm font-medium">

                                    Seleccionar foto

                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />

                                </label>

                                <span className="text-xs text-gray-500">

                                    JPG o PNG recomendado

                                </span>

                            </div>

                            {preview && (

                                <img

                                    src={preview}

                                    className="w-24 h-24 rounded-full mt-3 object-cover border"

                                />

                            )}

                        </div>

                        <button

                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}

                            className="bg-[#5B7B6D] text-white px-4 py-2 rounded hover:bg-green-800 transition"

                        >

                            {saving ? "Guardando..." : "Guardar cambios"}

                        </button>

                    </form>
                    {error && (

                        <div className="text-red-500 mt-3">

                            {error}

                        </div>

                    )}

                    {success && (

                        <div className="text-green-600 mt-3">

                            {success}

                        </div>

                    )}


                </div>

            </div>

        </div>

    )

}