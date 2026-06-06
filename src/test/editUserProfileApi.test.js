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

describe('editUserProfileApi', () => {
    beforeEach(() => vi.clearAllMocks())

    describe('getSession', () => {
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
        it('llama a GET /api/users/:userId', async () => {
            mockApiClient.get.mockResolvedValueOnce({ data: { id_user: 7, name: 'Usuario' } })
            const result = await fetchUserProfile(7)
            expect(mockApiClient.get).toHaveBeenCalledWith('/api/users/7')
            expect(result).toMatchObject({ id_user: 7 })
        })
    })

    describe('updateUserProfile', () => {
        it('llama a PUT /api/users/:userId con el payload', async () => {
            mockApiClient.put.mockResolvedValueOnce({ data: { id_user: 7, name: 'Actualizado' } })
            const result = await updateUserProfile(7, { name: 'Actualizado' })
            expect(mockApiClient.put).toHaveBeenCalledWith('/api/users/7', { name: 'Actualizado' })
            expect(result).toMatchObject({ name: 'Actualizado' })
        })
    })

    describe('updateUserAddress', () => {
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
        it.each([
            [true,  { response: { data: 'Error directo' } },                              'Error directo'],
            [true,  { response: { data: { message: 'Error de API' } } },                  'Error de API'],
            [true,  { response: { data: { error: { message: 'Error anidado' } } } },      'Error anidado'],
            [true,  { response: { data: { error: 'Error string' } } },                    'Error string'],
            [true,  { response: { data: { other: 'thing' } } },                           'fallback'],
            [false, new Error('algo'),                                                      'fallback'],
        ])('retorna mensaje correcto', (isAxios, err, expected) => {
            axios.isAxiosError.mockReturnValue(isAxios)
            expect(getBackendErrorMessage(err, 'fallback')).toBe(expected)
        })
    })

    describe('getUserImage', () => {
        it('llama a GET /users/:userId/image', async () => {
            mockApiClient.get.mockResolvedValueOnce({ data: { url: 'https://img.com/photo.jpg' } })
            const result = await getUserImage(7)
            expect(mockApiClient.get).toHaveBeenCalledWith('/users/7/image')
            expect(result).toMatchObject({ url: 'https://img.com/photo.jpg' })
        })
    })

    describe('uploadUserImage', () => {
        it('llama a POST /users/:userId/image con FormData', async () => {
            mockApiClient.post.mockResolvedValueOnce({ data: { url: 'https://img.com/new.jpg' } })
            const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
            const result = await uploadUserImage(7, file)
            expect(mockApiClient.post).toHaveBeenCalledWith(
                '/users/7/image',
                expect.any(FormData),
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            expect(result).toMatchObject({ url: 'https://img.com/new.jpg' })
        })
    })

    describe('deleteUserImage', () => {
        it('llama a DELETE /users/:userId/image', async () => {
            mockApiClient.delete.mockResolvedValueOnce({ data: { success: true } })
            const result = await deleteUserImage(7)
            expect(mockApiClient.delete).toHaveBeenCalledWith('/users/7/image')
            expect(result).toMatchObject({ success: true })
        })
    })
})
