import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

vi.mock('../lib/apiClient', () => ({
    default: {
        post: vi.fn(),
    }
}))

vi.mock('/src/assets/feather.png', () => ({ default: 'feather.png' }))

import apiClient from '../lib/apiClient'
import AuthPage from '../features/clients/pages/AuthPage'

async function performLogin(role, email) {
    apiClient.post.mockResolvedValueOnce({ data: { user: { role } } })
    render(<AuthPage />)
    await userEvent.type(screen.getByPlaceholderText('tu@correo.com'), email)
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await userEvent.click(screen.getByText('Iniciar sesión', { selector: 'button[type="submit"]' }))
}

describe('AuthPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        sessionStorage.clear()
    })

    it('renderiza el título OpenMarket', () => {
        render(<AuthPage />)
        expect(screen.getByText('OpenMarket')).toBeInTheDocument()
    })

    it('muestra el formulario de login por defecto', () => {
        render(<AuthPage />)
        expect(screen.getByPlaceholderText('tu@correo.com')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
        expect(screen.getByText('Iniciar sesión', { selector: 'button[type="submit"]' })).toBeInTheDocument()
    })

    it('cambia al formulario de registro al hacer clic en Registrarse', async () => {
        render(<AuthPage />)
        await userEvent.click(screen.getByText('Registrarse'))
        expect(screen.getByPlaceholderText('Tu nombre')).toBeInTheDocument()
        expect(screen.getByText('Crear cuenta')).toBeInTheDocument()
    })

    it('vuelve al login al hacer clic en Iniciar sesión', async () => {
        render(<AuthPage />)
        await userEvent.click(screen.getByText('Registrarse'))
        await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
        expect(screen.queryByPlaceholderText('Tu nombre')).not.toBeInTheDocument()
    })

    it.each([
        ['CUSTOMER', 'cliente@test.com',  '/homepage'],
        ['ADMIN',    'admin@test.com',    '/admin/dashboard'],
        ['SELLER',   'seller@test.com',   '/comercio'],
        ['DELIVERY', 'delivery@test.com', '/delivery'],
    ])('navega a la ruta correcta tras login como %s', async (role, email, path) => {
        await performLogin(role, email)
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(path, { replace: true })
        })
    })

    it('guarda showDeliveryReviewPrompt en sessionStorage para CUSTOMER', async () => {
        await performLogin('CUSTOMER', 'cliente@test.com')
        await waitFor(() => {
            expect(sessionStorage.getItem('showDeliveryReviewPrompt')).toBe('1')
        })
    })

    it('muestra error cuando el login falla', async () => {
        apiClient.post.mockRejectedValueOnce({ response: { data: { message: 'Credenciales inválidas' } } })
        render(<AuthPage />)
        await userEvent.type(screen.getByPlaceholderText('tu@correo.com'), 'wrong@test.com')
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
        await userEvent.click(screen.getByText('Iniciar sesión', { selector: 'button[type="submit"]' }))
        await waitFor(() => {
            expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
        })
    })

    it('muestra "Ocurrió un error" cuando no hay mensaje en el error', async () => {
        apiClient.post.mockRejectedValueOnce(new Error('Network Error'))
        render(<AuthPage />)
        await userEvent.type(screen.getByPlaceholderText('tu@correo.com'), 'user@test.com')
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass123')
        await userEvent.click(screen.getByText('Iniciar sesión', { selector: 'button[type="submit"]' }))
        await waitFor(() => {
            expect(screen.getByText('Ocurrió un error')).toBeInTheDocument()
        })
    })

    it('muestra error cuando las contraseñas no coinciden en registro', async () => {
        render(<AuthPage />)
        await userEvent.click(screen.getByText('Registrarse'))
        await userEvent.type(screen.getByPlaceholderText('Tu nombre'), 'Juan Pérez')
        await userEvent.type(screen.getByPlaceholderText('tu@correo.com'), 'juan@test.com')
        const passwords = screen.getAllByPlaceholderText('••••••••')
        await userEvent.type(passwords[0], 'password123')
        await userEvent.type(passwords[1], 'password456')
        await userEvent.click(screen.getByText('Crear cuenta'))
        expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
    })

    it('cambia al login tras registro exitoso', async () => {
        apiClient.post.mockResolvedValueOnce({ data: {} })
        render(<AuthPage />)
        await userEvent.click(screen.getByText('Registrarse'))
        await userEvent.type(screen.getByPlaceholderText('Tu nombre'), 'Juan Pérez')
        await userEvent.type(screen.getByPlaceholderText('tu@correo.com'), 'juan@test.com')
        const passwords = screen.getAllByPlaceholderText('••••••••')
        await userEvent.type(passwords[0], 'password123')
        await userEvent.type(passwords[1], 'password123')
        await userEvent.click(screen.getByText('Crear cuenta'))
        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith('/api/users/register', expect.any(Object))
        })
    })

    it('limpia el error al cambiar de modo login/registro', async () => {
        apiClient.post.mockRejectedValueOnce({ response: { data: { message: 'Error previo' } } })
        render(<AuthPage />)
        await userEvent.type(screen.getByPlaceholderText('tu@correo.com'), 'test@test.com')
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrong')
        await userEvent.click(screen.getByText('Iniciar sesión', { selector: 'button[type="submit"]' }))
        await waitFor(() => {
            expect(screen.getByText('Error previo')).toBeInTheDocument()
        })
        await userEvent.click(screen.getByText('Registrarse'))
        expect(screen.queryByText('Error previo')).not.toBeInTheDocument()
    })

    it('muestra "Cargando..." durante el submit', async () => {
        apiClient.post.mockReturnValue(new Promise(() => {}))
        render(<AuthPage />)
        await userEvent.type(screen.getByPlaceholderText('tu@correo.com'), 'test@test.com')
        await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password')
        await userEvent.click(screen.getByText('Iniciar sesión', { selector: 'button[type="submit"]' }))
        expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })
})
