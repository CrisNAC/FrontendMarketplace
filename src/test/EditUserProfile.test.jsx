import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../components/navbar/Navbar', () => ({ default: () => null }))

vi.mock('../features/commerces/services/editUserProfileApi', () => ({
    getSession: vi.fn(),
    fetchUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),
    uploadUserImage: vi.fn(),
    getBackendErrorMessage: vi.fn((_err, fallback) => fallback),
}))

import {
    getSession,
    fetchUserProfile,
    updateUserProfile,
    getBackendErrorMessage,
} from '../features/commerces/services/editUserProfileApi'
import { EditClientProfile } from '../features/clients/pages/EditUserProfile'

const mockUser = {
    id_user: 7,
    name: 'María García',
    email: 'maria@test.com',
    phone: '0981555555',
    avatar_url: null,
}

describe('EditClientProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getSession.mockResolvedValue({ user: { id_user: 7 } })
        fetchUserProfile.mockResolvedValue(mockUser)
    })

    it('muestra "Cargando perfil..." al iniciar', () => {
        getSession.mockReturnValue(new Promise(() => {}))
        render(<EditClientProfile />)
        expect(screen.getByText('Cargando perfil...')).toBeInTheDocument()
    })

    it('muestra el título "Editar Perfil" después de cargar', async () => {
        render(<EditClientProfile />)
        await waitFor(() => {
            expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
        })
    })

    it('precarga el nombre del usuario en el campo', async () => {
        render(<EditClientProfile />)
        await waitFor(() => {
            const nameInput = screen.getByDisplayValue('María García')
            expect(nameInput).toBeInTheDocument()
        })
    })

    it('precarga el email del usuario en el campo', async () => {
        render(<EditClientProfile />)
        await waitFor(() => {
            expect(screen.getByDisplayValue('maria@test.com')).toBeInTheDocument()
        })
    })

    it('muestra el botón "Guardar cambios"', async () => {
        render(<EditClientProfile />)
        await waitFor(() => {
            expect(screen.getByText('Guardar cambios')).toBeInTheDocument()
        })
    })

    it('llama updateUserProfile al guardar', async () => {
        updateUserProfile.mockResolvedValueOnce({})
        render(<EditClientProfile />)
        await waitFor(() => screen.getByText('Guardar cambios'))
        await userEvent.click(screen.getByText('Guardar cambios'))
        await waitFor(() => {
            expect(updateUserProfile).toHaveBeenCalledWith(7, expect.objectContaining({
                name: 'María García',
                email: 'maria@test.com',
            }))
        })
    })

    it('muestra "Perfil actualizado correctamente" en éxito', async () => {
        updateUserProfile.mockResolvedValueOnce({})
        render(<EditClientProfile />)
        await waitFor(() => screen.getByText('Guardar cambios'))
        await userEvent.click(screen.getByText('Guardar cambios'))
        await waitFor(() => {
            expect(screen.getByText('Perfil actualizado correctamente')).toBeInTheDocument()
        })
    })

    it('muestra error cuando no hay sesión activa', async () => {
        getSession.mockResolvedValue({ user: null })
        render(<EditClientProfile />)
        await waitFor(() => {
            expect(screen.getByText('No hay sesión activa. Por favor iniciá sesión.')).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga del perfil', async () => {
        getSession.mockRejectedValue(new Error('Error de red'))
        render(<EditClientProfile />)
        await waitFor(() => {
            expect(screen.getByText('Error cargando perfil')).toBeInTheDocument()
        })
    })

    it('muestra error de validación cuando el nombre está vacío', async () => {
        fetchUserProfile.mockResolvedValue({ ...mockUser, name: '' })
        render(<EditClientProfile />)
        await waitFor(() => screen.getByText('Guardar cambios'))
        await userEvent.click(screen.getByText('Guardar cambios'))
        await waitFor(() => {
            expect(screen.getByText('Nombre obligatorio')).toBeInTheDocument()
        })
    })

    it('muestra error cuando updateUserProfile falla', async () => {
        updateUserProfile.mockRejectedValueOnce(new Error('Error al actualizar'))
        render(<EditClientProfile />)
        await waitFor(() => screen.getByText('Guardar cambios'))
        await userEvent.click(screen.getByText('Guardar cambios'))
        await waitFor(() => {
            expect(screen.getByText('Error actualizando perfil')).toBeInTheDocument()
        })
    })
})
