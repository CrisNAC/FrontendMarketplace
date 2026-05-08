import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockCommerceClient, mockProductClient } = vi.hoisted(() => {
    const mockCommerceClient = { get: vi.fn(), put: vi.fn(), patch: vi.fn() }
    const mockProductClient = { get: vi.fn(), put: vi.fn(), delete: vi.fn() }
    return { mockCommerceClient, mockProductClient }
})

vi.mock('axios', () => ({
    default: {
        create: vi.fn()
            .mockReturnValueOnce(mockCommerceClient)
            .mockReturnValueOnce(mockProductClient)
            .mockReturnValue(mockProductClient),
        isAxiosError: vi.fn((err) => !!err?.response),
    }
}))

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

import { CommerceProductsPage } from '../features/commerces/pages/CommerceProductsPage'

const mockProduct = {
    id_product: 101,
    name: 'Laptop Gaming',
    price: 500000,
    visible: true,
    product_category: { name: 'Electrónica' },
    imageUrl: null,
}

describe('CommerceProductsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockCommerceClient.get
            .mockResolvedValueOnce({ data: { user: { id_user: 1, id_store: 5 } } })
            .mockResolvedValueOnce({ data: { products: [mockProduct] } })
    })

    it('muestra "Cargando..." mientras carga', () => {
        mockCommerceClient.get.mockReset()
        mockCommerceClient.get.mockReturnValue(new Promise(() => {}))

        render(<CommerceProductsPage />)

        expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })

    it('renderiza los productos del comercio', async () => {
        render(<CommerceProductsPage />)

        await waitFor(() => {
            expect(screen.getByText('Laptop Gaming')).toBeInTheDocument()
        })
    })

    it('muestra error cuando no hay id_store en sesión', async () => {
        mockCommerceClient.get.mockReset()
        mockCommerceClient.get.mockResolvedValueOnce({ data: { user: { id_user: 1, id_store: null } } })

        render(<CommerceProductsPage />)

        await waitFor(() => {
            expect(screen.getByText('No tenés un comercio registrado.')).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga', async () => {
        mockCommerceClient.get.mockReset()
        mockCommerceClient.get.mockRejectedValueOnce(new Error('Error de red'))

        render(<CommerceProductsPage />)

        await waitFor(() => {
            expect(screen.getByText('Error de red')).toBeInTheDocument()
        })
    })

    it('filtra productos por nombre', async () => {
        mockCommerceClient.get
            .mockReset()
            .mockResolvedValueOnce({ data: { user: { id_store: 5 } } })
            .mockResolvedValueOnce({
                data: {
                    products: [
                        mockProduct,
                        { id_product: 102, name: 'Mouse Gamer', price: 80000, visible: true, product_category: { name: 'Periféricos' } },
                    ]
                }
            })

        render(<CommerceProductsPage />)

        await waitFor(() => {
            expect(screen.getByText('Laptop Gaming')).toBeInTheDocument()
        })

        const searchInput = screen.getByPlaceholderText('Buscar productos...')
        await userEvent.type(searchInput, 'Mouse')

        expect(screen.queryByText('Laptop Gaming')).not.toBeInTheDocument()
        expect(screen.getByText('Mouse Gamer')).toBeInTheDocument()
    })

    it('muestra "Aún no tenés productos" cuando la lista está vacía', async () => {
        mockCommerceClient.get
            .mockReset()
            .mockResolvedValueOnce({ data: { user: { id_store: 5 } } })
            .mockResolvedValueOnce({ data: { products: [] } })

        render(<CommerceProductsPage />)

        await waitFor(() => {
            expect(screen.getByText('Aún no tenés productos.')).toBeInTheDocument()
        })
    })

    it('abre el modal de confirmación de eliminación', async () => {
        render(<CommerceProductsPage />)

        await waitFor(() => {
            expect(screen.getByText('Laptop Gaming')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTitle('Eliminar producto'))

        expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument()
    })

    it('cancela la eliminación al hacer clic en Cancelar', async () => {
        render(<CommerceProductsPage />)

        await waitFor(() => expect(screen.getByText('Laptop Gaming')).toBeInTheDocument())

        await userEvent.click(screen.getByTitle('Eliminar producto'))
        await userEvent.click(screen.getByText('Cancelar'))

        await waitFor(() => {
            expect(screen.queryByText('¿Estás seguro?')).not.toBeInTheDocument()
        })
    })

    it('elimina un producto al confirmar', async () => {
        mockProductClient.delete.mockResolvedValueOnce({})

        render(<CommerceProductsPage />)

        await waitFor(() => expect(screen.getByText('Laptop Gaming')).toBeInTheDocument())

        await userEvent.click(screen.getByTitle('Eliminar producto'))
        await userEvent.click(screen.getByText('Eliminar'))

        await waitFor(() => {
            expect(mockProductClient.delete).toHaveBeenCalled()
        })
    })
})
