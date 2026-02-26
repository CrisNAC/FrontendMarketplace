
export const OrderCard = ({ order }) => {
  return (
    <div className="flex justify-between items-center border border-gray rounded-lg p-4 mb-4 bg-white shadow-sm">
      {/*id y fecha del pedido */}
      <div>
        <h4 className="text-base font-semibold mb-1">
          {order.id}
        </h4>
        <p className="text-gray text-sm">
          {order.fecha}
        </p>
      </div>

      {/* Estado del pedido */}
      <div>
        <p>{order.estado}</p>
      </div>

      {/* Cantidad del producto y el total */}
      <div className="text-right">
        <p className="text-sm mb-1">{order.cantidad} producto(s)</p>
        <p className="text-lg font-bold">${order.total}</p>
      </div>
    </div>
  );
};
