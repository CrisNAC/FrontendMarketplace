import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/cartApi', () => ({
    getApiBase: vi.fn(() => 'http://localhost:3000'),
}))

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        isAxiosError: vi.fn(),
    },
}))

import axios from 'axios'
import { getApiBase } from '../lib/cartApi'
import {
    REPORT_REASON_LABELS,
    hasLocalReportForProduct,
    rememberLocalReport,
    fetchProductReportReasons,
    fetchPendingProductReport,
    submitProductReport,
} from '../features/clients/services/productReportApi'

describe('REPORT_REASON_LABELS', () => {
    it('exporta la lista de motivos', () => {
        expect(Array.isArray(REPORT_REASON_LABELS)).toBe(true)
        expect(REPORT_REASON_LABELS.length).toBeGreaterThan(0)
        expect(REPORT_REASON_LABELS[0]).toHaveProperty('value')
        expect(REPORT_REASON_LABELS[0]).toHaveProperty('label')
    })
})

describe('hasLocalReportForProduct', () => {
    beforeEach(() => sessionStorage.clear())

    it('retorna false cuando userId es null', () => {
        expect(hasLocalReportForProduct(null, 1)).toBe(false)
    })

    it('retorna false cuando productId es null', () => {
        expect(hasLocalReportForProduct(1, null)).toBe(false)
    })

    it('retorna false cuando no hay nada en sessionStorage', () => {
        expect(hasLocalReportForProduct(1, 10)).toBe(false)
    })

    it('retorna false cuando el JSON guardado es inválido', () => {
        sessionStorage.setItem('marketplace_product_report_1', 'invalid-json')
        expect(hasLocalReportForProduct(1, 10)).toBe(false)
    })

    it('retorna false cuando productIds no es un array', () => {
        sessionStorage.setItem('marketplace_product_report_1', JSON.stringify({ productIds: 'no-array' }))
        expect(hasLocalReportForProduct(1, 10)).toBe(false)
    })

    it('retorna false cuando el producto no está en la lista', () => {
        sessionStorage.setItem('marketplace_product_report_1', JSON.stringify({ productIds: [5, 6] }))
        expect(hasLocalReportForProduct(1, 10)).toBe(false)
    })

    it('retorna true cuando el producto está en la lista', () => {
        sessionStorage.setItem('marketplace_product_report_1', JSON.stringify({ productIds: [10, 20] }))
        expect(hasLocalReportForProduct(1, 10)).toBe(true)
    })
})

describe('rememberLocalReport', () => {
    beforeEach(() => sessionStorage.clear())

    it('no hace nada cuando userId es null', () => {
        rememberLocalReport(null, 1)
        expect(sessionStorage.length).toBe(0)
    })

    it('no hace nada cuando productId es null', () => {
        rememberLocalReport(1, null)
        expect(sessionStorage.length).toBe(0)
    })

    it('guarda el productId en sessionStorage', () => {
        rememberLocalReport(5, 10)
        expect(hasLocalReportForProduct(5, 10)).toBe(true)
    })

    it('no duplica un productId ya guardado', () => {
        rememberLocalReport(5, 10)
        rememberLocalReport(5, 10)
        const raw = sessionStorage.getItem('marketplace_product_report_5')
        const data = JSON.parse(raw)
        expect(data.productIds).toHaveLength(1)
    })

    it('agrega un segundo productId a la lista existente', () => {
        rememberLocalReport(5, 10)
        rememberLocalReport(5, 20)
        expect(hasLocalReportForProduct(5, 10)).toBe(true)
        expect(hasLocalReportForProduct(5, 20)).toBe(true)
    })
})

describe('fetchProductReportReasons', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna la lista de motivos cuando el status es 200 y data es array', async () => {
        const reasons = [{ value: 'DEFECTIVE', label: 'Defectuoso' }]
        axios.get.mockResolvedValueOnce({ status: 200, data: reasons })

        const result = await fetchProductReportReasons()

        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:3000/api/reports/products/reasons',
            { validateStatus: expect.any(Function) }
        )
        expect(result).toEqual(reasons)
    })

    it('retorna null cuando el status no es 200', async () => {
        axios.get.mockResolvedValueOnce({ status: 404, data: [] })
        expect(await fetchProductReportReasons()).toBeNull()
    })

    it('retorna null cuando data no es un array', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: { message: 'ok' } })
        expect(await fetchProductReportReasons()).toBeNull()
    })

    it('usa http://localhost:3000 como fallback cuando getApiBase retorna vacío', async () => {
        getApiBase.mockReturnValueOnce('')
        axios.get.mockResolvedValueOnce({ status: 200, data: [] })
        await fetchProductReportReasons()
        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:3000/api/reports/products/reasons',
            expect.any(Object)
        )
    })
})

describe('fetchPendingProductReport', () => {
    beforeEach(() => vi.clearAllMocks())

    it('retorna true cuando hasReport es true', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: { hasReport: true } })
        expect(await fetchPendingProductReport(10)).toBe(true)
    })

    it('retorna false cuando hasReport es false', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: { hasReport: false } })
        expect(await fetchPendingProductReport(10)).toBe(false)
    })

    it('retorna null cuando el status no es 200', async () => {
        axios.get.mockResolvedValueOnce({ status: 401, data: {} })
        expect(await fetchPendingProductReport(10)).toBeNull()
    })

    it('retorna null cuando hasReport no es boolean', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: { hasReport: 'yes' } })
        expect(await fetchPendingProductReport(10)).toBeNull()
    })

    it('llama al endpoint correcto con el productId', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: { hasReport: false } })
        await fetchPendingProductReport(42)
        expect(axios.get).toHaveBeenCalledWith(
            'http://localhost:3000/api/reports/products/check',
            expect.objectContaining({ params: { productId: 42 } })
        )
    })
})

describe('submitProductReport', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a axios.post con productId y reason', async () => {
        axios.post.mockResolvedValueOnce({ status: 201, data: {} })
        await submitProductReport({ productId: 5, reason: 'DEFECTIVE' })
        expect(axios.post).toHaveBeenCalledWith(
            'http://localhost:3000/api/reports/products',
            { productId: 5, reason: 'DEFECTIVE' },
            expect.any(Object)
        )
    })

    it('incluye description cuando se provee y no está vacía', async () => {
        axios.post.mockResolvedValueOnce({ status: 201, data: {} })
        await submitProductReport({ productId: 5, reason: 'OTHER', description: 'Un problema' })
        expect(axios.post).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ description: 'Un problema' }),
            expect.any(Object)
        )
    })

    it('no incluye description cuando está vacía', async () => {
        axios.post.mockResolvedValueOnce({ status: 201, data: {} })
        await submitProductReport({ productId: 5, reason: 'OTHER', description: '   ' })
        const body = axios.post.mock.calls[0][1]
        expect(body).not.toHaveProperty('description')
    })

    it('no incluye description cuando es null', async () => {
        axios.post.mockResolvedValueOnce({ status: 201, data: {} })
        await submitProductReport({ productId: 5, reason: 'OTHER', description: null })
        const body = axios.post.mock.calls[0][1]
        expect(body).not.toHaveProperty('description')
    })
})
