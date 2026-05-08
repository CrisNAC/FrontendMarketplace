import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockApiClient } = vi.hoisted(() => ({
    mockApiClient: { get: vi.fn(), post: vi.fn() }
}))

vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => mockApiClient),
        isAxiosError: vi.fn((err) => !!err?.isAxios),
    }
}))

import axios from 'axios'
import {
    fetchAvailableDeliveries,
    createDeliveryAssignment,
    checkOrderAssignment,
    getAssignmentErrorMessage,
} from '../features/commerces/services/deliveryAssignmentApi'

describe('fetchAvailableDeliveries', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama al endpoint correcto y retorna data', async () => {
        const mockData = [{ id: 1, name: 'Repartidor' }]
        mockApiClient.get.mockResolvedValueOnce({ data: mockData })

        const result = await fetchAvailableDeliveries(3, 7)

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/stores/3/orders/7/deliveries')
        expect(result).toEqual(mockData)
    })

    it('lanza error cuando la llamada falla', async () => {
        mockApiClient.get.mockRejectedValueOnce(new Error('Error de red'))
        await expect(fetchAvailableDeliveries(3, 7)).rejects.toThrow('Error de red')
    })
})

describe('createDeliveryAssignment', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama al endpoint correcto con fk_order y fk_delivery', async () => {
        const mockData = { id: 99, fk_order: 7, fk_delivery: 1 }
        mockApiClient.post.mockResolvedValueOnce({ data: mockData })

        const result = await createDeliveryAssignment(7, 1)

        expect(mockApiClient.post).toHaveBeenCalledWith('/api/assignments', { fk_order: 7, fk_delivery: 1 })
        expect(result).toEqual(mockData)
    })

    it('lanza error cuando la llamada falla', async () => {
        mockApiClient.post.mockRejectedValueOnce(new Error('Error de red'))
        await expect(createDeliveryAssignment(7, 1)).rejects.toThrow('Error de red')
    })
})

describe('checkOrderAssignment', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna data cuando la asignación existe', async () => {
        const mockData = { has_assignment: true, delivery: { id: 1 } }
        mockApiClient.get.mockResolvedValueOnce({ data: mockData })

        const result = await checkOrderAssignment(10)

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/orders/10/assignment')
        expect(result).toEqual(mockData)
    })

    it('retorna { has_assignment: false } cuando el status es 404', async () => {
        const error = { response: { status: 404 } }
        mockApiClient.get.mockRejectedValueOnce(error)

        const result = await checkOrderAssignment(10)

        expect(result).toEqual({ has_assignment: false })
    })

    it('relanza el error cuando no es 404', async () => {
        const error = { response: { status: 500 }, message: 'Error interno' }
        mockApiClient.get.mockRejectedValueOnce(error)

        await expect(checkOrderAssignment(10)).rejects.toEqual(error)
    })
})

describe('getAssignmentErrorMessage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna data.message para errores axios', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { isAxios: true, response: { data: { message: 'Error del servidor' } } }
        expect(getAssignmentErrorMessage(error)).toBe('Error del servidor')
    })

    it('retorna data.error.message para errores axios anidados', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { isAxios: true, response: { data: { error: { message: 'Error anidado' } } } }
        expect(getAssignmentErrorMessage(error)).toBe('Error anidado')
    })

    it('retorna fallback cuando no hay mensaje en error axios', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { isAxios: true, response: { data: {} } }
        expect(getAssignmentErrorMessage(error, 'Fallback')).toBe('Fallback')
    })

    it('retorna error.message para errores no axios', () => {
        axios.isAxiosError.mockReturnValue(false)
        const error = new Error('Error de red')
        expect(getAssignmentErrorMessage(error)).toBe('Error de red')
    })

    it('retorna fallback por defecto para errores desconocidos', () => {
        axios.isAxiosError.mockReturnValue(false)
        expect(getAssignmentErrorMessage({})).toBe('Ocurrió un error inesperado.')
    })
})
