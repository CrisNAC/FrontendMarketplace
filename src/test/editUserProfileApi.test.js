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
    getSession,
    fetchUserProfile,
    updateUserProfile,
    updateUserAddress,
    getBackendErrorMessage,
    getUserImage,
    uploadUserImage,
    deleteUserImage,
} from '../features/commerces/services/editUserProfileApi'

describe('getSession', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna los datos de sesión del usuario', async () => {
        mockApiClient.get.mockResolvedValueOnce({
            data: { success: true, user: { id_user: 1, name: 'Test' } }
        })

        const result = await getSession()

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/session/user-session')
        expect(result).toMatchObject({ user: { id_user: 1 } })
    })
})

describe('fetchUserProfile', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/users/:userId', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: { id_user: 7, name: 'Usuario' } })

        const result = await fetchUserProfile(7)

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/users/7')
        expect(result).toMatchObject({ id_user: 7 })
    })
})

describe('updateUserProfile', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PUT /api/users/:userId con el payload', async () => {
        mockApiClient.put.mockResolvedValueOnce({ data: { id_user: 7, name: 'Actualizado' } })

        const result = await updateUserProfile(7, { name: 'Actualizado' })

        expect(mockApiClient.put).toHaveBeenCalledWith('/api/users/7', { name: 'Actualizado' })
        expect(result).toMatchObject({ name: 'Actualizado' })
    })
})

describe('updateUserAddress', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PUT /api/users/:userId/addresses/:addressId', async () => {
        mockApiClient.put.mockResolvedValueOnce({ data: { id: 1 } })

        const result = await updateUserAddress(7, 1, { city: 'Asunción' })

        expect(mockApiClient.put).toHaveBeenCalledWith(
            '/api/users/7/addresses/1',
            { city: 'Asunción' }
        )
        expect(result).toMatchObject({ id: 1 })
    })
})

describe('getBackendErrorMessage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('extrae string de data', () => {
        axios.isAxiosError.mockReturnValue(true)
        const err = { response: { data: 'Error directo' } }
        expect(getBackendErrorMessage(err, 'fallback')).toBe('Error directo')
    })

    it('extrae data.message', () => {
        axios.isAxiosError.mockReturnValue(true)
        const err = { response: { data: { message: 'Error de API' } } }
        expect(getBackendErrorMessage(err, 'fallback')).toBe('Error de API')
    })

    it('extrae data.error.message', () => {
        axios.isAxiosError.mockReturnValue(true)
        const err = { response: { data: { error: { message: 'Error anidado' } } } }
        expect(getBackendErrorMessage(err, 'fallback')).toBe('Error anidado')
    })

    it('extrae data.error como string', () => {
        axios.isAxiosError.mockReturnValue(true)
        const err = { response: { data: { error: 'Error string' } } }
        expect(getBackendErrorMessage(err, 'fallback')).toBe('Error string')
    })

    it('retorna fallback si no hay datos útiles', () => {
        axios.isAxiosError.mockReturnValue(true)
        const err = { response: { data: { other: 'thing' } } }
        expect(getBackendErrorMessage(err, 'fallback')).toBe('fallback')
    })

    it('retorna fallback para errores no-Axios', () => {
        axios.isAxiosError.mockReturnValue(false)
        expect(getBackendErrorMessage(new Error('algo'), 'fallback')).toBe('fallback')
    })
})

describe('getUserImage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /users/:userId/image', async () => {
        mockApiClient.get.mockResolvedValueOnce({ data: { url: 'http://img.com/photo.jpg' } })

        const result = await getUserImage(7)

        expect(mockApiClient.get).toHaveBeenCalledWith('/users/7/image')
        expect(result).toMatchObject({ url: 'http://img.com/photo.jpg' })
    })
})

describe('uploadUserImage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a POST /users/:userId/image con FormData', async () => {
        mockApiClient.post.mockResolvedValueOnce({ data: { url: 'http://img.com/new.jpg' } })

        const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
        const result = await uploadUserImage(7, file)

        expect(mockApiClient.post).toHaveBeenCalledWith(
            '/users/7/image',
            expect.any(FormData),
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        expect(result).toMatchObject({ url: 'http://img.com/new.jpg' })
    })
})

describe('deleteUserImage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a DELETE /users/:userId/image', async () => {
        mockApiClient.delete.mockResolvedValueOnce({ data: { success: true } })

        const result = await deleteUserImage(7)

        expect(mockApiClient.delete).toHaveBeenCalledWith('/users/7/image')
        expect(result).toMatchObject({ success: true })
    })
})
