import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeliveryProfilePage } from '../features/delivery/pages/DeliveryProfilePage'

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

vi.mock('../features/clients/services/deliveryApi', () => ({
    getCurrentUserForDeliveryForm: vi.fn(),
    getDeliveryProfile: vi.fn(),
}))

vi.mock('../features/commerces/services/editUserProfileApi', () => ({
    getBackendErrorMessage: (_err, fallback) => fallback,
}))

import { getCurrentUserForDeliveryForm, getDeliveryProfile } from '../features/clients/services/deliveryApi'

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const mockUserSessionAndProfile = {
    sessionUser: { id_user: 1, role: 'DELIVERY', name: 'Delivery Guy', email: 'delivery@test.com', id_delivery: 5 },
    profile: { phone: '0981000000' }
}

const mockDeliveryProfile = {
    id_delivery: 5,
    delivery_status: 'ACTIVE',
    vehicle_type: 'CAR',
    coverage_city: 'Asunción',
    coverage_region: 'Central',
    coverage_radius_km: 10,
    availability_notes: 'Lunes a Viernes',
    average_rating: 4.5,
    total_deliveries: 20,
    reviews_count: 5,
    created_at: new Date().toISOString()
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('DeliveryProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('muestra el badge "Disponible" cuando el delivery está ACTIVE', async () => {
        getCurrentUserForDeliveryForm.mockResolvedValueOnce(mockUserSessionAndProfile)
        getDeliveryProfile.mockResolvedValueOnce(mockDeliveryProfile)

        render(<DeliveryProfilePage />)

        await waitFor(() => {
            expect(screen.getByText('Disponible')).toBeInTheDocument()
        })

        expect(screen.getByText('Delivery Guy')).toBeInTheDocument()
        expect(screen.getByText('CAR')).toBeInTheDocument()
        expect(screen.getByText('Asunción')).toBeInTheDocument()
    })

    it('maneja el error correctamente si getCurrentUserForDeliveryForm falla', async () => {
        getCurrentUserForDeliveryForm.mockRejectedValueOnce(new Error('Network error'))

        render(<DeliveryProfilePage />)

        await waitFor(() => {
            expect(screen.getByText('No se pudo cargar el perfil del delivery.')).toBeInTheDocument()
        })
    })
})
