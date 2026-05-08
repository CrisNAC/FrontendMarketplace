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

    it('retorna data.message cuando es Axios error', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { data: { message: 'Error mensaje' } } }, 'fb')).toBe('Error mensaje')
    })

    it('retorna data.error cuando no hay message', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { data: { error: 'Error campo' } } }, 'fb')).toBe('Error campo')
    })

    it('retorna mensaje de status 400', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 400, data: {} } }, 'fb')).toBe('Datos inválidos. Revisá los campos requeridos.')
    })

    it('retorna mensaje de status 401', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 401, data: {} } }, 'fb')).toBe('Sesión inválida o expirada. Iniciá sesión nuevamente.')
    })

    it('retorna mensaje de status 403', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 403, data: {} } }, 'fb')).toBe('No tenés permiso para editar este producto.')
    })

    it('retorna mensaje de status 404', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 404, data: {} } }, 'fb')).toBe('Producto no encontrado.')
    })

    it('retorna mensaje de status 500', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 500, data: {} } }, 'fb')).toBe('Error interno del servidor.')
    })

    it('retorna error.message para instancia de Error', () => {
        axios.isAxiosError.mockReturnValue(false)
        expect(getBackendErrorMessage(new Error('mensaje de error'), 'fb')).toBe('mensaje de error')
    })

    it('retorna fallback para error desconocido', () => {
        axios.isAxiosError.mockReturnValue(false)
        expect(getBackendErrorMessage({}, 'fallback')).toBe('fallback')
    })
})
