import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockApiClient } = vi.hoisted(() => {
    const mockApiClient = {
        get: vi.fn(),
        put: vi.fn(),
        post: vi.fn(),
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
    fetchProductById,
    fetchProductCategories,
    fetchProductTags,
    updateProduct,
    getBackendErrorMessage,
    getProductImage,
    uploadProductImage,
    deleteProductImage,
} from '../features/commerces/services/editProductApi'

describe('fetchProductById', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /products/:id y retorna data', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: { id: 1, name: 'Laptop' } })

        const result = await fetchProductById(1)

        expect(mockApiClient.get).toHaveBeenCalledWith('/products/1')
        expect(result).toMatchObject({ id: 1, name: 'Laptop' })
    })
})

describe('fetchProductCategories', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna array cuando la respuesta es un array', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Electrónica' }] })

        const result = await fetchProductCategories()

        expect(mockApiClient.get).toHaveBeenCalledWith(
            '/api/categories/products',
            expect.objectContaining({ params: expect.any(Object) })
        )
        expect(result).toHaveLength(1)
    })

    it('retorna array vacío cuando la respuesta no es un array', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: null })

        const result = await fetchProductCategories()

        expect(result).toEqual([])
    })

    it('filtra params vacíos (search vacío no se envía)', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: [] })

        await fetchProductCategories({ search: '', limit: 50 })

        const call = mockApiClient.get.mock.calls[0]
        expect(call[1].params).not.toHaveProperty('search')
        expect(call[1].params).toHaveProperty('limit', 50)
    })

    it('incluye search cuando no está vacío', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: [] })

        await fetchProductCategories({ search: 'ropa', limit: 10 })

        const call = mockApiClient.get.mock.calls[0]
        expect(call[1].params).toHaveProperty('search', 'ropa')
    })
})

describe('fetchProductTags', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /products/tags y retorna array', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'oferta' }] })

        const result = await fetchProductTags({ search: 'oferta' })

        expect(mockApiClient.get).toHaveBeenCalledWith(
            '/products/tags',
            expect.objectContaining({ params: expect.any(Object) })
        )
        expect(result).toHaveLength(1)
    })

    it('retorna array vacío si la respuesta no es array', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: {} })

        const result = await fetchProductTags()

        expect(result).toEqual([])
    })
})

describe('updateProduct', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PUT /products/:id con el payload', async () => {
        mockApiClient.put.mockResolvedValueOnce({ data: { id: 5, name: 'Updated' } })

        const result = await updateProduct({ productId: 5, payload: { name: 'Updated' } })

        expect(mockApiClient.put).toHaveBeenCalledWith('/products/5', { name: 'Updated' })
        expect(result).toMatchObject({ id: 5 })
    })
})

describe('getProductImage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /products/:id/image', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: { image_url: 'https://example.com/img.jpg' } })

        const result = await getProductImage(3)

        expect(mockApiClient.get).toHaveBeenCalledWith('/products/3/image')
        expect(result).toHaveProperty('image_url')
    })
})

describe('uploadProductImage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a POST /products/:id/image con FormData', async () => {
        mockApiClient.post.mockResolvedValueOnce({ data: { image_url: 'https://example.com/new.jpg' } })

        const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
        const result = await uploadProductImage(3, file)

        expect(mockApiClient.post).toHaveBeenCalledWith(
            '/products/3/image',
            expect.any(FormData),
            expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
        )
        expect(result).toHaveProperty('image_url')
    })
})

describe('deleteProductImage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a DELETE /products/:id/image', async () => {
        mockApiClient.delete.mockResolvedValueOnce({ data: { success: true } })

        const result = await deleteProductImage(3)

        expect(mockApiClient.delete).toHaveBeenCalledWith('/products/3/image')
        expect(result).toMatchObject({ success: true })
    })
})

describe('getBackendErrorMessage', () => {
    beforeEach(() => vi.clearAllMocks())

    it.each([
        [true,  { response: { data: { message: 'Error mensaje' } } }, 'Error mensaje'],
        [true,  { response: { data: { error: 'Error campo' } } },     'Error campo'],
        [false, new Error('mensaje de error'),                        'mensaje de error'],
        [false, {},                                                    'fallback'],
    ])('retorna mensaje según tipo de error', (isAxios, input, expected) => {
        axios.isAxiosError.mockReturnValue(isAxios)
        expect(getBackendErrorMessage(input, 'fallback')).toBe(expected)
    })

    it.each([
        [400, 'Datos inválidos. Revisá los campos requeridos.'],
        [401, 'Sesión inválida o expirada. Iniciá sesión nuevamente.'],
        [403, 'No tenés permiso para editar este producto.'],
        [404, 'Producto no encontrado.'],
        [500, 'Error interno del servidor.'],
    ])('retorna mensaje para status %i', (status, expected) => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status, data: {} } }, 'fb')).toBe(expected)
    })
})
