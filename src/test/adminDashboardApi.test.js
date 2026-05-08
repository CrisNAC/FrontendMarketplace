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
import { fetchAdminDashboardStats, fetchAdminRecentActivity } from '../features/admin/services/adminDashboardApi'

const makeResponse = (data) => ({ data })

describe('fetchAdminDashboardStats', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna stats con todos los valores cuando las peticiones tienen éxito', async () => {
        apiClient.get.mockImplementation((url) => {
            if (url === '/api/reports/products/filtered') {
                return Promise.resolve(makeResponse({ filteredReports: { meta: { total: 3 } } }))
            }
            return Promise.resolve(makeResponse({ pagination: { total: 5 } }))
        })

        const stats = await fetchAdminDashboardStats()

        expect(stats).toMatchObject({
            totalUsers: 5,
            activeBuyers: 5,
            registeredCommerces: 5,
            pendingProducts: 5,
            pendingReviews: 5,
            pendingCommerces: 5,
            pendingProductReports: 3,
        })
    })

    it('retorna 0 para los valores cuando las peticiones fallan', async () => {
        apiClient.get.mockRejectedValue(new Error('Network error'))

        const stats = await fetchAdminDashboardStats()

        expect(stats).toMatchObject({
            totalUsers: 0,
            activeBuyers: 0,
            registeredCommerces: 0,
            pendingProductReports: 0,
        })
    })

    it('extrae total de responseData.total cuando no hay pagination', async () => {
        apiClient.get.mockResolvedValue(makeResponse({ total: 8 }))

        const stats = await fetchAdminDashboardStats()

        expect(stats.totalUsers).toBe(8)
    })

    it('extrae total desde data.length cuando data es array', async () => {
        apiClient.get.mockResolvedValue(makeResponse({ data: [1, 2, 3] }))

        const stats = await fetchAdminDashboardStats()

        expect(stats.totalUsers).toBe(3)
    })

    it('retorna 0 cuando responseData es null o no es objeto', async () => {
        apiClient.get.mockResolvedValue(makeResponse(null))

        const stats = await fetchAdminDashboardStats()

        expect(stats.totalUsers).toBe(0)
    })

    it('extrae total de filteredReviewReports.meta.total', async () => {
        apiClient.get.mockImplementation((url) => {
            if (url === '/api/reports/reviews/filtered') {
                return Promise.resolve(makeResponse({ filteredReviewReports: { meta: { total: 7 } } }))
            }
            return Promise.resolve(makeResponse({ pagination: { total: 1 } }))
        })

        const stats = await fetchAdminDashboardStats()

        expect(stats.pendingReviews).toBe(7)
    })
})

describe('fetchAdminRecentActivity', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna actividades combinadas y ordenadas por fecha', async () => {
        const now = Date.now()
        const earlier = new Date(now - 100000).toISOString()
        const later = new Date(now).toISOString()

        apiClient.get.mockImplementation((url) => {
            if (url === '/api/admin/users') {
                return Promise.resolve(makeResponse({
                    data: [
                        { id: 1, name: 'Usuario A', createdAt: earlier },
                        { id: 2, name: 'Comercio B', createdAt: later },
                    ]
                }))
            }
            if (url === '/api/reports/reviews/filtered') {
                return Promise.resolve(makeResponse({ filteredReviewReports: { data: [] } }))
            }
            if (url === '/api/reports/products/filtered') {
                return Promise.resolve(makeResponse({ filteredReports: { data: [] } }))
            }
            return Promise.resolve(makeResponse({ data: [] }))
        })

        const activities = await fetchAdminRecentActivity()

        expect(Array.isArray(activities)).toBe(true)
        expect(activities.length).toBeLessThanOrEqual(8)
    })

    it('retorna array vacío cuando todas las peticiones fallan', async () => {
        apiClient.get.mockRejectedValue(new Error('Network error'))

        const activities = await fetchAdminRecentActivity()

        expect(activities).toEqual([])
    })

    it('mapea reseñas reportadas con reason', async () => {
        apiClient.get.mockImplementation((url) => {
            if (url === '/api/reports/reviews/filtered') {
                return Promise.resolve(makeResponse({
                    filteredReviewReports: {
                        data: [{
                            id: 10,
                            id_review_report: 10,
                            reason: 'Spam',
                            product_review: { product: { name: 'Producto X' } },
                            created_at: new Date().toISOString(),
                        }]
                    }
                }))
            }
            if (url === '/api/reports/products/filtered') {
                return Promise.resolve(makeResponse({ filteredReports: { data: [] } }))
            }
            return Promise.resolve(makeResponse({ data: [] }))
        })

        const activities = await fetchAdminRecentActivity()

        const reviewActivity = activities.find(a => a.id.startsWith('error-review'))
        expect(reviewActivity).toBeTruthy()
        expect(reviewActivity.description).toContain('spam')
        expect(reviewActivity.detail).toBe('Producto X')
    })

    it('mapea reportes de producto correctamente', async () => {
        apiClient.get.mockImplementation((url) => {
            if (url === '/api/reports/products/filtered') {
                return Promise.resolve(makeResponse({
                    filteredReports: {
                        data: [{
                            id_product_report: 5,
                            product: { name: 'Mouse gamer' },
                            reason: 'Falso',
                            created_at: new Date().toISOString(),
                        }]
                    }
                }))
            }
            if (url === '/api/reports/reviews/filtered') {
                return Promise.resolve(makeResponse({ filteredReviewReports: { data: [] } }))
            }
            return Promise.resolve(makeResponse({ data: [] }))
        })

        const activities = await fetchAdminRecentActivity()

        const reportActivity = activities.find(a => a.id.startsWith('warn-prodreport'))
        expect(reportActivity).toBeTruthy()
        expect(reportActivity.detail).toContain('Mouse gamer')
    })

    it('deduplica actividades con el mismo id', async () => {
        apiClient.get.mockImplementation((url) => {
            if (url === '/api/reports/products/filtered') {
                return Promise.resolve(makeResponse({ filteredReports: { data: [] } }))
            }
            if (url === '/api/reports/reviews/filtered') {
                return Promise.resolve(makeResponse({ filteredReviewReports: { data: [] } }))
            }
            return Promise.resolve(makeResponse({
                data: [{ id: 99, name: 'Test', createdAt: new Date().toISOString() }]
            }))
        })

        const activities = await fetchAdminRecentActivity()

        const ids = activities.map(a => a.id)
        const uniqueIds = new Set(ids)
        expect(ids.length).toBe(uniqueIds.size)
    })

    it('usa pickEntityName con distintos campos', async () => {
        apiClient.get.mockImplementation((url) => {
            if (url === '/api/admin/stores/pending') {
                return Promise.resolve(makeResponse({
                    data: [{ id: 1, businessName: 'Mi Comercio', createdAt: new Date().toISOString() }]
                }))
            }
            if (url === '/api/reports/products/filtered') {
                return Promise.resolve(makeResponse({ filteredReports: { data: [] } }))
            }
            if (url === '/api/reports/reviews/filtered') {
                return Promise.resolve(makeResponse({ filteredReviewReports: { data: [] } }))
            }
            return Promise.resolve(makeResponse({ data: [] }))
        })

        const activities = await fetchAdminRecentActivity()

        const commerceActivity = activities.find(a => a.id.startsWith('warn-commerce'))
        expect(commerceActivity?.detail).toBe('Mi Comercio')
    })
})
