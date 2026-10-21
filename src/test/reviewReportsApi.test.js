import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/apiClient', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
    }
}))

import apiClient from '../lib/apiClient'
import {
    reportProductReview,
    fetchFilteredReviewReports,
    resolveReviewReport,
} from '../lib/reviewReportsApi'

describe('reportProductReview', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a POST /api/reports/reviews/:reviewId con reason y description', async () => {
        apiClient.post.mockResolvedValueOnce({ data: { report: { id: 1 } } })

        const result = await reportProductReview(5, { reason: 'SPAM', description: 'Es spam' })

        expect(apiClient.post).toHaveBeenCalledWith('/api/reports/reviews/5', {
            reason: 'SPAM',
            description: 'Es spam',
        })
        expect(result).toMatchObject({ id: 1 })
    })

    it('omite description cuando está vacía', async () => {
        apiClient.post.mockResolvedValueOnce({ data: { report: { id: 2 } } })

        await reportProductReview(5, { reason: 'OTHER', description: '  ' })

        const call = apiClient.post.mock.calls[0]
        expect(call[1]).not.toHaveProperty('description')
    })

    it('omite description cuando es undefined', async () => {
        apiClient.post.mockResolvedValueOnce({ data: { report: { id: 3 } } })

        await reportProductReview(5, { reason: 'SPAM' })

        const call = apiClient.post.mock.calls[0]
        expect(call[1]).not.toHaveProperty('description')
    })
})

describe('fetchFilteredReviewReports', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/reports/reviews/filtered con params por defecto', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { filteredReviewReports: [] } })

        const result = await fetchFilteredReviewReports()

        expect(apiClient.get).toHaveBeenCalledWith('/api/reports/reviews/filtered', {
            params: { page: 1, limit: 10 },
        })
        expect(result).toEqual([])
    })

    it('incluye report_status cuando se pasa', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { filteredReviewReports: [{ id: 1 }] } })

        await fetchFilteredReviewReports({ report_status: 'PENDING' })

        const call = apiClient.get.mock.calls[0]
        expect(call[1].params).toHaveProperty('report_status', 'PENDING')
    })

    it('incluye search cuando no está vacío', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { filteredReviewReports: [] } })

        await fetchFilteredReviewReports({ search: 'usuario' })

        const call = apiClient.get.mock.calls[0]
        expect(call[1].params).toHaveProperty('search', 'usuario')
    })

    it('no incluye search cuando está vacío', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { filteredReviewReports: [] } })

        await fetchFilteredReviewReports({ search: '  ' })

        const call = apiClient.get.mock.calls[0]
        expect(call[1].params).not.toHaveProperty('search')
    })

    it('retorna los reportes del response', async () => {
        const reports = [{ id: 1 }, { id: 2 }]
        apiClient.get.mockResolvedValueOnce({ data: { filteredReviewReports: reports } })

        const result = await fetchFilteredReviewReports({ page: 2, limit: 5 })

        expect(result).toHaveLength(2)
    })
})

describe('resolveReviewReport', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PUT /api/reports/reviews/:reportId con decision', async () => {
        apiClient.put.mockResolvedValueOnce({ data: { updatedReport: { id: 10, decision: 'KEEP_REVIEW' } } })

        const result = await resolveReviewReport(10, { decision: 'KEEP_REVIEW' })

        expect(apiClient.put).toHaveBeenCalledWith('/api/reports/reviews/10', { decision: 'KEEP_REVIEW' })
        expect(result).toMatchObject({ id: 10 })
    })

    it('soporta REMOVE_REVIEW como decision', async () => {
        apiClient.put.mockResolvedValueOnce({ data: { updatedReport: { id: 11, decision: 'REMOVE_REVIEW' } } })

        await resolveReviewReport(11, { decision: 'REMOVE_REVIEW' })

        expect(apiClient.put).toHaveBeenCalledWith('/api/reports/reviews/11', { decision: 'REMOVE_REVIEW' })
    })
})
