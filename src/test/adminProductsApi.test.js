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
import { fetchAdminProducts, approveProduct, rejectProduct } from '../features/admin/services/adminProductsApi'

describe('fetchAdminProducts', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/admin/products con params por defecto', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { data: [], pagination: { total: 0 } } })

        const result = await fetchAdminProducts()

        expect(apiClient.get).toHaveBeenCalledWith('/api/admin/products', {
            params: { page: 1, limit: 20 }
        })
        expect(result).toMatchObject({ data: [] })
    })

    it('incluye search cuando se proporciona', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { data: [] } })

        await fetchAdminProducts({ search: 'mouse  ' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.search).toBe('mouse')
    })

    it('no incluye search si está vacío', async () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        await fetchAdminProducts({ search: '   ' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.search).toBeUndefined()
    })

    it('incluye approvalStatus cuando se proporciona', async () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        await fetchAdminProducts({ approvalStatus: 'PENDING', page: 2, limit: 10 })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params).toMatchObject({ approvalStatus: 'PENDING', page: 2, limit: 10 })
    })
})

describe('approveProduct', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PATCH con status ACTIVE', async () => {
        apiClient.patch.mockResolvedValueOnce({ data: { id: 1, status: 'ACTIVE' } })

        const result = await approveProduct(1)

        expect(apiClient.patch).toHaveBeenCalledWith('/api/admin/products/1/status', { status: 'ACTIVE' })
        expect(result).toMatchObject({ status: 'ACTIVE' })
    })
})

describe('rejectProduct', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PATCH con status REJECTED y motivo', async () => {
        apiClient.patch.mockResolvedValueOnce({ data: { id: 1, status: 'REJECTED' } })

        const result = await rejectProduct(1, 'Contenido inapropiado')

        expect(apiClient.patch).toHaveBeenCalledWith('/api/admin/products/1/status', {
            status: 'REJECTED',
            reason: 'Contenido inapropiado',
        })
        expect(result).toMatchObject({ status: 'REJECTED' })
    })
})
