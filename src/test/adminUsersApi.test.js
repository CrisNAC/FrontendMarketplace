import { describe, it, expect, vi, beforeEach } from 'vitest'

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
import { fetchAdminUsers, fetchPendingStores, approveStore, rejectStore } from '../features/admin/services/adminUsersApi'

describe('fetchAdminUsers', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/admin/users con params por defecto', () => {
        apiClient.get.mockResolvedValueOnce({ data: { data: [], pagination: { total: 0 } } })

        const result = fetchAdminUsers()

        expect(apiClient.get).toHaveBeenCalledWith('/api/admin/users', {
            params: { page: 1, limit: 20 }
        })
        expect(result).toBeTruthy()
    })

    it('incluye search cuando se proporciona', () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        fetchAdminUsers({ search: 'Juan ' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.search).toBe('Juan')
    })

    it('no incluye search si está en blanco', () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        fetchAdminUsers({ search: '  ' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.search).toBeUndefined()
    })

    it('incluye role cuando se proporciona', () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        fetchAdminUsers({ role: 'SELLER' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.role).toBe('SELLER')
    })

    it('incluye status cuando se proporciona', () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        fetchAdminUsers({ status: 'true' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.status).toBe('true')
    })

    it('no incluye status vacío', () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        fetchAdminUsers({ status: '' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.status).toBeUndefined()
    })

    it('usa page y limit personalizados', () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        fetchAdminUsers({ page: 3, limit: 50 })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params).toMatchObject({ page: 3, limit: 50 })
    })
})

describe('fetchPendingStores', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/admin/stores/pending', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { data: [] } })

        const result = await fetchPendingStores()

        expect(apiClient.get).toHaveBeenCalledWith('/api/admin/stores/pending', {
            params: { page: 1, limit: 20 }
        })
        expect(result).toBeTruthy()
    })

    it('usa page y limit personalizados', async () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        await fetchPendingStores({ page: 2, limit: 5 })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params).toMatchObject({ page: 2, limit: 5 })
    })
})

describe('approveStore', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PATCH /:id/approve', async () => {
        apiClient.patch.mockResolvedValueOnce({ data: { id: 3, status: 'APPROVED' } })

        const result = await approveStore(3)

        expect(apiClient.patch).toHaveBeenCalledWith('/api/admin/stores/3/approve')
        expect(result).toMatchObject({ status: 'APPROVED' })
    })
})

describe('rejectStore', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PATCH /:id/reject con motivo', async () => {
        apiClient.patch.mockResolvedValueOnce({ data: { id: 4 } })

        await rejectStore(4, 'Datos inválidos')

        expect(apiClient.patch).toHaveBeenCalledWith('/api/admin/stores/4/reject', {
            reason: 'Datos inválidos',
        })
    })
})
