import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-hot-toast', () => ({
    default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('lucide-react', () => ({
    Phone: () => <span />,
    X: () => <span data-testid="x-icon" />,
}))

vi.mock('../features/clients/services/deliveryApi', () => ({
    becomeDelivery: vi.fn(),
    getCurrentUserForDeliveryForm: vi.fn(),
}))

vi.mock('../features/commerces/services/editUserProfileApi', () => ({
    getBackendErrorMessage: vi.fn((_err, fallback) => fallback),
}))

import { becomeDelivery, getCurrentUserForDeliveryForm } from '../features/clients/services/deliveryApi'
import { BecomeDeliveryModal } from '../features/clients/components/BecomeDeliveryModal'

const mockProfile = {
    userId: 7,
    sessionUser: { name: 'José', email: 'jose@test.com', role: 'CLIENT' },
    profile: { id_user: 7, name: 'José', email: 'jose@test.com', phone: '0981111111', role: 'CLIENT' },
}

function renderOpen(props = {}) {
    return render(<BecomeDeliveryModal open={true} onClose={vi.fn()} onSuccess={vi.fn()} {...props} />)
}

describe('BecomeDeliveryModal', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserForDeliveryForm.mockResolvedValue(mockProfile)
    })

    it('no renderiza nada cuando open=false', () => {
        render(<BecomeDeliveryModal open={false} onClose={vi.fn()} onSuccess={vi.fn()} />)
        expect(screen.queryByText('Quiero ser delivery')).not.toBeInTheDocument()
    })

    it('muestra "Cargando…" mientras carga', () => {
        getCurrentUserForDeliveryForm.mockReturnValue(new Promise(() => {}))
        renderOpen()
        expect(screen.getByText('Cargando…')).toBeInTheDocument()
    })

    it.each([
        ['título "Quiero ser delivery"', 'getByText', 'Quiero ser delivery'],
        ['select de tipo de vehículo', 'getByLabelText', 'Tipo de vehículo'],
        ['email del usuario', 'getByText', 'jose@test.com'],
        ['botón Cancelar', 'getByText', 'Cancelar'],
    ])('muestra el %s', async (_, queryType, queryArg) => {
        renderOpen()
        await waitFor(() => {
            expect(screen[queryType](queryArg)).toBeInTheDocument()
        })
    })

    it('muestra el campo teléfono con valor precargado', async () => {
        renderOpen()
        await waitFor(() => {
            const phoneInput = screen.getByPlaceholderText('+54 9 11 2345-6789')
            expect(phoneInput.value).toBe('0981111111')
        })
    })

    it('muestra las opciones de vehículo', async () => {
        renderOpen()
        await waitFor(() => {
            expect(screen.getByText('Bicicleta')).toBeInTheDocument()
            expect(screen.getByText('Motocicleta / scooter')).toBeInTheDocument()
            expect(screen.getByText('Automóvil')).toBeInTheDocument()
            expect(screen.getByText('A pie')).toBeInTheDocument()
        })
    })

    it('llama onClose al hacer clic en Cancelar', async () => {
        const onClose = vi.fn()
        renderOpen({ onClose })
        await waitFor(() => screen.getByText('Cancelar'))
        await userEvent.click(screen.getByText('Cancelar'))
        expect(onClose).toHaveBeenCalled()
    })

    it('muestra error de validación si el teléfono está vacío', async () => {
        renderOpen()
        await waitFor(() => screen.getByPlaceholderText('+54 9 11 2345-6789'))
        const phoneInput = screen.getByPlaceholderText('+54 9 11 2345-6789')
        await userEvent.clear(phoneInput)
        await userEvent.click(screen.getByText('Confirmar'))
        await waitFor(() => {
            expect(screen.getByText('Revisá los datos del formulario.')).toBeInTheDocument()
        })
    })

    it('llama becomeDelivery con datos válidos y llama onSuccess', async () => {
        becomeDelivery.mockResolvedValueOnce({})
        const onSuccess = vi.fn()
        const onClose = vi.fn()
        renderOpen({ onClose, onSuccess })
        await waitFor(() => screen.getByPlaceholderText('+54 9 11 2345-6789'))
        await userEvent.click(screen.getByText('Confirmar'))
        await waitFor(() => {
            expect(becomeDelivery).toHaveBeenCalledWith('MOTOCICLETA', '0981111111')
            expect(onSuccess).toHaveBeenCalled()
            expect(onClose).toHaveBeenCalled()
        })
    })

    it('muestra error cuando becomeDelivery falla', async () => {
        becomeDelivery.mockRejectedValueOnce(new Error('Error del servidor'))
        renderOpen()
        await waitFor(() => screen.getByPlaceholderText('+54 9 11 2345-6789'))
        await userEvent.click(screen.getByText('Confirmar'))
        await waitFor(() => {
            expect(screen.getByText('No se pudo completar el registro como delivery.')).toBeInTheDocument()
        })
    })

    it('muestra "Ya sos delivery" cuando el usuario ya es delivery', async () => {
        getCurrentUserForDeliveryForm.mockResolvedValue({
            ...mockProfile,
            profile: { ...mockProfile.profile, role: 'DELIVERY' },
        })
        renderOpen()
        await waitFor(() => {
            expect(screen.getByText('Ya sos delivery')).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la carga del perfil', async () => {
        getCurrentUserForDeliveryForm.mockRejectedValue(new Error('Error de sesión'))
        renderOpen()
        await waitFor(() => {
            expect(screen.getByText('No se pudo cargar tu sesión.')).toBeInTheDocument()
        })
    })
})
