/* eslint-disable react/prop-types */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: '1' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

vi.mock('react-hot-toast', () => ({
    default: { error: vi.fn(), success: vi.fn() },
    toast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('lucide-react', () => ({
    AlertTriangle: () => null, Box: () => null, MessageSquareWarning: () => null,
    ShoppingCart: () => null, Store: () => null, TrendingUp: () => null,
    UserRound: () => null, Users: () => null, Search: () => null,
    Shield: () => null, Truck: () => null, Eye: () => null,
    Check: () => null, X: () => <span>X</span>, Tag: () => null,
    Package: () => null, Pencil: () => null, Plus: () => null,
    CheckCircle: () => null, XCircle: () => null, Clock: () => null,
    Trash2: () => null, ArrowLeft: () => null, EyeOff: () => null,
    Flag: () => null, Calendar: () => null, MessageSquare: () => null,
}))

vi.mock('../features/admin/services/adminDashboardApi', () => ({
    fetchAdminDashboardStats: vi.fn(),
    fetchAdminRecentActivity: vi.fn(),
}))

vi.mock('../features/admin/services/adminUsersApi', () => ({
    fetchAdminUsers: vi.fn(),
    fetchPendingStores: vi.fn(),
    approveStore: vi.fn(),
    rejectStore: vi.fn(),
}))

vi.mock('../features/admin/services/adminCategoriesApi', () => ({
    fetchCategoriesWithProducts: vi.fn(),
    fetchAdminCategoryById: vi.fn(),
    updateAdminCategory: vi.fn(),
    deleteAdminCategory: vi.fn(),
    createAdminCategory: vi.fn(),
}))

vi.mock('../features/admin/services/adminProductsApi', () => ({
    fetchAdminProducts: vi.fn(),
    approveProduct: vi.fn(),
    rejectProduct: vi.fn(),
}))

vi.mock('../features/reports/ProductClaimsPanel', () => ({
    default: () => <div>ProductClaimsPanel</div>,
}))

vi.mock('../features/reports/ReviewReportsPanel', () => ({
    default: () => <div>ReviewReportsPanel</div>,
}))

import { fetchAdminDashboardStats, fetchAdminRecentActivity } from '../features/admin/services/adminDashboardApi'
import { fetchAdminUsers, fetchPendingStores } from '../features/admin/services/adminUsersApi'
import { fetchCategoriesWithProducts, fetchAdminCategoryById } from '../features/admin/services/adminCategoriesApi'
import { fetchAdminProducts } from '../features/admin/services/adminProductsApi'
import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage'
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage'
import { AdminPendingStoresPage } from '../features/admin/pages/AdminPendingStoresPage'
import { AdminCategoriesPage } from '../features/admin/pages/AdminCategoriesPage'
import { AdminCategoryDetailPage } from '../features/admin/pages/AdminCategoryDetailPage'
import { AdminProductsPage } from '../features/admin/pages/AdminProductsPage'
import { AdminModulePlaceholderPage } from '../features/admin/pages/AdminModulePlaceholderPage'
import ModeracionResenas from '../features/admin/pages/ReclamosPage'
import ReclamosList from '../features/admin/pages/Reclamos'

const mockStats = {
    totalUsers: 100, activeBuyers: 50, registeredCommerces: 20,
    pendingProducts: 5, pendingReviews: 3, pendingCommerces: 2, pendingProductReports: 1,
}

// ─── AdminModulePlaceholderPage ───────────────────────────────────────────────
describe('AdminModulePlaceholderPage', () => {
    it('renderiza el título y descripción', () => {
        render(<AdminModulePlaceholderPage title="Módulo Test" description="Descripción del módulo" />)
        expect(screen.getByText('Módulo Test')).toBeInTheDocument()
        expect(screen.getByText('Descripción del módulo')).toBeInTheDocument()
    })

    it('renderiza sin props (sin error)', () => {
        render(<AdminModulePlaceholderPage />)
        expect(screen.getByText(/listo para recibir/i)).toBeInTheDocument()
    })
})

// ─── AdminDashboardPage ───────────────────────────────────────────────────────
describe('AdminDashboardPage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('muestra indicadores de carga mientras espera', () => {
        fetchAdminDashboardStats.mockReturnValue(new Promise(() => {}))
        fetchAdminRecentActivity.mockReturnValue(new Promise(() => {}))
        render(<AdminDashboardPage />)
        expect(screen.getAllByText('...').length).toBeGreaterThan(0)
    })

    it('muestra stats al cargar correctamente', async () => {
        fetchAdminDashboardStats.mockResolvedValue(mockStats)
        fetchAdminRecentActivity.mockResolvedValue([])
        render(<AdminDashboardPage />)
        await waitFor(() => {
            expect(screen.getByText('Total Usuarios')).toBeInTheDocument()
        })
        expect(screen.getByText('Compradores Activos')).toBeInTheDocument()
    })

    it('muestra "Aun no hay actividad" cuando actividad está vacía', async () => {
        fetchAdminDashboardStats.mockResolvedValue(mockStats)
        fetchAdminRecentActivity.mockResolvedValue([])
        render(<AdminDashboardPage />)
        await waitFor(() => {
            expect(screen.getByText(/Aun no hay actividad/i)).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga', async () => {
        fetchAdminDashboardStats.mockRejectedValue(new Error('Error'))
        fetchAdminRecentActivity.mockRejectedValue(new Error('Error'))
        render(<AdminDashboardPage />)
        await waitFor(() => {
            expect(screen.getByText(/No se pudo cargar el dashboard/i)).toBeInTheDocument()
        })
    })
})

// ─── AdminUsersPage ───────────────────────────────────────────────────────────
describe('AdminUsersPage', () => {
    beforeEach(() => vi.clearAllMocks())

    const mockUsersResponse = {
        data: [{ id_user: 1, name: 'Juan Test', email: 'juan@test.com', role: 'CUSTOMER', is_active: true }],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
    }

    it('muestra usuarios al cargar correctamente', async () => {
        fetchAdminUsers.mockResolvedValue(mockUsersResponse)
        render(<AdminUsersPage />)
        await waitFor(() => {
            expect(screen.getByText('juan@test.com')).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga', async () => {
        fetchAdminUsers.mockRejectedValue({ response: { data: { error: { message: 'Error al cargar los usuarios.' } } } })
        render(<AdminUsersPage />)
        await waitFor(() => {
            expect(screen.getByText(/Error al cargar/i)).toBeInTheDocument()
        })
    })

    it('muestra "No se encontraron usuarios" cuando lista vacía', async () => {
        fetchAdminUsers.mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } })
        render(<AdminUsersPage />)
        await waitFor(() => {
            expect(screen.getByText(/No se encontraron usuarios/i)).toBeInTheDocument()
        })
    })
})

// ─── AdminPendingStoresPage ───────────────────────────────────────────────────
describe('AdminPendingStoresPage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('muestra "Cargando comercios pendientes" durante la carga', async () => {
        fetchPendingStores.mockReturnValue(new Promise(() => {}))
        render(<AdminPendingStoresPage />)
        await waitFor(() => {
            expect(screen.getByText(/Cargando comercios pendientes/i)).toBeInTheDocument()
        })
    })

    it('muestra comercios pendientes cuando la API responde', async () => {
        fetchPendingStores.mockResolvedValue({
            data: [{ id_store: 1, name: 'Tienda Pendiente', status: 'PENDING', logo: null, description: 'Desc', category: 'Cat' }],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        })
        render(<AdminPendingStoresPage />)
        await waitFor(() => {
            expect(screen.getByText('Tienda Pendiente')).toBeInTheDocument()
        })
    })

    it('muestra "No hay solicitudes" cuando lista vacía', async () => {
        fetchPendingStores.mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })
        render(<AdminPendingStoresPage />)
        await waitFor(() => {
            expect(screen.getByText(/No hay solicitudes de comercios/i)).toBeInTheDocument()
        })
    })
})

const mockCatResponse = (data = []) => ({
    data,
    categoryTotal: data.length,
    categoryPage: 1,
    categoryLimit: 20,
    categoryTotalPages: 1,
})

// ─── AdminCategoriesPage ─────────────────────────────────────────────────────
describe('AdminCategoriesPage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('muestra categorías cuando la API responde', async () => {
        fetchCategoriesWithProducts.mockResolvedValue(
            mockCatResponse([{ id: 1, name: 'Electrónica', visible: true, products: [] }])
        )
        render(<AdminCategoriesPage />)
        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga', async () => {
        fetchCategoriesWithProducts.mockRejectedValue(new Error('Error'))
        render(<AdminCategoriesPage />)
        await waitFor(() => {
            expect(screen.getByText(/Error al cargar/i)).toBeInTheDocument()
        })
    })

    it('muestra "No se encontraron categorías" cuando lista está vacía', async () => {
        fetchCategoriesWithProducts.mockResolvedValue(mockCatResponse([]))
        render(<AdminCategoriesPage />)
        await waitFor(() => {
            expect(screen.getByText(/No se encontraron categorías/i)).toBeInTheDocument()
        })
    })
})

// ─── AdminCategoryDetailPage ──────────────────────────────────────────────────
describe('AdminCategoryDetailPage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('muestra detalle de categoría al cargar', async () => {
        fetchAdminCategoryById.mockResolvedValue({ id: 1, name: 'Electrónica', visible: true })
        fetchCategoriesWithProducts.mockResolvedValue(mockCatResponse([]))
        render(<AdminCategoryDetailPage />)
        await waitFor(() => {
            expect(screen.getAllByText('Electrónica').length).toBeGreaterThan(0)
        })
    })

    it('muestra estado de carga mientras espera', () => {
        fetchAdminCategoryById.mockReturnValue(new Promise(() => {}))
        fetchCategoriesWithProducts.mockReturnValue(new Promise(() => {}))
        render(<AdminCategoryDetailPage />)
        expect(screen.getByText(/Cargando/i)).toBeInTheDocument()
    })

    it('muestra error cuando falla la carga', async () => {
        fetchAdminCategoryById.mockRejectedValue(new Error('Error'))
        fetchCategoriesWithProducts.mockResolvedValue(mockCatResponse([]))
        render(<AdminCategoryDetailPage />)
        await waitFor(() => {
            expect(screen.getByText(/No se pudo cargar/i)).toBeInTheDocument()
        })
    })
})

// ─── AdminProductsPage ────────────────────────────────────────────────────────
describe('AdminProductsPage', () => {
    beforeEach(() => vi.clearAllMocks())

    const mockProduct = {
        id: 1, name: 'Producto Test', approvalStatus: 'PENDING',
        image_url: null, price: 10000,
        store: { name: 'Tienda Test' },
        category: { name: 'Categoría Test' },
        createdAt: new Date().toISOString(),
    }

    it('muestra productos pendientes al cargar', async () => {
        fetchAdminProducts.mockResolvedValue({ data: [mockProduct], pagination: { total: 1, page: 1, limit: 20, totalPages: 1 } })
        render(<AdminProductsPage />)
        await waitFor(() => {
            expect(screen.getByText('Producto Test')).toBeInTheDocument()
        })
    })

    it('muestra "No hay productos" cuando lista vacía', async () => {
        fetchAdminProducts.mockResolvedValue({ data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } })
        render(<AdminProductsPage />)
        await waitFor(() => {
            expect(screen.getByText(/No hay productos/i)).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga', async () => {
        fetchAdminProducts.mockRejectedValue(new Error('Error'))
        render(<AdminProductsPage />)
        await waitFor(() => {
            expect(screen.getByText(/Error al cargar los productos/i)).toBeInTheDocument()
        })
    })
})

// ─── ReclamosPage ─────────────────────────────────────────────────────────────
describe('ReclamosPage (ModeracionResenas)', () => {
    it('renderiza el título de moderación', () => {
        render(<ModeracionResenas />)
        expect(screen.getByText(/Moderación de reseñas/i)).toBeInTheDocument()
    })

    it('muestra los tabs de Reseñas y Reclamos', () => {
        render(<ModeracionResenas />)
        expect(screen.getByRole('button', { name: /Reseñas reportadas/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Reclamos/i })).toBeInTheDocument()
    })

    it('cambia al tab de Reclamos al hacer clic', async () => {
        render(<ModeracionResenas />)
        const reclamosBtn = screen.getByRole('button', { name: /Reclamos de producto/i })
        await userEvent.click(reclamosBtn)
        expect(screen.getByText('ProductClaimsPanel')).toBeInTheDocument()
    })
})

// ─── Reclamos (ReclamosList) ──────────────────────────────────────────────────
describe('ReclamosList', () => {
    it('renderiza "Reclamos de usuarios"', () => {
        render(<ReclamosList />)
        expect(screen.getByText('Reclamos de usuarios')).toBeInTheDocument()
    })

    it('renderiza el panel de reclamos', () => {
        render(<ReclamosList />)
        expect(screen.getByText('ProductClaimsPanel')).toBeInTheDocument()
    })
})
