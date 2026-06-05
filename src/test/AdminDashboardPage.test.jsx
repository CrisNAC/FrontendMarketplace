import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

vi.mock('../features/admin/services/adminDashboardApi', () => ({
    fetchAdminDashboardStats: vi.fn(),
    fetchAdminRecentActivity: vi.fn(),
}))

import { fetchAdminDashboardStats, fetchAdminRecentActivity } from '../features/admin/services/adminDashboardApi'
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage'

const mockStats = {
    totalUsers: 150,
    activeBuyers: 80,
    registeredCommerces: 25,
    pendingProducts: 3,
    pendingReviews: 2,
    pendingCommerces: 5,
    pendingProductReports: 0,
}

const mockActivity = [
    {
        id: 'info-customer-1',
        type: 'info',
        label: 'info',
        description: 'Nuevo comprador registrado',
        detail: 'Juan Pérez',
        dateMs: Date.now() - 60000,
    },
    {
        id: 'warning-product-2',
        type: 'warning',
        label: 'warning',
        description: 'Producto pendiente de aprobación',
        detail: 'Mouse Gamer',
        dateMs: Date.now() - 3600000,
    },
]

describe('AdminDashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchAdminDashboardStats.mockResolvedValue(mockStats)
        fetchAdminRecentActivity.mockResolvedValue(mockActivity)
    })

    it('muestra el título del dashboard', async () => {
        render(<AdminDashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument()
        })
    })

    it('muestra "..." mientras carga', () => {
        fetchAdminDashboardStats.mockReturnValue(new Promise(() => {}))
        fetchAdminRecentActivity.mockReturnValue(new Promise(() => {}))

        render(<AdminDashboardPage />)

        const loadingIndicators = screen.getAllByText('...')
        expect(loadingIndicators.length).toBeGreaterThan(0)
    })

    it('renderiza las tarjetas de estadísticas con valores', async () => {
        render(<AdminDashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('Total Usuarios')).toBeInTheDocument()
        })

        expect(screen.getByText('Compradores Activos')).toBeInTheDocument()
        expect(screen.getByText('Comercios Registrados')).toBeInTheDocument()
        expect(screen.getByText('Productos Pendientes')).toBeInTheDocument()
    })

    it('muestra la actividad reciente', async () => {
        render(<AdminDashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('Actividad Reciente')).toBeInTheDocument()
        })

        expect(screen.getByText('Nuevo comprador registrado')).toBeInTheDocument()
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
        expect(screen.getByText('Producto pendiente de aprobación')).toBeInTheDocument()
    })

    it('muestra las tareas pendientes', async () => {
        render(<AdminDashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('Tareas Pendientes')).toBeInTheDocument()
        })

        expect(screen.getByText('Productos sospechosos')).toBeInTheDocument()
        expect(screen.getByText('Reseñas reportadas')).toBeInTheDocument()
        expect(screen.getByText('Comercios por aprobar')).toBeInTheDocument()
    })

    it.each([
        [3, /3 compradores reportaron productos/],
        [1, /Un comprador reportó un producto/],
    ])('muestra mensaje para %i reporte(s) de productos', async (count, pattern) => {
        fetchAdminDashboardStats.mockResolvedValue({ ...mockStats, pendingProductReports: count })
        render(<AdminDashboardPage />)
        await waitFor(() => {
            expect(screen.getByText('Hay reportes de productos pendientes')).toBeInTheDocument()
        })
        expect(screen.getByText(pattern)).toBeInTheDocument()
    })

    it('no muestra alerta cuando no hay reportes de productos', async () => {
        render(<AdminDashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('Total Usuarios')).toBeInTheDocument()
        })

        expect(screen.queryByText('Hay reportes de productos pendientes')).not.toBeInTheDocument()
    })

    it('muestra error cuando falla la carga', async () => {
        fetchAdminDashboardStats.mockRejectedValue(new Error('Error de red'))

        render(<AdminDashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('No se pudo cargar el dashboard.')).toBeInTheDocument()
        })
    })

    it('navega al hacer clic en una tarjeta con link', async () => {
        render(<AdminDashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('Total Usuarios')).toBeInTheDocument()
        })

        const cards = screen.getAllByTitle('Abrir gestión de usuarios con este filtro')
        await userEvent.click(cards[0])

        expect(mockNavigate).toHaveBeenCalledWith('/admin/usuarios')
    })

    it('muestra mensaje de no actividad cuando la lista está vacía', async () => {
        fetchAdminRecentActivity.mockResolvedValue([])

        render(<AdminDashboardPage />)

        await waitFor(() => {
            expect(screen.getByText('Aun no hay actividad disponible para mostrar.')).toBeInTheDocument()
        })
    })
})
