import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockApiClient } = vi.hoisted(() => ({
    mockApiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() }
}))

vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => mockApiClient),
        isAxiosError: vi.fn((err) => !!err?.response),
    }
}))

import { getProductById } from '../features/commerces/services/productDetailApi'
import { getProductReviews } from '../features/commerces/services/productReviewApi'

describe('productDetailApi - getProductById', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama al endpoint correcto y retorna data', async () => {
        const mockProduct = { id: 7, name: 'Laptop', price: 500000 }
        mockApiClient.get.mockResolvedValueOnce({ data: mockProduct })

        const result = await getProductById(7)

        expect(mockApiClient.get).toHaveBeenCalledWith('/products/7')
        expect(result).toEqual(mockProduct)
    })

    it('lanza el error cuando la llamada falla', async () => {
        mockApiClient.get.mockRejectedValueOnce(new Error('Error de red'))

        await expect(getProductById(7)).rejects.toThrow('Error de red')
    })
})

describe('productReviewApi - getProductReviews', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama al endpoint correcto y retorna data', async () => {
        const mockReviews = { reviews: [], stats: { averageRating: null, totalReviews: 0 } }
        mockApiClient.get.mockResolvedValueOnce({ data: mockReviews })

        const result = await getProductReviews(7)

        expect(mockApiClient.get).toHaveBeenCalledWith('/products/reviews/7')
        expect(result).toEqual(mockReviews)
    })

    it('lanza el error cuando la llamada falla', async () => {
        mockApiClient.get.mockRejectedValueOnce(new Error('Error de red'))

        await expect(getProductReviews(7)).rejects.toThrow('Error de red')
    })
})
