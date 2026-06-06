import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    }
}))

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    }
}))

import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'
import {
    getDeliveryAssignments,
    getActiveDeliveryAssignments,
    completeDeliveryAssignment,
    getDeliveryOrderHistory,
} from '../features/delivery/services/deliveryAssignmentsApi'

describe('getDeliveryAssignments', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET sin status cuando no se pasa', async () => {
        apiClient.get.mockResolvedValueOnce({ data: [{ id: 1 }] })

        const result = await getDeliveryAssignments(10)

        expect(apiClient.get).toHaveBeenCalledWith('/api/assignments/deliveries/10/assignments')
        expect(result).toEqual([{ id: 1 }])
    })

    it('agrega ?status= cuando se pasa', async () => {
        apiClient.get.mockResolvedValueOnce({ data: [] })

        await getDeliveryAssignments(10, 'ACCEPTED')

        expect(apiClient.get).toHaveBeenCalledWith('/api/assignments/deliveries/10/assignments?status=ACCEPTED')
    })

    it('propaga el error si falla', async () => {
        apiClient.get.mockRejectedValueOnce(new Error('Network'))

        await expect(getDeliveryAssignments(10)).rejects.toThrow('Network')
    })
})

describe('getActiveDeliveryAssignments', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a getDeliveryAssignments con status ACCEPTED', async () => {
        apiClient.get.mockResolvedValueOnce({ data: [] })

        await getActiveDeliveryAssignments(10)

        expect(apiClient.get).toHaveBeenCalledWith('/api/assignments/deliveries/10/assignments?status=ACCEPTED')
    })
})

describe('completeDeliveryAssignment', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a POST /api/assignments/:id/complete y muestra toast de éxito', async () => {
        apiClient.post.mockResolvedValueOnce({ data: { success: true } })

        const result = await completeDeliveryAssignment(55)

        expect(apiClient.post).toHaveBeenCalledWith('/api/assignments/55/complete')
        expect(toast.success).toHaveBeenCalledWith('Entrega finalizada correctamente')
        expect(result).toMatchObject({ success: true })
    })

    it('muestra toast de error y propaga el error cuando falla', async () => {
        const err = { response: { data: { error: { message: 'No autorizado' } } } }
        apiClient.post.mockRejectedValueOnce(err)

        await expect(completeDeliveryAssignment(55)).rejects.toEqual(err)
        expect(toast.error).toHaveBeenCalledWith('No autorizado')
    })

    it('usa mensaje por defecto cuando no hay mensaje en el error', async () => {
        apiClient.post.mockRejectedValueOnce(new Error('fail'))

        await expect(completeDeliveryAssignment(55)).rejects.toThrow()
        expect(toast.error).toHaveBeenCalledWith('Error al finalizar la entrega')
    })
})

describe('getDeliveryOrderHistory', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET sin query string cuando no hay filtros', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { orders: [] } })

        const result = await getDeliveryOrderHistory(10)

        expect(apiClient.get).toHaveBeenCalledWith('/api/assignments/10/orders')
        expect(result).toMatchObject({ orders: [] })
    })

    it('construye el query string con los filtros proporcionados', async () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        await getDeliveryOrderHistory(10, { period: '7d', page: 1, limit: 10 })

        const call = apiClient.get.mock.calls[0]
        expect(call[0]).toContain('period=7d')
        expect(call[0]).toContain('page=1')
        expect(call[0]).toContain('limit=10')
    })

    it('incluye assignment_status, orderId y userName cuando se pasan', async () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        await getDeliveryOrderHistory(10, {
            assignment_status: 'DELIVERED',
            orderId: '123',
            userName: 'Juan',
        })

        const call = apiClient.get.mock.calls[0]
        expect(call[0]).toContain('assignment_status=DELIVERED')
        expect(call[0]).toContain('orderId=123')
        expect(call[0]).toContain('userName=Juan')
    })

    it('propaga el error si falla', async () => {
        apiClient.get.mockRejectedValueOnce(new Error('Network'))

        await expect(getDeliveryOrderHistory(10)).rejects.toThrow('Network')
    })
})
