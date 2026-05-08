import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

vi.mock('react-hot-toast', () => ({
    default: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('lucide-react', () => ({
    Search: () => <span>Search</span>,
    ArrowLeft: () => <span>←</span>,
    User: () => <span>User</span>,
    Phone: () => <span>Phone</span>,
    Mail: () => <span>Mail</span>,
    Package: () => <span>Package</span>,
    Percent: () => <span>Percent</span>,
    Star: () => <span>Star</span>,
}))

vi.mock('../features/commerces/services/editCommerceApi', () => ({
    apiClient: { get: vi.fn() },
}))

vi.mock('../features/commerces/services/commerceStoreDeliveryApi', () => ({
    searchDeliveries: vi.fn(),
    linkDeliveryToStore: vi.fn(),
    getStoreDeliveryErrorMessage: vi.fn((_err, fallback) => fallback),
}))

vi.mock('../features/commerces/utils/storeDeliveriesLocalCache', () => ({
    prependCachedStoreDelivery: vi.fn(),
}))

vi.mock('../features/commerces/components/ConfirmLinkDeliveryModal', () => ({
    ConfirmLinkDeliveryModal: ({ open, onCancel, onConfirm, confirming }) =>
        open ? (
            <div data-testid="confirm-modal">
                <button onClick={onCancel} disabled={confirming}>Cancelar</button>
                <button onClick={onConfirm} disabled={confirming}>Confirmar</button>
            </div>
        ) : null,
}))

vi.mock('../hooks/useDebouncedValue', () => ({
    useDebouncedValue: (val) => val,
}))

import toast from 'react-hot-toast'
import { apiClient } from '../features/commerces/services/editCommerceApi'
import { searchDeliveries, linkDeliveryToStore } from '../features/commerces/services/commerceStoreDeliveryApi'
import { AddStoreDeliveryPage } from '../features/commerces/pages/AddStoreDeliveryPage'

const mockCandidate = {
    id_user: 1,
    name: 'Carlos López',
    email: 'carlos@test.com',
    phone: '0981000000',
    total_deliveries: 50,
    success_rate: 0.95,
    average_rating: 4.5,
}

describe('AddStoreDeliveryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        apiClient.get.mockResolvedValue({ data: { user: { id_store: 3 } } })
        searchDeliveries.mockResolvedValue([mockCandidate])
    })

    it('muestra error cuando no hay comercio registrado', async () => {
        apiClient.get.mockResolvedValue({ data: { user: { id_store: null } } })
        render(<AddStoreDeliveryPage />)
        await waitFor(() => {
            expect(screen.getByText('No tenés un comercio registrado.')).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la sesión', async () => {
        apiClient.get.mockRejectedValue(new Error('Network error'))
        render(<AddStoreDeliveryPage />)
        await waitFor(() => {
            expect(screen.getByText('No se pudo cargar la sesión.')).toBeInTheDocument()
        })
    })

    it('muestra el encabezado "Agregar delivery"', async () => {
        render(<AddStoreDeliveryPage />)
        await waitFor(() => {
            expect(screen.getByText('Agregar delivery')).toBeInTheDocument()
        })
    })

    it('muestra "Cargando lista..." mientras carga los repartidores', async () => {
        searchDeliveries.mockReturnValue(new Promise(() => {}))
        render(<AddStoreDeliveryPage />)
        await waitFor(() => {
            expect(screen.getByText('Cargando lista…')).toBeInTheDocument()
        })
    })

    it('muestra el input de búsqueda', async () => {
        render(<AddStoreDeliveryPage />)
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Filtrar por nombre, correo o teléfono…')).toBeInTheDocument()
        })
    })

    it('muestra "No hay repartidores disponibles" cuando la lista está vacía', async () => {
        searchDeliveries.mockResolvedValue([])
        render(<AddStoreDeliveryPage />)
        await waitFor(() => {
            expect(screen.getByText('No hay repartidores disponibles por ahora.')).toBeInTheDocument()
        })
    })

    it('muestra "Ningún resultado coincide" cuando el filtro no encuentra coincidencias', async () => {
        render(<AddStoreDeliveryPage />)
        await waitFor(() => screen.getByPlaceholderText('Filtrar por nombre, correo o teléfono…'))
        await userEvent.type(screen.getByPlaceholderText('Filtrar por nombre, correo o teléfono…'), 'xyznoexiste')
        await waitFor(() => {
            expect(screen.getByText('Ningún resultado coincide con el filtro.')).toBeInTheDocument()
        })
    })

    it('muestra el nombre del repartidor en la lista', async () => {
        render(<AddStoreDeliveryPage />)
        await waitFor(() => {
            expect(screen.getByText('Carlos López')).toBeInTheDocument()
        })
    })

    it('muestra el email del repartidor', async () => {
        render(<AddStoreDeliveryPage />)
        await waitFor(() => {
            expect(screen.getByText('carlos@test.com')).toBeInTheDocument()
        })
    })

    it('muestra el botón "Agregar" para cada repartidor', async () => {
        render(<AddStoreDeliveryPage />)
        await waitFor(() => {
            expect(screen.getByText('Agregar')).toBeInTheDocument()
        })
    })

    it('abre el modal de confirmación al hacer clic en Agregar', async () => {
        render(<AddStoreDeliveryPage />)
        await waitFor(() => screen.getByText('Agregar'))
        await userEvent.click(screen.getByText('Agregar'))
        expect(screen.getByTestId('confirm-modal')).toBeInTheDocument()
    })

    it('cierra el modal al hacer clic en Cancelar', async () => {
        render(<AddStoreDeliveryPage />)
        await waitFor(() => screen.getByText('Agregar'))
        await userEvent.click(screen.getByText('Agregar'))
        await userEvent.click(screen.getByText('Cancelar'))
        await waitFor(() => {
            expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument()
        })
    })

    it('llama linkDeliveryToStore al confirmar', async () => {
        linkDeliveryToStore.mockResolvedValueOnce({ id_delivery: 10, delivery_status: 'ACTIVE' })
        render(<AddStoreDeliveryPage />)
        await waitFor(() => screen.getByText('Agregar'))
        await userEvent.click(screen.getByText('Agregar'))
        await userEvent.click(screen.getByText('Confirmar'))
        await waitFor(() => {
            expect(linkDeliveryToStore).toHaveBeenCalledWith(3, 1)
        })
    })

    it('muestra toast de éxito y navega tras confirmar', async () => {
        linkDeliveryToStore.mockResolvedValueOnce({ id_delivery: 10, delivery_status: 'ACTIVE' })
        render(<AddStoreDeliveryPage />)
        await waitFor(() => screen.getByText('Agregar'))
        await userEvent.click(screen.getByText('Agregar'))
        await userEvent.click(screen.getByText('Confirmar'))
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Repartidor agregado a tu comercio.')
            expect(mockNavigate).toHaveBeenCalledWith('/comercio/delivery')
        })
    })

    it('muestra error cuando falla la lista de repartidores', async () => {
        searchDeliveries.mockRejectedValue(new Error('Error de red'))
        render(<AddStoreDeliveryPage />)
        await waitFor(() => {
            expect(screen.getByText('No se pudo cargar la lista de repartidores.')).toBeInTheDocument()
        })
    })

    it('muestra la disponibilidad de repartidores', async () => {
        render(<AddStoreDeliveryPage />)
        await waitFor(() => {
            expect(screen.getByText('1 disponible')).toBeInTheDocument()
        })
    })
})
