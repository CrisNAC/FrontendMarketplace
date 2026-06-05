import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../features/commerces/services/categoryRequestApi', () => ({
    submitCategoryRequest: vi.fn(),
    getBackendErrorMessage: vi.fn((error, fallback) => fallback),
}))

import { submitCategoryRequest, getBackendErrorMessage } from '../features/commerces/services/categoryRequestApi'
import { useCategoryRequest } from '../features/commerces/hooks/useCategoryRequest'

describe('useCategoryRequest', () => {
    beforeEach(() => vi.clearAllMocks())

    it('estado inicial correcto', () => {
        const { result } = renderHook(() => useCategoryRequest())
        expect(result.current.formData).toEqual({ name: '' })
        expect(result.current.validationErrors).toEqual({})
        expect(result.current.isSubmitting).toBe(false)
        expect(result.current.resultModal.isOpen).toBe(false)
    })

    it('onFieldChange actualiza formData y limpia errores', () => {
        const { result } = renderHook(() => useCategoryRequest())
        act(() => {
            result.current.onFieldChange({ target: { name: 'name', value: 'Tecnología' } })
        })
        expect(result.current.formData.name).toBe('Tecnología')
        expect(result.current.validationErrors.name).toBe('')
    })

    it('handleSubmit muestra error de validación si el nombre está vacío', async () => {
        const { result } = renderHook(() => useCategoryRequest())
        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })
        expect(result.current.validationErrors.name).toBeTruthy()
        expect(submitCategoryRequest).not.toHaveBeenCalled()
    })

    it('handleSubmit muestra error de validación si el nombre es solo espacios', async () => {
        const { result } = renderHook(() => useCategoryRequest())
        act(() => {
            result.current.onFieldChange({ target: { name: 'name', value: '   ' } })
        })
        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })
        expect(result.current.validationErrors.name).toBeTruthy()
    })

    it('handleSubmit envía correctamente y muestra modal de éxito', async () => {
        submitCategoryRequest.mockResolvedValue({})
        const { result } = renderHook(() => useCategoryRequest())
        act(() => {
            result.current.onFieldChange({ target: { name: 'name', value: 'Electrónica' } })
        })
        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })
        expect(submitCategoryRequest).toHaveBeenCalledWith({ name: 'Electrónica' })
        expect(result.current.resultModal.isOpen).toBe(true)
        expect(result.current.resultModal.variant).toBe('success')
        expect(result.current.formData.name).toBe('')
    })

    it('handleSubmit muestra modal de error cuando la API falla', async () => {
        submitCategoryRequest.mockRejectedValue(new Error('Network error'))
        const { result } = renderHook(() => useCategoryRequest())
        act(() => {
            result.current.onFieldChange({ target: { name: 'name', value: 'Categoría' } })
        })
        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })
        expect(result.current.resultModal.isOpen).toBe(true)
        expect(result.current.resultModal.variant).toBe('error')
        expect(getBackendErrorMessage).toHaveBeenCalled()
    })

    it('closeModal cierra el modal de resultado', async () => {
        submitCategoryRequest.mockResolvedValue({})
        const { result } = renderHook(() => useCategoryRequest())
        act(() => {
            result.current.onFieldChange({ target: { name: 'name', value: 'Test' } })
        })
        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })
        expect(result.current.resultModal.isOpen).toBe(true)
        act(() => result.current.closeModal())
        expect(result.current.resultModal.isOpen).toBe(false)
    })

    it('resetForm limpia el formulario y errores', () => {
        const { result } = renderHook(() => useCategoryRequest())
        act(() => {
            result.current.onFieldChange({ target: { name: 'name', value: 'Algo' } })
        })
        act(() => result.current.resetForm())
        expect(result.current.formData.name).toBe('')
        expect(result.current.validationErrors).toEqual({})
    })

    it('isSubmitting es true durante el envío y false después', async () => {
        let resolveSubmit
        submitCategoryRequest.mockReturnValue(new Promise(resolve => { resolveSubmit = resolve }))
        const { result } = renderHook(() => useCategoryRequest())
        act(() => {
            result.current.onFieldChange({ target: { name: 'name', value: 'Categoría' } })
        })
        act(() => {
            result.current.handleSubmit({ preventDefault: vi.fn() })
        })
        expect(result.current.isSubmitting).toBe(true)
        resolveSubmit({})
        await waitFor(() => {
            expect(result.current.isSubmitting).toBe(false)
        })
    })
})
