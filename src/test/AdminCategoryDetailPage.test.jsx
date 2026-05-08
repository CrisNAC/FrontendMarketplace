import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
}))

vi.mock('../features/admin/services/adminCategoriesApi', () => ({
    fetchAdminCategoryById: vi.fn(),
    fetchCategoriesWithProducts: vi.fn(),
    updateAdminCategory: vi.fn(),
}))

import {
    fetchAdminCategoryById,
    fetchCategoriesWithProducts,
    updateAdminCategory,
} from '../features/admin/services/adminCategoriesApi'
import { AdminCategoryDetailPage } from '../features/admin/pages/AdminCategoryDetailPage'

const mockCategory = {
    id: 1,
    name: 'Electrónica',
    visible: true,
    status: true,
    productCount: 5,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-06-01').toISOString(),
}

const mockProductsResponse = {
    data: [{
        id: 1,
        name: 'Electrónica',
        products: {
            data: [
                { id: 10, name: 'Laptop', price: 500000, status: true, visible: true, isOffer: false },
                { id: 11, name: 'Mouse', price: 80000, status: false, visible: true, isOffer: true, originalPrice: 100000 },
            ],
            total: 2,
            productPage: 1,
            productLimit: 10,
            productTotalPages: 1,
        },
    }],
}

const emptyProductsResponse = {
    data: [{ id: 1, name: 'Electrónica', products: { data: [], total: 0, productPage: 1, productLimit: 10, productTotalPages: 1 } }],
}

describe('AdminCategoryDetailPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchAdminCategoryById.mockResolvedValue(mockCategory)
        fetchCategoriesWithProducts.mockResolvedValue(mockProductsResponse)
    })

    it('muestra "Cargando..." mientras carga la categoría', () => {
        fetchAdminCategoryById.mockReturnValue(new Promise(() => {}))

        render(<AdminCategoryDetailPage />)

        expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })

    it('renderiza el nombre de la categoría', async () => {
        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            const matches = screen.getAllByText('Electrónica')
            expect(matches.length).toBeGreaterThan(0)
        })
    })

    it('muestra badge Visible cuando la categoría es visible', async () => {
        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getAllByText('Electrónica').length).toBeGreaterThan(0)
        })

        expect(screen.getAllByText('Visible').length).toBeGreaterThan(0)
        expect(screen.getByText('Activa')).toBeInTheDocument()
    })

    it('muestra badge Oculta cuando la categoría no es visible', async () => {
        fetchAdminCategoryById.mockResolvedValueOnce({ ...mockCategory, visible: false })

        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getByText('Oculta')).toBeInTheDocument()
        })
    })

    it('muestra el total de productos', async () => {
        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getByText('Total productos')).toBeInTheDocument()
        })

        expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('muestra error cuando falla la carga de la categoría', async () => {
        fetchAdminCategoryById.mockRejectedValueOnce(new Error('Error de red'))

        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getByText('No se pudo cargar la categoría.')).toBeInTheDocument()
        })
    })

    it('renderiza los productos cuando cargan exitosamente', async () => {
        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getByText('Laptop')).toBeInTheDocument()
        })

        expect(screen.getByText('Mouse')).toBeInTheDocument()
    })

    it('muestra "Activo" e "Inactivo" según el estado del producto', async () => {
        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getByText('Laptop')).toBeInTheDocument()
        })

        expect(screen.getByText('Activo')).toBeInTheDocument()
        expect(screen.getByText('Inactivo')).toBeInTheDocument()
    })

    it('muestra badge "Oferta" en productos de oferta', async () => {
        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getByText('Mouse')).toBeInTheDocument()
        })

        expect(screen.getByText('Oferta')).toBeInTheDocument()
    })

    it('muestra "Esta categoría no tiene productos." cuando está vacía', async () => {
        fetchCategoriesWithProducts.mockResolvedValueOnce(emptyProductsResponse)

        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getByText('Esta categoría no tiene productos.')).toBeInTheDocument()
        })
    })

    it('navega a /admin/categorias al hacer clic en el botón de retroceso', async () => {
        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getByText('Gestión de Categorías')).toBeInTheDocument()
        })

        // El ArrowLeft está dentro de un button sin texto visible
        const backBtn = screen.getByRole('button', { name: '' })
        await userEvent.click(backBtn)

        expect(mockNavigate).toHaveBeenCalledWith('/admin/categorias')
    })

    it('abre el modal de edición al hacer clic en Editar', async () => {
        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getByText('Editar')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Editar'))

        expect(screen.getByText('Editar Categoría')).toBeInTheDocument()
    })

    it('cierra el modal de edición al hacer clic en Cancelar', async () => {
        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getByText('Editar')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Editar'))
        await userEvent.click(screen.getByText('Cancelar'))

        await waitFor(() => {
            expect(screen.queryByText('Editar Categoría')).not.toBeInTheDocument()
        })
    })

    it('muestra error en modal cuando el nombre está vacío', async () => {
        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getByText('Editar')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Editar'))

        const nameInput = screen.getByDisplayValue('Electrónica')
        await userEvent.clear(nameInput)
        await userEvent.click(screen.getByText('Guardar Cambios'))

        expect(screen.getByText('El nombre es requerido.')).toBeInTheDocument()
    })

    it('guarda los cambios y cierra el modal cuando se envía correctamente', async () => {
        updateAdminCategory.mockResolvedValueOnce({ ...mockCategory, name: 'Tecnología' })

        render(<AdminCategoryDetailPage />)

        await waitFor(() => {
            expect(screen.getByText('Editar')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Editar'))

        const nameInput = screen.getByDisplayValue('Electrónica')
        await userEvent.clear(nameInput)
        await userEvent.type(nameInput, 'Tecnología')
        await userEvent.click(screen.getByText('Guardar Cambios'))

        await waitFor(() => {
            expect(updateAdminCategory).toHaveBeenCalledWith(1, { name: 'Tecnología' })
        })
    })
})
