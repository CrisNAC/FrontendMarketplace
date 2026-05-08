import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

vi.mock('../features/commerces/services/editUserProfileApi', () => ({
    getSession: vi.fn(),
    fetchUserProfile: vi.fn(),
    getUserImage: vi.fn(),
    uploadUserImage: vi.fn(),
    getBackendErrorMessage: (_err, fallback) => fallback,
}))

vi.mock('../components/navbar/Navbar', () => ({
    default: () => null,
}))

vi.mock('../components/SidebarClientProfile', () => ({
    SidebarClientProfile: () => null,
}))

import {
    getSession,
    fetchUserProfile,
    getUserImage,
} from '../features/commerces/services/editUserProfileApi'
import MyAccountPage from '../features/clients/pages/MyAccountPage'

const mockUser = {
    id_user: 7,
    name: 'Juan Pérez',
    email: 'juan@test.com',
    role: 'CUSTOMER',
}

describe('MyAccountPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getSession.mockResolvedValue({ user: { id_user: 7 } })
        fetchUserProfile.mockResolvedValue({ data: mockUser })
        getUserImage.mockResolvedValue({ avatar_url: null })
    })

    it('muestra spinner de carga mientras carga el perfil', () => {
        getSession.mockReturnValue(new Promise(() => {}))

        render(<MyAccountPage />)

        expect(document.querySelector('.animate-spin') ?? screen.queryByRole('status')).toBeTruthy()
    })

    it('renderiza el perfil del usuario cuando carga exitosamente', async () => {
        render(<MyAccountPage />)

        await waitFor(() => {
            expect(screen.getByText('Mi Cuenta')).toBeInTheDocument()
        })
    })

    it('muestra error cuando la sesión falla', async () => {
        getSession.mockRejectedValueOnce(new Error('Error de red'))

        render(<MyAccountPage />)

        await waitFor(() => {
            expect(screen.getByText('Error cargando perfil')).toBeInTheDocument()
        })
    })

    it('muestra error cuando no hay sesión activa', async () => {
        getSession.mockResolvedValueOnce({ user: null })

        render(<MyAccountPage />)

        await waitFor(() => {
            expect(screen.getByText('No hay sesión activa.')).toBeInTheDocument()
        })
    })

    it('no duplica la carga del perfil por re-renders', async () => {
        const { rerender } = render(<MyAccountPage />)

        await waitFor(() => {
            expect(getSession).toHaveBeenCalledTimes(1)
        })

        rerender(<MyAccountPage />)
        await waitFor(() => {
            expect(getSession).toHaveBeenCalledTimes(1)
        })
    })
})
