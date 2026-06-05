/* eslint-disable react/prop-types */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

vi.mock('../lib/apiClient', () => ({
    default: {
        get: vi.fn(),
    }
}))

vi.mock('../features/clients/services/wishlistService', () => ({
    getWishlists: vi.fn(),
    getWishlistItems: vi.fn(),
    createWishlist: vi.fn(),
    deleteWishlist: vi.fn(),
    removeWishlistItem: vi.fn(),
}))

vi.mock('../lib/cartApi', () => ({
    addToCartApi: vi.fn(),
}))

vi.mock('../lib/cartLocalStorage', () => ({
    mergeCartResponseFromApi: vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    }
}))

vi.mock('../components/SidebarClientProfile', () => ({
    SidebarClientProfile: () => null,
}))

vi.mock('../features/clients/components/wishlist/WishlistItemCard', () => ({
    default: ({ item, onRemove }) => (
        <div>
            <span>{item.product?.name || 'Producto'}</span>
            <button onClick={() => onRemove(item)}>Eliminar</button>
        </div>
    ),
}))

vi.mock('../features/clients/components/wishlist/WishlistSummaryCard', () => ({
    default: ({ totalItems, onAddAllToCart }) => (
        <div>
            <span>Total: {totalItems}</span>
            <button onClick={onAddAllToCart}>Agregar todo al carrito</button>
        </div>
    ),
}))

import apiClient from '../lib/apiClient'
import {
    getWishlists,
    getWishlistItems,
    createWishlist,
    removeWishlistItem,
} from '../features/clients/services/wishlistService'
import toast from 'react-hot-toast'
import Wishlist from '../features/clients/pages/Wishlist'

const mockWishlist = {
    id: 1,
    name: 'Mi lista',
}

const mockItems = {
    items: [
        { id: 1, quantity: 1, product: { id: 10, name: 'Laptop', price: 500000 } },
    ]
}

describe('Wishlist', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        apiClient.get.mockResolvedValue({ data: { user: { id_user: 7 } } })
        getWishlists.mockResolvedValue([mockWishlist])
        getWishlistItems.mockResolvedValue(mockItems)
    })

    it('navega al login cuando no hay sesión', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { user: null } })

        render(<Wishlist />)

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login')
        })
    })

    it('renderiza las listas de deseos cargadas', async () => {
        render(<Wishlist />)

        await waitFor(() => {
            expect(screen.getByText('Mi lista')).toBeInTheDocument()
        })
    })

    it('muestra el producto de la lista', async () => {
        render(<Wishlist />)

        await waitFor(() => {
            expect(screen.getByText('Laptop')).toBeInTheDocument()
        })
    })

    it('muestra "No tenés listas creadas" cuando está vacío', async () => {
        getWishlists.mockResolvedValueOnce([])

        render(<Wishlist />)

        await waitFor(() => {
            expect(screen.getByText('No tenés listas creadas')).toBeInTheDocument()
        })
    })

    it('muestra formulario de nueva lista al hacer clic en el botón', async () => {
        render(<Wishlist />)

        await waitFor(() => {
            expect(screen.getByText('Mi lista')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Nueva lista'))

        expect(screen.getByPlaceholderText('Nombre de la lista')).toBeInTheDocument()
    })

    it('crea una nueva lista', async () => {
        createWishlist.mockResolvedValueOnce({ id: 2, name: 'Lista nueva' })
        getWishlists.mockResolvedValue([mockWishlist, { id: 2, name: 'Lista nueva' }])
        getWishlistItems.mockResolvedValue({ items: [] })

        render(<Wishlist />)

        await waitFor(() => expect(screen.getByText('Mi lista')).toBeInTheDocument())

        await userEvent.click(screen.getByText('Nueva lista'))
        await userEvent.type(screen.getByPlaceholderText('Nombre de la lista'), 'Lista nueva')
        await userEvent.click(screen.getByText('Crear'))

        await waitFor(() => {
            expect(createWishlist).toHaveBeenCalledWith(7, 'Lista nueva')
        })
    })

    it('elimina un item de la lista', async () => {
        removeWishlistItem.mockResolvedValueOnce({})

        render(<Wishlist />)

        await waitFor(() => {
            expect(screen.getByText('Laptop')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Eliminar'))

        await waitFor(() => {
            expect(removeWishlistItem).toHaveBeenCalledWith(7, 1, 10)
            expect(toast.success).toHaveBeenCalledWith('Producto eliminado de la lista')
        })
    })

    it('muestra el total de items en el resumen', async () => {
        render(<Wishlist />)

        await waitFor(() => {
            expect(screen.getByText('Total: 1')).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga de listas', async () => {
        getWishlists.mockRejectedValueOnce(new Error('Network'))

        render(<Wishlist />)

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('No se pudieron cargar las listas')
        })
    })
})
