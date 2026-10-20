import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

describe('useDebouncedValue', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('retorna el valor inicial inmediatamente', () => {
        const { result } = renderHook(() => useDebouncedValue('hola', 300))
        expect(result.current).toBe('hola')
    })

    it('no actualiza el valor antes de que expire el delay', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 300),
            { initialProps: { value: 'a' } }
        )

        rerender({ value: 'b' })

        act(() => { vi.advanceTimersByTime(100) })

        expect(result.current).toBe('a')
    })

    it('actualiza el valor después del delay', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 300),
            { initialProps: { value: 'a' } }
        )

        rerender({ value: 'b' })

        act(() => { vi.advanceTimersByTime(300) })

        expect(result.current).toBe('b')
    })

    it('cancela el timer anterior si el valor cambia de nuevo', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 300),
            { initialProps: { value: 'a' } }
        )

        rerender({ value: 'b' })
        act(() => { vi.advanceTimersByTime(200) })

        rerender({ value: 'c' })
        act(() => { vi.advanceTimersByTime(300) })

        expect(result.current).toBe('c')
    })

    it('usa el delay por defecto de 350ms', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value),
            { initialProps: { value: 'x' } }
        )

        rerender({ value: 'y' })

        act(() => { vi.advanceTimersByTime(349) })
        expect(result.current).toBe('x')

        act(() => { vi.advanceTimersByTime(1) })
        expect(result.current).toBe('y')
    })
})
