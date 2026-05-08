import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockApiClient } = vi.hoisted(() => ({
    mockApiClient: { get: vi.fn(), post: vi.fn() }
}))

vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => mockApiClient),
        isAxiosError: vi.fn((err) => !!err?.response),
    }
}))

import axios from 'axios'
import { submitCategoryRequest, getBackendErrorMessage } from '../features/commerces/services/categoryRequestApi'

describe('submitCategoryRequest', () => {
    beforeEach(() => vi.clearAllMocks())

    it('envía POST con el nombre y retorna data', async () => {
        mockApiClient.post.mockResolvedValueOnce({ data: { message: 'ok', data: { id: 1 } } })

        const result = await submitCategoryRequest({ name: 'Electrónica' })

        expect(mockApiClient.post).toHaveBeenCalledWith(
            '/api/commerces/category-requests',
            { name: 'Electrónica' }
        )
        expect(result).toMatchObject({ message: 'ok' })
    })
})

describe('getBackendErrorMessage - categoryRequestApi', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna string de data', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { data: 'Error directo' } }, 'fb')).toBe('Error directo')
    })

    it('retorna data.message', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { data: { message: 'Error mensaje' } } }, 'fb')).toBe('Error mensaje')
    })

    it('retorna data.error', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { data: { error: 'Error str' } } }, 'fb')).toBe('Error str')
    })

    it('retorna data.detail', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { data: { detail: 'Detalle' } } }, 'fb')).toBe('Detalle')
    })

    it('retorna mensaje específico para 400', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 400, data: {} } }, 'fb')).toBe('Datos inválidos. Completá el nombre de la categoría.')
    })

    it('retorna mensaje específico para 401', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 401, data: {} } }, 'fb')).toBe('Necesitas iniciar sesión para solicitar una categoría.')
    })

    it('retorna mensaje específico para 403', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 403, data: {} } }, 'fb')).toBe('Solo los comercios pueden solicitar nuevas categorías.')
    })

    it('retorna mensaje específico para 409', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 409, data: {} } }, 'fb')).toBe('Ya existe esa categoría o una solicitud pendiente con ese nombre.')
    })

    it('retorna mensaje específico para 500', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 500, data: {} } }, 'fb')).toBe('Error interno del servidor.')
    })

    it('retorna error.message para instancia de Error', () => {
        axios.isAxiosError.mockReturnValue(false)
        expect(getBackendErrorMessage(new Error('error directo'), 'fb')).toBe('error directo')
    })

    it('retorna fallback para error desconocido', () => {
        axios.isAxiosError.mockReturnValue(false)
        expect(getBackendErrorMessage({}, 'fallback text')).toBe('fallback text')
    })
})
