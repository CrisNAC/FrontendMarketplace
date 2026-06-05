import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

vi.mock('../features/clients/components/search/SearchProductCard', () => ({
    SearchProductCard: ({ name }) => <div>{name}</div>,
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

const mockFetch = (categoriesData, productsData = [], storesData = []) => {
    return vi.fn((url) => {
        const urlStr = String(url)
        if (urlStr.includes('/api/categories/products')) {
            return Promise.resolve(makeOkResponse(categoriesData))
        }
        if (urlStr.includes('/products')) {
            return Promise.resolve(makeOkResponse({ products: productsData }))
        }
        return Promise.resolve(makeOkResponse(storesData))
    })
}

describe('HomeSections', () => {
    const originalFetch = globalThis.fetch

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        globalThis.fetch = originalFetch
    })

    it('muestra texto de carga durante el fetch', () => {
        globalThis.fetch = vi.fn(() => new Promise(() => {}))

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
        globalThis.fetch = vi.fn((url) => {
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

    it('muestra el nombre de la oferta cuando hay productos en oferta', async () => {
        global.fetch = mockFetch(
            [],
            [{ id_product: 1, name: 'Laptop Oferta', price: 500000, offer_price: 400000, image_url: null }]
        )

        render(<HomeSections />)

        await waitFor(() => {
            expect(screen.getByText('Laptop Oferta')).toBeInTheDocument()
        })
    })

    it('muestra error de ofertas cuando falla la carga', async () => {
        globalThis.fetch = vi.fn((url) => {
            const urlStr = String(url)
            if (urlStr.includes('/api/categories/products')) {
                return Promise.resolve(makeOkResponse([]))
            }
            if (urlStr.includes('/products')) {
                return Promise.resolve(makeErrorResponse())
            }
            return Promise.resolve(makeOkResponse([]))
        })

        render(<HomeSections />)

        await waitFor(() => {
            expect(screen.getByText(/No se pudieron cargar ofertas/)).toBeInTheDocument()
        })
    })

    it('muestra comercios cuando la API retorna datos', async () => {
        global.fetch = mockFetch(
            [],
            [],
            [{ id_store: 1, name: 'Tienda Test', logo: null }]
        )

        render(<HomeSections />)

        await waitFor(() => {
            expect(screen.getByText('Tienda Test')).toBeInTheDocument()
        })
    })

    it('muestra "No hay comercios disponibles" cuando la lista está vacía', async () => {
        global.fetch = mockFetch([], [], [])

        render(<HomeSections />)

        await waitFor(() => {
            expect(screen.getByText('No hay comercios disponibles.')).toBeInTheDocument()
        })
    })

    it('muestra error de comercios cuando falla la carga', async () => {
        globalThis.fetch = vi.fn((url) => {
            const urlStr = String(url)
            if (urlStr.includes('/api/categories/products')) {
                return Promise.resolve(makeOkResponse([]))
            }
            if (urlStr.includes('/products')) {
                return Promise.resolve(makeOkResponse({ products: [] }))
            }
            return Promise.resolve(makeErrorResponse())
        })

        render(<HomeSections />)

        await waitFor(() => {
            expect(screen.getByText(/No se pudieron cargar comercios/)).toBeInTheDocument()
        })
    })

    it('navega a /ofertas al hacer clic en "Ver todas las ofertas"', async () => {
        global.fetch = mockFetch([], [])

        render(<HomeSections />)

        await waitFor(() => screen.getByText('Ver todas las ofertas'))
        await userEvent.click(screen.getByText('Ver todas las ofertas'))

        expect(mockNavigate).toHaveBeenCalledWith('/ofertas')
    })

    it('navega al perfil del comercio al hacer clic en un comercio', async () => {
        global.fetch = mockFetch(
            [],
            [],
            [{ id_store: 5, name: 'Mi Tienda', logo: null }]
        )

        render(<HomeSections />)

        await waitFor(() => screen.getByText('Mi Tienda'))

        const storeDivs = document.querySelectorAll('[class*="cursor-pointer"]')
        if (storeDivs.length > 0) {
            await userEvent.click(storeDivs[storeDivs.length - 1])
            expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('storeId=5'))
        }
    })

    it('navega a la búsqueda por categoría al hacer clic en una categoría', async () => {
        global.fetch = mockFetch(
            [{ id: 3, name: 'Deportes', id_product_category: 3 }],
            []
        )

        render(<HomeSections />)

        await waitFor(() => screen.getByText('Deportes'))
        await userEvent.click(screen.getByText('Deportes'))

        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('categoryId=3'))
    })
})
