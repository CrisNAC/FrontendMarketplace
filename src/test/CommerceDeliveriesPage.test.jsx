import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommerceDeliveriesPage } from '../features/commerces/pages/CommerceDeliveriesPage'

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/comercio/delivery' }),
    }
})

vi.mock('../hooks/useLogout', () => ({
    useLogout: () => vi.fn(),
}))

// apiClient para la sesión
vi.mock('../lib/apiClient', () => ({
    default: { get: vi.fn() },
}))

vi.mock('../features/commerces/services/commerceDeliveryApi', () => ({
    fetchStoreDeliveries: vi.fn(),
    deleteStoreDelivery: vi.fn(),
    getDeliveryErrorMessage: (_err, fallback) => fallback,
}))

import apiClient from '../lib/apiClient'
import {
    fetchStoreDeliveries,
    deleteStoreDelivery,
} from '../features/commerces/services/commerceDeliveryApi'

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const mockSession = {
    data: { user: { id_store: 1 } },
}

const mockDelivery1 = {
    id: 10,
    user: { id: 2, name: 'Juan Pérez', email: 'juan@delivery.com', phone: '+56912345678' },
    status: 'AVAILABLE',
    vehicleType: 'MOTORCYCLE',
    completedDeliveries: 156,
    successRate: 97.4,
    avgRating: 4.8,
    reviewCount: 3,
}

const mockDelivery2 = {
    id: 11,
    user: { id: 3, name: 'María González', email: 'maria@delivery.com', phone: '+56923456789' },
    status: 'IN_DELIVERY',
    vehicleType: 'CAR',
    completedDeliveries: 243,
    successRate: 99.2,
    avgRating: 4.9,
    reviewCount: 3,
}

const mockDelivery3 = {
    id: 12,
    user: { id: 4, name: 'Ana López', email: 'ana@delivery.com', phone: '+56945678901' },
    status: 'UNAVAILABLE',
    vehicleType: 'BICYCLE',
    completedDeliveries: 87,
    successRate: 97.0,
    avgRating: null,
    reviewCount: 0,
}

const mockData = {
    stats: { total: 3, available: 1, inDelivery: 1, avgRating: 4.8 },
    deliveries: [mockDelivery1, mockDelivery2, mockDelivery3],
}

const setupSuccess = () => {
    apiClient.get.mockResolvedValue(mockSession)
    fetchStoreDeliveries.mockResolvedValue(mockData)
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('CommerceDeliveriesPage', () => {
    beforeEach(() => vi.clearAllMocks())

    // ── Carga inicial ─────────────────────────────────────────────────────────
    describe('Carga inicial', () => {
        it('muestra spinner mientras carga', () => {
            apiClient.get.mockReturnValue(new Promise(() => { }))

            render(<CommerceDeliveriesPage />)

            expect(screen.queryByText('Gestión de Repartidores')).not.toBeInTheDocument()
        })

        it('muestra error si la sesión falla', async () => {
            apiClient.get.mockRejectedValueOnce(new Error('Network error'))

            render(<CommerceDeliveriesPage />)

            await waitFor(() => {
                expect(screen.getByText('No se pudo cargar la sesión.')).toBeInTheDocument()
            })
        })

        it('muestra error si el usuario no tiene comercio registrado', async () => {
            apiClient.get.mockResolvedValueOnce({ data: { user: { id_store: null } } })

            render(<CommerceDeliveriesPage />)

            await waitFor(() => {
                expect(screen.getByText('No tenés un comercio registrado.')).toBeInTheDocument()
            })
        })

        it('muestra error si fetchStoreDeliveries falla', async () => {
            apiClient.get.mockResolvedValue(mockSession)
            fetchStoreDeliveries.mockRejectedValueOnce(new Error('Server error'))

            render(<CommerceDeliveriesPage />)

            await waitFor(() => {
                expect(screen.getByText('No se pudieron cargar los repartidores.')).toBeInTheDocument()
            })
        })

        it('renderiza el encabezado y stats correctamente', async () => {
            setupSuccess()
            
            render(<CommerceDeliveriesPage />)
            
            await waitFor(() => {
                expect(screen.getByText('Gestión de Repartidores')).toBeInTheDocument()
            })
            
            expect(screen.getByText('Disponibles')).toBeInTheDocument()
            expect(screen.getByText('En Entrega')).toBeInTheDocument()
            expect(screen.getByText('Total Repartidores')).toBeInTheDocument()
            expect(screen.getByText('Rating Promedio')).toBeInTheDocument()

            expect(screen.getAllByText('1')).toHaveLength(2)
            expect(screen.getByText('3')).toBeInTheDocument()
            expect(screen.getAllByText('4.8')).toHaveLength(2)
        })
    })

    // ── Vista Cards ───────────────────────────────────────────────────────────
    describe('Vista Cards', () => {
        it('renderiza los nombres de los deliveries en vista cards (default)', async () => {
            setupSuccess()

            render(<CommerceDeliveriesPage />)

            await waitFor(() => {
                expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
            })

            expect(screen.getByText('María González')).toBeInTheDocument()
            expect(screen.getByText('Ana López')).toBeInTheDocument()
        })

        it('muestra los badges de estado correctamente', async () => {
            setupSuccess()

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getByText('Disponible'))

            expect(screen.getByText('Disponible')).toBeInTheDocument()
            expect(screen.getByText('En entrega')).toBeInTheDocument()
            expect(screen.getByText('No disponible')).toBeInTheDocument()
        })

        it('muestra "—" cuando avgRating es null', async () => {
            setupSuccess()

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getByText('Ana López'))

            // Ana López no tiene rating — debe mostrar —
            const dashes = screen.getAllByText('—')
            expect(dashes.length).toBeGreaterThan(0)
        })

        it('muestra el % de éxito correctamente', async () => {
            setupSuccess()

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getByText('97.4 %'))
            expect(screen.getByText('99.2 %')).toBeInTheDocument()
        })

        it('muestra EmptyState cuando no hay deliveries', async () => {
            apiClient.get.mockResolvedValue(mockSession)
            fetchStoreDeliveries.mockResolvedValueOnce({
                stats: { total: 0, available: 0, inDelivery: 0, avgRating: null },
                deliveries: [],
            })

            render(<CommerceDeliveriesPage />)

            await waitFor(() => {
                expect(screen.getByText('Todavía no agregaste repartidores')).toBeInTheDocument()
            })
        })
    })

    // ── Vista Tabla ───────────────────────────────────────────────────────────
    describe('Vista Tabla', () => {
        it('cambia a vista tabla al hacer clic en el botón Tabla', async () => {
            setupSuccess()

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getByText('Tabla'))
            fireEvent.click(screen.getByText('Tabla'))

            // Los headers de la tabla deben aparecer
            expect(screen.getByText('Nombre Completo')).toBeInTheDocument()
            expect(screen.getByText('Estado')).toBeInTheDocument()
            expect(screen.getByText('Teléfono')).toBeInTheDocument()
            expect(screen.getByText('Correo')).toBeInTheDocument()
            expect(screen.getByText('Entregas')).toBeInTheDocument()
            expect(screen.getByText('% Éxito')).toBeInTheDocument()
            expect(screen.getByText('Calificación')).toBeInTheDocument()
        })

        it('vuelve a vista cards al hacer clic en Cards', async () => {
            setupSuccess()

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getByText('Tabla'))
            fireEvent.click(screen.getByText('Tabla'))
            fireEvent.click(screen.getByText('Cards'))

            // En cards no existe el header "Nombre Completo"
            expect(screen.queryByText('Nombre Completo')).not.toBeInTheDocument()
            expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
        })
    })

    // ── Navegación ────────────────────────────────────────────────────────────
    describe('Navegación', () => {
        it('navega a /comercio/delivery/agregar al hacer clic en Agregar Delivery', async () => {
            setupSuccess()

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getByText('Agregar Delivery'))
            fireEvent.click(screen.getByText('Agregar Delivery'))

            expect(mockNavigate).toHaveBeenCalledWith('/comercio/delivery/agregar')
        })

        it('navega a la página de reseñas con el state correcto al hacer clic en Ver Reseñas', async () => {
            setupSuccess()

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getAllByText('Ver Reseñas'))
            fireEvent.click(screen.getAllByText('Ver Reseñas')[0])

            expect(mockNavigate).toHaveBeenCalledWith(
                '/comercio/deliveries/resenas',
                { state: { deliveryId: 10 } }
            )
        })

        it('navega a EmptyState y botón Agregar delivery funciona', async () => {
            apiClient.get.mockResolvedValue(mockSession)
            fetchStoreDeliveries.mockResolvedValueOnce({
                stats: { total: 0, available: 0, inDelivery: 0, avgRating: null },
                deliveries: [],
            })

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getByText('Agregar delivery'))
            fireEvent.click(screen.getByText('Agregar delivery'))

            expect(mockNavigate).toHaveBeenCalledWith('/comercio/delivery/agregar')
        })
    })

    // ── Modal de eliminación ──────────────────────────────────────────────────
    describe('Modal de eliminación', () => {
        it('abre el modal al hacer clic en Eliminar', async () => {
            setupSuccess()
            
            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getAllByText('Eliminar'))
            fireEvent.click(screen.getAllByText('Eliminar')[0])

            const modal = screen.getByText('Desvincular repartidor').closest('div')
            expect(screen.getByText('Desvincular repartidor')).toBeInTheDocument()
            expect(screen.getByText(/Desvincular a/)).toBeInTheDocument()
            expect(modal.querySelector('strong')).toHaveTextContent('Juan Pérez')
        })

        it('cierra el modal al hacer clic en Cancelar', async () => {
            setupSuccess()

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getAllByText('Eliminar'))
            fireEvent.click(screen.getAllByText('Eliminar')[0])

            expect(screen.getByText('Desvincular repartidor')).toBeInTheDocument()

            fireEvent.click(screen.getByText('Cancelar'))

            expect(screen.queryByText('Desvincular repartidor')).not.toBeInTheDocument()
        })

        it('llama a deleteStoreDelivery con los IDs correctos al confirmar', async () => {
            setupSuccess()
            deleteStoreDelivery.mockResolvedValueOnce()
            fetchStoreDeliveries.mockResolvedValue(mockData) // recarga

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getAllByText('Eliminar'))
            fireEvent.click(screen.getAllByText('Eliminar')[0])

            fireEvent.click(screen.getByText('Desvincular'))

            await waitFor(() => {
                expect(deleteStoreDelivery).toHaveBeenCalledWith(1, 10)
            })
        })

        it('muestra error inline si deleteStoreDelivery falla', async () => {
            setupSuccess()
            deleteStoreDelivery.mockRejectedValueOnce(new Error('Tiene entregas activas'))

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getAllByText('Eliminar'))
            fireEvent.click(screen.getAllByText('Eliminar')[0])
            fireEvent.click(screen.getByText('Desvincular'))

            await waitFor(() => {
                expect(screen.getByText('No se pudo desvincular el repartidor.')).toBeInTheDocument()
            })

            // El modal sigue abierto
            expect(screen.getByText('Desvincular repartidor')).toBeInTheDocument()
        })

        it('deshabilita botones del modal mientras desvincula', async () => {
            setupSuccess()
            deleteStoreDelivery.mockReturnValue(new Promise(() => { }))

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getAllByText('Eliminar'))
            fireEvent.click(screen.getAllByText('Eliminar')[0])
            fireEvent.click(screen.getByText('Desvincular'))

            await waitFor(() => {
                expect(screen.getByText('Desvinculando…')).toBeInTheDocument()
            })

            expect(screen.getByText('Cancelar')).toBeDisabled()
        })

        it('recarga la lista tras desvincular exitosamente', async () => {
            setupSuccess()
            deleteStoreDelivery.mockResolvedValueOnce()
            // Segunda carga sin el delivery eliminado
            fetchStoreDeliveries.mockResolvedValueOnce({
                stats: { total: 2, available: 1, inDelivery: 1, avgRating: 4.85 },
                deliveries: [mockDelivery2, mockDelivery3],
            })

            render(<CommerceDeliveriesPage />)

            await waitFor(() => screen.getAllByText('Eliminar'))
            fireEvent.click(screen.getAllByText('Eliminar')[0])
            fireEvent.click(screen.getByText('Desvincular'))

            await waitFor(() => {
                expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument()
            })

            expect(fetchStoreDeliveries).toHaveBeenCalledTimes(2)
        })
    })
})