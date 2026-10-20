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
import {
    createAdminCategory,
    fetchAdminCategories,
    fetchAdminCategoryById,
    fetchCategoriesWithProducts,
    updateAdminCategory,
    deleteAdminCategory,
} from '../features/admin/services/adminCategoriesApi'

describe('createAdminCategory', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a POST /api/admin/categories con el nombre', async () => {
        apiClient.post.mockResolvedValueOnce({ data: { id: 1, name: 'Electrónica' } })

        const result = await createAdminCategory('Electrónica')

        expect(apiClient.post).toHaveBeenCalledWith('/api/admin/categories', { name: 'Electrónica' })
        expect(result).toMatchObject({ id: 1, name: 'Electrónica' })
    })
})

describe('fetchAdminCategories', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET sin params cuando no hay filtros', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { data: [], categoryTotal: 0 } })

        const result = await fetchAdminCategories()

        expect(apiClient.get).toHaveBeenCalledWith('/api/admin/categories', { params: {} })
        expect(result).toBeTruthy()
    })

    it('incluye visible cuando no es "all"', async () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        await fetchAdminCategories({ visible: 'true' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.visible).toBe('true')
    })

    it('no incluye visible cuando es "all"', async () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        await fetchAdminCategories({ visible: 'all' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.visible).toBeUndefined()
    })

    it('incluye searchCategory trimado cuando tiene texto', async () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        await fetchAdminCategories({ searchCategory: '  ropa  ' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.searchCategory).toBe('ropa')
    })

    it('no incluye searchCategory vacío', async () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        await fetchAdminCategories({ searchCategory: '   ' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.searchCategory).toBeUndefined()
    })

    it('incluye categoryPage y categoryLimit', async () => {
        apiClient.get.mockResolvedValueOnce({ data: {} })

        await fetchAdminCategories({ categoryPage: 2, categoryLimit: 10 })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params).toMatchObject({ categoryPage: 2, categoryLimit: 10 })
    })
})

describe('fetchAdminCategoryById', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/admin/categories/:id', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { id: 5, name: 'Ropa' } })

        const result = await fetchAdminCategoryById(5)

        expect(apiClient.get).toHaveBeenCalledWith('/api/admin/categories/5')
        expect(result).toMatchObject({ id: 5, name: 'Ropa' })
    })
})

describe('fetchCategoriesWithProducts', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /filter/withProducts sin filtros', async () => {
        apiClient.get.mockResolvedValueOnce({ data: [] })

        await fetchCategoriesWithProducts()

        expect(apiClient.get).toHaveBeenCalledWith(
            '/api/admin/categories/filter/withProducts',
            { params: {} }
        )
    })

    it('incluye todos los filtros cuando se proporcionan', async () => {
        apiClient.get.mockResolvedValueOnce({ data: [] })

        await fetchCategoriesWithProducts({
            visible: 'true',
            search: ' electro ',
            searchCategory: ' tech ',
            searchProduct: ' mouse ',
            categoryPage: 1,
            categoryLimit: 5,
            productPage: 1,
            productLimit: 3,
        })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params).toMatchObject({
            visible: 'true',
            search: 'electro',
            searchCategory: 'tech',
            searchProduct: 'mouse',
            categoryPage: 1,
            categoryLimit: 5,
            productPage: 1,
            productLimit: 3,
        })
    })

    it('no incluye visible cuando es "all"', async () => {
        apiClient.get.mockResolvedValueOnce({ data: [] })

        await fetchCategoriesWithProducts({ visible: 'all' })

        const [, config] = apiClient.get.mock.calls[0]
        expect(config.params.visible).toBeUndefined()
    })
})

describe('updateAdminCategory', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a PUT /api/admin/categories/:id con payload', async () => {
        apiClient.put.mockResolvedValueOnce({ data: { id: 2, name: 'Tecnología' } })

        const result = await updateAdminCategory(2, { name: 'Tecnología', visible: true })

        expect(apiClient.put).toHaveBeenCalledWith('/api/admin/categories/2', { name: 'Tecnología', visible: true })
        expect(result).toMatchObject({ id: 2 })
    })
})

describe('deleteAdminCategory', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a DELETE /api/admin/categories/:id', async () => {
        apiClient.delete.mockResolvedValueOnce({})

        await deleteAdminCategory(3)

        expect(apiClient.delete).toHaveBeenCalledWith('/api/admin/categories/3')
    })
})
