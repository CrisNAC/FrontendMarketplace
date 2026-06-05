import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeliveryEditProfilePage } from '../features/delivery/pages/DeliveryEditProfilePage'

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn()

// Spread del módulo real + override solo de lo que necesitamos
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/delivery/perfil/editar' }),
    }
})

// useLogout es un hook propio que llama a la API — lo neutralizamos
vi.mock('../hooks/useLogout', () => ({
    useLogout: () => vi.fn(),
}))

vi.mock('../features/clients/services/deliveryApi', () => ({
    getCurrentUserForDeliveryForm: vi.fn(),
    getDeliveryProfile: vi.fn(),
    updateMyDelivery: vi.fn(),
    UI_VEHICLE_LABELS: {
        CAR: 'Automóvil',
        MOTORCYCLE: 'Motocicleta / scooter',
        BICYCLE: 'Bicicleta',
        ON_FOOT: 'A pie',
    },
}))

vi.mock('../features/commerces/services/editUserProfileApi', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        getBackendErrorMessage: (_err, fallback) => fallback,
    }
})

const mockShowToast = vi.fn();

vi.mock('@/hooks', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

import {
    getCurrentUserForDeliveryForm,
    getDeliveryProfile,
    updateMyDelivery,
} from '../features/clients/services/deliveryApi'

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const mockSession = {
    sessionUser: {
        id_user: 1,
        role: 'DELIVERY',
        name: 'Juan Delivery',
        email: 'juan@test.com',
        id_delivery: 5,
    },
    profile: { phone: '0981000000' },
}

const mockDelivery = {
    id_delivery: 5,
    vehicle_type: 'MOTORCYCLE',
    delivery_status: 'ACTIVE',
    user: {
        id_user: 1,
        name: 'Juan Delivery',
        email: 'juan@test.com',
        phone: '0981000000',
        avatar_url: null,
    },
}

const setupSuccess = () => {
    getCurrentUserForDeliveryForm.mockResolvedValue(mockSession)
    getDeliveryProfile.mockResolvedValue(mockDelivery)
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('DeliveryEditProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ── Carga inicial ─────────────────────────────────────────────────────────
    describe('Carga inicial', () => {
        it('muestra el spinner mientras carga', () => {
            getCurrentUserForDeliveryForm.mockReturnValue(new Promise(() => { }))

            render(<DeliveryEditProfilePage />)

            expect(screen.queryByText('Actualizar Perfil')).not.toBeInTheDocument()
        })

        it('renderiza el formulario con los datos del delivery', async () => {
            setupSuccess()

            render(<DeliveryEditProfilePage />)

            await waitFor(() => {
                expect(screen.getByDisplayValue('Juan Delivery')).toBeInTheDocument()
            })

            expect(screen.getByDisplayValue('juan@test.com')).toBeInTheDocument()
            expect(screen.getByDisplayValue('0981000000')).toBeInTheDocument()
            expect(screen.getByRole('combobox')).toHaveValue('MOTORCYCLE')
        })

        it('muestra error si getCurrentUserForDeliveryForm falla', async () => {
            getCurrentUserForDeliveryForm.mockRejectedValueOnce(new Error('Network error'))

            render(<DeliveryEditProfilePage />)

            await waitFor(() => {
                expect(screen.getByText('No se pudo cargar el perfil.')).toBeInTheDocument()
            })
        })

        it('muestra error si getDeliveryProfile falla', async () => {
            getCurrentUserForDeliveryForm.mockResolvedValueOnce(mockSession)
            getDeliveryProfile.mockRejectedValueOnce(new Error('Server error'))

            render(<DeliveryEditProfilePage />)

            await waitFor(() => {
                expect(screen.getByText('No se pudo cargar el perfil.')).toBeInTheDocument()
            })
        })

        it('redirige a /quiero-ser-delivery si el rol no es DELIVERY', async () => {
            getCurrentUserForDeliveryForm.mockResolvedValueOnce({
                sessionUser: { ...mockSession.sessionUser, role: 'CUSTOMER' },
                profile: mockSession.profile,
            })

            render(<DeliveryEditProfilePage />)

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/quiero-ser-delivery', { replace: true })
            })
        })

        it('muestra error si la sesión no tiene id_delivery', async () => {
            getCurrentUserForDeliveryForm.mockResolvedValueOnce({
                sessionUser: { ...mockSession.sessionUser, id_delivery: null },
                profile: mockSession.profile,
            })

            render(<DeliveryEditProfilePage />)

            await waitFor(() => {
                expect(screen.getByText('No se encontró el perfil de delivery.')).toBeInTheDocument()
            })
        })
    })

    // ── Edición de campos ─────────────────────────────────────────────────────
    describe('Edición de campos', () => {
        it('permite editar el nombre', async () => {
            setupSuccess()
            const user = userEvent.setup()

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByDisplayValue('Juan Delivery'))

            const nameInput = screen.getByDisplayValue('Juan Delivery')
            await user.clear(nameInput)
            await user.type(nameInput, 'Carlos Nuevo')

            expect(nameInput).toHaveValue('Carlos Nuevo')
        })

        it('permite editar el teléfono', async () => {
            setupSuccess()
            const user = userEvent.setup()

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByDisplayValue('0981000000'))

            const phoneInput = screen.getByDisplayValue('0981000000')
            await user.clear(phoneInput)
            await user.type(phoneInput, '0991999888')

            expect(phoneInput).toHaveValue('0991999888')
        })

        it('permite cambiar el tipo de vehículo', async () => {
            setupSuccess()

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByRole('combobox'))

            fireEvent.change(screen.getByRole('combobox'), { target: { value: 'BICYCLE' } })

            expect(screen.getByRole('combobox')).toHaveValue('BICYCLE')
        })

        it('el campo email es de solo lectura', async () => {
            setupSuccess()

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByDisplayValue('juan@test.com'))

            expect(screen.getByDisplayValue('juan@test.com')).toHaveAttribute('readonly')
        })
    })

    // ── Validaciones ──────────────────────────────────────────────────────────
    describe('Validaciones', () => {
        it('muestra error si se intenta guardar con nombre vacío', async () => {
            setupSuccess()
            const user = userEvent.setup()

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByDisplayValue('Juan Delivery'))

            await user.clear(screen.getByDisplayValue('Juan Delivery'))
            await user.click(screen.getByText('Actualizar Perfil'))

            expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument()
            expect(updateMyDelivery).not.toHaveBeenCalled()
        })

        it('muestra error si se intenta guardar con teléfono vacío', async () => {
            setupSuccess()
            const user = userEvent.setup()
            
            render(<DeliveryEditProfilePage />)
            
            await waitFor(() => screen.getByDisplayValue('0981000000'))
            
            await user.clear(screen.getByDisplayValue('0981000000'))
            await user.click(screen.getByText('Actualizar Perfil'))
            
            expect(screen.getByText('El teléfono es obligatorio.')).toBeInTheDocument()
            expect(updateMyDelivery).not.toHaveBeenCalled()
        })
    })

    // ── Guardado ──────────────────────────────────────────────────────────────
    describe('Guardado', () => {
        it('llama a updateMyDelivery con los datos correctos al guardar', async () => {
            setupSuccess()
            updateMyDelivery.mockResolvedValueOnce({})
            const user = userEvent.setup()

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByDisplayValue('0981000000'))

            const phoneInput = screen.getByDisplayValue('0981000000')
            await user.clear(phoneInput)
            await user.type(phoneInput, '0991555444')

            await user.click(screen.getByText('Actualizar Perfil'))

            await waitFor(() => {
                expect(updateMyDelivery).toHaveBeenCalledWith(
                    5,
                    { name: 'Juan Delivery', phone: '0991555444', vehicleType: 'MOTORCYCLE' },
                    undefined,
                )
            })
        })

        it('muestra toast de éxito y navega a /delivery/perfil al guardar', async () => {
            setupSuccess()
            updateMyDelivery.mockResolvedValueOnce({})

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByText('Actualizar Perfil'))
            fireEvent.click(screen.getByText('Actualizar Perfil'))

            await waitFor(() => {
                expect(mockShowToast).toHaveBeenCalledWith('Perfil actualizado correctamente.', 'success')
                expect(mockNavigate).toHaveBeenCalledWith('/delivery/perfil')
            })
        })

        it('muestra error inline si updateMyDelivery falla', async () => {
            setupSuccess()
            updateMyDelivery.mockRejectedValueOnce(new Error('Server error'))

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByText('Actualizar Perfil'))
            fireEvent.click(screen.getByText('Actualizar Perfil'))

            await waitFor(() => {
                expect(screen.getByText('No se pudo guardar el perfil.')).toBeInTheDocument()
            })

            expect(mockNavigate).not.toHaveBeenCalledWith('/delivery/perfil')
        })

        it('deshabilita los botones mientras guarda', async () => {
            setupSuccess()
            updateMyDelivery.mockReturnValue(new Promise(() => { }))

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByText('Actualizar Perfil'))
            fireEvent.click(screen.getByText('Actualizar Perfil'))

            await waitFor(() => {
                expect(screen.getByText('Guardando…')).toBeInTheDocument()
            })

            expect(screen.getByText('Cancelar')).toBeDisabled()
        })
    })

    // ── Navegación ────────────────────────────────────────────────────────────
    describe('Navegación', () => {
        it('navega a /delivery/perfil al cancelar', async () => {
            setupSuccess()

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByText('Cancelar'))
            fireEvent.click(screen.getByText('Cancelar'))

            expect(mockNavigate).toHaveBeenCalledWith('/delivery/perfil')
        })

        it('navega a /delivery/perfil al hacer clic en la flecha de volver', async () => {
            setupSuccess()

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByLabelText('Volver'))
            fireEvent.click(screen.getByLabelText('Volver'))

            expect(mockNavigate).toHaveBeenCalledWith('/delivery/perfil')
        })
    })

    // ── Foto de perfil ────────────────────────────────────────────────────────
    describe('Foto de perfil', () => {
        it('muestra el placeholder cuando no hay avatar', async () => {
            setupSuccess()

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByText('Seleccionar archivo'))

            expect(screen.getByText('Sin archivo seleccionado')).toBeInTheDocument()
        })

        it('muestra el nombre del archivo al seleccionar una imagen', async () => {
            setupSuccess()
            const user = userEvent.setup()

            render(<DeliveryEditProfilePage />)

            await waitFor(() => screen.getByText('Seleccionar archivo'))

            const file = new File(['fake'], 'foto.png', { type: 'image/png' })
            const input = document.querySelector('input[type="file"]')
            await user.upload(input, file)

            expect(screen.getByText('foto.png')).toBeInTheDocument()
        })

        it('muestra el avatar actual si el delivery ya tiene uno', async () => {
            getCurrentUserForDeliveryForm.mockResolvedValue(mockSession)
            getDeliveryProfile.mockResolvedValueOnce({
                ...mockDelivery,
                user: { ...mockDelivery.user, avatar_url: 'https://cdn.example.com/avatar.jpg' },
            })

            render(<DeliveryEditProfilePage />)

            await waitFor(() => {
                const img = screen.getByAltText('Avatar')
                expect(img).toHaveAttribute('src', 'https://cdn.example.com/avatar.jpg')
            })
        })
    })
})