import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommerceOrdersPage, timeAgo } from '../features/commerces/pages/CommerceOrdersPage'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

vi.mock('../features/commerces/services/editCommerceApi', () => ({
    apiClient: { get: vi.fn() },
}))

vi.mock('../features/commerces/services/commerceOrdersApi', () => ({
    ordersApiClient: { get: vi.fn(), patch: vi.fn() },
    fetchStoreOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
    getOrderErrorMessage: (_err, fallback) => fallback,
}))

vi.mock('../features/clients/components/commerceProfile/Pagination', () => ({
    Pagination: () => null,
}))

vi.mock('../features/clients/components/OrderStepper', () => ({
    OrderStepper: () => null,
}))

vi.mock('../features/commerces/services/deliveryAssignmentApi', () => ({
    checkOrderAssignment: vi.fn().mockResolvedValue({ has_assignment: false }),
}))

vi.mock('../features/commerces/components/deliveryAssignment/DeliveryAssignmentModal', () => ({
    DeliveryAssignmentModal: ({ onClose }) => (
        <div data-testid="delivery-modal">
            <button onClick={onClose}>Cerrar modal</button>
        </div>
    ),
}))

vi.mock('lucide-react', () => ({
    ShoppingBag: () => null,
    Clock: () => null,
    CheckCircle: () => null,
    XCircle: () => null,
    Truck: () => null,
    MapPin: () => null,
    Calendar: () => null,
    Filter: () => null,
}))

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
    address: null,
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

    it('muestra error cuando no hay comercio en la sesión (id_store null)', async () => {
        apiClient.get.mockResolvedValue({ data: { user: { id_store: null } } })

        render(<CommerceOrdersPage />)

        await waitFor(() => {
            expect(screen.getByText('No tenés un comercio registrado.')).toBeInTheDocument()
        })
    })

    it('muestra "No tenés pedidos en progreso." al cambiar a Seguimiento sin órdenes', async () => {
        apiClient.get.mockResolvedValue(mockSessionWithStore)
        fetchStoreOrders.mockResolvedValue(mockOrdersResponse)

        render(<CommerceOrdersPage />)

        await waitFor(() => screen.getByText('Pendientes'))

        await userEvent.click(screen.getByText('Seguimiento'))

        await waitFor(() => {
            expect(screen.getByText('No tenés pedidos en progreso.')).toBeInTheDocument()
        })
    })

    it('muestra el tab Historial con "Cargando historial..." mientras carga', async () => {
        apiClient.get.mockResolvedValue(mockSessionWithStore)
        fetchStoreOrders
            .mockResolvedValueOnce(mockOrdersResponse)
            .mockReturnValue(new Promise(() => {}))

        render(<CommerceOrdersPage />)

        await waitFor(() => screen.getByText('Historial'))
        await userEvent.click(screen.getByText('Historial'))

        await waitFor(() => {
            expect(screen.getByText('Cargando historial...')).toBeInTheDocument()
        })
    })

    it('muestra "No hay pedidos con esos filtros." en Historial cuando retorna vacío', async () => {
        apiClient.get.mockResolvedValue(mockSessionWithStore)
        fetchStoreOrders.mockResolvedValue({ ...mockOrdersResponse, orders: [], total: 0 })

        render(<CommerceOrdersPage />)

        await waitFor(() => screen.getByText('Historial'))
        await userEvent.click(screen.getByText('Historial'))

        await waitFor(() => {
            expect(screen.getByText('No hay pedidos con esos filtros.')).toBeInTheDocument()
        })
    })

    it('muestra pedidos en Historial cuando la API retorna datos', async () => {
        const historicalOrder = {
            ...mockPendingOrder,
            id: 10,
            status: 'DELIVERED',
            createdAt: new Date().toISOString(),
        }
        apiClient.get.mockResolvedValue(mockSessionWithStore)
        fetchStoreOrders.mockResolvedValue({
            orders: [historicalOrder],
            total: 1,
            page: 1,
            limit: 10,
            total_page: 1,
        })

        render(<CommerceOrdersPage />)

        await waitFor(() => screen.getByText('Historial'))
        await userEvent.click(screen.getByText('Historial'))

        await waitFor(() => {
            expect(screen.getByText('#OM-10')).toBeInTheDocument()
        })
    })

    it('muestra el botón "Asignar delivery" para pedidos con dirección', async () => {
        const orderWithAddress = {
            ...mockPendingOrder,
            id: 3,
            address: { city: 'Asunción', region: 'Central' },
        }
        apiClient.get.mockResolvedValue(mockSessionWithStore)
        fetchStoreOrders.mockResolvedValue({
            ...mockOrdersResponse,
            orders: [orderWithAddress],
        })

        render(<CommerceOrdersPage />)

        await waitFor(() => {
            expect(screen.getByText('Asignar delivery')).toBeInTheDocument()
        })
    })

    it('abre el modal de asignación al hacer clic en "Asignar delivery"', async () => {
        const orderWithAddress = {
            ...mockPendingOrder,
            id: 4,
            address: { city: 'Luque', region: 'Central' },
        }
        apiClient.get.mockResolvedValue(mockSessionWithStore)
        fetchStoreOrders.mockResolvedValue({
            ...mockOrdersResponse,
            orders: [orderWithAddress],
        })

        render(<CommerceOrdersPage />)

        await waitFor(() => screen.getByText('Asignar delivery'))
        await userEvent.click(screen.getByText('Asignar delivery'))

        await waitFor(() => {
            expect(screen.getByTestId('delivery-modal')).toBeInTheDocument()
        })
    })

    it('cierra el modal al hacer clic en cerrar', async () => {
        const orderWithAddress = {
            ...mockPendingOrder,
            id: 5,
            address: { city: 'Luque', region: 'Central' },
        }
        apiClient.get.mockResolvedValue(mockSessionWithStore)
        fetchStoreOrders.mockResolvedValue({
            ...mockOrdersResponse,
            orders: [orderWithAddress],
        })

        render(<CommerceOrdersPage />)

        await waitFor(() => screen.getByText('Asignar delivery'))
        await userEvent.click(screen.getByText('Asignar delivery'))
        await waitFor(() => screen.getByTestId('delivery-modal'))
        await userEvent.click(screen.getByText('Cerrar modal'))

        await waitFor(() => {
            expect(screen.queryByTestId('delivery-modal')).not.toBeInTheDocument()
        })
    })
})

describe('timeAgo', () => {
    it('retorna "hace unos segundos" para diferencias menores a 1 min', () => {
        const now = new Date(Date.now() - 30 * 1000).toISOString()
        expect(timeAgo(now)).toBe('hace unos segundos')
    })

    it('retorna "hace X min" para diferencias menores a 1 hora', () => {
        const now = new Date(Date.now() - 5 * 60 * 1000).toISOString()
        expect(timeAgo(now)).toBe('hace 5 min')
    })

    it('retorna "hace Xh" para diferencias menores a 24 horas', () => {
        const now = new Date(Date.now() - 3 * 3600 * 1000).toISOString()
        expect(timeAgo(now)).toBe('hace 3h')
    })

    it('retorna "hace X días" para diferencias de más de 24 horas', () => {
        const now = new Date(Date.now() - 2 * 86400 * 1000).toISOString()
        expect(timeAgo(now)).toBe('hace 2 días')
    })
})