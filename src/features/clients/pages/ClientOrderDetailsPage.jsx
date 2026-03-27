import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SidebarClientProfile } from '../../../components/SidebarClientProfile';
import Navbar from '../../../components/navbar/Navbar';
import { getSession } from '../../commerces/services/editUserProfileApi';
import { getOrderById, getBackendErrorMessage } from '../../commerces/services/orderApi';
import { getProductById } from '../../commerces/services/productDetailApi';

const STATUS_CONFIG = {
  PENDING:    { label: 'Pendiente',  classes: 'border-yellow-500 text-yellow-600' },
  PROCESSING: { label: 'En proceso', classes: 'border-blue-500 text-blue-600'    },
  SHIPPED:    { label: 'Enviado',    classes: 'border-blue-500 text-blue-600'    },
  DELIVERED:  { label: 'Entregado',  classes: 'border-green-500 text-green-600'  },
  CANCELLED:  { label: 'Cancelado',  classes: 'border-red-500 text-red-600'      },
};

const formatCurrency = (val) =>
  `Gs. ${Number(val).toLocaleString('es-PY')}`;

const formatDate = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('es-PY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const ClientOrderDetailsPage = () => {
  const { orderId } = useParams();

  const [order, setOrder]     = useState(null);
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const sessionData = await getSession();
        const userId = sessionData.user.id_user;

        const data = await getOrderById(userId, orderId);
        if (!data) {
          setError('Pedido no encontrado');
          return;
        }
        setOrder(data);

        // Enriquecer cada item con el nombre del producto desde GET /products/:id
        // item.productId si el backend lo expone, sino item.id como fallback
        const enriched = await Promise.all(
          data.items.map(async (item) => {
            try {
              const productId = item.productId ?? item.fk_product ?? item.id;
              const product = await getProductById(productId);
              return { ...item, productName: product?.name ?? `Artículo #${item.id}` };
            } catch {
              return { ...item, productName: `Artículo #${item.id}` };
            }
          })
        );
        setItems(enriched);
      } catch (err) {
        setError(getBackendErrorMessage(err, 'Error al cargar el pedido'));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div><Navbar /><p className="p-6 text-gray-500">Cargando pedido...</p></div>;
  }

  if (error || !order) {
    return <div><Navbar /><p className="p-6 text-red-500">{error || 'Pedido no encontrado'}</p></div>;
  }

  const statusConfig  = STATUS_CONFIG[order.status] ?? { label: order.status, classes: 'border-gray-400 text-gray-600' };
  const subtotalTotal = order.items.reduce((acc, item) => acc + Number(item.subtotal), 0);

  return (
    <div>
      <Navbar />
      <h3 className="p-2 ms-5 mt-2 font-bold">Mis Pedidos</h3>

      <div className="grid grid-cols-[250px_1fr] min-h-screen gap-x-20">
        <div className="p-3 w-80">
          <SidebarClientProfile />
        </div>

        <div className="mb-5">
          {/* Cabecera */}
          <div className="flex justify-between items-center mb-2 bg-white p-3 rounded-lg me-2">
            <div>
              <p className="text-lg font-bold">Pedido N° {order.id}</p>
              <p className="text-sm text-gray-600">
                Fecha de pedido: {formatDate(order.createdAt)}
              </p>
            </div>
            <span className={`border px-3 py-1 rounded-sm text-sm ${statusConfig.classes}`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Tabla de artículos */}
          <div className="bg-white p-3 rounded-lg me-2">
            <div className="mb-3 text-sm">
              <span className="font-bold text-gray-900 border-b-2 border-black pb-2">
                Artículos pedidos
              </span>
            </div>

            <div className="border border-gray-200 rounded-sm overflow-hidden">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col style={{ width: '45%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '25%' }} />
                </colgroup>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-3 font-semibold text-gray-900 text-left">Producto</th>
                    <th className="p-3 font-semibold text-gray-900 text-right">Precio unit.</th>
                    <th className="p-3 font-semibold text-gray-900 text-right">Cant.</th>
                    <th className="p-3 font-semibold text-gray-900 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="p-3 text-left align-top">
                        <p className="font-medium text-gray-800">{item.productName}</p>
                        {item.isOfferApplied && (
                          <span className="text-xs text-green-600">Oferta aplicada</span>
                        )}
                      </td>
                      <td className="p-3 text-right align-top">
                        <p className="text-gray-900">{formatCurrency(item.price)}</p>
                        {item.isOfferApplied && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatCurrency(item.originalPrice)}
                          </p>
                        )}
                      </td>
                      <td className="p-3 text-right text-gray-900 align-top">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-right font-medium text-gray-900 align-top">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Resumen */}
              <div className="flex justify-end bg-gray-50 p-4 border-t border-gray-200">
                <div className="w-64 text-sm space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subtotalTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-300 pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del pedido */}
            <div className="mt-5">
              <p className="text-base font-bold mb-3">Información de pedido</p>
              <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="font-semibold text-gray-900 mb-1 text-sm">Dirección de envío</p>
                  <div className="text-gray-600 text-xs space-y-0.5">
                    <p>{order.address.address}</p>
                    <p>{order.address.city}</p>
                    <p>{order.address.region}</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 mb-1 text-sm">Notas del pedido</p>
                  <p className="text-gray-600 text-xs">{order.notes ?? 'Sin notas'}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 mb-1 text-sm">Estado</p>
                  <span className={`inline-block border px-2 py-0.5 rounded text-xs ${statusConfig.classes}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4 me-2">
            <button
              onClick={() => window.history.back()}
              className="bg-[#6B9080] text-white px-4 py-2 rounded hover:bg-green-800 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};