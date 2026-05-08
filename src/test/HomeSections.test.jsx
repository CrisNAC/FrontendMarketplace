import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

vi.mock('../features/clients/components/search/SearchProductCard', () => ({
    SearchProductCard: ({ product }) => <div>{product.name}</div>,
}))

import { HomeSections } from '../features/clients/components/home/HomeSections'

const makeOkResponse = (data) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
})

const makeErrorResponse = () => ({
    ok: false,
    status: 500,
    json: () => Promise.resolve({ error: 'Error del servidor' }),
})

// Categories returns array directly; products returns {products:[]}
const mockFetch = (categoriesData, productsData = [], storesData = []) => {
    return vi.fn((url) => {
        const urlStr = String(url)
        if (urlStr.includes('/api/categories/products')) {
            return Promise.resolve(makeOkResponse(categoriesData))
        }
        if (urlStr.includes('/products')) {
            return Promise.resolve(makeOkResponse({ products: productsData }))
        }
        return Promise.resolve(makeOkResponse({ stores: storesData }))
    })
}

describe('HomeSections', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra texto de carga durante el fetch', () => {
        global.fetch = vi.fn(() => new Promise(() => {}))

        render(<HomeSections />)

        expect(screen.getAllByText(/Cargando/).length).toBeGreaterThan(0)
    })

    it('muestra "Compra por categorías" después de cargar datos', async () => {
        global.fetch = mockFetch([{ id_product_category: 1, name: 'Electrónica' }])

        render(<HomeSections />)

        await waitFor(() => {
            expect(screen.getByText('Compra por categorías')).toBeInTheDocument()
        })
    })

    it('muestra categoría cargada', async () => {
        global.fetch = mockFetch([{ id_product_category: 1, name: 'Tecnología' }])

        render(<HomeSections />)

        await waitFor(() => {
            expect(screen.getByText('Tecnología')).toBeInTheDocument()
        })
    })

    it('muestra "No hay categorías disponibles" cuando la lista está vacía', async () => {
        global.fetch = mockFetch([])

        render(<HomeSections />)

        await waitFor(() => {
            expect(screen.getByText(/No hay categorías/)).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga de categorías', async () => {
        global.fetch = vi.fn((url) => {
            if (String(url).includes('/api/categories/products')) {
                return Promise.resolve(makeErrorResponse())
            }
            return Promise.resolve(makeOkResponse({ products: [] }))
        })

        render(<HomeSections />)

        await waitFor(() => {
            expect(screen.getByText(/No se pudieron cargar categorías/)).toBeInTheDocument()
        })
    })

    it('muestra "Ofertas" sección', async () => {
        global.fetch = mockFetch(
            [],
            [{ id_product: 1, name: 'Laptop Oferta', price: 500000, offer_price: 400000, image_url: null }]
        )

        render(<HomeSections />)

        await waitFor(() => {
            expect(screen.getByText('Ofertas')).toBeInTheDocument()
        })
    })

    it('muestra "No hay ofertas disponibles" cuando lista vacía', async () => {
        global.fetch = mockFetch([], [])

        render(<HomeSections />)

        await waitFor(() => {
            expect(screen.getByText(/No hay ofertas disponibles/)).toBeInTheDocument()
        })
    })
})
