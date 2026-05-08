import { describe, it, expect } from 'vitest'
import { formatGuarani, formatGuaraniAmount } from '../lib/formatGuarani'

describe('formatGuarani', () => {
    it('retorna "Gs. —" para null', () => {
        expect(formatGuarani(null)).toBe('Gs. —')
    })

    it('retorna "Gs. —" para undefined', () => {
        expect(formatGuarani(undefined)).toBe('Gs. —')
    })

    it('retorna "Gs. —" para string vacío', () => {
        expect(formatGuarani('')).toBe('Gs. —')
    })

    it('retorna "Gs. —" para NaN', () => {
        expect(formatGuarani('abc')).toBe('Gs. —')
    })

    it('retorna "Gs. —" para Infinity', () => {
        expect(formatGuarani(Infinity)).toBe('Gs. —')
    })

    it('formatea 0 correctamente', () => {
        expect(formatGuarani(0)).toBe('Gs. 0')
    })

    it('formatea un número entero', () => {
        const result = formatGuarani(150000)
        expect(result).toContain('Gs.')
        expect(result).toContain('150')
    })

    it('redondea decimales al entero más cercano', () => {
        // 1.7 → rounds to 2, no decimal fraction in output
        expect(formatGuarani(1.7)).toBe('Gs. 2')
        expect(formatGuarani(1.3)).toBe('Gs. 1')
    })

    it('acepta strings numéricos', () => {
        const result = formatGuarani('50000')
        expect(result).toContain('Gs.')
    })

    it('maneja números negativos', () => {
        const result = formatGuarani(-1000)
        expect(result).toContain('Gs.')
        expect(result).toContain('-')
    })
})

describe('formatGuaraniAmount', () => {
    it('retorna "—" para null', () => {
        expect(formatGuaraniAmount(null)).toBe('—')
    })

    it('retorna "—" para undefined', () => {
        expect(formatGuaraniAmount(undefined)).toBe('—')
    })

    it('retorna "—" para string vacío', () => {
        expect(formatGuaraniAmount('')).toBe('—')
    })

    it('retorna "—" para NaN', () => {
        expect(formatGuaraniAmount('abc')).toBe('—')
    })

    it('formatea número sin prefijo', () => {
        const result = formatGuaraniAmount(50000)
        expect(result).not.toContain('Gs.')
        expect(result).toContain('50')
    })

    it('formatea 0', () => {
        expect(formatGuaraniAmount(0)).toBe('0')
    })
})
