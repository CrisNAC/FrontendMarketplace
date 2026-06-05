import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-hot-toast', () => ({
    default: { success: vi.fn(), error: vi.fn() }
}))

vi.mock('../features/delivery/services/deliveryOrdersApi', () => ({
    loadDeliveryDashboard: vi.fn(),
    getBackendErrorMessage: vi.fn((_err, fb) => fb),
    respondToDeliveryOrder: vi.fn(),
}))

vi.mock('../lib/formatGuarani', () => ({
    formatGuarani: (v) => `₲${v}`
}))

import toast from 'react-hot-toast'
import { loadDeliveryDashboard, respondToDeliveryOrder } from '../features/delivery/services/deliveryOrdersApi'
import DeliveryOrderScreen from '../features/delivery/pages/DeliveryOrderScreen'

const mockAssignment = {
    id_delivery_assignment: 1,
    order: {
        id_order: 10,
        total_price: 150000,
        estimated_delivery_time: 30,
        client: { name: 'Cliente Test', phone: '+595971000000' },
        store: { name: 'Tienda Test', addresses: [{ address: 'Calle 1 123' }] },
        order_products: [
            { quantity: 2, product: { name: 'Laptop', price: 100000 } }
        ],
        addresses: [{ address: 'Av. Mcal. López 1234' }],
    }
}

function setupWithAssignment() {
    loadDeliveryDashboard.mockResolvedValueOnce({
        assignments: [mockAssignment],
        reason: null,
        delivery: { id_delivery: 1 }
    })
}

describe('DeliveryOrderScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra "Cargando pedidos..." durante la carga', () => {
        loadDeliveryDashboard.mockReturnValue(new Promise(() => {}))
        render(<DeliveryOrderScreen />)
        expect(screen.getByText('Cargando pedidos…')).toBeInTheDocument()
    })

    it('muestra el título "Pedidos para aceptar"', async () => {
        setupWithAssignment()
        render(<DeliveryOrderScreen />)
        await waitFor(() => {
            expect(screen.getByText('Pedidos para aceptar')).toBeInTheDocument()
        })
    })

    it('muestra "No hay pedidos pendientes" cuando no hay assignments', async () => {
        loadDeliveryDashboard.mockResolvedValueOnce({
            assignments: [],
            reason: null,
            delivery: { id_delivery: 1 }
        })
        render(<DeliveryOrderScreen />)
        await waitFor(() => {
            expect(screen.getByText('No hay pedidos pendientes')).toBeInTheDocument()
        })
    })

    it.each([
        ['not_delivery', /Iniciá sesión con una cuenta de repartidor/],
        ['no_delivery_profile', /no tiene perfil de delivery activo/],
    ])('muestra mensaje cuando reason es %s', async (reason, pattern) => {
        loadDeliveryDashboard.mockResolvedValueOnce({ assignments: [], reason, delivery: null })
        render(<DeliveryOrderScreen />)
        await waitFor(() => {
            expect(screen.getByText(pattern)).toBeInTheDocument()
        })
    })

    it('renderiza datos de la asignación', async () => {
        setupWithAssignment()
        render(<DeliveryOrderScreen />)
        await waitFor(() => {
            expect(screen.getByText('Tienda Test')).toBeInTheDocument()
        })
    })

    it('acepta un pedido al hacer clic en Aceptar', async () => {
        setupWithAssignment()
        respondToDeliveryOrder.mockResolvedValueOnce({})
        loadDeliveryDashboard.mockResolvedValueOnce({ assignments: [], reason: null, delivery: { id_delivery: 1 } })
        render(<DeliveryOrderScreen />)
        await waitFor(() => {
            expect(screen.getByText('Aceptar')).toBeInTheDocument()
        })
        await userEvent.click(screen.getByText('Aceptar'))
        await waitFor(() => {
            expect(respondToDeliveryOrder).toHaveBeenCalledWith(10, 'ACCEPT')
            expect(toast.success).toHaveBeenCalledWith('Pedido aceptado.')
        })
    })

    it('rechaza un pedido al hacer clic en Rechazar', async () => {
        setupWithAssignment()
        respondToDeliveryOrder.mockResolvedValueOnce({})
        loadDeliveryDashboard.mockResolvedValueOnce({ assignments: [], reason: null, delivery: { id_delivery: 1 } })
        render(<DeliveryOrderScreen />)
        await waitFor(() => {
            expect(screen.getByText('Rechazar')).toBeInTheDocument()
        })
        await userEvent.click(screen.getByText('Rechazar'))
        await waitFor(() => {
            expect(respondToDeliveryOrder).toHaveBeenCalledWith(10, 'REJECT')
            expect(toast.success).toHaveBeenCalledWith('Pedido rechazado.')
        })
    })

    it('muestra error cuando respondToDeliveryOrder falla', async () => {
        setupWithAssignment()
        respondToDeliveryOrder.mockRejectedValueOnce(new Error('Error de red'))
        render(<DeliveryOrderScreen />)
        await waitFor(() => {
            expect(screen.getByText('Aceptar')).toBeInTheDocument()
        })
        await userEvent.click(screen.getByText('Aceptar'))
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled()
        })
    })
})
