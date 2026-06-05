/* eslint-disable react/prop-types */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

vi.mock('axios', () => ({
    default: { get: vi.fn() }
}))

vi.mock('../hooks/useAddresses', () => ({
    useAddresses: vi.fn(),
}))

vi.mock('../components/navbar/Navbar', () => ({
    default: () => null,
}))

vi.mock('../components/SidebarClientProfile', () => ({
    SidebarClientProfile: () => null,
}))

vi.mock('../features/clients/components/Map', () => ({
    default: ({ onPointChange }) => (
        <button type="button" onClick={() => onPointChange?.({ lat: -25.3, lng: -57.6 })}>
            Seleccionar en mapa
        </button>
    ),
}))

vi.mock('lucide-react', () => ({
    MapPin: () => null,
    Plus: () => null,
    Pencil: () => null,
    Trash2: () => null,
    X: () => <span>X</span>,
    Loader2: () => null,
    AlertCircle: () => null,
    CheckCircle2: () => null,
}))

import axios from 'axios'
import { useAddresses } from '../hooks/useAddresses'
import AddressesPage from '../features/clients/components/addresses/AddressesPage'

const mockAddress = {
    id_address: 1,
    address: 'Av. Test 123',
    latitude: -25.3,
    longitude: -57.6,
}

const baseHook = {
    addresses: [mockAddress],
    loading: false,
    error: null,
    createAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
}

describe('AddressesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        axios.get.mockResolvedValue({ data: { success: true, user: { id_user: 7 } } })
        useAddresses.mockReturnValue(baseHook)
    })

    it('muestra "Libreta de direcciones"', async () => {
        render(<AddressesPage />)

        await waitFor(() => {
            expect(screen.getByText('Libreta de direcciones')).toBeInTheDocument()
        })
    })

    it('muestra las direcciones cargadas', async () => {
        render(<AddressesPage />)

        await waitFor(() => {
            expect(screen.getByText('Av. Test 123')).toBeInTheDocument()
        })
    })

    it('muestra "No tienes direcciones guardadas" cuando la lista está vacía', async () => {
        useAddresses.mockReturnValue({ ...baseHook, addresses: [] })

        render(<AddressesPage />)

        await waitFor(() => {
            expect(screen.getByText('No tienes direcciones guardadas.')).toBeInTheDocument()
        })
    })

    it('muestra el botón "Agregar dirección"', async () => {
        render(<AddressesPage />)

        await waitFor(() => {
            expect(screen.getByText('Agregar dirección')).toBeInTheDocument()
        })
    })

    it('abre el formulario al hacer clic en Agregar dirección', async () => {
        render(<AddressesPage />)

        await waitFor(() => {
            expect(screen.getByText('Agregar dirección')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Agregar dirección'))

        expect(screen.getByPlaceholderText('Ej: Av. República del Paraguay 1234')).toBeInTheDocument()
    })

    it('cancela el formulario al hacer clic en Cancelar', async () => {
        render(<AddressesPage />)

        await waitFor(() => {
            expect(screen.getByText('Agregar dirección')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Agregar dirección'))

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Ej: Av. República del Paraguay 1234')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Cancelar'))

        await waitFor(() => {
            expect(screen.queryByPlaceholderText('Ej: Av. República del Paraguay 1234')).not.toBeInTheDocument()
        })
    })

    it('abre diálogo de confirmación al eliminar una dirección', async () => {
        render(<AddressesPage />)

        await waitFor(() => {
            expect(screen.getByText('Av. Test 123')).toBeInTheDocument()
        })

        const deleteButtons = screen.getAllByTitle('Eliminar')
        await userEvent.click(deleteButtons[0])

        expect(screen.getByText('Eliminar dirección')).toBeInTheDocument()
    })

    it('cancela la eliminación al hacer clic en Cancelar del diálogo', async () => {
        render(<AddressesPage />)

        await waitFor(() => {
            expect(screen.getByText('Av. Test 123')).toBeInTheDocument()
        })

        const deleteButtons = screen.getAllByTitle('Eliminar')
        await userEvent.click(deleteButtons[0])

        expect(screen.getByText('Eliminar dirección')).toBeInTheDocument()

        const cancelBtns = screen.getAllByText('Cancelar')
        await userEvent.click(cancelBtns[0])

        await waitFor(() => {
            expect(screen.queryByText('Eliminar dirección')).not.toBeInTheDocument()
        })
    })

    it('llama a deleteAddress al confirmar la eliminación', async () => {
        baseHook.deleteAddress.mockResolvedValueOnce({})

        render(<AddressesPage />)

        await waitFor(() => {
            expect(screen.getByText('Av. Test 123')).toBeInTheDocument()
        })

        const deleteButtons = screen.getAllByTitle('Eliminar')
        await userEvent.click(deleteButtons[0])

        const confirmBtn = screen.getAllByText('Eliminar').find(el => el.tagName === 'BUTTON')
        await userEvent.click(confirmBtn)

        await waitFor(() => {
            expect(baseHook.deleteAddress).toHaveBeenCalledWith(1)
        })
    })

    it('muestra error cuando se envía el formulario sin seleccionar punto en el mapa', async () => {
        render(<AddressesPage />)

        await waitFor(() => screen.getByText('Agregar dirección'))
        await userEvent.click(screen.getByText('Agregar dirección'))

        await waitFor(() =>
            screen.getByPlaceholderText('Ej: Av. República del Paraguay 1234')
        )

        await userEvent.type(
            screen.getByPlaceholderText('Ej: Av. República del Paraguay 1234'),
            'Av. Sin Coordenadas 1'
        )

        const submitBtns = screen.getAllByRole('button', { name: /Agregar dirección/i })
        await userEvent.click(submitBtns[submitBtns.length - 1])

        await waitFor(() => {
            expect(screen.getByText('Debes seleccionar un punto en el mapa.')).toBeInTheDocument()
        })
    })

    it('llama a createAddress al enviar el formulario con coordenadas', async () => {
        baseHook.createAddress.mockResolvedValueOnce({})

        render(<AddressesPage />)

        await waitFor(() => screen.getByText('Agregar dirección'))
        await userEvent.click(screen.getByText('Agregar dirección'))

        await waitFor(() =>
            screen.getByPlaceholderText('Ej: Av. República del Paraguay 1234')
        )

        await userEvent.type(
            screen.getByPlaceholderText('Ej: Av. República del Paraguay 1234'),
            'Av. Test 456'
        )

        await userEvent.click(screen.getByText('Seleccionar en mapa'))

        const submitBtns = screen.getAllByRole('button', { name: /Agregar dirección/i })
        await userEvent.click(submitBtns[submitBtns.length - 1])

        await waitFor(() => {
            expect(baseHook.createAddress).toHaveBeenCalledWith(
                expect.objectContaining({ address: 'Av. Test 456', latitude: -25.3, longitude: -57.6 })
            )
        })
    })

    it('abre formulario de edición al hacer clic en Editar', async () => {
        render(<AddressesPage />)

        await waitFor(() => screen.getByText('Av. Test 123'))

        const editBtns = screen.getAllByTitle('Editar')
        await userEvent.click(editBtns[0])

        await waitFor(() => {
            expect(screen.getByText('Editar dirección')).toBeInTheDocument()
        })
    })

    it('llama a updateAddress al guardar cambios en edición', async () => {
        baseHook.updateAddress.mockResolvedValueOnce({})

        render(<AddressesPage />)

        await waitFor(() => screen.getByText('Av. Test 123'))

        const editBtns = screen.getAllByTitle('Editar')
        await userEvent.click(editBtns[0])

        await waitFor(() => screen.getByText('Editar dirección'))

        const submitBtn = screen.getByRole('button', { name: /Guardar cambios/i })
        await userEvent.click(submitBtn)

        await waitFor(() => {
            expect(baseHook.updateAddress).toHaveBeenCalledWith(
                1,
                expect.objectContaining({ address: 'Av. Test 123' })
            )
        })
    })

    it('muestra skeleton cuando loading es true', async () => {
        useAddresses.mockReturnValue({ ...baseHook, loading: true })

        render(<AddressesPage />)

        await waitFor(() => {
            const pulseElements = document.querySelectorAll('.animate-pulse')
            expect(pulseElements.length).toBeGreaterThan(0)
        })
    })

    it('muestra error de carga de direcciones', async () => {
        useAddresses.mockReturnValue({ ...baseHook, error: 'No se pudieron cargar las direcciones.' })

        render(<AddressesPage />)

        await waitFor(() => {
            expect(screen.getByText('No se pudieron cargar las direcciones.')).toBeInTheDocument()
        })
    })

    it('muestra pantalla de login cuando no hay sesión activa', async () => {
        axios.get.mockResolvedValue({ data: { user: null } })

        render(<AddressesPage />)

        await waitFor(() => {
            expect(screen.getByText('Inicia sesión para continuar')).toBeInTheDocument()
        })
    })
})
