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

    it.each([
        [true,  { response: { data: 'Error directo' } },                      'Error directo'],
        [true,  { response: { data: { message: 'Error mensaje' } } },         'Error mensaje'],
        [true,  { response: { data: { error: 'Error str' } } },               'Error str'],
        [true,  { response: { data: { detail: 'Detalle' } } },                'Detalle'],
        [false, new Error('error directo'),                                     'error directo'],
        [false, {},                                                             'fallback text'],
    ])('retorna mensaje según tipo de error', (isAxios, input, expected) => {
        axios.isAxiosError.mockReturnValue(isAxios)
        expect(getBackendErrorMessage(input, 'fallback text')).toBe(expected)
    })

    it.each([
        [400, 'Datos inválidos. Completá el nombre de la categoría.'],
        [401, 'Necesitas iniciar sesión para solicitar una categoría.'],
        [403, 'Solo los comercios pueden solicitar nuevas categorías.'],
        [409, 'Ya existe esa categoría o una solicitud pendiente con ese nombre.'],
        [500, 'Error interno del servidor.'],
    ])('retorna mensaje específico para status %i', (status, expected) => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status, data: {} } }, 'fb')).toBe(expected)
    })
})
