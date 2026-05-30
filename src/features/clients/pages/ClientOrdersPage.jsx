import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLoader } from '../../../components/PageLoader';
import { OrderCard } from '../../../components/OrderCard';
import { getSession } from '../../commerces/services/editUserProfileApi';
import { getOrdersByCustomer, getBackendErrorMessage } from '../../commerces/services/orderApi';

// Mapea el estado del backend al texto que muestra la UI
const STATUS_LABEL = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
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

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    id: o.id,
    total: Number(o.total),
    estado: STATUS_LABEL[o.status] ?? o.status,
    fecha: formatDate(o.createdAt),
    cantidad: o.items?.length ?? 0,
  }));

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-[1100px] mx-auto w-full">
      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {!error && mappedOrders.length === 0 && (
        <div className="bg-[#F3F5F4] border border-[#C7D6CF] rounded-xl p-10 text-center">
          <p className="text-[18px] text-[#4f615b] font-medium">No tenés pedidos aún.</p>
        </div>
      )}

      {!error && mappedOrders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onClick={() => handleCardClick(order.id)}
        />
      ))}
    </div>
  );
};