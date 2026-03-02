import { Check, X } from 'lucide-react';

const steps = ["Pendiente", "Procesando", "Enviado", "Entregado", "Cancelado"];

export const OrderStepper = ({ estado }) => {
    const stepActual = steps.indexOf(estado);
    const cancelado = estado === "Cancelado";
    const indexCancelado = steps.indexOf("Cancelado");

    return (
        // padding bottom para dar espacio a los textos absolutos
        <div className='flex items-center w-full pb-8 pt-4'>
            {steps.map((step, index) => {
                // si es igual o menor al actual, está "check" (siempre que no esté cancelado)
                const completadoOActual = index <= stepActual;
                const esPasoCancelado = step === "Cancelado";

                // La linea roja solamente es la que une el penultimo paso con el ultimo
                const esLineaRoja = cancelado && index === indexCancelado - 1;
                // Las lineas verdes solo conectan hasta el paso actual
                const esLineaVerde = !cancelado && index < stepActual;

                return (
                    <div key={step} className={`flex items-center ${index !== steps.length - 1 ? "w-full" : ""}`}>

                        {/* Circulo */}
                        <div className="flex flex-col items-center relative">
                            <div className={`w-6 h-6 flex items-center justify-center rounded-full text-white
                                ${cancelado 
                                    ? (esPasoCancelado ? "bg-red-500" : "bg-gray-300") 
                                    : (completadoOActual ? "bg-[#9cbfa9]" : "bg-gray-300")}`}>
                                
                                {cancelado 
                                    ? (esPasoCancelado ? <X size={14} strokeWidth={4} /> : null) 
                                    : (completadoOActual ? <Check size={14} strokeWidth={4} /> : null)}
                            </div>
                            
                            {/* Texto */}
                            <span className={`absolute top-8 text-[11px] font-bold w-max 
                                ${cancelado && esPasoCancelado ? "text-red-500" : "text-gray-600"}`}>
                                {step}
                            </span>
                        </div>

                        {/* Linea */}
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1.5 mx-1 rounded-full ${
                                esLineaRoja ? "bg-red-500" 
                                    : cancelado ? "bg-gray-200" 
                                    : esLineaVerde ? "bg-[#9cbfa9]" 
                                    : "bg-gray-200"
                            }`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
