import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../features/commerces/services/editUserProfileApi', () => ({
    getSession: vi.fn(),
}))

vi.mock('../features/delivery/services/deliveryOrdersApi', () => ({
    getDeliveryOrderHistory: vi.fn(),
    getBackendErrorMessage: (_err, fallback) => fallback,
}))

import { getSession } from '../features/commerces/services/editUserProfileApi'
import { getDeliveryOrderHistory } from '../features/delivery/services/deliveryOrdersApi'
import DeliveryHistoryPage from '../features/delivery/pages/DeliveryHistoryPage'

const mockEntry = {
    id_order: 500,
    order_status: 'DELIVERED',
    total: 180000,
    created_at: new Date().toISOString(),
    user: { name: 'María López' },
    assignment_status: 'DELIVERED',
}

const mockPayload = {
    content: [mockEntry],
    total_elements: 1,
    total_pages: 1,
    page: 1,
    size: 10,
}

describe('DeliveryHistoryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra alerta cuando el usuario no es DELIVERY', async () => {
        getSession.mockResolvedValueOnce({ user: { role: 'CUSTOMER', id_delivery: null } })

        render(<DeliveryHistoryPage />)

        await waitFor(() => {
            expect(screen.getByText('Iniciá sesión con una cuenta de repartidor para ver el historial.')).toBeInTheDocument()
        })
    })

    it('muestra alerta cuando no tiene perfil de delivery', async () => {
        getSession.mockResolvedValueOnce({ user: { role: 'DELIVERY', id_delivery: null } })

        render(<DeliveryHistoryPage />)

        await waitFor(() => {
            expect(screen.getByText('Tu usuario no tiene perfil de delivery. Registrate como delivery desde el perfil de cliente.')).toBeInTheDocument()
        })
    })

    it('muestra alerta not_delivery cuando la sesión falla', async () => {
        getSession.mockRejectedValueOnce(new Error('Network'))

        render(<DeliveryHistoryPage />)

        await waitFor(() => {
            expect(screen.getByText('Iniciá sesión con una cuenta de repartidor para ver el historial.')).toBeInTheDocument()
        })
    })

    it('muestra el título Historial', async () => {
        getSession.mockResolvedValueOnce({ user: { role: 'DELIVERY', id_delivery: 5 } })
        getDeliveryOrderHistory.mockResolvedValueOnce(mockPayload)

        render(<DeliveryHistoryPage />)

        await waitFor(() => {
            expect(screen.getByText('Historial')).toBeInTheDocument()
        })
    })

    it('renderiza las entradas del historial', async () => {
        getSession.mockResolvedValueOnce({ user: { role: 'DELIVERY', id_delivery: 5 } })
        getDeliveryOrderHistory.mockResolvedValueOnce(mockPayload)

        render(<DeliveryHistoryPage />)

        await waitFor(() => {
            expect(screen.queryByText('Cargando...')).not.toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga del historial', async () => {
        getSession.mockResolvedValueOnce({ user: { role: 'DELIVERY', id_delivery: 5 } })
        getDeliveryOrderHistory.mockRejectedValueOnce(new Error('Red'))

        render(<DeliveryHistoryPage />)

        await waitFor(() => {
            expect(screen.getByText('No se pudo cargar el historial.')).toBeInTheDocument()
        })
    })

    it('muestra los tabs de período', async () => {
        getSession.mockResolvedValueOnce({ user: { role: 'DELIVERY', id_delivery: 5 } })
        getDeliveryOrderHistory.mockResolvedValue(mockPayload)

        render(<DeliveryHistoryPage />)

        await waitFor(() => {
            expect(screen.getByText('7 días')).toBeInTheDocument()
        })

        expect(screen.getByText('15 días')).toBeInTheDocument()
        expect(screen.getByText('Mes')).toBeInTheDocument()
        expect(screen.getByText('Todos')).toBeInTheDocument()
    })

    it('muestra el botón de filtros', async () => {
        getSession.mockResolvedValueOnce({ user: { role: 'DELIVERY', id_delivery: 5 } })
        getDeliveryOrderHistory.mockResolvedValue(mockPayload)

        render(<DeliveryHistoryPage />)

        await waitFor(() => {
            expect(screen.getByText('Filtros')).toBeInTheDocument()
        })
    })

    it('muestra mensaje cuando no hay pedidos en el historial', async () => {
        getSession.mockResolvedValueOnce({ user: { role: 'DELIVERY', id_delivery: 5 } })
        getDeliveryOrderHistory.mockResolvedValueOnce({
            content: [],
            total_elements: 0,
            total_pages: 1,
            page: 1,
            size: 10,
        })

        render(<DeliveryHistoryPage />)

        await waitFor(() => {
            expect(screen.getByText('No hay pedidos que coincidan con los filtros.')).toBeInTheDocument()
        })
    })

    it('cambia de tab al hacer clic', async () => {
        getSession.mockResolvedValueOnce({ user: { role: 'DELIVERY', id_delivery: 5 } })
        getDeliveryOrderHistory.mockResolvedValue(mockPayload)

        render(<DeliveryHistoryPage />)

        await waitFor(() => {
            expect(screen.getByText('7 días')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Todos'))

        await waitFor(() => {
            expect(getDeliveryOrderHistory).toHaveBeenCalledWith(
                5,
                expect.objectContaining({ period: 'all' })
            )
        })
    })
})
