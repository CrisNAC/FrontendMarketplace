import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted garantiza que mockApiClient esté definido antes del izado de vi.mock
const { mockApiClient, mockGetBackendErrorMessage } = vi.hoisted(() => ({
    mockApiClient: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
    mockGetBackendErrorMessage: vi.fn((error, fallback) => fallback ?? 'Error'),
}))

vi.mock('../features/commerces/services/editCommerceApi', () => ({
    apiClient: mockApiClient,
    getBackendErrorMessage: mockGetBackendErrorMessage,
}))

// Mock de axios para isAxiosError
vi.mock('axios', () => ({
    default: {
        isAxiosError: vi.fn(),
    },
}))

import axios from 'axios'
import {
    searchDeliveries,
    linkDeliveryToStore,
    getStoreDeliveryErrorMessage,
} from '../features/commerces/services/commerceStoreDeliveryApi'

import {
    fetchStoreDeliveries,
    deleteStoreDelivery,
    getDeliveryErrorMessage,
} from '../features/commerces/services/commerceDeliveryApi'

// ─── commerceStoreDeliveryApi ─────────────────────────────────────────────────
describe('searchDeliveries', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna array de deliveries en éxito', async () => {
        const mockData = [{ id_user: 1, name: 'Juan' }]
        mockApiClient.get.mockResolvedValue({ data: mockData })
        const result = await searchDeliveries('juan')
        expect(result).toEqual(mockData)
        expect(mockApiClient.get).toHaveBeenCalledWith('/api/deliveries/search', { params: { q: 'juan' } })
    })

    it('retorna array vacío si la respuesta no es array', async () => {
        mockApiClient.get.mockResolvedValue({ data: null })
        const result = await searchDeliveries('x')
        expect(result).toEqual([])
    })

    it('llama sin params cuando no se provee query', async () => {
        mockApiClient.get.mockResolvedValue({ data: [] })
        await searchDeliveries()
        expect(mockApiClient.get).toHaveBeenCalledWith('/api/deliveries/search', {})
    })

    it('retorna mock data completo si 404 y no hay query', async () => {
        const error404 = { response: { status: 404 } }
        mockApiClient.get.mockRejectedValue(error404)
        axios.isAxiosError.mockReturnValue(true)
        const result = await searchDeliveries()
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(3)
    })

    it('filtra mock data por nombre si 404 con query', async () => {
        const error404 = { response: { status: 404 } }
        mockApiClient.get.mockRejectedValue(error404)
        axios.isAxiosError.mockReturnValue(true)
        const result = await searchDeliveries('User A')
        expect(result.length).toBe(1)
        expect(result[0].name).toBe('Test User A')
    })

    it('relanza el error si no es 404', async () => {
        const error500 = { response: { status: 500 } }
        mockApiClient.get.mockRejectedValue(error500)
        axios.isAxiosError.mockReturnValue(false)
        await expect(searchDeliveries('x')).rejects.toEqual(error500)
    })
})

describe('linkDeliveryToStore', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna datos en éxito', async () => {
        const mockResponse = { id_delivery: 1, fk_user: 5 }
        mockApiClient.post.mockResolvedValue({ data: mockResponse })
        const result = await linkDeliveryToStore(10, 5)
        expect(result).toEqual(mockResponse)
        expect(mockApiClient.post).toHaveBeenCalledWith('/api/stores/10/deliveries', { fk_user: 5 })
    })

    it('retorna respuesta mock si 404', async () => {
        const error404 = { response: { status: 404 } }
        mockApiClient.post.mockRejectedValue(error404)
        axios.isAxiosError.mockReturnValue(true)
        const result = await linkDeliveryToStore(10, 5)
        expect(result.fk_user).toBe(5)
        expect(result.delivery_status).toBe('AVAILABLE')
    })

    it('relanza el error si no es 404', async () => {
        const error403 = { response: { status: 403 } }
        mockApiClient.post.mockRejectedValue(error403)
        axios.isAxiosError.mockReturnValue(false)
        await expect(linkDeliveryToStore(10, 5)).rejects.toEqual(error403)
    })
})

describe('getStoreDeliveryErrorMessage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna mensaje del body si está disponible', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { response: { data: { message: 'Error específico' }, status: 400 } }
        expect(getStoreDeliveryErrorMessage(error, 'fallback')).toBe('Error específico')
    })

    it('retorna mensaje de conflicto (409)', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { response: { data: {}, status: 409 } }
        expect(getStoreDeliveryErrorMessage(error, 'fallback')).toBe('Ese repartidor ya está vinculado.')
    })

    it('retorna mensaje de not found (404)', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { response: { data: {}, status: 404 } }
        expect(getStoreDeliveryErrorMessage(error, 'fallback')).toBe('No se encontró al repartidor o no es válido.')
    })

    it('retorna mensaje de forbidden (403)', () => {
        axios.isAxiosError.mockReturnValue(true)
        const error = { response: { data: {}, status: 403 } }
        expect(getStoreDeliveryErrorMessage(error, 'fallback')).toBe('No tenés permiso para vincular deliveries a este comercio.')
    })

    it('delega a getBackendErrorMessage si no es axios error', () => {
        axios.isAxiosError.mockReturnValue(false)
        mockGetBackendErrorMessage.mockReturnValue('fallback error')
        const error = new Error('Network error')
        getStoreDeliveryErrorMessage(error, 'fallback')
        expect(mockGetBackendErrorMessage).toHaveBeenCalled()
    })
})

// ─── commerceDeliveryApi ──────────────────────────────────────────────────────
describe('fetchStoreDeliveries', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna datos de deliveries de la tienda', async () => {
        const mockData = { stats: { total: 2 }, deliveries: [{ id: 1 }] }
        mockApiClient.get.mockResolvedValue({ data: mockData })
        const result = await fetchStoreDeliveries(5)
        expect(result).toEqual(mockData)
        expect(mockApiClient.get).toHaveBeenCalledWith('/api/stores/5/deliveries')
    })

    it('propaga el error si la API falla', async () => {
        mockApiClient.get.mockRejectedValue(new Error('Server error'))
        await expect(fetchStoreDeliveries(5)).rejects.toThrow('Server error')
    })
})

describe('deleteStoreDelivery', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama al endpoint correcto y resuelve', async () => {
        mockApiClient.delete.mockResolvedValue({})
        await expect(deleteStoreDelivery(5, 10)).resolves.not.toThrow()
        expect(mockApiClient.delete).toHaveBeenCalledWith('/api/stores/5/deliveries/10')
    })

    it('propaga el error si la API falla', async () => {
        mockApiClient.delete.mockRejectedValue(new Error('Delete failed'))
        await expect(deleteStoreDelivery(5, 10)).rejects.toThrow('Delete failed')
    })
})

describe('getDeliveryErrorMessage', () => {
    it('retorna data.message si es string', () => {
        const error = { response: { data: { message: 'Error del server' } } }
        expect(getDeliveryErrorMessage(error)).toBe('Error del server')
    })

    it('retorna data.error.message si está disponible', () => {
        const error = { response: { data: { error: { message: 'Error nested' } } } }
        expect(getDeliveryErrorMessage(error)).toBe('Error nested')
    })

    it('retorna data si es string directo', () => {
        const error = { response: { data: 'Simple error' } }
        expect(getDeliveryErrorMessage(error)).toBe('Simple error')
    })

    it('retorna error.message si no hay response', () => {
        const error = { message: 'Network error' }
        expect(getDeliveryErrorMessage(error)).toBe('Network error')
    })

    it('retorna fallback si no hay información de error', () => {
        expect(getDeliveryErrorMessage({}, 'mi fallback')).toBe('mi fallback')
    })

    it('retorna fallback por defecto si no se provee', () => {
        expect(getDeliveryErrorMessage({})).toBe('Ocurrió un error inesperado.')
    })
})
