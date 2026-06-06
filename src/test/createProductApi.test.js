import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockApiClient } = vi.hoisted(() => {
    const mockApiClient = {
        get: vi.fn(),
        post: vi.fn(),
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
    fetchCurrentSessionUser,
    fetchProductCategories,
    fetchProductTags,
    createProduct,
    getBackendErrorMessage,
    uploadProductImage,
} from '../features/commerces/services/createProductApi'

describe('fetchCurrentSessionUser', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna el usuario de sesión', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: { user: { id_user: 7 } } })
        const result = await fetchCurrentSessionUser()
        expect(result).toMatchObject({ id_user: 7 })
    })

    it('también acepta data.data.user', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: { data: { user: { id_user: 5 } } } })
        const result = await fetchCurrentSessionUser()
        expect(result).toMatchObject({ id_user: 5 })
    })

    it('lanza error cuando no hay id_user', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: { user: null } })
        await expect(fetchCurrentSessionUser()).rejects.toThrow('Necesitas iniciar sesion para publicar un producto.')
    })
})

describe('fetchProductCategories', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna categorías normalizadas de array directo', async () => {
        mockApiClient.get.mockResolvedValueOnce({
            data: [{ id: 1, name: 'Electrónica', status: true }]
        })
        const result = await fetchProductCategories()
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ id: 1, name: 'Electrónica' })
    })

    it('normaliza id_product_category a id', async () => {
        mockApiClient.get.mockResolvedValueOnce({
            data: [{ id_product_category: 5, name: 'Ropa' }]
        })
        const result = await fetchProductCategories()
        expect(result[0]).toMatchObject({ id: 5, name: 'Ropa' })
    })

    it('retorna array vacío cuando la respuesta no es válida', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: null })
        const result = await fetchProductCategories()
        expect(result).toEqual([])
    })

    it('filtra categorías sin id o nombre', async () => {
        mockApiClient.get.mockResolvedValueOnce({
            data: [
                { id: 1, name: 'Válida' },
                { id: null, name: 'Sin id' },
                { id: 2, name: '' },
            ]
        })
        const result = await fetchProductCategories()
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Válida')
    })

    it('acepta el formato data.data', async () => {
        mockApiClient.get.mockResolvedValueOnce({
            data: { data: [{ id: 3, name: 'Gaming' }] }
        })
        const result = await fetchProductCategories()
        expect(result).toHaveLength(1)
    })
})

describe('fetchProductTags', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna tags normalizados', async () => {
        mockApiClient.get.mockResolvedValueOnce({
            data: [{ id: 1, name: 'oferta' }]
        })
        const result = await fetchProductTags()
        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({ id: 1, name: 'oferta' })
    })

    it('normaliza id_product_tag a id', async () => {
        mockApiClient.get.mockResolvedValueOnce({
            data: [{ id_product_tag: 10, name: 'nuevo' }]
        })
        const result = await fetchProductTags()
        expect(result[0]).toMatchObject({ id: 10, name: 'nuevo' })
    })

    it('filtra tags sin id o nombre', async () => {
        mockApiClient.get.mockResolvedValueOnce({
            data: [{ id: 1, name: '' }, { id: 2, name: 'válido' }]
        })
        const result = await fetchProductTags()
        expect(result).toHaveLength(1)
    })
})

describe('createProduct', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET session y POST products con el payload', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: { user: { id_user: 7 } } })
        mockApiClient.post.mockResolvedValueOnce({ data: { id_product: 100 } })
        const payload = { name: 'Laptop', price: 500000, categoryId: 1, quantity: 5 }
        const result = await createProduct({ payload })
        expect(mockApiClient.post).toHaveBeenCalledWith(
            expect.stringContaining('products'),
            payload
        )
        expect(result).toMatchObject({ id_product: 100 })
    })
})

describe('uploadProductImage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a POST /products/:id/image con FormData', async () => {
        mockApiClient.post.mockResolvedValueOnce({ data: { image_url: 'https://cdn.example.com/img.jpg' } })
        const file = new File(['content'], 'foto.jpg', { type: 'image/jpeg' })
        const result = await uploadProductImage(100, file)
        expect(mockApiClient.post).toHaveBeenCalledWith(
            '/products/100/image',
            expect.any(FormData),
            expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
        )
        expect(result).toHaveProperty('image_url')
    })
})

describe('getBackendErrorMessage', () => {
    beforeEach(() => vi.clearAllMocks())

    it.each([
        [true,  { response: { data: 'Error directo' } },                      'Error directo'],
        [true,  { response: { data: { message: 'Error mensaje' } } },         'Error mensaje'],
        [false, new Error('error directo'),                                     'error directo'],
        [false, {},                                                             'fallback text'],
    ])('retorna mensaje según tipo de error', (isAxios, input, expected) => {
        axios.isAxiosError.mockReturnValue(isAxios)
        expect(getBackendErrorMessage(input, 'fallback text')).toBe(expected)
    })

    it.each([
        [400, 'Datos invalidos. Revisa los campos requeridos del producto.'],
        [401, 'Necesitas iniciar sesion para publicar un producto.'],
        [403, 'No tienes permisos para crear productos con esta cuenta.'],
        [404, 'No se encontro el comercio o alguna referencia del producto.'],
        [409, 'Ya existe un producto con los datos enviados.'],
        [500, 'Error interno del servidor.'],
    ])('retorna mensaje específico para status %i', (status, expected) => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status, data: {} } }, 'fb')).toBe(expected)
    })
})
