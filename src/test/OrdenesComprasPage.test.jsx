import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
    default: { error: vi.fn(), success: vi.fn() }
}))

vi.mock('../lib/cartApi', () => ({
    fetchCartsApi: vi.fn(),
    getApiBase: vi.fn(() => 'http://localhost:3000'),
}))

vi.mock('../lib/formatGuarani', () => ({
    formatGuarani: (v) => `Gs. ${v}`,
}))

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        isAxiosError: vi.fn(),
    }
}))

import axios from 'axios'
import { fetchCartsApi } from '../lib/cartApi'
import OrdenesComprasPage from '../features/clients/pages/OrdenesComprasPage'

const mockCart = {
    id: 1,
    commerce: { name: 'Tienda Test', logo: null },
    items: [
        {
            id: 1,
            quantity: 2,
            product: { id: 10, name: 'Laptop', price: 100000, image_url: null }
        }
    ]
}

describe('OrdenesComprasPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        axios.get.mockResolvedValue({ data: { user: { id_user: 7 } } })
        fetchCartsApi.mockResolvedValue([mockCart])
    })

    it('muestra "Cargando carrito..." durante la carga', () => {
        axios.get.mockReturnValue(new Promise(() => {}))

        render(<OrdenesComprasPage />)

        expect(screen.getByText('Cargando carrito...')).toBeInTheDocument()
    })

    it('muestra el título "Ordenes de Compras"', async () => {
        render(<OrdenesComprasPage />)

        await waitFor(() => {
            expect(screen.getByText('Ordenes de Compras')).toBeInTheDocument()
        })
    })

    it('muestra el carrito cargado', async () => {
        render(<OrdenesComprasPage />)

        await waitFor(() => {
            expect(screen.getByText('Laptop')).toBeInTheDocument()
        })
    })

    it('muestra el total formateado', async () => {
        render(<OrdenesComprasPage />)

        await waitFor(() => {
            expect(screen.getAllByText(/Gs\. 200000/).length).toBeGreaterThan(0)
        })
    })

    it('muestra "Tu carrito está vacío" cuando no hay carts', async () => {
        fetchCartsApi.mockResolvedValueOnce([])

        render(<OrdenesComprasPage />)

        await waitFor(() => {
            expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
        })
    })

    it('muestra "Iniciá sesión" cuando no hay usuario', async () => {
        axios.get.mockResolvedValueOnce({ data: { user: null } })

        render(<OrdenesComprasPage />)

        await waitFor(() => {
            expect(screen.getByText('Iniciá sesión para ver tus compras.')).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla fetchCartsApi', async () => {
        fetchCartsApi.mockRejectedValueOnce(new Error('Error de red'))

        render(<OrdenesComprasPage />)

        await waitFor(() => {
            expect(screen.getByText('No se pudo cargar el carrito.')).toBeInTheDocument()
        })
    })

    it('muestra botón Reintentar en estado error', async () => {
        fetchCartsApi.mockRejectedValueOnce(new Error('Error'))

        render(<OrdenesComprasPage />)

        await waitFor(() => {
            expect(screen.getByText('Reintentar')).toBeInTheDocument()
        })
    })
})
