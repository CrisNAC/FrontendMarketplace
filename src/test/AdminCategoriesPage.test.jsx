import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

vi.mock('../features/admin/services/adminCategoriesApi', () => ({
    fetchCategoriesWithProducts: vi.fn(),
    createAdminCategory: vi.fn(),
    updateAdminCategory: vi.fn(),
    deleteAdminCategory: vi.fn(),
}))

import {
    fetchCategoriesWithProducts,
    createAdminCategory,
    deleteAdminCategory,
} from '../features/admin/services/adminCategoriesApi'
import { AdminCategoriesPage } from '../features/admin/pages/AdminCategoriesPage'

const mockCategory = {
    id: 1,
    name: 'Electrónica',
    visible: true,
    status: true,
    productCount: 5,
    products: [],
    createdAt: new Date().toISOString(),
}

const mockCategoriesResponse = {
    data: [mockCategory],
    categoryTotal: 1,
    categoryPage: 1,
    categoryLimit: 20,
    categoryTotalPages: 1,
}

const emptyResponse = {
    data: [],
    categoryTotal: 0,
    categoryPage: 1,
    categoryLimit: 20,
    categoryTotalPages: 1,
}

describe('AdminCategoriesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchCategoriesWithProducts.mockResolvedValue(mockCategoriesResponse)
    })

    it('muestra el título de gestión de categorías', async () => {
        render(<AdminCategoriesPage />)

        await waitFor(() => {
            expect(screen.getByText('Gestión de Categorías')).toBeInTheDocument()
        })
    })

    it('muestra "Cargando categorías..." durante la carga', () => {
        fetchCategoriesWithProducts.mockReturnValue(new Promise(() => {}))

        render(<AdminCategoriesPage />)

        expect(screen.getByText('Cargando categorías...')).toBeInTheDocument()
    })

    it('renderiza las categorías cuando la carga es exitosa', async () => {
        render(<AdminCategoriesPage />)

        await waitFor(() => {
            expect(screen.getByText('Electrónica')).toBeInTheDocument()
        })

        // El span de estado dentro de la CategoryRow
        const visibleBadges = screen.getAllByText('Visible')
        expect(visibleBadges.length).toBeGreaterThan(0)
        expect(screen.getByText('Activa')).toBeInTheDocument()
    })

    it('muestra "No se encontraron categorías" cuando la lista está vacía', async () => {
        fetchCategoriesWithProducts.mockResolvedValue(emptyResponse)

        render(<AdminCategoriesPage />)

        await waitFor(() => {
            expect(screen.getByText('No se encontraron categorías con los filtros seleccionados.')).toBeInTheDocument()
        })
    })

    it('muestra el error cuando falla la carga', async () => {
        fetchCategoriesWithProducts.mockRejectedValue({
            response: { data: { message: 'Error de servidor' } }
        })

        render(<AdminCategoriesPage />)

        await waitFor(() => {
            expect(screen.getByText('Error de servidor')).toBeInTheDocument()
        })
    })

    it('abre el modal de creación al hacer clic en "Nueva Categoría"', async () => {
        render(<AdminCategoriesPage />)

        await waitFor(() => expect(screen.getByText('Electrónica')).toBeInTheDocument())

        await userEvent.click(screen.getByText('Nueva Categoría'))

        expect(screen.getByText('Nueva Categoría', { selector: 'h3' })).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Ej: Electrónica')).toBeInTheDocument()
    })

    it('cierra el modal de creación al hacer clic en Cancelar', async () => {
        render(<AdminCategoriesPage />)

        await waitFor(() => expect(screen.getByText('Electrónica')).toBeInTheDocument())

        await userEvent.click(screen.getByText('Nueva Categoría'))
        await userEvent.click(screen.getByText('Cancelar'))

        await waitFor(() => {
            expect(screen.queryByPlaceholderText('Ej: Electrónica')).not.toBeInTheDocument()
        })
    })

    it('muestra error en el modal cuando el nombre está vacío', async () => {
        render(<AdminCategoriesPage />)

        await waitFor(() => expect(screen.getByText('Electrónica')).toBeInTheDocument())

        await userEvent.click(screen.getByText('Nueva Categoría'))
        await userEvent.click(screen.getByText('Crear Categoría'))

        expect(screen.getByText('El nombre es requerido.')).toBeInTheDocument()
    })

    it('crea la categoría al enviar el formulario correctamente', async () => {
        createAdminCategory.mockResolvedValueOnce({ id: 2, name: 'Ropa' })
        fetchCategoriesWithProducts.mockResolvedValue({
            ...mockCategoriesResponse,
            data: [mockCategory, { id: 2, name: 'Ropa', visible: true, status: true, productCount: 0 }],
        })

        render(<AdminCategoriesPage />)

        await waitFor(() => expect(screen.getByText('Electrónica')).toBeInTheDocument())

        await userEvent.click(screen.getByText('Nueva Categoría'))
        await userEvent.type(screen.getByPlaceholderText('Ej: Electrónica'), 'Ropa')
        await userEvent.click(screen.getByText('Crear Categoría'))

        await waitFor(() => {
            expect(createAdminCategory).toHaveBeenCalledWith('Ropa')
        })
    })

    it('abre el modal de edición al hacer clic en "Editar categoría"', async () => {
        render(<AdminCategoriesPage />)

        await waitFor(() => expect(screen.getByText('Electrónica')).toBeInTheDocument())

        await userEvent.click(screen.getByTitle('Editar categoría'))

        expect(screen.getByText('Editar Categoría')).toBeInTheDocument()
    })

    it('abre el modal de eliminación al hacer clic en "Eliminar categoría"', async () => {
        render(<AdminCategoriesPage />)

        await waitFor(() => expect(screen.getByText('Electrónica')).toBeInTheDocument())

        await userEvent.click(screen.getByTitle('Eliminar categoría'))

        expect(screen.getByText('¿Eliminar categoría?')).toBeInTheDocument()
        expect(screen.getByText(/"Electrónica"/)).toBeInTheDocument()
    })

    it('elimina la categoría al confirmar en el modal de eliminación', async () => {
        deleteAdminCategory.mockResolvedValueOnce(undefined)
        fetchCategoriesWithProducts.mockResolvedValueOnce(mockCategoriesResponse)
            .mockResolvedValueOnce(emptyResponse)

        render(<AdminCategoriesPage />)

        await waitFor(() => expect(screen.getByText('Electrónica')).toBeInTheDocument())

        await userEvent.click(screen.getByTitle('Eliminar categoría'))
        await userEvent.click(screen.getByText('Eliminar'))

        await waitFor(() => {
            expect(deleteAdminCategory).toHaveBeenCalledWith(1)
        })
    })

    it('cambia al tab de Solicitudes pendientes', async () => {
        fetchCategoriesWithProducts
            .mockResolvedValueOnce(mockCategoriesResponse)
            .mockResolvedValueOnce(emptyResponse)

        render(<AdminCategoriesPage />)

        await waitFor(() => expect(screen.getByText('Electrónica')).toBeInTheDocument())

        await userEvent.click(screen.getByText('Solicitudes pendientes'))

        await waitFor(() => {
            expect(screen.getByText('No hay solicitudes pendientes. ¡Todo al día!')).toBeInTheDocument()
        })
    })

    it('muestra solicitudes pendientes en el tab correspondiente', async () => {
        const pendingRequest = {
            id: 10,
            name: 'Gaming',
            visible: false,
            createdAt: new Date().toISOString(),
        }

        fetchCategoriesWithProducts
            .mockResolvedValueOnce(mockCategoriesResponse)
            .mockResolvedValueOnce({
                ...emptyResponse,
                data: [pendingRequest],
                categoryTotal: 1,
            })

        render(<AdminCategoriesPage />)

        await waitFor(() => expect(screen.getByText('Electrónica')).toBeInTheDocument())

        await userEvent.click(screen.getByText('Solicitudes pendientes'))

        await waitFor(() => {
            expect(screen.getByText('Gaming')).toBeInTheDocument()
        })

        expect(screen.getByText('Pendiente')).toBeInTheDocument()
        expect(screen.getByTitle('Aprobar solicitud')).toBeInTheDocument()
        expect(screen.getByTitle('Rechazar solicitud')).toBeInTheDocument()
    })

    it('navega al detalle al hacer clic en Ver', async () => {
        render(<AdminCategoriesPage />)

        await waitFor(() => expect(screen.getByText('Electrónica')).toBeInTheDocument())

        await userEvent.click(screen.getByTitle('Ver detalle'))

        expect(mockNavigate).toHaveBeenCalledWith('/admin/categorias/1')
    })

    it('muestra las estadísticas de categorías', async () => {
        render(<AdminCategoriesPage />)

        await waitFor(() => {
            expect(screen.getByText('Total de Categorías')).toBeInTheDocument()
        })

        expect(screen.getByText('Categorías Visibles')).toBeInTheDocument()
        expect(screen.getByText('Categorías Ocultas')).toBeInTheDocument()
    })
})
