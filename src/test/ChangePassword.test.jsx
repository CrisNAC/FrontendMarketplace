import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockApiClient } = vi.hoisted(() => {
    const mockApiClient = {
        put: vi.fn(),
        delete: vi.fn(),
    }
    return { mockApiClient }
})

vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => mockApiClient),
        isAxiosError: vi.fn((err) => !!err?.response),
    }
}))

vi.mock('../features/commerces/services/editUserProfileApi', () => ({
    getSession: vi.fn(),
    getBackendErrorMessage: (_err, fallback) => fallback,
}))

vi.mock('../components/navbar/Navbar', () => ({
    default: () => null,
}))

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

import { getSession } from '../features/commerces/services/editUserProfileApi'
import { ChangePassword } from '../features/clients/pages/ChangePassword'

describe('ChangePassword', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra "Cargando..." mientras verifica la sesión', () => {
        getSession.mockReturnValue(new Promise(() => {}))

        render(<ChangePassword />)

        expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })

    it('renderiza el formulario cuando la sesión es válida', async () => {
        getSession.mockResolvedValueOnce({ user: { id_user: 7 } })

        render(<ChangePassword />)

        await waitFor(() => {
            expect(screen.getByText('Cambiar Contraseña')).toBeInTheDocument()
        })

        expect(screen.getByPlaceholderText('Tu contraseña actual')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Repetí la nueva contraseña')).toBeInTheDocument()
    })

    it('muestra error cuando la sesión no tiene id_user', async () => {
        getSession.mockResolvedValueOnce({ user: null })

        render(<ChangePassword />)

        await waitFor(() => {
            expect(screen.getByText('No hay sesión activa. Por favor iniciá sesión.')).toBeInTheDocument()
        })
    })

    it('muestra error de validación cuando el formulario está vacío', async () => {
        getSession.mockResolvedValueOnce({ user: { id_user: 7 } })

        render(<ChangePassword />)

        await waitFor(() => {
            expect(screen.getByText('Cambiar Contraseña')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Cambiar contraseña'))

        expect(screen.getByText('La contraseña actual es obligatoria')).toBeInTheDocument()
    })

    it('muestra error cuando las contraseñas no coinciden', async () => {
        getSession.mockResolvedValueOnce({ user: { id_user: 7 } })

        render(<ChangePassword />)

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Tu contraseña actual')).toBeInTheDocument()
        })

        await userEvent.type(screen.getByPlaceholderText('Tu contraseña actual'), 'oldpassword')
        await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'newpass123')
        await userEvent.type(screen.getByPlaceholderText('Repetí la nueva contraseña'), 'differentpass')

        await userEvent.click(screen.getByText('Cambiar contraseña'))

        expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
    })

    it('muestra error cuando la nueva contraseña es muy corta', async () => {
        getSession.mockResolvedValueOnce({ user: { id_user: 7 } })

        render(<ChangePassword />)

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Tu contraseña actual')).toBeInTheDocument()
        })

        await userEvent.type(screen.getByPlaceholderText('Tu contraseña actual'), 'oldpass')
        await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'abc')
        await userEvent.type(screen.getByPlaceholderText('Repetí la nueva contraseña'), 'abc')

        await userEvent.click(screen.getByText('Cambiar contraseña'))

        expect(screen.getByText('La nueva contraseña debe tener al menos 6 caracteres')).toBeInTheDocument()
    })

    it('muestra error cuando nueva y actual son iguales', async () => {
        getSession.mockResolvedValueOnce({ user: { id_user: 7 } })

        render(<ChangePassword />)

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Tu contraseña actual')).toBeInTheDocument()
        })

        await userEvent.type(screen.getByPlaceholderText('Tu contraseña actual'), 'samepass123')
        await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'samepass123')
        await userEvent.type(screen.getByPlaceholderText('Repetí la nueva contraseña'), 'samepass123')

        await userEvent.click(screen.getByText('Cambiar contraseña'))

        expect(screen.getByText('La nueva contraseña debe ser diferente a la actual')).toBeInTheDocument()
    })

    it('muestra éxito al cambiar la contraseña correctamente', async () => {
        getSession.mockResolvedValueOnce({ user: { id_user: 7 } })
        mockApiClient.put.mockResolvedValueOnce({ data: {} })
        mockApiClient.delete.mockResolvedValueOnce({})

        render(<ChangePassword />)

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Tu contraseña actual')).toBeInTheDocument()
        })

        await userEvent.type(screen.getByPlaceholderText('Tu contraseña actual'), 'oldpassword')
        await userEvent.type(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'newpass123')
        await userEvent.type(screen.getByPlaceholderText('Repetí la nueva contraseña'), 'newpass123')

        await userEvent.click(screen.getByText('Cambiar contraseña'))

        await waitFor(() => {
            expect(screen.getByText('Contraseña actualizada correctamente. Redirigiendo al login...')).toBeInTheDocument()
        })
    })

    it('muestra/oculta la contraseña al hacer clic en el ojo', async () => {
        getSession.mockResolvedValueOnce({ user: { id_user: 7 } })

        render(<ChangePassword />)

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Tu contraseña actual')).toBeInTheDocument()
        })

        const input = screen.getByPlaceholderText('Tu contraseña actual')
        expect(input).toHaveAttribute('type', 'password')

        // El primer botón de ojo es para "Contraseña actual"
        const eyeButtons = screen.getAllByRole('button', { name: '' })
        await userEvent.click(eyeButtons[0])

        expect(input).toHaveAttribute('type', 'text')
    })

    it('muestra error cuando falla la sesión', async () => {
        getSession.mockRejectedValueOnce(new Error('Network'))

        render(<ChangePassword />)

        await waitFor(() => {
            expect(screen.getByText('Error al verificar sesión')).toBeInTheDocument()
        })
    })
})
