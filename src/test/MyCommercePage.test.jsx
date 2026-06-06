/* eslint-disable react/prop-types */
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

vi.mock('lucide-react', () => ({
    Package: () => <span>Package</span>,
    Star: () => <span>Star</span>,
    MessageSquare: () => <span>MessageSquare</span>,
    Layers: () => <span>Layers</span>,
    AlertCircle: () => <span>AlertCircle</span>,
    Info: () => <span>Info</span>,
}))

vi.mock('../features/commerces/components/dashboard/Topbar', () => ({
    Topbar: ({ storeName }) => <div data-testid="topbar">{storeName}</div>,
}))

vi.mock('../features/commerces/components/dashboard/StatCard', () => ({
    StatCard: ({ title, value }) => <div data-testid="stat-card">{title}: {value}</div>,
}))

vi.mock('../features/commerces/components/dashboard/BestRatedSection', () => ({
    BestRatedSection: () => <div data-testid="best-rated">BestRated</div>,
}))

vi.mock('../features/commerces/components/dashboard/MostSoldSection', () => ({
    MostSoldSection: () => <div data-testid="most-sold">MostSold</div>,
}))

vi.mock('../features/commerces/components/dashboard/CollectionsSection', () => ({
    CollectionsSection: () => <div data-testid="collections">Collections</div>,
}))

vi.mock('../features/commerces/services/editCommerceApi', () => ({
    apiClient: { get: vi.fn() },
}))

import { MyCommercePage } from '../features/commerces/pages/MyCommercePage'
import { apiClient } from '../features/commerces/services/editCommerceApi'

const baseStore = {
    id_store: 5,
    name: 'Mi Comercio',
    store_status: 'ACTIVE',
    products: [{ id: 1 }, { id: 2 }],
}

function setupApiSuccess(storeOverrides = {}) {
    apiClient.get
        .mockResolvedValueOnce({ data: { user: { id_store: 5 } } })
        .mockResolvedValueOnce({ data: { ...baseStore, ...storeOverrides } })
}

describe('MyCommercePage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra "Cargando..." mientras carga', () => {
        apiClient.get.mockReturnValue(new Promise(() => {}))
        render(<MyCommercePage />)
        expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })

    it('muestra error cuando no hay id_store en la sesión', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { user: { id_store: null } } })
        render(<MyCommercePage />)
        await waitFor(() => {
            expect(screen.getByText('No tenés un comercio registrado.')).toBeInTheDocument()
        })
    })

    it('navega a /crear-comercio cuando el comercio no existe (404)', async () => {
        apiClient.get
            .mockResolvedValueOnce({ data: { user: { id_store: 5 } } })
            .mockRejectedValueOnce({ response: { status: 404 } })
        render(<MyCommercePage />)
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/crear-comercio')
        })
    })

    it('muestra mensaje de error genérico cuando falla la carga', async () => {
        apiClient.get
            .mockResolvedValueOnce({ data: { user: { id_store: 5 } } })
            .mockRejectedValueOnce({ response: { status: 500, data: { message: 'Error interno' } } })
        render(<MyCommercePage />)
        await waitFor(() => {
            expect(screen.getByText('Error interno')).toBeInTheDocument()
        })
    })

    it('muestra "No se pudo cargar el comercio." con error sin mensaje', async () => {
        apiClient.get
            .mockResolvedValueOnce({ data: { user: { id_store: 5 } } })
            .mockRejectedValueOnce({ response: { status: 500 } })
        render(<MyCommercePage />)
        await waitFor(() => {
            expect(screen.getByText('No se pudo cargar el comercio.')).toBeInTheDocument()
        })
    })

    it('muestra el Topbar con el nombre del comercio', async () => {
        setupApiSuccess()
        render(<MyCommercePage />)
        await waitFor(() => {
            expect(screen.getByTestId('topbar')).toHaveTextContent('Mi Comercio')
        })
    })

    it('muestra las StatCards de estadísticas', async () => {
        setupApiSuccess()
        render(<MyCommercePage />)
        await waitFor(() => {
            expect(screen.getByText('Productos Activos: 2')).toBeInTheDocument()
        })
    })

    it('muestra las secciones BestRated y MostSold', async () => {
        setupApiSuccess()
        render(<MyCommercePage />)
        await waitFor(() => {
            expect(screen.getByTestId('best-rated')).toBeInTheDocument()
            expect(screen.getByTestId('most-sold')).toBeInTheDocument()
        })
    })

    it('muestra la sección Collections', async () => {
        setupApiSuccess()
        render(<MyCommercePage />)
        await waitFor(() => {
            expect(screen.getByTestId('collections')).toBeInTheDocument()
        })
    })

    it('muestra banner "Comercio en revisión" cuando store_status es INACTIVE', async () => {
        setupApiSuccess({ store_status: 'INACTIVE' })
        render(<MyCommercePage />)
        await waitFor(() => {
            expect(screen.getByText('Comercio en revisión')).toBeInTheDocument()
        })
    })

    it('muestra banner "Comercio no aprobado o suspendido" cuando store_status es SUSPENDED', async () => {
        setupApiSuccess({ store_status: 'SUSPENDED' })
        render(<MyCommercePage />)
        await waitFor(() => {
            expect(screen.getByText('Comercio no aprobado o suspendido')).toBeInTheDocument()
        })
    })

    it('no muestra banners de estado cuando el comercio está ACTIVE', async () => {
        setupApiSuccess()
        render(<MyCommercePage />)
        await waitFor(() => screen.getByTestId('topbar'))
        expect(screen.queryByText('Comercio en revisión')).not.toBeInTheDocument()
        expect(screen.queryByText('Comercio no aprobado o suspendido')).not.toBeInTheDocument()
    })
})
