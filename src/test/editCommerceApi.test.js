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

describe('fetchCommerceById', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET con el id del comercio y retorna data', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: { id_store: 5, name: 'MiTienda' } })

        const result = await fetchCommerceById(5)

        expect(mockApiClient.get).toHaveBeenCalledWith(expect.stringContaining('/5'))
        expect(result).toMatchObject({ id_store: 5 })
    })
})

describe('fetchCommerceCategories', () => {
    beforeEach(() => vi.clearAllMocks())

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
    beforeEach(() => vi.clearAllMocks())

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
    beforeEach(() => vi.clearAllMocks())

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
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/commerces/:id', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: { id_store: 5 } })

        const result = await fetchMyCommerce(5)

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/commerces/5')
        expect(result).toMatchObject({ id_store: 5 })
    })
})

describe('getStoreImage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /stores/:id/image', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: { logo: 'https://example.com/logo.png' } })

        const result = await getStoreImage(5)

        expect(mockApiClient.get).toHaveBeenCalledWith('/stores/5/image')
        expect(result).toHaveProperty('logo')
    })
})

describe('uploadStoreImage', () => {
    beforeEach(() => vi.clearAllMocks())

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
    beforeEach(() => vi.clearAllMocks())

    it('llama a DELETE /stores/:id/image', async () => {
        mockApiClient.delete.mockResolvedValueOnce({ data: { success: true } })

        const result = await deleteStoreImage(5)

        expect(mockApiClient.delete).toHaveBeenCalledWith('/stores/5/image')
        expect(result).toMatchObject({ success: true })
    })
})

describe('getBackendErrorMessage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna string de data cuando data es string', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { data: 'Error texto' } }, 'fb')).toBe('Error texto')
    })

    it('retorna data.message', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { data: { message: 'Error msg' } } }, 'fb')).toBe('Error msg')
    })

    it('retorna data.error', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { data: { error: 'Error campo' } } }, 'fb')).toBe('Error campo')
    })

    it('retorna data.detail', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { data: { detail: 'Error detail' } } }, 'fb')).toBe('Error detail')
    })

    it('retorna mensaje de status 400', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 400, data: {} } }, 'fb')).toBe('Datos inválidos. Revisá los campos requeridos.')
    })

    it('retorna mensaje de status 401', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 401, data: {} } }, 'fb')).toBe('No estás autenticado. Iniciá sesión nuevamente.')
    })

    it('retorna mensaje de status 403', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 403, data: {} } }, 'fb')).toBe('No tenés permiso para editar este comercio.')
    })

    it('retorna mensaje de status 404', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 404, data: {} } }, 'fb')).toBe('Comercio no encontrado.')
    })

    it('retorna mensaje de status 409', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 409, data: {} } }, 'fb')).toBe('El email ingresado ya está registrado por otro comercio.')
    })

    it('retorna mensaje de status 500', () => {
        axios.isAxiosError.mockReturnValue(true)
        expect(getBackendErrorMessage({ response: { status: 500, data: {} } }, 'fb')).toBe('Error interno del servidor.')
    })

    it('retorna error.message para instancia de Error', () => {
        axios.isAxiosError.mockReturnValue(false)
        expect(getBackendErrorMessage(new Error('mensaje real'), 'fb')).toBe('mensaje real')
    })

    it('retorna fallback para error desconocido', () => {
        axios.isAxiosError.mockReturnValue(false)
        expect(getBackendErrorMessage({}, 'fallback')).toBe('fallback')
    })
})
