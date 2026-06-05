/* eslint-disable react/prop-types */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

vi.mock('../features/commerces/services/editUserProfileApi', () => ({
    getSession: vi.fn(),
}))

vi.mock('../features/commerces/services/orderApi', () => ({
    getOrdersByCustomer: vi.fn(),
    getBackendErrorMessage: (_err, fallback) => fallback,
}))

vi.mock('../components/navbar/Navbar', () => ({
    default: () => <div data-testid="navbar" />,
}))

vi.mock('../components/SidebarClientProfile', () => ({
    SidebarClientProfile: () => <div data-testid="sidebar" />,
}))

vi.mock('../features/clients/components/OrderStepper', () => ({
    OrderStepper: ({ estado }) => <div>{estado}</div>,
}))

import { getSession } from '../features/commerces/services/editUserProfileApi'
import { getOrdersByCustomer } from '../features/commerces/services/orderApi'
import { ClientOrdersPage } from '../features/clients/pages/ClientOrdersPage'

const mockOrders = [
    {
        id: 1,
        total: '150000',
        status: 'PENDING',
        createdAt: '2024-06-15T10:00:00Z',
        items: [{ id: 1 }, { id: 2 }],
    },
    {
        id: 2,
        total: '80000',
        status: 'DELIVERED',
        createdAt: '2024-06-10T10:00:00Z',
        items: [{ id: 3 }],
    },
]

describe('ClientOrdersPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getSession.mockResolvedValue({ user: { id_user: 7 } })
    })

    it('muestra "Cargando pedidos..." durante la carga', () => {
        getSession.mockReturnValue(new Promise(() => {}))

        render(<ClientOrdersPage />)

        expect(screen.getByText('Cargando pedidos...')).toBeInTheDocument()
    })

    it('muestra los pedidos cuando la carga es exitosa', async () => {
        getOrdersByCustomer.mockResolvedValueOnce(mockOrders)

        render(<ClientOrdersPage />)

        await waitFor(() => {
            expect(screen.getByText('1')).toBeInTheDocument()
            expect(screen.getByText('2')).toBeInTheDocument()
        })
    })

    it('muestra el total de cada pedido', async () => {
        getOrdersByCustomer.mockResolvedValueOnce(mockOrders)

        render(<ClientOrdersPage />)

        await waitFor(() => {
            const totals = screen.getAllByText(/Gs\./)
            expect(totals.length).toBeGreaterThan(0)
        })
    })

    it('muestra "No tenés pedidos aún." cuando la lista está vacía', async () => {
        getOrdersByCustomer.mockResolvedValueOnce([])

        render(<ClientOrdersPage />)

        await waitFor(() => {
            expect(screen.getByText('No tenés pedidos aún.')).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga', async () => {
        getSession.mockRejectedValueOnce(new Error('Error de red'))

        render(<ClientOrdersPage />)

        await waitFor(() => {
            expect(screen.getByText('Error al cargar los pedidos')).toBeInTheDocument()
        })
    })

    it('navega al detalle del pedido al hacer clic', async () => {
        getOrdersByCustomer.mockResolvedValueOnce(mockOrders)

        render(<ClientOrdersPage />)

        await waitFor(() => {
            expect(screen.getByText('1')).toBeInTheDocument()
        })

        const cards = document.querySelectorAll('[class*="cursor-pointer"]')
        expect(cards.length).toBeGreaterThan(0)
        await userEvent.click(cards[0])
        expect(mockNavigate).toHaveBeenCalledWith('/pedidos/1')
    })

    it('muestra el título "Mis Pedidos"', async () => {
        getOrdersByCustomer.mockResolvedValueOnce([])

        render(<ClientOrdersPage />)

        await waitFor(() => {
            expect(screen.getByText('Mis Pedidos')).toBeInTheDocument()
        })
    })
})
