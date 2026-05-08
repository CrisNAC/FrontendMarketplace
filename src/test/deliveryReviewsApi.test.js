import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockApiClient } = vi.hoisted(() => ({
    mockApiClient: { get: vi.fn() }
}))

vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => mockApiClient),
        isAxiosError: vi.fn((err) => !!err?.response),
    }
}))

import axios from 'axios'
import {
    getStoreDeliveryReviews,
    getDeliveryReviewsErrorMessage,
} from '../features/commerces/services/deliveryReviewsApi'

describe('getStoreDeliveryReviews', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama al endpoint correcto y retorna data', async () => {
        const mockData = [{ id: 1, rating: 5 }]
        mockApiClient.get.mockResolvedValueOnce({ data: mockData })

        const result = await getStoreDeliveryReviews(5, 3)

        expect(mockApiClient.get).toHaveBeenCalledWith(
            '/api/stores/5/deliveries/3/reviews',
            { params: {} }
        )
        expect(result).toEqual(mockData)
    })

    it('incluye filtros en los params cuando se proveen', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: [] })

        await getStoreDeliveryReviews(5, 3, { search: 'juan', minRating: 3, maxRating: 5 })

        expect(mockApiClient.get).toHaveBeenCalledWith(
            '/api/stores/5/deliveries/3/reviews',
            { params: { search: 'juan', minRating: 3, maxRating: 5 } }
        )
    })

    it('no incluye filtros vacíos en los params', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: [] })

        await getStoreDeliveryReviews(5, 3, { search: '', minRating: null })

        expect(mockApiClient.get).toHaveBeenCalledWith(
            '/api/stores/5/deliveries/3/reviews',
            { params: {} }
        )
    })

    it('lanza error cuando la llamada falla', async () => {
        mockApiClient.get.mockRejectedValueOnce(new Error('Error de red'))

        await expect(getStoreDeliveryReviews(5, 3)).rejects.toThrow('Error de red')
    })
})

describe('getDeliveryReviewsErrorMessage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna data.message para errores axios', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { response: { data: { message: 'Error del servidor' } } }
        expect(getDeliveryReviewsErrorMessage(error)).toBe('Error del servidor')
    })

    it('retorna data.error.message para errores axios anidados', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { response: { data: { error: { message: 'Error anidado' } } } }
        expect(getDeliveryReviewsErrorMessage(error)).toBe('Error anidado')
    })

    it('retorna fallback cuando no hay mensaje en el error axios', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { response: { data: {} } }
        expect(getDeliveryReviewsErrorMessage(error, 'fallback')).toBe('fallback')
    })

    it('retorna error.message para errores no axios', () => {
        axios.isAxiosError.mockReturnValue(false)
        const error = new Error('Error de red')
        expect(getDeliveryReviewsErrorMessage(error)).toBe('Error de red')
    })

    it('retorna fallback por defecto para errores desconocidos', () => {
        axios.isAxiosError.mockReturnValue(false)
        expect(getDeliveryReviewsErrorMessage({})).toBe('No se pudieron cargar las reseñas del repartidor.')
    })
})
