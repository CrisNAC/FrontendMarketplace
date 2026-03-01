import { OrderCard } from '../../../components/OrderCard';
import { SidebarClientProfile } from '../../../components/SidebarClientProfile';

export const ClientOrdersPage = () => {
  const orders = [
    {
      id: "ORD-2024-001543",
      total: 1388.96,
      estado: 'Entregado',
      fecha: '15 de junio del 2024',
      cantidad: 4
    },
    {
      id: "ORD-2024-001502",
      total: 299.99,
      estado: 'Pendiente',
      fecha: '8 de junio del 2024',
      cantidad: 1
    },
    {
      id: "ORD-2024-001489",
      total: 85.50,
      estado: 'Cancelado',
      fecha: '1 de junio del 2024',
      cantidad: 2
    }
  ];

  return (
    <div>
      {/*titulo*/}
      <h3 className="p-4 ms-5 font-bold mb-10">Mis Pedidos</h3>

      <div className="grid grid-cols-[250px_1fr] min-h-screen gap-x-15">
        {/* sidebar de navegacion del perfil del cliente */}
        <div className="p-3 w-80">
          <SidebarClientProfile />
        </div>

        {/* lista de pedidos */}
        <div className="p-6">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
};
