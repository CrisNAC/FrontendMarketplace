import { describe, it, expect, beforeEach } from 'vitest'
import {
    readCachedStoreDeliveries,
    prependCachedStoreDelivery,
} from '../features/commerces/utils/storeDeliveriesLocalCache'

describe('storeDeliveriesLocalCache', () => {
    beforeEach(() => {
        sessionStorage.clear()
    })

    describe('readCachedStoreDeliveries', () => {
        it('retorna [] cuando storeId es null', () => {
            expect(readCachedStoreDeliveries(null)).toEqual([])
        })

        it('retorna [] cuando no hay datos en sessionStorage', () => {
            expect(readCachedStoreDeliveries(5)).toEqual([])
        })

        it('retorna los deliveries cacheados cuando existen', () => {
            const key = 'fe_store_deliveries_cache_v1_5'
            const data = [{ fk_user: 1, name: 'Juan' }]
            sessionStorage.setItem(key, JSON.stringify(data))

            expect(readCachedStoreDeliveries(5)).toEqual(data)
        })

        it('retorna [] cuando el JSON es inválido', () => {
            sessionStorage.setItem('fe_store_deliveries_cache_v1_5', 'invalid-json')
            expect(readCachedStoreDeliveries(5)).toEqual([])
        })

        it('retorna [] cuando el dato parseado no es un array', () => {
            sessionStorage.setItem('fe_store_deliveries_cache_v1_5', JSON.stringify({ not: 'an array' }))
            expect(readCachedStoreDeliveries(5)).toEqual([])
        })
    })

    describe('prependCachedStoreDelivery', () => {
        it('no hace nada cuando storeId es null', () => {
            prependCachedStoreDelivery(null, { fk_user: 1, name: 'Juan' })
            expect(sessionStorage.length).toBe(0)
        })

        it('no hace nada cuando entry no tiene fk_user', () => {
            prependCachedStoreDelivery(5, { name: 'Juan' })
            expect(sessionStorage.length).toBe(0)
        })

        it('agrega el delivery al principio de la lista', () => {
            const entry = { fk_user: 1, name: 'Juan', addedAt: '2024-01-01T00:00:00.000Z' }
            prependCachedStoreDelivery(5, entry)

            const result = readCachedStoreDeliveries(5)
            expect(result).toHaveLength(1)
            expect(result[0].fk_user).toBe(1)
        })

        it('no duplica si el fk_user ya existe en la lista', () => {
            prependCachedStoreDelivery(5, { fk_user: 1, name: 'Juan' })
            prependCachedStoreDelivery(5, { fk_user: 1, name: 'Juan actualizado' })

            const result = readCachedStoreDeliveries(5)
            expect(result).toHaveLength(1)
        })

        it('agrega el campo addedAt automáticamente si no se provee', () => {
            prependCachedStoreDelivery(5, { fk_user: 2, name: 'María' })

            const result = readCachedStoreDeliveries(5)
            expect(result[0].addedAt).toBeDefined()
        })

        it('prepende correctamente (más nuevo primero)', () => {
            prependCachedStoreDelivery(5, { fk_user: 1, name: 'Juan' })
            prependCachedStoreDelivery(5, { fk_user: 2, name: 'María' })

            const result = readCachedStoreDeliveries(5)
            expect(result[0].fk_user).toBe(2)
            expect(result[1].fk_user).toBe(1)
        })
    })
})
