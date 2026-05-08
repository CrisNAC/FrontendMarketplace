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
}))

vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => ({ get: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } })),
        isAxiosError: vi.fn((err) => !!err?.response),
    }
}))

import axios from 'axios'
import apiClient from '../lib/apiClient'
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

    it('llama a GET /api/deliveries/:id/assignments', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { delivery_assignments: [] } })

        const result = await getDeliveryPendingWithAssignments(5)

        expect(apiClient.get).toHaveBeenCalledWith('/api/deliveries/5/assignments')
        expect(result).toMatchObject({ delivery_assignments: [] })
    })
})

describe('loadDeliveryDashboard', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna reason "not_delivery" si el rol no es DELIVERY', async () => {
        getSession.mockResolvedValueOnce({ user: { id_user: 1, role: 'CUSTOMER' } })

        const result = await loadDeliveryDashboard()

        expect(result.reason).toBe('not_delivery')
        expect(result.assignments).toEqual([])
    })

    it('retorna reason "no_delivery_profile" si no hay id_delivery', async () => {
        getSession.mockResolvedValueOnce({ user: { id_user: 1, role: 'DELIVERY', id_delivery: null } })

        const result = await loadDeliveryDashboard()

        expect(result.reason).toBe('no_delivery_profile')
    })

    it('retorna assignments cuando el delivery tiene perfil', async () => {
        getSession.mockResolvedValueOnce({
            user: { id_user: 2, role: 'DELIVERY', id_delivery: 10 }
        })
        apiClient.get.mockResolvedValueOnce({
            data: { delivery_assignments: [{ id: 1 }, { id: 2 }] }
        })

        const result = await loadDeliveryDashboard()

        expect(result.reason).toBeNull()
        expect(result.assignments).toHaveLength(2)
    })

    it('retorna assignments vacío si delivery_assignments no es array', async () => {
        getSession.mockResolvedValueOnce({
            user: { id_user: 2, role: 'DELIVERY', id_delivery: 10 }
        })
        apiClient.get.mockResolvedValueOnce({ data: { delivery_assignments: null } })

        const result = await loadDeliveryDashboard()

        expect(result.assignments).toEqual([])
    })

    it('maneja el caso donde user es null', async () => {
        getSession.mockResolvedValueOnce({ user: null })

        const result = await loadDeliveryDashboard()

        expect(result.reason).toBe('not_delivery')
    })
})

describe('respondToDeliveryOrder', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a POST con la acción correcta', async () => {
        apiClient.post.mockResolvedValueOnce({ data: { success: true } })

        const result = await respondToDeliveryOrder(42, 'ACCEPT')

        expect(apiClient.post).toHaveBeenCalledWith(
            '/api/assignments/orders/42/delivery-response',
            { action: 'ACCEPT' }
        )
        expect(result).toMatchObject({ success: true })
    })

    it('llama a POST con REJECT', async () => {
        apiClient.post.mockResolvedValueOnce({ data: {} })

        await respondToDeliveryOrder(42, 'REJECT')

        expect(apiClient.post).toHaveBeenCalledWith(
            '/api/assignments/orders/42/delivery-response',
            { action: 'REJECT' }
        )
    })
})

describe('getDeliveryOrderHistory', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET con params básicos', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { orders: [] } })

        const result = await getDeliveryOrderHistory(5)

        expect(apiClient.get).toHaveBeenCalledWith('/api/assignments/5/orders', { params: {} })
        expect(result).toBeTruthy()
    })

    it('incluye todos los query params cuando se proporcionan', async () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        await getDeliveryOrderHistory(5, {
            page: 2,
            limit: 10,
            period: '7d',
            assignment_status: 'COMPLETED',
            orderId: '123',
            userName: 'Juan',
        })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params).toMatchObject({
            page: 2,
            limit: 10,
            period: '7d',
            assignment_status: 'COMPLETED',
            orderId: '123',
            userName: 'Juan',
        })
    })

    it('no incluye params vacíos', async () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        await getDeliveryOrderHistory(5, { period: '', orderId: '' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.period).toBeUndefined()
        expect(config.params.orderId).toBeUndefined()
    })
})

describe('getBackendErrorMessage', () => {
    it('extrae message de string en resData', () => {
        axios.isAxiosError.mockReturnValue(true)
        const err = { response: { data: 'Error de servidor' } }
        expect(getBackendErrorMessage(err, 'fallback')).toBe('Error de servidor')
    })

    it('extrae message de resData.message', () => {
        axios.isAxiosError.mockReturnValue(true)
        const err = { response: { data: { message: 'No encontrado' } } }
        expect(getBackendErrorMessage(err, 'fallback')).toBe('No encontrado')
    })

    it('extrae message de resData.error', () => {
        axios.isAxiosError.mockReturnValue(true)
        const err = { response: { data: { error: 'Acceso denegado' } } }
        expect(getBackendErrorMessage(err, 'fallback')).toBe('Acceso denegado')
    })

    it('extrae message de resData.error.message', () => {
        axios.isAxiosError.mockReturnValue(true)
        const err = { response: { data: { error: { message: 'Error interno' } } } }
        expect(getBackendErrorMessage(err, 'fallback')).toBe('Error interno')
    })

    it('retorna fallback si no hay datos reconocibles', () => {
        axios.isAxiosError.mockReturnValue(true)
        const err = { response: { data: {} } }
        expect(getBackendErrorMessage(err, 'fallback')).toBe('fallback')
    })

    it('retorna message del Error si no es AxiosError', () => {
        axios.isAxiosError.mockReturnValue(false)
        const err = new Error('Error genérico')
        expect(getBackendErrorMessage(err, 'fallback')).toBe('Error genérico')
    })

    it('retorna fallback si no es ni AxiosError ni Error', () => {
        axios.isAxiosError.mockReturnValue(false)
        expect(getBackendErrorMessage({}, 'fallback')).toBe('fallback')
    })
})
