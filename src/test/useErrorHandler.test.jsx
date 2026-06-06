import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

import { useErrorHandler } from '../hooks/useErrorHandler'

describe('useErrorHandler', () => {
    beforeEach(() => vi.clearAllMocks())

    const makeError = (status, code) => ({
        response: {
            status,
            data: code === undefined ? {} : { error: { code } },
        },
    })

    it('navega a /login para error 401', () => {
        const { result } = renderHook(() => useErrorHandler())
        result.current(makeError(401))
        expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('navega a /error/403 para error 403', () => {
        const { result } = renderHook(() => useErrorHandler())
        result.current(makeError(403))
        expect(mockNavigate).toHaveBeenCalledWith('/error/403')
    })

    it('navega a /error/500 para error 500', () => {
        const { result } = renderHook(() => useErrorHandler())
        result.current(makeError(500))
        expect(mockNavigate).toHaveBeenCalledWith('/error/500')
    })

    it('navega a /error/500 para cualquier 5xx', () => {
        const { result } = renderHook(() => useErrorHandler())
        result.current(makeError(503))
        expect(mockNavigate).toHaveBeenCalledWith('/error/500')
    })

    it('no navega a /error/404 por defecto', () => {
        const { result } = renderHook(() => useErrorHandler())
        result.current(makeError(404))
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('navega a /error/404 cuando redirect404 es true', () => {
        const { result } = renderHook(() => useErrorHandler({ redirect404: true }))
        result.current(makeError(404))
        expect(mockNavigate).toHaveBeenCalledWith('/error/404')
    })

    it('no navega si el código no es un número', () => {
        const { result } = renderHook(() => useErrorHandler())
        result.current({ response: { status: 'invalid' } })
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('no navega si no hay response', () => {
        const { result } = renderHook(() => useErrorHandler())
        result.current(new Error('network'))
        expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('usa el código del campo error.code si está disponible', () => {
        const { result } = renderHook(() => useErrorHandler())
        result.current(makeError(200, 401))
        expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
})
