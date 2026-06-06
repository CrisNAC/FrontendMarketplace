import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()
let mockLocationState = {}

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: mockLocationState }),
}))

vi.mock('../components/navbar/Navbar', () => ({ default: () => null }))

vi.mock('lucide-react', () => ({
    CheckCircle2: () => <span data-testid="check-icon">✓</span>,
}))

vi.mock('../lib/formatGuarani', () => ({
    formatGuarani: (v) => `Gs. ${v}`,
}))

import PedidoConfirmadoPage from '../features/clients/pages/PedidoConfirmadoPage'

const mockOrder = {
    id: 99,
    status: 'PENDING',
    total: 750000,
    notes: 'Dejar en la puerta',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    address: { id: 1, address: 'Av. Principal 456', city: 'Asunción', region: 'Central' },
    items: [
        { id: 1, name: 'Laptop HP', quantity: 1, price: 500000, originalPrice: 500000, isOfferApplied: false, subtotal: 500000 },
        { id: 2, name: 'Mouse Logitech', quantity: 2, price: 125000, originalPrice: 125000, isOfferApplied: true, subtotal: 250000 },
    ],
}

const standardState = { order: mockOrder, shippingMethod: 'delivery', shippingCost: 0, subtotal: 750000, discount: 0, total: 750000 }

function renderWithOrder(state = standardState) {
    mockLocationState = state
    render(<PedidoConfirmadoPage />)
}

describe('PedidoConfirmadoPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockLocationState = {}
    })

    it('muestra "No se encontró información del pedido" cuando no hay orden', () => {
        render(<PedidoConfirmadoPage />)
        expect(screen.getByText('No se encontró información del pedido')).toBeInTheDocument()
    })

    it('navega a /pedidos al hacer clic en "Ir a Mis Pedidos" sin orden', async () => {
        render(<PedidoConfirmadoPage />)
        await userEvent.click(screen.getByText('Ir a Mis Pedidos'))
        expect(mockNavigate).toHaveBeenCalledWith('/pedidos')
    })

    it.each([
        ['¡Pedido Confirmado!',  '¡Pedido Confirmado!'],
        ['número del pedido',    '#99'],
        ['Oferta aplicada',      'Oferta aplicada'],
        ['dirección de entrega', 'Av. Principal 456'],
        ['notas del pedido',     'Dejar en la puerta'],
        ['envío gratis',         'Gratis'],
    ])('muestra el/la %s cuando hay orden', (_, text) => {
        renderWithOrder()
        expect(screen.getByText(text)).toBeInTheDocument()
    })

    it('muestra los productos del pedido', () => {
        renderWithOrder()
        expect(screen.getByText('Laptop HP')).toBeInTheDocument()
        expect(screen.getByText('Mouse Logitech')).toBeInTheDocument()
    })

    it('muestra "Retiro en Local" cuando shippingMethod es pickup', () => {
        renderWithOrder({ order: { ...mockOrder, address: null }, shippingMethod: 'pickup', shippingCost: 0, subtotal: 750000, discount: 0, total: 750000 })
        expect(screen.getAllByText('Retiro en Local').length).toBeGreaterThan(0)
    })

    it('muestra "Envío Estándar" cuando shippingMethod es delivery', () => {
        renderWithOrder({ order: mockOrder, shippingMethod: 'delivery', shippingCost: 15000, subtotal: 750000, discount: 0, total: 765000 })
        expect(screen.getAllByText('Envío Estándar').length).toBeGreaterThan(0)
    })

    it('muestra el descuento cuando es mayor a 0', () => {
        renderWithOrder({ order: mockOrder, shippingMethod: 'delivery', shippingCost: 0, subtotal: 750000, discount: 50000, total: 700000 })
        expect(screen.getByText('Descuento:')).toBeInTheDocument()
    })

    it('navega a /pedidos al hacer clic en "Ver Mis Pedidos"', async () => {
        renderWithOrder()
        await userEvent.click(screen.getByText('Ver Mis Pedidos'))
        expect(mockNavigate).toHaveBeenCalledWith('/pedidos')
    })

    it('muestra "—" cuando la fecha no está disponible', () => {
        renderWithOrder({ order: { ...mockOrder, createdAt: undefined }, shippingMethod: 'pickup', shippingCost: 0, subtotal: 750000, discount: 0, total: 750000 })
        expect(screen.getByText('—')).toBeInTheDocument()
    })
})
