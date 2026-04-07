import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderCard } from '../../../components/OrderCard';
import { SidebarClientProfile } from '../../../components/SidebarClientProfile';
import Navbar from '../../../components/navbar/Navbar';
import { getSession } from '../../commerces/services/editUserProfileApi';
import { getOrdersByCustomer, getBackendErrorMessage } from '../../commerces/services/orderApi';

// Mapea el estado del backend al texto que muestra la UI
const STATUS_LABEL = {
  PENDING:    'Pendiente',
  PROCESSING: 'Procesando', 
  SHIPPED:    'Enviado',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
};

// Formatea fecha ISO → "15 de junio del 2024"
const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('es-PY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const ClientOrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // 1. Obtener el usuario de la sesión activa
        const sessionData = await getSession();
        const userId = sessionData.user.id_user;

        // 2. Traer sus pedidos
        const data = await getOrdersByCustomer(userId);
        setOrders(data);
      } catch (err) {
        setError(getBackendErrorMessage(err, 'Error al cargar los pedidos'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCardClick = (orderId) => {
    navigate(`/pedidos/${orderId}`);
  };

  // Transforma la respuesta del backend al shape que espera <OrderCard>
  const mappedOrders = orders.map((o) => ({
    id:       o.id,
    total:    Number(o.total),
    estado:   STATUS_LABEL[o.status] ?? o.status,
    fecha:    formatDate(o.createdAt),
    cantidad: o.items?.length ?? 0,
  }));

  return (
    <div>
      <Navbar />
      <h3 className="p-2 ms-5 mt-2 font-bold">Mis Pedidos</h3>

      <div className="grid grid-cols-[250px_1fr] min-h-screen gap-x-15">
        <div className="p-3 w-80">
          <SidebarClientProfile />
        </div>

        <div className="p-6">
          {loading && (
            <p className="text-gray-500">Cargando pedidos...</p>
          )}

          {!loading && error && (
            <p className="text-red-500">{error}</p>
          )}

          {!loading && !error && mappedOrders.length === 0 && (
            <p className="text-gray-500">No tenés pedidos aún.</p>
          )}

          {!loading && !error && mappedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => handleCardClick(order.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};