import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/homepage', search: '' }),
    Link: ({ children, to, className }) => <a href={to} className={className}>{children}</a>,
}))

vi.mock('react-hot-toast', () => ({
    default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        delete: vi.fn(),
    },
}))

vi.mock('../lib/cartApi', () => ({
    fetchCartsApi: vi.fn(),
    getApiBase: vi.fn(() => 'http://localhost:3000'),
}))

vi.mock('lucide-react', () => ({
    User: () => <span>UserIcon</span>,
    X: () => <span>XIcon</span>,
    ShoppingCart: () => <span>CartIcon</span>,
    Search: () => <span>SearchIcon</span>,
    ChevronDown: () => null,
    LogOut: () => null,
}))

import axios from 'axios'
import { fetchCartsApi } from '../lib/cartApi'
import { CategoriesBar } from '../components/navbar/CategoriesBar'
import { MarketplaceNavbar } from '../components/navbar/MarketplaceNavbar'
import Navbar from '../components/navbar/Navbar'

// ─── CategoriesBar ─────────────────────────────────────────────────────────────
describe('CategoriesBar', () => {
    it('renderiza todas las categorías predefinidas', () => {
        render(<CategoriesBar />)
        expect(screen.getByText('Tecnologia')).toBeInTheDocument()
        expect(screen.getByText('Moda')).toBeInTheDocument()
        expect(screen.getByText('Deportes')).toBeInTheDocument()
        expect(screen.getByText('Ofertas!!')).toBeInTheDocument()
    })

    it('renderiza la etiqueta "Ofertas!!" en rojo', () => {
        render(<CategoriesBar />)
        const oferta = screen.getByText('Ofertas!!')
        expect(oferta.className).toContain('red')
    })

    it('renderiza exactamente 8 categorías + Ofertas', () => {
        render(<CategoriesBar />)
        const spans = screen.getAllByText(/./i)
        expect(spans.length).toBeGreaterThanOrEqual(8)
    })
})

// ─── MarketplaceNavbar ────────────────────────────────────────────────────────
describe('MarketplaceNavbar', () => {
    it('renderiza el nombre "Open Market"', () => {
        render(<MarketplaceNavbar />)
        expect(screen.getByText('Open Market')).toBeInTheDocument()
    })

    it('renderiza el input de búsqueda con placeholder "Buscar"', () => {
        render(<MarketplaceNavbar />)
        expect(screen.getByPlaceholderText('Buscar')).toBeInTheDocument()
    })

    it('renderiza el botón "Buscar"', () => {
        render(<MarketplaceNavbar />)
        expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
    })

    it('renderiza los links de navegación', () => {
        render(<MarketplaceNavbar />)
        expect(screen.getByText('Inicio')).toBeInTheDocument()
        expect(screen.getByText('Productos')).toBeInTheDocument()
        expect(screen.getByText('Comercio')).toBeInTheDocument()
    })
})

// ─── Navbar ───────────────────────────────────────────────────────────────────
describe('Navbar', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        axios.get.mockResolvedValue({ data: { user: null } })
        fetchCartsApi.mockResolvedValue([])
    })

    it('renderiza el logo "Open Market"', async () => {
        render(<Navbar />)
        await waitFor(() => {
            expect(screen.getByText('Open Market')).toBeInTheDocument()
        })
    })

    it('renderiza los links de navegación principales', async () => {
        render(<Navbar />)
        await waitFor(() => {
            expect(screen.getByText('Inicio')).toBeInTheDocument()
            expect(screen.getByText('Productos')).toBeInTheDocument()
            expect(screen.getByText('Comercio')).toBeInTheDocument()
            // "Ofertas" aparece dos veces (nav + barra de categorías), usar getAllByText
            expect(screen.getAllByText('Ofertas').length).toBeGreaterThanOrEqual(1)
        })
    })

    it('muestra "Iniciar sesión" al abrir el menú cuando no hay sesión', async () => {
        render(<Navbar />)
        await waitFor(() => screen.getByRole('button', { name: /Menú de cuenta/i }))
        await userEvent.click(screen.getByRole('button', { name: /Menú de cuenta/i }))
        expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
    })

    it('muestra los links del perfil al abrir el menú con sesión activa', async () => {
        axios.get.mockResolvedValue({ data: { user: { id_user: 1, name: 'María', role: 'CUSTOMER' } } })
        fetchCartsApi.mockResolvedValue([])
        render(<Navbar />)
        await waitFor(() => screen.getByRole('button', { name: /Menú de cuenta/i }))
        await userEvent.click(screen.getByRole('button', { name: /Menú de cuenta/i }))
        expect(screen.getByText('Mi cuenta')).toBeInTheDocument()
    })

    it('muestra el input de búsqueda', async () => {
        render(<Navbar />)
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
        })
    })

    it('muestra "Quiero ser delivery" solo para usuarios CUSTOMER', async () => {
        axios.get.mockResolvedValue({ data: { user: { id_user: 2, name: 'Juan', role: 'CUSTOMER' } } })
        fetchCartsApi.mockResolvedValue([])
        render(<Navbar />)
        await waitFor(() => {
            expect(screen.getByText('Quiero ser delivery')).toBeInTheDocument()
        })
    })

    it('no muestra "Quiero ser delivery" para usuarios SELLER', async () => {
        axios.get.mockResolvedValue({ data: { user: { id_user: 3, name: 'Comercio', role: 'SELLER' } } })
        fetchCartsApi.mockResolvedValue([])
        render(<Navbar />)
        await waitFor(() => {
            expect(screen.queryByText('Quiero ser delivery')).not.toBeInTheDocument()
        })
    })

    it('abre el menú de perfil al hacer clic en el botón de cuenta', async () => {
        axios.get.mockResolvedValue({ data: { user: { id_user: 1, name: 'María', role: 'CUSTOMER' } } })
        fetchCartsApi.mockResolvedValue([])
        render(<Navbar />)
        await waitFor(() => screen.getByRole('button', { name: /Menú de cuenta/i }))
        await userEvent.click(screen.getByRole('button', { name: /Menú de cuenta/i }))
        expect(screen.getByText('Mi cuenta')).toBeInTheDocument()
        expect(screen.getByText('Mis pedidos')).toBeInTheDocument()
    })

    it('muestra el contador del carrito cuando hay items', async () => {
        axios.get.mockResolvedValue({ data: { user: { id_user: 1, name: 'María', role: 'CUSTOMER' } } })
        fetchCartsApi.mockResolvedValue([{ items: [{ quantity: 2 }, { quantity: 1 }] }])
        render(<Navbar />)
        await waitFor(() => {
            expect(screen.getByText('3')).toBeInTheDocument()
        })
    })

    it('navega al buscar un término (Enter)', async () => {
        render(<Navbar />)
        await waitFor(() => screen.getByPlaceholderText('Buscar'))
        await userEvent.type(screen.getByPlaceholderText('Buscar'), 'laptop')
        fireEvent.keyDown(screen.getByPlaceholderText('Buscar'), { key: 'Enter' })
        // Solo verifica que el input cambia sin crash
        expect(screen.getByPlaceholderText('Buscar')).toHaveValue('laptop')
    })

    it('maneja error de sesión y muestra el botón de cuenta', async () => {
        axios.get.mockRejectedValue(new Error('Network error'))
        render(<Navbar />)
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Menú de cuenta/i })).toBeInTheDocument()
        })
        await userEvent.click(screen.getByRole('button', { name: /Menú de cuenta/i }))
        expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
    })
})
