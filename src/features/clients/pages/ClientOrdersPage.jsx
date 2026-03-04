import { OrderCard } from '../../../components/OrderCard';
import { SidebarClientProfile } from '../../../components/SidebarClientProfile';
import { useNavigate } from 'react-router-dom';
import  Navbar  from '../../../components/navbar/Navbar';

export const ClientOrdersPage = () => {

  const navigate = useNavigate();

  const orders = [
    {
      id: "ORD-2024-001543",
      total: '61.200',
      estado: 'Enviado',
      fecha: '15 de junio del 2024',
      cantidad: 4
    },
    {
      id: "ORD-2024-001502",
      total: '314.000',
      estado: 'Entregado',
      fecha: '8 de junio del 2024',
      cantidad: 1
    },
    {
      id: "ORD-2024-001489",
      total: '155.200',
      estado: 'Cancelado',
      fecha: '1 de junio del 2024',
      cantidad: 2
    }
  ];

  const handleCardClick = (orderId) => {
    navigate(`/pedidos/${orderId}`);
  }

  return (
    <div>
      <Navbar />
      {/*titulo*/}
      <h3 className="p-2 ms-5 mt-2 font-bold">Mis Pedidos</h3>

      <div className="grid grid-cols-[250px_1fr] min-h-screen gap-x-15">
        {/* sidebar de navegacion del perfil del cliente */}
        <div className="p-3 w-80">
          <SidebarClientProfile />
        </div>

        {/* lista de pedidos */}
        <div className="p-6">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} onClick={() => handleCardClick(order.id)}/>
          ))}
        </div>
      </div>
    </div>
  );
};
