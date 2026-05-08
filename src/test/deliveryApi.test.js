import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    }
}))

vi.mock('../features/commerces/services/editUserProfileApi', () => ({
    getSession: vi.fn(),
    fetchUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),
}))

import apiClient from '../lib/apiClient'
import { getSession, fetchUserProfile, updateUserProfile } from '../features/commerces/services/editUserProfileApi'
import {
    getCurrentUserForDeliveryForm,
    getDeliveryProfile,
    becomeDelivery,
    updateMyDelivery,
    updateDeliveryStatus,
    UI_VEHICLE_LABELS,
} from '../features/clients/services/deliveryApi'

describe('getCurrentUserForDeliveryForm', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna sesión y perfil cuando hay sesión activa', async () => {
        getSession.mockResolvedValueOnce({ user: { id_user: 7, name: 'Test' } })
        fetchUserProfile.mockResolvedValueOnce({ phone: '0981000000' })

        const result = await getCurrentUserForDeliveryForm()

        expect(result).toMatchObject({
            userId: 7,
            sessionUser: { id_user: 7 },
            profile: { phone: '0981000000' },
        })
    })

    it('lanza error si no hay id_user en la sesión', async () => {
        getSession.mockResolvedValueOnce({ user: null })

        await expect(getCurrentUserForDeliveryForm()).rejects.toThrow('No hay sesión activa.')
    })

    it('lanza error si getSession falla', async () => {
        getSession.mockRejectedValueOnce(new Error('Network'))

        await expect(getCurrentUserForDeliveryForm()).rejects.toThrow()
    })

    it('retorna profile: null si fetchUserProfile retorna null', async () => {
        getSession.mockResolvedValueOnce({ user: { id_user: 1 } })
        fetchUserProfile.mockResolvedValueOnce(null)

        const result = await getCurrentUserForDeliveryForm()

        expect(result.profile).toBeNull()
    })
})

describe('getDeliveryProfile', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/deliveries/:id', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { id_delivery: 5 } })

        const result = await getDeliveryProfile(5)

        expect(apiClient.get).toHaveBeenCalledWith('/api/deliveries/5')
        expect(result).toMatchObject({ id_delivery: 5 })
    })
})

describe('becomeDelivery', () => {
    beforeEach(() => vi.clearAllMocks())

    it('registra como delivery con tipo de vehículo válido', async () => {
        apiClient.post.mockResolvedValueOnce({ data: { id_delivery: 10 } })

        const result = await becomeDelivery('AUTOMOVIL')

        expect(apiClient.post).toHaveBeenCalledWith('/api/deliveries/register', { vehicleType: 'CAR' })
        expect(result).toMatchObject({ id_delivery: 10 })
    })

    it('traduce BICICLETA a BICYCLE', async () => {
        apiClient.post.mockResolvedValueOnce({ data: {} })

        await becomeDelivery('BICICLETA')

        expect(apiClient.post).toHaveBeenCalledWith('/api/deliveries/register', { vehicleType: 'BICYCLE' })
    })

    it('lanza error con tipo de vehículo inválido', async () => {
        await expect(becomeDelivery('AVION')).rejects.toThrow('Tipo de vehículo no válido.')
    })

    it('actualiza el teléfono si se proporciona', async () => {
        apiClient.post.mockResolvedValueOnce({ data: { id_delivery: 1 } })
        getSession.mockResolvedValueOnce({ user: { id_user: 7 } })
        updateUserProfile.mockResolvedValueOnce({})

        await becomeDelivery('MOTOCICLETA', '0981000000')

        expect(updateUserProfile).toHaveBeenCalledWith(7, { phone: '0981000000' })
    })

    it('no actualiza teléfono si el string está vacío', async () => {
        apiClient.post.mockResolvedValueOnce({ data: {} })

        await becomeDelivery('A_PIE', '  ')

        expect(updateUserProfile).not.toHaveBeenCalled()
    })

    it('no lanza error si la actualización del teléfono falla', async () => {
        apiClient.post.mockResolvedValueOnce({ data: {} })
        getSession.mockRejectedValueOnce(new Error('Sesión inválida'))

        await expect(becomeDelivery('AUTOMOVIL', '0981111111')).resolves.not.toThrow()
    })
})

describe('updateMyDelivery', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PUT con FormData', async () => {
        apiClient.put.mockResolvedValueOnce({ data: { id_delivery: 5 } })

        const result = await updateMyDelivery(5, { name: 'Pedro', phone: '0981', vehicleType: 'CAR' }, null)

        expect(apiClient.put).toHaveBeenCalledWith(
            '/api/deliveries/5',
            expect.any(FormData),
            expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
        )
        expect(result).toMatchObject({ id_delivery: 5 })
    })
})

describe('updateDeliveryStatus', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PATCH con el nuevo estado', async () => {
        apiClient.patch.mockResolvedValueOnce({ data: { delivery_status: 'ACTIVE' } })

        const result = await updateDeliveryStatus(5, 'ACTIVE')

        expect(apiClient.patch).toHaveBeenCalledWith('/api/deliveries/5/status', { delivery_status: 'ACTIVE' })
        expect(result).toMatchObject({ delivery_status: 'ACTIVE' })
    })

    it('propaga el error si la petición falla', async () => {
        apiClient.patch.mockRejectedValueOnce(new Error('Network error'))

        await expect(updateDeliveryStatus(5, 'INACTIVE')).rejects.toThrow('Network error')
    })
})

describe('UI_VEHICLE_LABELS', () => {
    it('tiene las etiquetas correctas para cada tipo', () => {
        expect(UI_VEHICLE_LABELS.CAR).toBe('Automóvil')
        expect(UI_VEHICLE_LABELS.MOTORCYCLE).toBe('Motocicleta / scooter')
        expect(UI_VEHICLE_LABELS.BICYCLE).toBe('Bicicleta')
        expect(UI_VEHICLE_LABELS.ON_FOOT).toBe('A pie')
    })
})
