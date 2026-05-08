import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGet = vi.hoisted(() => vi.fn())

vi.mock('axios', () => ({
    default: {
        create: () => ({ get: mockGet }),
        isAxiosError: vi.fn(),
    },
}))

vi.mock('react-router-dom', () => ({
    useParams: () => ({ orderId: '42' }),
}))

vi.mock('../components/navbar/Navbar', () => ({ default: () => null }))
vi.mock('../components/SidebarClientProfile', () => ({
    SidebarClientProfile: () => null,
}))
vi.mock('../lib/formatGuarani', () => ({
    formatGuarani: (v) => `Gs. ${v}`,
}))

import { ClientOrderDetailsPage } from '../features/clients/pages/ClientOrderDetailsPage'

const mockOrder = {
    id: 42,
    status: 'PENDING',
    createdAt: '2024-01-15T10:00:00Z',
    total: 500000,
    notes: 'Entregar en puerta',
    address: { address: 'Av. Test 123', city: 'Asunción', region: 'Central' },
    items: [
        { id: 1, productId: 10, price: 250000, quantity: 2, subtotal: 500000 },
    ],
}

describe('ClientOrderDetailsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra "Cargando pedido..." durante la carga', () => {
        mockGet.mockReturnValue(new Promise(() => {}))
        render(<ClientOrderDetailsPage />)
        expect(screen.getByText('Cargando pedido...')).toBeInTheDocument()
    })

    it('muestra el pedido cargado', async () => {
        mockGet.mockResolvedValueOnce({ data: { user: { id_user: 7 } } })
        mockGet.mockResolvedValueOnce({ data: [mockOrder] })
        mockGet.mockResolvedValue({ data: { name: 'Laptop Pro' } })

        render(<ClientOrderDetailsPage />)
        await waitFor(() => {
            expect(screen.getByText(/Pedido N° 42/)).toBeInTheDocument()
        })
    })

    it('muestra el estado "Pendiente" para orden PENDING', async () => {
        mockGet.mockResolvedValueOnce({ data: { user: { id_user: 7 } } })
        mockGet.mockResolvedValueOnce({ data: [mockOrder] })
        mockGet.mockResolvedValue({ data: { name: 'Laptop Pro' } })

        render(<ClientOrderDetailsPage />)
        await waitFor(() => {
            expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0)
        })
    })

    it('muestra los items del pedido', async () => {
        mockGet.mockResolvedValueOnce({ data: { user: { id_user: 7 } } })
        mockGet.mockResolvedValueOnce({ data: [mockOrder] })
        mockGet.mockResolvedValue({ data: { name: 'Laptop Pro' } })

        render(<ClientOrderDetailsPage />)
        await waitFor(() => {
            expect(screen.getByText('Laptop Pro')).toBeInTheDocument()
        })
    })

    it('muestra el total del pedido', async () => {
        mockGet.mockResolvedValueOnce({ data: { user: { id_user: 7 } } })
        mockGet.mockResolvedValueOnce({ data: [mockOrder] })
        mockGet.mockResolvedValue({ data: { name: 'Laptop Pro' } })

        render(<ClientOrderDetailsPage />)
        await waitFor(() => {
            expect(screen.getAllByText('Gs. 500000').length).toBeGreaterThan(0)
        })
    })

    it('muestra las notas del pedido', async () => {
        mockGet.mockResolvedValueOnce({ data: { user: { id_user: 7 } } })
        mockGet.mockResolvedValueOnce({ data: [mockOrder] })
        mockGet.mockResolvedValue({ data: { name: 'Laptop Pro' } })

        render(<ClientOrderDetailsPage />)
        await waitFor(() => {
            expect(screen.getByText('Entregar en puerta')).toBeInTheDocument()
        })
    })

    it('muestra "Pedido no encontrado" cuando no existe el pedido', async () => {
        mockGet.mockResolvedValueOnce({ data: { user: { id_user: 7 } } })
        mockGet.mockResolvedValueOnce({ data: [] })

        render(<ClientOrderDetailsPage />)
        await waitFor(() => {
            expect(screen.getByText('Pedido no encontrado')).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla el fetch de sesión', async () => {
        mockGet.mockRejectedValueOnce(new Error('Error de sesión'))

        render(<ClientOrderDetailsPage />)
        await waitFor(() => {
            expect(screen.getByText('Error de sesión')).toBeInTheDocument()
        })
    })

    it('muestra la dirección de envío', async () => {
        mockGet.mockResolvedValueOnce({ data: { user: { id_user: 7 } } })
        mockGet.mockResolvedValueOnce({ data: [mockOrder] })
        mockGet.mockResolvedValue({ data: { name: 'Producto Test' } })

        render(<ClientOrderDetailsPage />)
        await waitFor(() => {
            expect(screen.getByText('Av. Test 123')).toBeInTheDocument()
        })
    })
})
