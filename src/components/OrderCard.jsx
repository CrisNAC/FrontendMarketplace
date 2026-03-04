import { OrderStepper } from '../features/clients/components/OrderStepper'
import { Truck, CheckCircle, AlertCircle, Clock, Package } from 'lucide-react';

const iconosEstado = {
    "Pendiente": (
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <Clock size={24} strokeWidth={2} />
        </div>
    ),
    "Procesando": (
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Package size={24} strokeWidth={2} />
        </div>
    ),
    "Enviado": (
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Truck size={24} strokeWidth={2} />
        </div>
    ),
    "Entregado": (
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-green-50 text-green-600 shrink-0">
            <CheckCircle size={24} strokeWidth={2} />
        </div>
    ),
    "Cancelado": (
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 text-red-600 shrink-0">
            <AlertCircle size={24} strokeWidth={2} />
        </div>
    )
};

export const OrderCard = ({ order, onClick }) => {
  return (
    
    <div onClick={onClick} className="flex justify-between items-center border border-gray-200 rounded-lg p-1 mb-3 bg-white shadow-sm gap-4 cursor-pointer hover:bg-slate-50 hover:border-blue-400 hover:shadow-md transition-all duration-200">
      
      {/* Agrupamos el icono con los textos a la izquierda */}
      <div className="flex items-center ms-2 gap-4">
        
        {/* Aca se renderiza el icono del estado del pedido */}
        {iconosEstado[order.estado] || iconosEstado["Pendiente"]}

        {/* id y fecha del pedido*/}
        <div>
          <p className="text-base font-semibold mb-1">
            {order.id}
          </p>
          <p className="text-gray-500 text-sm">
            {order.fecha}
          </p>
        </div>
      </div>

      {/* Estado del pedido */}
      <div className="flex-1 max-w-[50%] px-4 hidden md:block">
        <OrderStepper estado={order.estado} />
      </div>

      {/* Cantidad del producto y el total */}
      <div className="text-right me-2 shrink-0">
        <p className="text-sm mb-1 text-gray-600">{order.cantidad} producto(s)</p>
        <p className="text-lg font-bold">Gs. {order.total}</p>
      </div>
    </div>
  );
};
