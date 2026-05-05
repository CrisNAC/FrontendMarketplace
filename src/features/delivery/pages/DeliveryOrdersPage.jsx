// src/features/delivery/pages/DeliveryOrdersPage.jsx
import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Clock, AlertCircle, Loader, Truck } from 'lucide-react';
import { getActiveDeliveryAssignments, completeDeliveryAssignment } from '../services/deliveryAssignmentsApi';
import { getCurrentUserForDeliveryForm } from '../../clients/services/deliveryApi';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return 'hace unos segundos';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)} días`;
}

export function DeliveryOrdersPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const { sessionUser } = await getCurrentUserForDeliveryForm();
        if (active && sessionUser?.id_delivery) {
          const data = await getActiveDeliveryAssignments(sessionUser.id_delivery);
          if (active) {
            setAssignments(Array.isArray(data) ? data : []);
            setError('');
          }
        }
      } catch (err) {
        if (active) {
          console.error('Error cargando pedidos activos:', err);
          setError('No se pudieron cargar los pedidos activos');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => { active = false; };
  }, []);

  const handleCompleteDelivery = async (assignmentId) => {
    setCompleting(assignmentId);
    try {
      await completeDeliveryAssignment(assignmentId);
      setAssignments(prev => prev.filter(a => a.id_delivery_assignment !== assignmentId));
    } catch (err) {
      console.error('Error completando entrega:', err);
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontWeight: '600', margin: '0 0 8px 0' }}>Mis Pedidos en Curso</h4>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Pedidos que estás repartiendo en este momento
          </p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6b7280' }}>
          <Loader size={18} className="animate-spin" />
          <span>Cargando pedidos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontWeight: '600', margin: '0 0 8px 0' }}>Mis Pedidos en Curso</h4>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Pedidos que estás repartiendo en este momento
          </p>
        </div>
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '12px 16px', color: '#be123c', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          {error}
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontWeight: '600', margin: '0 0 8px 0' }}>Mis Pedidos en Curso</h4>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Pedidos que estás repartiendo en este momento
          </p>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '48px 20px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <Truck size={40} color='#d1d5db' style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '15px', fontWeight: '600', color: '#374151', margin: 0 }}>¡No tienes pedidos activos! Buen trabajo completando entregas.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontWeight: '600', margin: '0 0 8px 0' }}>Mis Pedidos en Curso</h4>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          Tienes {assignments.length} {assignments.length === 1 ? 'pedido' : 'pedidos'} para entregar
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {assignments.map((assignment) => {
          const order = assignment.order;
          const isCompleting = completing === assignment.id_delivery_assignment;
          
          const clientName = order?.user?.name || 'Cliente sin nombre';
          const clientCity = order?.address?.city || '';
          const clientRegion = order?.address?.region || '';
          const location = clientCity
            ? `${clientCity}${clientRegion ? `, ${clientRegion}` : ''}`
            : 'Dirección sin especificar';

          return (
            <div
              key={assignment.id_delivery_assignment}
              style={{
                backgroundColor: 'white',
                borderRadius: '14px',
                padding: '16px 20px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                borderLeft: '3px solid var(--primary-dark)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                {/* Lado izquierdo: Información del pedido */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                    #ORD-{order?.id_order || '—'}
                  </p>

                  {/* Cliente */}
                  <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                    Cliente
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0 0 6px 0' }}>
                    {clientName}
                  </p>

                  {/* Dirección */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '8px' }}>
                    <MapPin size={12} color='#ef4444' style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {location}
                    </span>
                  </div>

                  {/* Tiempo */}
                  <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {timeAgo(order?.created_at)}
                  </span>
                </div>

                {/* Lado derecho: Total y botón */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px 0', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>
                      Total a cobrar
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)', margin: 0 }}>
                      Gs. {Number(order?.total || 0).toLocaleString('es-PY')}
                    </p>
                  </div>

                  {/* Botón de acción */}
                  <button
                    onClick={() => handleCompleteDelivery(assignment.id_delivery_assignment)}
                    disabled={isCompleting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      backgroundColor: isCompleting ? 'rgba(107, 144, 128, 0.6)' : 'var(--primary-dark)',
                      color: 'white',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: isCompleting ? 'not-allowed' : 'pointer',
                      opacity: isCompleting ? 0.7 : 1,
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      if (!isCompleting) {
                        e.target.style.backgroundColor = '#4a9d6f';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCompleting) {
                        e.target.style.backgroundColor = 'var(--primary-dark)';
                      }
                    }}
                  >
                    {isCompleting ? (
                      <>
                        <Loader size={12} className="animate-spin" />
                        Finalizando...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} />
                        Finalizado
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DeliveryOrdersPage;