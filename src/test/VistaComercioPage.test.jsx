/* eslint-disable react/prop-types */
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-router-dom', () => ({
    useLocation: () => ({ search: '?storeId=5&storeName=Tienda+Tech' }),
    useNavigate: () => vi.fn(),
}))

vi.mock('lucide-react', () => ({
    ArrowLeft: ({ onClick, style }) => <button onClick={onClick} style={style} data-testid="back-btn">←</button>,
    Phone: () => <span>Phone</span>,
    Mail: () => <span>Mail</span>,
    MapPin: () => <span>MapPin</span>,
    Search: () => <span>Search</span>,
    X: ({ onClick }) => <button type="button" onClick={onClick} data-testid="x-icon">X</button>,
}))

vi.mock('../lib/apiClient', () => ({
    default: { get: vi.fn() },
}))

vi.mock('axios', () => ({
    default: { isAxiosError: vi.fn(() => false) },
}))

import apiClient from '../lib/apiClient'
import { VistaComercioPage } from '../features/clients/pages/VistaComercioPage'

const mockStore = {
    id_store: 5,
    name: 'Tienda Tech',
    status: true,
    average_rating: 4.5,
    total_reviews: 100,
    close_time: '20:00',
    store_category: { id_store_category: 1, name: 'Electrónica' },
    email: 'tienda@tech.com',
    phone: '0981123456',
    addresses: [{ address: 'Av. Principal 123', city: 'Asunción', region: 'Central' }],
}

const mockProduct = {
    id_product: 1,
    name: 'Laptop HP',
    price: '500000',
    visible: true,
}

describe('VistaComercioPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        apiClient.get
            .mockResolvedValueOnce({ data: mockStore })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValue({ data: [mockProduct] })
    })

    it('muestra el nombre de la tienda en el breadcrumb', async () => {
        render(<VistaComercioPage />)
        await waitFor(() => {
            expect(screen.getByText(/Comercios \/ Tienda Tech/)).toBeInTheDocument()
        })
    })

    it('muestra el nombre del comercio en el header', async () => {
        render(<VistaComercioPage />)
        await waitFor(() => {
            expect(screen.getAllByText('Tienda Tech').length).toBeGreaterThan(0)
        })
    })

    it('muestra "Cargando productos..." cuando está cargando', async () => {
        apiClient.get
            .mockReset()
            .mockResolvedValueOnce({ data: mockStore })
            .mockResolvedValueOnce({ data: [] })
            .mockReturnValue(new Promise(() => {}))

        render(<VistaComercioPage />)
        await waitFor(() => {
            expect(screen.getByText('Cargando productos...')).toBeInTheDocument()
        })
    })

    it('muestra "no tiene productos" cuando la lista está vacía', async () => {
        apiClient.get
            .mockReset()
            .mockResolvedValueOnce({ data: mockStore })
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValue({ data: [] })

        render(<VistaComercioPage />)
        await waitFor(() => {
            expect(screen.getByText(/aún no tiene productos publicados/)).toBeInTheDocument()
        })
    })

    it('muestra los productos cuando se cargan correctamente', async () => {
        render(<VistaComercioPage />)
        await waitFor(() => {
            expect(screen.getByText('Laptop HP')).toBeInTheDocument()
        })
    })

    it('muestra "Abierto" cuando el comercio está abierto', async () => {
        render(<VistaComercioPage />)
        await waitFor(() => {
            expect(screen.getByText('Abierto')).toBeInTheDocument()
        })
    })

    it('muestra Productos Destacados cuando hay productos', async () => {
        render(<VistaComercioPage />)
        await waitFor(() => {
            expect(screen.getByText('Productos Destacados')).toBeInTheDocument()
        })
    })
})
