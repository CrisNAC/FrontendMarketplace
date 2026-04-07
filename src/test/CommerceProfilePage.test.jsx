import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CommerceProfilePage } from '../features/commerces/pages/CommerceProfilePage'

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

vi.mock('../features/commerces/services/editCommerceApi', () => ({
    apiClient: { get: vi.fn() },
    getBackendErrorMessage: (_err, fallback) => fallback,
    updateStoreStatus: vi.fn(),
}))

import { apiClient, updateStoreStatus } from '../features/commerces/services/editCommerceApi'

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const mockSession = {
    data: { user: { id_store: 5 } }
}

const mockActiveCommerce = {
    data: {
        id_store: 5,
        name: "Comercio Test",
        store_status: "ACTIVE",
        status: true,
        email: "test@test.com",
        phone: "0981000000",
        description: "Descripción test",
        store_category: { name: "Tecnología" },
        addresses: [{ address: "Calle 1", city: "Asunción", region: "Central" }],
        created_at: new Date().toISOString(),
    }
}

const mockInactiveCommerce = {
    data: { ...mockActiveCommerce.data, store_status: "INACTIVE" }
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('CommerceProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra badge "Inactivo" cuando el comercio está INACTIVE', async () => {
        apiClient.get
            .mockResolvedValueOnce(mockSession)
            .mockResolvedValueOnce(mockInactiveCommerce)

        render(<CommerceProfilePage />)

        await waitFor(() => {
            expect(screen.getByText('Inactivo')).toBeInTheDocument()
        })

        // El botón debe decir "Habilitar Comercio" cuando está inactivo
        expect(screen.getByText('Habilitar Comercio')).toBeInTheDocument()
    })

    it('muestra el modal de confirmación al hacer click en "Deshabilitar Comercio"', async () => {
        apiClient.get
            .mockResolvedValueOnce(mockSession)
            .mockResolvedValueOnce(mockActiveCommerce)

        render(<CommerceProfilePage />)

        await waitFor(() => {
            expect(screen.getByText('Deshabilitar Comercio')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Deshabilitar Comercio'))

        // El modal debe aparecer con el texto de confirmación
        expect(screen.getByText('¿Deshabilitar comercio?')).toBeInTheDocument()
        expect(screen.getByText(/Tus productos dejarán de ser visibles/)).toBeInTheDocument()
    })

    it('llama a updateStoreStatus con INACTIVE al confirmar deshabilitar', async () => {
        apiClient.get
            .mockResolvedValueOnce(mockSession)
            .mockResolvedValueOnce(mockActiveCommerce)

        updateStoreStatus.mockResolvedValue({ success: true })

        render(<CommerceProfilePage />)

        await waitFor(() => {
            expect(screen.getByText('Deshabilitar Comercio')).toBeInTheDocument()
        })

        // Abrir modal
        await userEvent.click(screen.getByText('Deshabilitar Comercio'))

        // Confirmar en el modal
        await userEvent.click(screen.getByText('Deshabilitar'))

        expect(updateStoreStatus).toHaveBeenCalledWith(5, 'INACTIVE')
    })
})