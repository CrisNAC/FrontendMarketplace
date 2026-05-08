import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-hot-toast', () => ({
    default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('lucide-react', () => ({
    MapPin: () => <span>MapPin</span>,
    Phone: () => <span>Phone</span>,
    CheckCircle: () => <span>CheckCircle</span>,
    Clock: () => <span>Clock</span>,
    AlertCircle: () => <span>AlertCircle</span>,
    Loader: () => <span>Loader</span>,
}))

vi.mock('../features/delivery/services/deliveryAssignmentsApi', () => ({
    getActiveDeliveryAssignments: vi.fn(),
    completeDeliveryAssignment: vi.fn(),
}))

import toast from 'react-hot-toast'
import { getActiveDeliveryAssignments, completeDeliveryAssignment } from '../features/delivery/services/deliveryAssignmentsApi'
import { ActiveDeliveriesSection } from '../features/delivery/components/ActiveDeliveriesSection'

const mockAssignment = {
    id_delivery_assignment: 1,
    order: {
        id_order: 10,
        total: 250000,
        created_at: '2024-01-15T10:00:00Z',
        user: { name: 'Juan Pérez' },
        fk_address: 1,
    },
}

describe('ActiveDeliveriesSection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra "Cargando pedidos..." durante la carga', () => {
        getActiveDeliveryAssignments.mockReturnValue(new Promise(() => {}))
        render(<ActiveDeliveriesSection deliveryId={5} />)
        expect(screen.getByText(/Cargando pedidos/)).toBeInTheDocument()
    })

    it('muestra "Pedidos Activos para Entregar" en el encabezado', async () => {
        getActiveDeliveryAssignments.mockResolvedValueOnce([mockAssignment])
        render(<ActiveDeliveriesSection deliveryId={5} />)
        await waitFor(() => {
            expect(screen.getByText(/Pedidos Activos para Entregar/)).toBeInTheDocument()
        })
    })

    it('muestra "No tienes pedidos pendientes" cuando la lista está vacía', async () => {
        getActiveDeliveryAssignments.mockResolvedValueOnce([])
        render(<ActiveDeliveriesSection deliveryId={5} />)
        await waitFor(() => {
            expect(screen.getByText(/No tienes pedidos pendientes/)).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga', async () => {
        getActiveDeliveryAssignments.mockRejectedValueOnce(new Error('Error de red'))
        render(<ActiveDeliveriesSection deliveryId={5} />)
        await waitFor(() => {
            expect(screen.getByText(/No se pudieron cargar los pedidos activos/)).toBeInTheDocument()
        })
    })

    it('muestra el número del pedido activo', async () => {
        getActiveDeliveryAssignments.mockResolvedValueOnce([mockAssignment])
        render(<ActiveDeliveriesSection deliveryId={5} />)
        await waitFor(() => {
            expect(screen.getByText(/Pedido #10/)).toBeInTheDocument()
        })
    })

    it('muestra el nombre del cliente', async () => {
        getActiveDeliveryAssignments.mockResolvedValueOnce([mockAssignment])
        render(<ActiveDeliveriesSection deliveryId={5} />)
        await waitFor(() => {
            expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
        })
    })

    it('muestra el botón "Marcar Entregado"', async () => {
        getActiveDeliveryAssignments.mockResolvedValueOnce([mockAssignment])
        render(<ActiveDeliveriesSection deliveryId={5} />)
        await waitFor(() => {
            expect(screen.getByText('Marcar Entregado')).toBeInTheDocument()
        })
    })

    it('llama completeDeliveryAssignment al hacer clic en Marcar Entregado', async () => {
        getActiveDeliveryAssignments.mockResolvedValueOnce([mockAssignment])
        completeDeliveryAssignment.mockResolvedValueOnce({})
        render(<ActiveDeliveriesSection deliveryId={5} />)
        await waitFor(() => screen.getByText('Marcar Entregado'))
        await userEvent.click(screen.getByText('Marcar Entregado'))
        await waitFor(() => {
            expect(completeDeliveryAssignment).toHaveBeenCalledWith(1)
        })
    })

    it('elimina la asignación del listado al completar entrega', async () => {
        getActiveDeliveryAssignments.mockResolvedValueOnce([mockAssignment])
        completeDeliveryAssignment.mockResolvedValueOnce({})
        render(<ActiveDeliveriesSection deliveryId={5} />)
        await waitFor(() => screen.getByText('Marcar Entregado'))
        await userEvent.click(screen.getByText('Marcar Entregado'))
        await waitFor(() => {
            expect(completeDeliveryAssignment).toHaveBeenCalledWith(1)
        })
    })
})
