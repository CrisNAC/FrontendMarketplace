import Navbar from "../../../components/navbar/Navbar";
import { CommerceCreationForm } from "../components/CommerceCreationForm";

export const CreateCommercePage = () => {
    return (
        <div>
            <Navbar />
            <div className="flex justify-center w-full mt-3 mb-3">
                <div className="w-full max-w-2xl bg-white p-8 rounded-md shadow-md ">
                    {/** Titulo */}
                    <p className="text-xl text-gray-900 font-bold">Crear Comercio</p>
                    <p className="text-gray-700">Completa el formulario para registrar tu comercio y comenzar a vender productos responsables.</p>

                    {/**Formulario */}
                    <CommerceCreationForm />


                    
                    <p className="text-sm text-gray-500 text-center mt-4">Los campos marcados con * son obligatorios.</p>
                </div>
            </div>
        </div>
    )
}