import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockApiClient } = vi.hoisted(() => {
    const mockApiClient = {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
    }
    return { mockApiClient }
})

vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => mockApiClient),
        isAxiosError: vi.fn((err) => !!err?.response),
    }
}))

import axios from 'axios'
import {
    getOrdersByCustomer,
    getOrderById,
    cancelOrder,
    getPendingDeliveryReviews,
    createDeliveryReview,
    getBackendErrorMessage,
} from '../features/commerces/services/orderApi'

describe('getOrdersByCustomer', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/users/:customerId/orders', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] })

        const result = await getOrdersByCustomer(7)

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/users/7/orders')
        expect(result).toHaveLength(2)
    })
})

describe('getOrderById', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna el pedido con el id correcto', async () => {
        mockApiClient.get.mockResolvedValueOnce({
            data: [{ id: 1 }, { id: 2, status: 'PENDING' }]
        })

        const result = await getOrderById(7, '2')

        expect(result).toMatchObject({ id: 2 })
    })

    it('retorna null si el pedido no existe', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: [{ id: 1 }] })

        const result = await getOrderById(7, '99')

        expect(result).toBeNull()
    })
})

describe('cancelOrder', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PATCH /api/orders/:orderId/status con CANCELLED', async () => {
        mockApiClient.patch.mockResolvedValueOnce({ data: { status: 'CANCELLED' } })

        const result = await cancelOrder(5)

        expect(mockApiClient.patch).toHaveBeenCalledWith('/api/orders/5/status', {
            order_status: 'CANCELLED',
        })
        expect(result).toMatchObject({ status: 'CANCELLED' })
    })
})

describe('getPendingDeliveryReviews', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/orders/pending-delivery-reviews', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: [{ id: 1 }] })

        const result = await getPendingDeliveryReviews()

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/orders/pending-delivery-reviews')
        expect(result).toHaveLength(1)
    })
})

describe('createDeliveryReview', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a POST /api/orders/:orderId/delivery-review con el payload', async () => {
        mockApiClient.post.mockResolvedValueOnce({ data: { success: true } })

        const result = await createDeliveryReview(10, { rating: 5, comment: 'Excelente' })

        expect(mockApiClient.post).toHaveBeenCalledWith(
            '/api/orders/10/delivery-review',
            { rating: 5, comment: 'Excelente' }
        )
        expect(result).toMatchObject({ success: true })
    })
})

describe('getBackendErrorMessage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('extrae string de data', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { data: 'Error' } }, 'fb')).toBe('Error')
    })

    it('extrae data.message', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { data: { message: 'Msg' } } }, 'fb')).toBe('Msg')
    })

    it('retorna el mensaje del Error para errores no-Axios', () => {
        axios.isAxiosError.mockReturnValue(false)
        // orderApi retorna error.message si es instancia de Error
        expect(getBackendErrorMessage(new Error('e'), 'fallback')).toBe('e')
    })
})
