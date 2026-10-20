/* eslint-disable react/prop-types */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommerceProfilePage } from '../features/commerces/pages/CommerceProfilePage'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

vi.mock('lucide-react', () => ({
    Edit: () => <span>Edit</span>,
    Mail: () => <span>Mail</span>,
    Phone: () => <span>Phone</span>,
    MapPin: () => <span>MapPin</span>,
    Calendar: () => <span>Calendar</span>,
    Star: () => <span>Star</span>,
    Zap: () => <span>Zap</span>,
    Image: () => <span>Image</span>,
    Trash2: () => <span>Trash2</span>,
    AlertTriangle: () => <span>AlertTriangle</span>,
    Globe: () => <span>Globe</span>,
    Instagram: () => <span>Instagram</span>,
    Music2: () => <span>Music2</span>,
    ToggleLeft: () => <span>ToggleLeft</span>,
    ToggleRight: () => <span>ToggleRight</span>,
}))

vi.mock('../features/commerces/services/editCommerceApi', () => ({
    apiClient: { get: vi.fn(), delete: vi.fn() },
    getBackendErrorMessage: (_err, fallback) => fallback,
    updateStoreStatus: vi.fn(),
}))

import { apiClient, updateStoreStatus } from '../features/commerces/services/editCommerceApi'

const mockSession = { data: { user: { id_store: 5 } } }

const mockActiveCommerce = {
    data: {
        id_store: 5,
        name: 'Comercio Test',
        store_status: 'ACTIVE',
        status: true,
        email: 'test@test.com',
        phone: '0981000000',
        description: 'Descripción test',
        store_category: { name: 'Tecnología' },
        addresses: [{ address: 'Calle 1', city: 'Asunción', region: 'Central' }],
        created_at: new Date().toISOString(),
        average_rating: 4.5,
        total_reviews: 20,
    }
}

const mockInactiveCommerce = {
    data: { ...mockActiveCommerce.data, store_status: 'INACTIVE' }
}

function setupActive() {
    apiClient.get
        .mockResolvedValueOnce(mockSession)
        .mockResolvedValueOnce(mockActiveCommerce)
}

describe('CommerceProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra "Cargando..." mientras carga', () => {
        apiClient.get.mockReturnValue(new Promise(() => {}))
        render(<CommerceProfilePage />)
        expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })

    it('muestra error cuando falla la sesión', async () => {
        apiClient.get.mockRejectedValueOnce(new Error('Error de sesión'))
        render(<CommerceProfilePage />)
        await waitFor(() => {
            expect(screen.getByText('No se pudo cargar el perfil.')).toBeInTheDocument()
        })
    })

    it('muestra error cuando no hay comercio registrado', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { user: { id_store: null } } })
        render(<CommerceProfilePage />)
        await waitFor(() => {
            expect(screen.getByText('No se pudo cargar el perfil.')).toBeInTheDocument()
        })
    })

    it('muestra badge "Activo" cuando el comercio está ACTIVE', async () => {
        setupActive()
        render(<CommerceProfilePage />)
        await waitFor(() => {
            expect(screen.getByText('Activo')).toBeInTheDocument()
        })
    })

    it('muestra badge "Inactivo" cuando el comercio está INACTIVE', async () => {
        apiClient.get
            .mockResolvedValueOnce(mockSession)
            .mockResolvedValueOnce(mockInactiveCommerce)
        render(<CommerceProfilePage />)
        await waitFor(() => {
            expect(screen.getByText('Inactivo')).toBeInTheDocument()
        })
        expect(screen.getByText('Habilitar Comercio')).toBeInTheDocument()
    })

    it.each([
        ['nombre',    'Comercio Test'],
        ['email',     'test@test.com'],
        ['teléfono',  '0981000000'],
        ['categoría', 'Tecnología'],
    ])('muestra el %s del comercio', async (_, text) => {
        setupActive()
        render(<CommerceProfilePage />)
        await waitFor(() => {
            expect(screen.getByText(text)).toBeInTheDocument()
        })
    })

    it('muestra el modal de confirmación al hacer clic en "Deshabilitar Comercio"', async () => {
        setupActive()
        render(<CommerceProfilePage />)
        await waitFor(() => screen.getByText('Deshabilitar Comercio'))
        await userEvent.click(screen.getByText('Deshabilitar Comercio'))
        expect(screen.getByText('¿Deshabilitar comercio?')).toBeInTheDocument()
        expect(screen.getByText(/Tus productos dejarán de ser visibles/)).toBeInTheDocument()
    })

    it('llama a updateStoreStatus con INACTIVE al confirmar deshabilitar', async () => {
        setupActive()
        updateStoreStatus.mockResolvedValue({ success: true })
        render(<CommerceProfilePage />)
        await waitFor(() => screen.getByText('Deshabilitar Comercio'))
        await userEvent.click(screen.getByText('Deshabilitar Comercio'))
        await userEvent.click(screen.getByText('Deshabilitar'))
        expect(updateStoreStatus).toHaveBeenCalledWith(5, 'INACTIVE')
    })

    it('llama a updateStoreStatus con ACTIVE al confirmar habilitar', async () => {
        apiClient.get
            .mockResolvedValueOnce(mockSession)
            .mockResolvedValueOnce(mockInactiveCommerce)
        updateStoreStatus.mockResolvedValue({ success: true })
        render(<CommerceProfilePage />)
        await waitFor(() => screen.getByText('Habilitar Comercio'))
        await userEvent.click(screen.getByText('Habilitar Comercio'))
        await userEvent.click(screen.getByText('Habilitar'))
        expect(updateStoreStatus).toHaveBeenCalledWith(5, 'ACTIVE')
    })

    it('muestra modal de eliminación al hacer clic en "Eliminar Comercio"', async () => {
        setupActive()
        render(<CommerceProfilePage />)
        await waitFor(() => screen.getByText('Eliminar Comercio'))
        await userEvent.click(screen.getByText('Eliminar Comercio'))
        expect(screen.getByText('¿Eliminar comercio?')).toBeInTheDocument()
    })

    it('llama a apiClient.delete al confirmar eliminación', async () => {
        setupActive()
        apiClient.delete.mockResolvedValue({})
        render(<CommerceProfilePage />)
        await waitFor(() => screen.getByText('Eliminar Comercio'))
        await userEvent.click(screen.getByText('Eliminar Comercio'))
        const deleteBtns = screen.getAllByText('Eliminar Comercio')
        await userEvent.click(deleteBtns[deleteBtns.length - 1])
        await waitFor(() => {
            expect(apiClient.delete).toHaveBeenCalledWith('/api/commerces/5')
        })
    })

    it('muestra error de toggle cuando falla el cambio de estado', async () => {
        setupActive()
        updateStoreStatus.mockRejectedValue(new Error('Error de red'))
        render(<CommerceProfilePage />)
        await waitFor(() => screen.getByText('Deshabilitar Comercio'))
        await userEvent.click(screen.getByText('Deshabilitar Comercio'))
        await userEvent.click(screen.getByText('Deshabilitar'))
        await waitFor(() => {
            expect(screen.getByText('No se pudo cambiar el estado del comercio.')).toBeInTheDocument()
        })
    })

    it('cierra el modal de toggle al hacer clic en Cancelar', async () => {
        setupActive()
        render(<CommerceProfilePage />)
        await waitFor(() => screen.getByText('Deshabilitar Comercio'))
        await userEvent.click(screen.getByText('Deshabilitar Comercio'))
        expect(screen.getByText('¿Deshabilitar comercio?')).toBeInTheDocument()
        await userEvent.click(screen.getByText('Cancelar'))
        await waitFor(() => {
            expect(screen.queryByText('¿Deshabilitar comercio?')).not.toBeInTheDocument()
        })
    })
})
