import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/apiClient', () => ({
    default: {
        get: vi.fn(),
        put: vi.fn(),
    }
}))

import apiClient from '../lib/apiClient'
import {
    fetchFilteredProductReports,
    updateProductReport,
} from '../lib/productReportsApi'

describe('fetchFilteredProductReports', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/reports/products/filtered con params por defecto', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { filteredReports: [] } })

        const result = await fetchFilteredProductReports()

        expect(apiClient.get).toHaveBeenCalledWith('/api/reports/products/filtered', {
            params: { page: 1, limit: 10 },
        })
        expect(result).toEqual([])
    })

    it('incluye report_status cuando se pasa', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { filteredReports: [] } })

        await fetchFilteredProductReports({ report_status: 'PENDING' })

        const call = apiClient.get.mock.calls[0]
        expect(call[1].params).toHaveProperty('report_status', 'PENDING')
    })

    it('incluye search cuando no está vacío', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { filteredReports: [] } })

        await fetchFilteredProductReports({ search: 'producto' })

        const call = apiClient.get.mock.calls[0]
        expect(call[1].params).toHaveProperty('search', 'producto')
    })

    it('omite search cuando está vacío', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { filteredReports: [] } })

        await fetchFilteredProductReports({ search: '   ' })

        const call = apiClient.get.mock.calls[0]
        expect(call[1].params).not.toHaveProperty('search')
    })

    it('retorna los reportes con page y limit personalizados', async () => {
        const reports = [{ id: 1 }, { id: 2 }]
        apiClient.get.mockResolvedValueOnce({ data: { filteredReports: reports } })

        const result = await fetchFilteredProductReports({ page: 2, limit: 20 })

        expect(result).toHaveLength(2)
        const call = apiClient.get.mock.calls[0]
        expect(call[1].params).toMatchObject({ page: 2, limit: 20 })
    })
})

describe('updateProductReport', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PUT /api/reports/products/:id con report_status', async () => {
        apiClient.put.mockResolvedValueOnce({ data: { updatedReport: { id: 5, report_status: 'IN_PROGRESS' } } })

        const result = await updateProductReport(5, { report_status: 'IN_PROGRESS' })

        expect(apiClient.put).toHaveBeenCalledWith('/api/reports/products/5', {
            report_status: 'IN_PROGRESS',
        })
        expect(result).toMatchObject({ id: 5 })
    })

    it('incluye notes cuando se pasa', async () => {
        apiClient.put.mockResolvedValueOnce({ data: { updatedReport: { id: 6 } } })

        await updateProductReport(6, { report_status: 'RESOLVED', notes: 'Revisado y cerrado' })

        const call = apiClient.put.mock.calls[0]
        expect(call[1]).toHaveProperty('notes', 'Revisado y cerrado')
    })

    it('no incluye notes cuando es undefined', async () => {
        apiClient.put.mockResolvedValueOnce({ data: { updatedReport: { id: 7 } } })

        await updateProductReport(7, { report_status: 'REJECTED' })

        const call = apiClient.put.mock.calls[0]
        expect(call[1]).not.toHaveProperty('notes')
    })
})
