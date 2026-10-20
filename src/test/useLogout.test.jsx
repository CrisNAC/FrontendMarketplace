import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

vi.mock('../lib/apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    }
}))

import apiClient from '../lib/apiClient'
import { useLogout } from '../hooks/useLogout'

describe('useLogout', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a DELETE /api/session y navega a /', async () => {
        apiClient.delete.mockResolvedValueOnce({})

        const { result } = renderHook(() => useLogout())

        await act(async () => {
            await result.current()
        })

        expect(apiClient.delete).toHaveBeenCalledWith('/api/session')
        expect(mockNavigate).toHaveBeenCalledWith('/')
    })

    it('navega a / incluso si la petición falla', async () => {
        apiClient.delete.mockRejectedValueOnce(new Error('Network error'))

        const { result } = renderHook(() => useLogout())

        await act(async () => {
            await result.current()
        })

        expect(apiClient.delete).toHaveBeenCalledWith('/api/session')
        expect(mockNavigate).toHaveBeenCalledWith('/')
    })
})
