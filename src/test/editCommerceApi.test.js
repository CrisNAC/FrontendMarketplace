import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockApiClient } = vi.hoisted(() => {
    const mockApiClient = {
        get: vi.fn(),
        put: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
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
    fetchCommerceById,
    fetchCommerceCategories,
    updateCommerce,
    getBackendErrorMessage,
    updateStoreStatus,
    fetchMyCommerce,
    getStoreImage,
    uploadStoreImage,
    deleteStoreImage,
} from '../features/commerces/services/editCommerceApi'

describe('editCommerceApi', () => {
    beforeEach(() => vi.clearAllMocks())

    describe('fetchCommerceById', () => {
        it('llama a GET con el id del comercio y retorna data', async () => {
            mockApiClient.get.mockResolvedValueOnce({ data: { id_store: 5, name: 'MiTienda' } })
            const result = await fetchCommerceById(5)
            expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining('/5'))
            expect(result).toMatchObject({ id_store: 5 })
        })
    })

    describe('fetchCommerceCategories', () => {
        it('retorna array cuando la respuesta es un array', async () => {
            mockApiClient.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Ropa' }] })
            const result = await fetchCommerceCategories()
            expect(result).toHaveLength(1)
            expect(result[0]).toMatchObject({ id: 1 })
        })

        it('retorna array vacío cuando la respuesta no es un array', async () => {
            mockApiClient.get.mockResolvedValueOnce({ data: null })
            const result = await fetchCommerceCategories()
            expect(result).toEqual([])
        })
    })

    describe('updateCommerce', () => {
        it('llama a PUT con el id y payload correctos', async () => {
            mockApiClient.put.mockResolvedValueOnce({ data: { success: true, message: 'Comercio actualizado exitosamente' } })
            const result = await updateCommerce({ commerceId: 5, payload: { name: 'NuevoNombre' } })
            expect(mockApiClient.put).toHaveBeenCalledWith(
                expect.stringContaining('5'),
                { name: 'NuevoNombre' }
            )
            expect(result).toMatchObject({ success: true })
        })
    })

    describe('updateStoreStatus', () => {
        it('llama a PATCH /api/commerces/:id/status con store_status', async () => {
            mockApiClient.patch.mockResolvedValueOnce({ data: { success: true } })
            const result = await updateStoreStatus(5, 'ACTIVE')
            expect(mockApiClient.patch).toHaveBeenCalledWith(
                '/api/commerces/5/status',
                { store_status: 'ACTIVE' }
            )
            expect(result).toMatchObject({ success: true })
        })
    })

    describe('fetchMyCommerce', () => {
        it('llama a GET /api/commerces/:id', async () => {
            mockApiClient.get.mockResolvedValueOnce({ data: { id_store: 5 } })
            const result = await fetchMyCommerce(5)
            expect(mockApiClient.get).toHaveBeenCalledWith('/api/commerces/5')
            expect(result).toMatchObject({ id_store: 5 })
        })
    })

    describe('getStoreImage', () => {
        it('llama a GET /stores/:id/image', async () => {
            mockApiClient.get.mockResolvedValueOnce({ data: { logo: 'https://example.com/logo.png' } })
            const result = await getStoreImage(5)
            expect(mockApiClient.get).toHaveBeenCalledWith('/stores/5/image')
            expect(result).toHaveProperty('logo')
        })
    })

    describe('uploadStoreImage', () => {
        it('llama a POST /stores/:id/image con FormData', async () => {
            mockApiClient.post.mockResolvedValueOnce({ data: { logo: 'https://example.com/logo.png' } })
            const file = new File(['content'], 'logo.png', { type: 'image/png' })
            const result = await uploadStoreImage(5, file)
            expect(mockApiClient.post).toHaveBeenCalledWith(
                '/stores/5/image',
                expect.any(FormData),
                expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
            )
            expect(result).toHaveProperty('logo')
        })
    })

    describe('deleteStoreImage', () => {
        it('llama a DELETE /stores/:id/image', async () => {
            mockApiClient.delete.mockResolvedValueOnce({ data: { success: true } })
            const result = await deleteStoreImage(5)
            expect(mockApiClient.delete).toHaveBeenCalledWith('/stores/5/image')
            expect(result).toMatchObject({ success: true })
        })
    })

    describe('getBackendErrorMessage', () => {
        it.each([
            [true,  { response: { data: 'Error texto' } },                        'Error texto'],
            [true,  { response: { data: { message: 'Error msg' } } },             'Error msg'],
            [true,  { response: { data: { error: 'Error campo' } } },             'Error campo'],
            [true,  { response: { data: { detail: 'Error detail' } } },           'Error detail'],
            [false, new Error('mensaje real'),                                      'mensaje real'],
            [false, {},                                                             'fallback'],
        ])('retorna mensaje según tipo de error', (isAxios, input, expected) => {
            axios.isAxiosError.mockReturnValue(isAxios)
            expect(getBackendErrorMessage(input, 'fallback')).toBe(expected)
        })

        it.each([
            [400, 'Datos inválidos. Revisá los campos requeridos.'],
            [401, 'No estás autenticado. Iniciá sesión nuevamente.'],
            [403, 'No tenés permiso para editar este comercio.'],
            [404, 'Comercio no encontrado.'],
            [409, 'El email ingresado ya está registrado por otro comercio.'],
            [500, 'Error interno del servidor.'],
        ])('retorna mensaje para status %i', (status, expected) => {
            axios.isAxiosError.mockReturnValue(true)
            expect(getBackendErrorMessage({ response: { status, data: {} } }, 'fb')).toBe(expected)
        })
    })
})
