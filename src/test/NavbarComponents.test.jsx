/* eslint-disable react/prop-types */
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }))

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigateMock,
    useLocation: () => ({ pathname: '/homepage', search: '' }),
    Link: ({ children, to, ...rest }) => <a href={to} {...rest}>{children}</a>,
}))

const mockShowToast = vi.hoisted(() => vi.fn())

vi.mock('@/hooks', () => ({
    useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        delete: vi.fn(),
        create: vi.fn(() => ({
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
        })),
    },
}))

vi.mock('../components/notifications/NotificationBellDropdown', () => ({
    NotificationBellDropdown: () => null,
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
    Menu: () => null,
}))

import axios from 'axios'
import { fetchCartsApi } from '../lib/cartApi'
import { Navbar } from '../components/navbar/Navbar'

// ─── Navbar ───────────────────────────────────────────────────────────────────
describe('Navbar', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        navigateMock.mockReset()
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
            expect(screen.getByPlaceholderText('Buscar')).toBeInTheDocument()
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
        expect(navigateMock).toHaveBeenCalled()
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

    it('muestra toast de éxito al cerrar sesión', async () => {
        axios.get.mockResolvedValue({ data: { user: { id_user: 1, name: 'María', role: 'CUSTOMER' } } })
        axios.delete.mockResolvedValue({})
        render(<Navbar />)
        await waitFor(() => screen.getByRole('button', { name: /Menú de cuenta/i }))
        await userEvent.click(screen.getByRole('button', { name: /Menú de cuenta/i }))
        await userEvent.click(screen.getByText('Cerrar sesión'))
        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith('Sesión cerrada', 'success')
        })
    })

    it('muestra toast de error cuando falla el cierre de sesión', async () => {
        axios.get.mockResolvedValue({ data: { user: { id_user: 1, name: 'María', role: 'CUSTOMER' } } })
        axios.delete.mockRejectedValue(new Error('Network error'))
        render(<Navbar />)
        await waitFor(() => screen.getByRole('button', { name: /Menú de cuenta/i }))
        await userEvent.click(screen.getByRole('button', { name: /Menú de cuenta/i }))
        await userEvent.click(screen.getByText('Cerrar sesión'))
        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith('No se pudo cerrar sesión. Intentá de nuevo.', 'error')
        })
    })
})
