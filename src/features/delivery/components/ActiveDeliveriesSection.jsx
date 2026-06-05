import { useState, useEffect } from 'react';
import { MapPin, Phone, CheckCircle, Clock, AlertCircle, Loader } from 'lucide-react';
import { getActiveDeliveryAssignments, completeDeliveryAssignment } from '../services/deliveryAssignmentsApi';
import { useToast } from "@/hooks";

const card = {
  backgroundColor: 'white',
  borderRadius: '16px',
  padding: '16px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  marginBottom: '12px',
};

const sectionTitle = {
  fontWeight: '700',
  fontSize: '15px',
  margin: '0 0 16px 0',
  color: '#111827',
};

const buttonStyle = {
  base: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  primary: {
    backgroundColor: 'var(--primary)',
    color: 'white',
  },
  primaryHover: {
    backgroundColor: '#4a9d6f',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
  secondaryHover: {
    backgroundColor: '#e5e7eb',
  },
};

export function ActiveDeliveriesSection({ deliveryId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    let active = true;

    const loadAssignments = async () => {
      try {
        const data = await getActiveDeliveryAssignments(deliveryId);
        if (active) {
          setAssignments(Array.isArray(data) ? data : []);
          setError('');
        }
      } catch (err) {
        if (active) {
          console.error('Error cargando asignaciones activas:', err);
          setError('No se pudieron cargar los pedidos activos');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAssignments();
    return () => { active = false; };
  }, [deliveryId]);

  const handleCompleteDelivery = async (assignmentId, orderId) => {
    setCompleting(assignmentId);
    try {
      await completeDeliveryAssignment(assignmentId);
      setAssignments(prev => prev.filter(a => a.id_delivery_assignment !== assignmentId));
      showToast('Pedido marcado como entregado', 'success');
    } catch (err) {
      console.error('Error completando entrega:', err);
      showToast('Error al marcar el pedido como entregado', 'error');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div style={card}>
        <h6 style={sectionTitle}>Pedidos Activos para Entregar</h6>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', padding: '20px', justifyContent: 'center' }}>
          <Loader size={16} className="animate-spin" />
          <span>Cargando pedidos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={card}>
        <h6 style={sectionTitle}>Pedidos Activos para Entregar</h6>
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecdd3', borderRadius: '10px', padding: '12px 16px', color: '#be123c', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div style={card}>
        <h6 style={sectionTitle}>Pedidos Activos para Entregar</h6>
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', color: '#166534', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          No tienes pedidos pendientes. ¡Buen trabajo!
        </div>
      </div>
    );
  }

  return (
    <div style={card}>
      <h6 style={sectionTitle}>Pedidos Activos para Entregar ({assignments.length})</h6>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {assignments.map((assignment) => {
          const order = assignment.order;
          const isCompleting = completing === assignment.id_delivery_assignment;

          return (
            <div
              key={assignment.id_delivery_assignment}
              style={{
                backgroundColor: '#fafafa',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                    Pedido #{order.id_order}
                  </p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {new Date(order.created_at).toLocaleDateString('es-PY')}
                  </p>
                </div>
                <span style={{ backgroundColor: '#dbeafe', color: '#0c4a6e', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                  En camino
                </span>
              </div>

              {order.user && (
                <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '8px', fontSize: '13px' }}>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontWeight: '500' }}>Cliente:</p>
                  <p style={{ margin: '0 0 4px 0', color: '#111827', fontWeight: '500' }}>{order.user.name}</p>
                  {order.fk_address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '4px' }}>
                      <MapPin size={12} color='#ef4444' style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ color: '#6b7280' }}>Ver ubicación</span>
                    </div>
                  )}
                </div>
              )}

              <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Total a cobrar:</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                  Gs. {Number(order.total).toLocaleString('es-PY')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => handleCompleteDelivery(assignment.id_delivery_assignment, order.id_order)}
                  disabled={isCompleting}
                  onMouseEnter={(e) => {
                    if (!isCompleting) {
                      e.target.style.backgroundColor = buttonStyle.primaryHover.backgroundColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = buttonStyle.primary.backgroundColor;
                  }}
                  style={{
                    ...buttonStyle.base,
                    ...buttonStyle.primary,
                    flex: 1,
                    opacity: isCompleting ? 0.7 : 1,
                    cursor: isCompleting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isCompleting ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      Marcar Entregado
                    </>
                  )}
                </button>
                <button
                  onClick={() => {}}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = buttonStyle.secondaryHover.backgroundColor;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = buttonStyle.secondary.backgroundColor;
                  }}
                  style={{
                    ...buttonStyle.base,
                    ...buttonStyle.secondary,
                  }}
                >
                  <MapPin size={14} />
                  Ver Mapa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActiveDeliveriesSection;