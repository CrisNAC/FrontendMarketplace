import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mergeWishlistLinesIntoLocalCart, mergeCartResponseFromApi } from '../lib/cartLocalStorage'

describe('mergeWishlistLinesIntoLocalCart', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.spyOn(globalThis, 'dispatchEvent')
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('no hace nada con lines vacías o nulas', () => {
        mergeWishlistLinesIntoLocalCart([])
        mergeWishlistLinesIntoLocalCart(null)
        mergeWishlistLinesIntoLocalCart(undefined)
        expect(localStorage.getItem('carrito')).toBeNull()
    })

    it('agrega un producto nuevo al carrito vacío', () => {
        mergeWishlistLinesIntoLocalCart([{
            productId: 1,
            nombre: 'Producto A',
            precio: 10000,
            cantidad: 2,
            storeId: 5,
            storeName: 'Tienda X',
            marca: 'MarcaA',
        }])

        const cart = JSON.parse(localStorage.getItem('carrito'))
        expect(cart).toHaveLength(1)
        expect(cart[0]).toMatchObject({ productId: 1, nombre: 'Producto A', cantidad: 2 })
    })

    it('suma la cantidad si el producto ya existe en el carrito', () => {
        localStorage.setItem('carrito', JSON.stringify([
            { productId: 1, nombre: 'Producto A', precio: 10000, cantidad: 3 }
        ]))

        mergeWishlistLinesIntoLocalCart([{
            productId: 1,
            nombre: 'Producto A',
            precio: 10000,
            cantidad: 2,
        }])

        const cart = JSON.parse(localStorage.getItem('carrito'))
        expect(cart[0].cantidad).toBe(5)
    })

    it('agrega producto nuevo cuando el carrito ya tiene otros productos', () => {
        localStorage.setItem('carrito', JSON.stringify([
            { productId: 1, nombre: 'Producto A', precio: 10000, cantidad: 1 }
        ]))

        mergeWishlistLinesIntoLocalCart([{
            productId: 2,
            nombre: 'Producto B',
            precio: 20000,
            cantidad: 1,
        }])

        const cart = JSON.parse(localStorage.getItem('carrito'))
        expect(cart).toHaveLength(2)
    })

    it('usa cantidad mínima de 1 si cantidad es inválida', () => {
        mergeWishlistLinesIntoLocalCart([{
            productId: 99,
            nombre: 'Test',
            precio: 5000,
            cantidad: 0,
        }])

        const cart = JSON.parse(localStorage.getItem('carrito'))
        expect(cart[0].cantidad).toBe(1)
    })

    it('dispara el evento cartUpdated', () => {
        mergeWishlistLinesIntoLocalCart([{ productId: 10, nombre: 'X', precio: 100, cantidad: 1 }])
        expect(globalThis.dispatchEvent).toHaveBeenCalledWith(expect.any(Event))
    })

    it('maneja localStorage corrupto gracefully', () => {
        localStorage.setItem('carrito', 'invalid-json')
        expect(() => mergeWishlistLinesIntoLocalCart([{
            productId: 1, nombre: 'A', precio: 100, cantidad: 1
        }])).not.toThrow()
    })
})

describe('mergeCartResponseFromApi', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.spyOn(globalThis, 'dispatchEvent')
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('no hace nada si items es null o vacío', () => {
        mergeCartResponseFromApi(null)
        mergeCartResponseFromApi({})
        mergeCartResponseFromApi({ items: [] })
        expect(localStorage.getItem('carrito')).toBeNull()
    })

    it('sincroniza items del API con el carrito local', () => {
        const cartResponse = {
            storeId: 5,
            commerce: { name: 'Tienda Y' },
            items: [{
                product: { id: 10, name: 'Mouse', price: 150000 },
                quantity: 2,
            }],
        }

        mergeCartResponseFromApi(cartResponse)

        const cart = JSON.parse(localStorage.getItem('carrito'))
        expect(cart).toHaveLength(1)
        expect(cart[0]).toMatchObject({
            productId: 10,
            nombre: 'Mouse',
            precio: 150000,
            cantidad: 2,
            storeId: 5,
            storeName: 'Tienda Y',
        })
    })

    it('usa id_product si product.id no está disponible', () => {
        const cartResponse = {
            items: [{
                product: { id_product: 20, name: 'Teclado', price: 80000 },
                quantity: 1,
            }],
        }

        mergeCartResponseFromApi(cartResponse)

        const cart = JSON.parse(localStorage.getItem('carrito'))
        expect(cart[0].productId).toBe(20)
    })

    it('filtra items sin productId válido', () => {
        const cartResponse = {
            items: [
                { product: { name: 'Sin ID', price: 1000 }, quantity: 1 },
                { product: { id: 99, name: 'Con ID', price: 2000 }, quantity: 1 },
            ],
        }

        mergeCartResponseFromApi(cartResponse)

        const cart = JSON.parse(localStorage.getItem('carrito'))
        expect(cart).toHaveLength(1)
        expect(cart[0].productId).toBe(99)
    })

    it('usa commerce.id como storeId si no hay storeId directo', () => {
        const cartResponse = {
            commerce: { id: 7, name: 'Tienda Z' },
            items: [{ product: { id: 1, name: 'A', price: 100 }, quantity: 1 }],
        }

        mergeCartResponseFromApi(cartResponse)

        const cart = JSON.parse(localStorage.getItem('carrito'))
        expect(cart[0].storeId).toBe(7)
    })
})
