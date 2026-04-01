import { describe, it, expect } from 'vitest'
import { formatGuarani, timeAgo } from '../features/commerces/pages/CommerceOrdersPage'

describe('formatGuarani', () => {
    it('formatea un número entero correctamente', () => {
        expect(formatGuarani(150000)).toBe('Gs. 150.000')
    })

    it('formatea cero correctamente', () => {
        expect(formatGuarani(0)).toBe('Gs. 0')
    })

    it('formatea números grandes correctamente', () => {
        expect(formatGuarani(1000000)).toBe('Gs. 1.000.000')
    })
})

describe('timeAgo', () => {
    it('muestra "hace unos segundos" para fechas recientes', () => {
        const ahora = new Date().toISOString()
        expect(timeAgo(ahora)).toBe('hace unos segundos')
    })

    it('muestra minutos para fechas de hace menos de una hora', () => {
        const haceDoceMinutos = new Date(Date.now() - 12 * 60 * 1000).toISOString()
        expect(timeAgo(haceDoceMinutos)).toBe('hace 12 min')
    })

    it('muestra horas para fechas de hace menos de un día', () => {
        const haceTresHoras = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        expect(timeAgo(haceTresHoras)).toBe('hace 3h')
    })

    it('muestra días para fechas de hace más de un día', () => {
        const haceDosDias = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        expect(timeAgo(haceDosDias)).toBe('hace 2 días')
    })
})