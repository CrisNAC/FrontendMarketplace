import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../features/commerces/services/editCommerceApi', () => ({
    apiClient: {
        get: vi.fn(),
        delete: vi.fn(),
    }
}))

import { apiClient } from '../features/commerces/services/editCommerceApi'
import {
    fetchStoreDeliveries,
    deleteStoreDelivery,
    getDeliveryErrorMessage,
} from '../features/commerces/services/commerceDeliveryApi'

describe('fetchStoreDeliveries', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/stores/:storeId/deliveries', async () => {
        apiClient.get.mockResolvedValueOnce({
            data: { stats: { total: 2 }, deliveries: [{ id: 1 }, { id: 2 }] }
        })

        const result = await fetchStoreDeliveries(5)

        expect(apiClient.get).toHaveBeenCalledWith('/api/stores/5/deliveries')
        expect(result).toMatchObject({ stats: { total: 2 } })
        expect(result.deliveries).toHaveLength(2)
    })
})

describe('deleteStoreDelivery', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a DELETE /api/stores/:storeId/deliveries/:deliveryId', async () => {
        apiClient.delete.mockResolvedValueOnce(undefined)

        await deleteStoreDelivery(5, 3)

        expect(apiClient.delete).toHaveBeenCalledWith('/api/stores/5/deliveries/3')
    })
})

describe('getDeliveryErrorMessage', () => {
    it('extrae message de data.message', () => {
        const err = { response: { data: { message: 'Delivery no encontrado' } }, message: 'Error' }
        expect(getDeliveryErrorMessage(err)).toBe('Delivery no encontrado')
    })

    it('extrae message de data.error.message', () => {
        const err = { response: { data: { error: { message: 'Error anidado' } } }, message: 'Error' }
        expect(getDeliveryErrorMessage(err)).toBe('Error anidado')
    })

    it('extrae data como string', () => {
        const err = { response: { data: 'Error directo' }, message: 'Error' }
        expect(getDeliveryErrorMessage(err)).toBe('Error directo')
    })

    it('retorna error.message si no hay response.data', () => {
        const err = { message: 'Network error' }
        expect(getDeliveryErrorMessage(err, 'fallback')).toBe('Network error')
    })

    it('retorna el fallback si no hay mensaje disponible', () => {
        expect(getDeliveryErrorMessage({}, 'Error genérico')).toBe('Error genérico')
    })

    it('usa el fallback por defecto si no se proporciona', () => {
        expect(getDeliveryErrorMessage({})).toBe('Ocurrió un error inesperado.')
    })
})
