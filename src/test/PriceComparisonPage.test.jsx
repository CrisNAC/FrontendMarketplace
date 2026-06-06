/* eslint-disable react/prop-types */
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const originalFetch = globalThis.fetch

vi.mock('react-router-dom', () => ({
    useLocation: () => ({ search: '?search=Laptop' }),
    useNavigate: () => vi.fn(),
    Link: ({ to, children, className }) => <a href={to} className={className}>{children}</a>,
}))

vi.mock('lucide-react', () => ({
    ArrowLeft: ({ onClick, className }) => <button onClick={onClick} className={className} data-testid="arrow-left">←</button>,
}))

vi.mock('../components/navbar/Navbar', () => ({ default: () => null }))

vi.mock('../lib/formatGuarani', () => ({
    formatGuarani: (v) => `Gs. ${v}`,
}))

import PriceComparisonPage from '../features/clients/pages/PriceComparisonPage'

const mockOffers = [
    {
        productId: 1,
        name: 'Laptop HP',
        price: 500000,
        store: { name: 'Tienda Tech', logo: null },
        image_url: null,
    },
    {
        productId: 2,
        name: 'Laptop HP',
        price: 450000,
        store: { name: 'Store Plus', logo: null },
        image_url: null,
    },
]

describe('PriceComparisonPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
    })

    it('muestra "Cargando ofertas..." durante la carga', () => {
        globalThis.fetch = vi.fn(() => new Promise(() => {}))
        render(<PriceComparisonPage />)
        expect(screen.getByText(/Cargando ofertas/)).toBeInTheDocument()
    })

    it('muestra las ofertas cargadas', async () => {
        globalThis.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ product: { name: 'Laptop HP' }, offers: mockOffers }),
        }))
        render(<PriceComparisonPage />)
        await waitFor(() => {
            expect(screen.getByText('Tienda Tech')).toBeInTheDocument()
        })
    })

    it('muestra la cantidad de ofertas encontradas', async () => {
        globalThis.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ product: { name: 'Laptop HP' }, offers: mockOffers }),
        }))
        render(<PriceComparisonPage />)
        await waitFor(() => {
            expect(screen.getByText(/Encontramos 2 ofertas/)).toBeInTheDocument()
        })
    })

    it('muestra "Sin ofertas" cuando la lista está vacía', async () => {
        globalThis.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ product: { name: 'Laptop HP' }, offers: [] }),
        }))
        render(<PriceComparisonPage />)
        await waitFor(() => {
            expect(screen.getByText(/Sin ofertas para este producto/)).toBeInTheDocument()
        })
    })

    it('muestra error cuando el fetch falla', async () => {
        globalThis.fetch = vi.fn(() => Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({}),
        }))
        render(<PriceComparisonPage />)
        await waitFor(() => {
            expect(screen.getByText(/No se pudo cargar la comparación/)).toBeInTheDocument()
        })
    })

    it('muestra el rango de precios cuando hay ofertas', async () => {
        globalThis.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ product: { name: 'Laptop HP' }, offers: mockOffers }),
        }))
        render(<PriceComparisonPage />)
        await waitFor(() => {
            expect(screen.getByText('Rango de precios:')).toBeInTheDocument()
        })
    })

    it('muestra "Sin precios disponibles" cuando no hay ofertas', async () => {
        globalThis.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ product: null, offers: [] }),
        }))
        render(<PriceComparisonPage />)
        await waitFor(() => {
            expect(screen.getByText(/Sin precios disponibles/)).toBeInTheDocument()
        })
    })

    it('muestra el nombre del producto en el título', async () => {
        globalThis.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ product: { name: 'Laptop HP' }, offers: mockOffers }),
        }))
        render(<PriceComparisonPage />)
        await waitFor(() => {
            expect(screen.getByText(/Ofertas: Laptop HP/)).toBeInTheDocument()
        })
    })

    it('muestra el enlace Ver más para productos con ID válido', async () => {
        globalThis.fetch = vi.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ product: { name: 'Laptop' }, offers: mockOffers }),
        }))
        render(<PriceComparisonPage />)
        await waitFor(() => {
            const verMasLinks = screen.getAllByText('+ Ver más')
            expect(verMasLinks.length).toBeGreaterThan(0)
        })
    })
})
