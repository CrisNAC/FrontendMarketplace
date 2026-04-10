import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommerceOrdersPage } from '../features/commerces/pages/CommerceOrdersPage'

// ─── Mocks de dependencias externas ──────────────────────────────────────────

// Mock de react-router-dom (el componente usa useNavigate internamente
// a través de otros componentes, lo dejamos vacío para evitar errores)
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

// Mock del apiClient de sesión
vi.mock('../features/commerces/services/editCommerceApi', () => ({
    apiClient: {
        get: vi.fn(),
    },
}))

// Mock de las funciones de ordersApi
vi.mock('../features/commerces/services/commerceOrdersApi', () => ({
    ordersApiClient: { get: vi.fn(), patch: vi.fn() },
    fetchStoreOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
    getOrderErrorMessage: (_err, fallback) => fallback,
}))

// Mock de componentes que dependen de librerías externas
vi.mock('../features/clients/components/commerceProfile/Pagination', () => ({
    Pagination: () => null,
}))

vi.mock('../features/clients/components/OrderStepper', () => ({
    OrderStepper: () => null,
}))

// ─── Imports de los mocks (después de declararlos) ────────────────────────────
import { apiClient } from '../features/commerces/services/editCommerceApi'
import { fetchStoreOrders } from '../features/commerces/services/commerceOrdersApi'

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const mockSessionWithStore = {
    data: {
        user: {
            id_user: 8,
            role: 'SELLER',
            id_store: 5,
        }
    }
}

const mockPendingOrder = {
    id: 1,
    status: 'PENDING',
    total: 150000,
    notes: null,
    createdAt: new Date().toISOString(),
    address: { city: 'Asunción', region: 'Central' },
    items: [{ id: 1 }],
}

const mockOrdersResponse = {
    orders: [mockPendingOrder],
    total: 1,
    page: 1,
    limit: 100,
    total_page: 1,
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('CommerceOrdersPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra el spinner de carga mientras espera la sesión', () => {
        // La sesión nunca resuelve → el componente queda en loading
        apiClient.get.mockReturnValue(new Promise(() => {}))

        render(<CommerceOrdersPage />)

        expect(screen.getByText('Cargando pedidos...')).toBeInTheDocument()
    })

    it('muestra los tabs y el pedido pendiente cuando la API responde bien', async () => {
        apiClient.get.mockResolvedValue(mockSessionWithStore)
        fetchStoreOrders.mockResolvedValue(mockOrdersResponse)

        render(<CommerceOrdersPage />)

        // Esperar a que desaparezca el loading
        await waitFor(() => {
            expect(screen.queryByText('Cargando pedidos...')).not.toBeInTheDocument()
        })

        // Los tres tabs deben estar visibles
        expect(screen.getByText('Pendientes')).toBeInTheDocument()
        expect(screen.getByText('Seguimiento')).toBeInTheDocument()
        expect(screen.getByText('Historial')).toBeInTheDocument()

        // El pedido pendiente debe aparecer
        expect(screen.getByText('#ORD-1')).toBeInTheDocument()
    })

    it('muestra error cuando la sesión falla', async () => {
        apiClient.get.mockRejectedValue(new Error('Network error'))

        render(<CommerceOrdersPage />)

        await waitFor(() => {
            expect(screen.getByText('No se pudo cargar la sesión.')).toBeInTheDocument()
        })
    })

        it('muestra pedido en Seguimiento cuando el estado es PROCESSING', async () => {
        const mockProcessingOrder = {
            ...mockPendingOrder,
            id: 2,
            status: 'PROCESSING',
        }

        apiClient.get.mockResolvedValue(mockSessionWithStore)
        fetchStoreOrders.mockResolvedValue({
            ...mockOrdersResponse,
            orders: [mockProcessingOrder],
        })

        render(<CommerceOrdersPage />)

        await waitFor(() => {
            expect(screen.queryByText('Cargando pedidos...')).not.toBeInTheDocument()
        })

        // Hacer clic en el tab Seguimiento
        await userEvent.click(screen.getByText('Seguimiento'))

        // El pedido debe aparecer en Seguimiento
        expect(screen.getByText('ORD-2')).toBeInTheDocument()
        // El botón de avanzar estado debe estar visible
        expect(screen.getByText('Marcar como Enviado')).toBeInTheDocument()
    })

    it('llama a updateOrderStatus con PROCESSING al aceptar un pedido', async () => {
        const { updateOrderStatus } = await import('../features/commerces/services/commerceOrdersApi')

        apiClient.get.mockResolvedValue(mockSessionWithStore)
        fetchStoreOrders.mockResolvedValue(mockOrdersResponse)

        render(<CommerceOrdersPage />)

        await waitFor(() => {
            expect(screen.getByText('#ORD-1')).toBeInTheDocument()
        })

        // Hacer clic en Aceptar
        await userEvent.click(screen.getByText('Aceptar'))

        expect(updateOrderStatus).toHaveBeenCalledWith(1, 'PROCESSING')
    })
    
    it('llama a updateOrderStatus con CANCELLED al rechazar un pedido', async () => {
        const { updateOrderStatus } = await import('../features/commerces/services/commerceOrdersApi')

        apiClient.get.mockResolvedValue(mockSessionWithStore)
        fetchStoreOrders.mockResolvedValue(mockOrdersResponse)

        render(<CommerceOrdersPage />)

        await waitFor(() => {
            expect(screen.getByText('#ORD-1')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Rechazar'))

        expect(updateOrderStatus).toHaveBeenCalledWith(1, 'CANCELLED')
    })

    it('muestra mensaje vacío cuando no hay pedidos pendientes', async () => {
        apiClient.get.mockResolvedValue(mockSessionWithStore)
        fetchStoreOrders.mockResolvedValue({
            ...mockOrdersResponse,
            orders: [],
            total: 0,
        })

        render(<CommerceOrdersPage />)

        await waitFor(() => {
            expect(screen.queryByText('Cargando pedidos...')).not.toBeInTheDocument()
        })

        expect(screen.getByText('No tenés pedidos pendientes.')).toBeInTheDocument()
    })
})