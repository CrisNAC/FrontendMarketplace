import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../features/delivery/services/deliveryAssignmentsApi', () => ({
    getActiveDeliveryAssignments: vi.fn(),
    completeDeliveryAssignment: vi.fn(),
}))

vi.mock('../features/clients/services/deliveryApi', () => ({
    getCurrentUserForDeliveryForm: vi.fn(),
}))

import {
    getActiveDeliveryAssignments,
    completeDeliveryAssignment,
} from '../features/delivery/services/deliveryAssignmentsApi'
import { getCurrentUserForDeliveryForm } from '../features/clients/services/deliveryApi'
import { DeliveryOrdersPage } from '../features/delivery/pages/DeliveryOrdersPage'

const mockAssignment = {
    id_delivery_assignment: 101,
    order: {
        id_order: 999,
        total: 250000,
        created_at: new Date().toISOString(),
        user: { name: 'Juan Pérez' },
        address: { city: 'Asunción', region: 'Central' },
    },
}

function setupWithAssignment() {
    getActiveDeliveryAssignments.mockResolvedValueOnce([mockAssignment])
    render(<DeliveryOrdersPage />)
}

describe('DeliveryOrdersPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserForDeliveryForm.mockResolvedValue({
            sessionUser: { id_user: 1, id_delivery: 5 }
        })
    })

    it('muestra "Cargando pedidos..." mientras carga', () => {
        getCurrentUserForDeliveryForm.mockReturnValue(new Promise(() => {}))
        render(<DeliveryOrdersPage />)
        expect(screen.getByText('Cargando pedidos...')).toBeInTheDocument()
    })

    it('muestra "Mis Pedidos en Curso"', async () => {
        getActiveDeliveryAssignments.mockResolvedValueOnce([])
        render(<DeliveryOrdersPage />)
        await waitFor(() => {
            expect(screen.getByText('Mis Pedidos en Curso')).toBeInTheDocument()
        })
    })

    it('muestra mensaje cuando no hay pedidos activos', async () => {
        getActiveDeliveryAssignments.mockResolvedValueOnce([])
        render(<DeliveryOrdersPage />)
        await waitFor(() => {
            expect(screen.getByText('¡No tienes pedidos activos! Buen trabajo completando entregas.')).toBeInTheDocument()
        })
    })

    it('renderiza los pedidos cuando hay asignaciones activas', async () => {
        setupWithAssignment()
        await waitFor(() => {
            expect(screen.getByText('#ORD-999')).toBeInTheDocument()
        })
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
        expect(screen.getByText('Asunción, Central')).toBeInTheDocument()
    })

    it('muestra el precio del pedido formateado', async () => {
        setupWithAssignment()
        await waitFor(() => {
            expect(screen.getByText(/250/)).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga', async () => {
        getCurrentUserForDeliveryForm.mockRejectedValueOnce(new Error('Red'))
        render(<DeliveryOrdersPage />)
        await waitFor(() => {
            expect(screen.getByText('No se pudieron cargar los pedidos activos')).toBeInTheDocument()
        })
    })

    it('completa una entrega al hacer clic en Finalizado', async () => {
        setupWithAssignment()
        completeDeliveryAssignment.mockResolvedValueOnce({})
        await waitFor(() => {
            expect(screen.getByText('Finalizado')).toBeInTheDocument()
        })
        await userEvent.click(screen.getByText('Finalizado'))
        await waitFor(() => {
            expect(completeDeliveryAssignment).toHaveBeenCalledWith(101)
        })
    })

    it('elimina el pedido de la lista tras completarlo', async () => {
        setupWithAssignment()
        completeDeliveryAssignment.mockResolvedValueOnce({})
        await waitFor(() => {
            expect(screen.getByText('#ORD-999')).toBeInTheDocument()
        })
        await userEvent.click(screen.getByText('Finalizado'))
        await waitFor(() => {
            expect(screen.queryByText('#ORD-999')).not.toBeInTheDocument()
        })
    })

    it('muestra "Dirección sin especificar" cuando no hay ciudad', async () => {
        const assignmentWithoutAddress = {
            ...mockAssignment,
            order: { ...mockAssignment.order, address: { city: '', region: '' } },
        }
        getActiveDeliveryAssignments.mockResolvedValueOnce([assignmentWithoutAddress])
        render(<DeliveryOrdersPage />)
        await waitFor(() => {
            expect(screen.getByText('Dirección sin especificar')).toBeInTheDocument()
        })
    })

    it.each([
        [[mockAssignment, { ...mockAssignment, id_delivery_assignment: 102, order: { ...mockAssignment.order, id_order: 1000 } }], 'Tienes 2 pedidos para entregar'],
        [[mockAssignment], 'Tienes 1 pedido para entregar'],
    ])('muestra el conteo correcto de pedidos', async (assignments, expectedText) => {
        getActiveDeliveryAssignments.mockResolvedValueOnce(assignments)
        render(<DeliveryOrdersPage />)
        await waitFor(() => {
            expect(screen.getByText(expectedText)).toBeInTheDocument()
        })
    })
})
