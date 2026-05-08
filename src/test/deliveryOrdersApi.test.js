import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockApiClient } = vi.hoisted(() => ({
    mockApiClient: { get: vi.fn(), post: vi.fn() },
}))

vi.mock('../lib/apiClient', () => ({ default: mockApiClient }))

vi.mock('../features/commerces/services/editUserProfileApi', () => ({
    getSession: vi.fn(),
}))

vi.mock('axios', () => ({
    default: { isAxiosError: vi.fn() },
}))

import axios from 'axios'
import { getSession } from '../features/commerces/services/editUserProfileApi'
import {
    getDeliveryPendingWithAssignments,
    loadDeliveryDashboard,
    respondToDeliveryOrder,
    getDeliveryOrderHistory,
    getBackendErrorMessage,
} from '../features/delivery/services/deliveryOrdersApi'

describe('getDeliveryPendingWithAssignments', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna datos del delivery con asignaciones', async () => {
        const mockData = { delivery_assignments: [{ id: 1 }] }
        mockApiClient.get.mockResolvedValue({ data: mockData })
        const result = await getDeliveryPendingWithAssignments(5)
        expect(result).toEqual(mockData)
        expect(mockApiClient.get).toHaveBeenCalledWith('/api/deliveries/5/assignments')
    })
})

describe('loadDeliveryDashboard', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna reason "not_delivery" si el usuario no es DELIVERY', async () => {
        getSession.mockResolvedValue({ user: { id_user: 1, role: 'CUSTOMER' } })
        const result = await loadDeliveryDashboard()
        expect(result.reason).toBe('not_delivery')
        expect(result.assignments).toEqual([])
    })

    it('retorna reason "not_delivery" si no hay usuario', async () => {
        getSession.mockResolvedValue({ user: null })
        const result = await loadDeliveryDashboard()
        expect(result.reason).toBe('not_delivery')
    })

    it('retorna reason "no_delivery_profile" si DELIVERY no tiene id_delivery', async () => {
        getSession.mockResolvedValue({ user: { id_user: 1, role: 'DELIVERY', id_delivery: null } })
        const result = await loadDeliveryDashboard()
        expect(result.reason).toBe('no_delivery_profile')
        expect(result.delivery).toBeNull()
    })

    it('carga asignaciones si el usuario DELIVERY tiene id_delivery', async () => {
        getSession.mockResolvedValue({ user: { id_user: 1, role: 'DELIVERY', id_delivery: 10 } })
        const mockDelivery = { delivery_assignments: [{ id: 1 }, { id: 2 }] }
        mockApiClient.get.mockResolvedValue({ data: mockDelivery })
        const result = await loadDeliveryDashboard()
        expect(result.reason).toBeNull()
        expect(result.assignments).toHaveLength(2)
    })

    it('retorna assignments vacío si delivery_assignments no es array', async () => {
        getSession.mockResolvedValue({ user: { id_user: 1, role: 'DELIVERY', id_delivery: 10 } })
        mockApiClient.get.mockResolvedValue({ data: { delivery_assignments: null } })
        const result = await loadDeliveryDashboard()
        expect(result.assignments).toEqual([])
    })
})

describe('respondToDeliveryOrder', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama al endpoint correcto con ACCEPT', async () => {
        mockApiClient.post.mockResolvedValue({ data: { success: true } })
        const result = await respondToDeliveryOrder(42, 'ACCEPT')
        expect(result).toEqual({ success: true })
        expect(mockApiClient.post).toHaveBeenCalledWith(
            '/api/assignments/orders/42/delivery-response',
            { action: 'ACCEPT' }
        )
    })

    it('llama al endpoint correcto con REJECT', async () => {
        mockApiClient.post.mockResolvedValue({ data: { success: false } })
        await respondToDeliveryOrder(42, 'REJECT')
        expect(mockApiClient.post).toHaveBeenCalledWith(
            '/api/assignments/orders/42/delivery-response',
            { action: 'REJECT' }
        )
    })
})

describe('getDeliveryOrderHistory', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama sin params cuando query está vacío', async () => {
        mockApiClient.get.mockResolvedValue({ data: { orders: [] } })
        await getDeliveryOrderHistory(5)
        expect(mockApiClient.get).toHaveBeenCalledWith('/api/assignments/5/orders', { params: {} })
    })

    it('incluye page y limit si se proveen', async () => {
        mockApiClient.get.mockResolvedValue({ data: {} })
        await getDeliveryOrderHistory(5, { page: 2, limit: 10 })
        expect(mockApiClient.get).toHaveBeenCalledWith('/api/assignments/5/orders', {
            params: { page: 2, limit: 10 },
        })
    })

    it('incluye period si no está vacío', async () => {
        mockApiClient.get.mockResolvedValue({ data: {} })
        await getDeliveryOrderHistory(5, { period: '7d' })
        const { params } = mockApiClient.get.mock.calls[0][1]
        expect(params.period).toBe('7d')
    })

    it('no incluye period si está vacío', async () => {
        mockApiClient.get.mockResolvedValue({ data: {} })
        await getDeliveryOrderHistory(5, { period: '' })
        const { params } = mockApiClient.get.mock.calls[0][1]
        expect(params.period).toBeUndefined()
    })

    it('incluye assignment_status, orderId y userName si se proveen', async () => {
        mockApiClient.get.mockResolvedValue({ data: {} })
        await getDeliveryOrderHistory(5, { assignment_status: 'ACCEPTED', orderId: 99, userName: 'Juan' })
        const { params } = mockApiClient.get.mock.calls[0][1]
        expect(params.assignment_status).toBe('ACCEPTED')
        expect(params.orderId).toBe('99')
        expect(params.userName).toBe('Juan')
    })
})

describe('getBackendErrorMessage (delivery)', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna resData si es string', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { response: { data: 'mensaje directo' } }
        expect(getBackendErrorMessage(error, 'fallback')).toBe('mensaje directo')
    })

    it('retorna resData.message si es string', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { response: { data: { message: 'mensaje objeto' } } }
        expect(getBackendErrorMessage(error, 'fallback')).toBe('mensaje objeto')
    })

    it('retorna resData.error si es string', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { response: { data: { error: 'error directo' } } }
        expect(getBackendErrorMessage(error, 'fallback')).toBe('error directo')
    })

    it('retorna resData.error.message si está disponible', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { response: { data: { error: { message: 'error anidado' } } } }
        expect(getBackendErrorMessage(error, 'fallback')).toBe('error anidado')
    })

    it('retorna fallback cuando es axios error sin mensaje parseable', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { response: { data: {} } }
        expect(getBackendErrorMessage(error, 'fallback')).toBe('fallback')
    })

    it('retorna error.message si es instancia de Error', () => {
        axios.isAxiosError.mockReturnValue(false)
        const error = new Error('generic error')
        expect(getBackendErrorMessage(error, 'fallback')).toBe('generic error')
    })

    it('retorna fallback si no hay información', () => {
        axios.isAxiosError.mockReturnValue(false)
        expect(getBackendErrorMessage({}, 'mi fallback')).toBe('mi fallback')
    })
})
