import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockAxios } = vi.hoisted(() => {
    const mockAxios = {
        post: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
    }
    return { mockAxios }
})

vi.mock('axios', () => ({
    default: mockAxios,
}))

import { addToCartApi, fetchCartsApi } from '../lib/cartApi'

describe('addToCartApi', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a POST /api/users/:id/cart/items con productId y quantity por defecto', async () => {
        mockAxios.post.mockResolvedValueOnce({ data: { success: true } })

        const result = await addToCartApi(7, { productId: 42 })

        expect(mockAxios.post).toHaveBeenCalledWith(
            expect.stringContaining('/api/users/7/cart/items'),
            { productId: 42, quantity: 1 },
            { withCredentials: true }
        )
        expect(result).toMatchObject({ success: true })
    })

    it('usa la quantity provista cuando se especifica', async () => {
        mockAxios.post.mockResolvedValueOnce({ data: {} })

        await addToCartApi(7, { productId: 42, quantity: 3 })

        const call = mockAxios.post.mock.calls[0]
        expect(call[1]).toMatchObject({ productId: 42, quantity: 3 })
    })

    it('envía withCredentials: true', async () => {
        mockAxios.post.mockResolvedValueOnce({ data: {} })

        await addToCartApi(7, { productId: 1 })

        const call = mockAxios.post.mock.calls[0]
        expect(call[2]).toMatchObject({ withCredentials: true })
    })
})

describe('fetchCartsApi', () => {
    beforeEach(() => vi.clearAllMocks())

    it('llama a GET /api/users/:id/carts y retorna carts', async () => {
        mockAxios.get.mockResolvedValueOnce({ data: { carts: [{ id: 1 }, { id: 2 }] } })

        const result = await fetchCartsApi(7)

        expect(mockAxios.get).toHaveBeenCalledWith(
            expect.stringContaining('/api/users/7/carts'),
            { withCredentials: true }
        )
        expect(result).toHaveLength(2)
    })

    it('retorna array vacío cuando carts es null', async () => {
        mockAxios.get.mockResolvedValueOnce({ data: { carts: null } })

        const result = await fetchCartsApi(7)

        expect(result).toEqual([])
    })

    it('retorna array vacío cuando data no tiene carts', async () => {
        mockAxios.get.mockResolvedValueOnce({ data: {} })

        const result = await fetchCartsApi(7)

        expect(result).toEqual([])
    })
})
