import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../features/commerces/services/createProductApi', () => ({
    fetchProductCategories: vi.fn(),
    fetchProductTags: vi.fn(),
    createProduct: vi.fn(),
    uploadProductImage: vi.fn(),
    getBackendErrorMessage: (_err, fallback) => fallback,
}))

import { MAX_VISIBLE_TAG_SUGGESTIONS, useCreateProduct } from '../features/commerces/hooks/useCreateProduct'
import {
    fetchProductCategories,
    fetchProductTags,
    createProduct,
    uploadProductImage,
} from '../features/commerces/services/createProductApi'

const mockCategories = [{ id: 1, name: 'Electrónica', status: true }]
const mockTags = [{ id: 1, name: 'oferta', status: true }, { id: 2, name: 'nuevo', status: true }]

describe('useCreateProduct', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchProductCategories.mockResolvedValue(mockCategories)
        fetchProductTags.mockResolvedValue(mockTags)
    })

    it('inicia en estado de carga y luego carga categorías y tags', async () => {
        const { result } = renderHook(() => useCreateProduct())

        expect(result.current.isLoadingInitialData).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoadingInitialData).toBe(false)
        })

        expect(result.current.categories).toHaveLength(1)
        expect(result.current.availableTags).toHaveLength(2)
    })

    it('setea loadError cuando falla la carga inicial', async () => {
        fetchProductCategories.mockRejectedValueOnce(new Error('Error de red'))

        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => {
            expect(result.current.loadError).toBeTruthy()
        })
    })

    it('onFieldChange actualiza el formData', async () => {
        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.onFieldChange({
                target: { name: 'name', value: 'Laptop Gaming', type: 'text' }
            })
        })

        expect(result.current.formData.name).toBe('Laptop Gaming')
    })

    it('onFieldChange maneja checkboxes', async () => {
        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.onFieldChange({
                target: { name: 'isVisible', value: 'on', type: 'checkbox', checked: false }
            })
        })

        expect(result.current.formData.isVisible).toBe(false)
    })

    it('toggleTag agrega un tag no seleccionado', async () => {
        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.toggleTag({ id: 1, name: 'oferta' })
        })

        expect(result.current.selectedTags).toHaveLength(1)
        expect(result.current.selectedTags[0].name).toBe('oferta')
    })

    it('toggleTag elimina un tag ya seleccionado', async () => {
        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => { result.current.toggleTag({ id: 1, name: 'oferta' }) })
        act(() => { result.current.toggleTag({ id: 1, name: 'oferta' }) })

        expect(result.current.selectedTags).toHaveLength(0)
    })

    it('selectedTagNames combina los nombres de tags seleccionados', async () => {
        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.toggleTag({ id: 1, name: 'oferta' })
            result.current.toggleTag({ id: 2, name: 'nuevo' })
        })

        expect(result.current.selectedTagNames).toBe('oferta, nuevo')
    })

    it('handleSubmit muestra errores de validación cuando el formulario está vacío', async () => {
        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        await act(async () => {
            result.current.handleSubmit({ preventDefault: vi.fn() })
        })

        expect(result.current.validationErrors.name).toBe('El nombre del producto es obligatorio.')
        expect(result.current.validationErrors.description).toBe('La descripcion es obligatoria.')
        expect(result.current.validationErrors.price).toBe('El precio es obligatorio.')
    })

    it('handleSubmit crea el producto exitosamente', async () => {
        createProduct.mockResolvedValueOnce({ id_product: 100 })

        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.onFieldChange({ target: { name: 'name', value: 'Laptop', type: 'text' } })
            result.current.onFieldChange({ target: { name: 'description', value: 'Descripcion completa del laptop', type: 'text' } })
            result.current.onFieldChange({ target: { name: 'price', value: '500000', type: 'number' } })
            result.current.onFieldChange({ target: { name: 'categoryId', value: '1', type: 'select' } })
            result.current.onFieldChange({ target: { name: 'quantity', value: '10', type: 'number' } })
        })

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })

        await waitFor(() => {
            expect(result.current.resultModal.isOpen).toBe(true)
            expect(result.current.resultModal.variant).toBe('success')
        })
    })

    it('handleSubmit muestra error cuando createProduct falla', async () => {
        createProduct.mockRejectedValueOnce(new Error('Error al crear'))

        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.onFieldChange({ target: { name: 'name', value: 'Laptop', type: 'text' } })
            result.current.onFieldChange({ target: { name: 'description', value: 'Desc completa del laptop', type: 'text' } })
            result.current.onFieldChange({ target: { name: 'price', value: '500000', type: 'number' } })
            result.current.onFieldChange({ target: { name: 'categoryId', value: '1', type: 'select' } })
            result.current.onFieldChange({ target: { name: 'quantity', value: '10', type: 'number' } })
        })

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })

        await waitFor(() => {
            expect(result.current.resultModal.variant).toBe('error')
        })
    })

    it('closeModal cierra el modal de resultado', async () => {
        createProduct.mockResolvedValueOnce({ id_product: 100 })

        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.onFieldChange({ target: { name: 'name', value: 'Laptop', type: 'text' } })
            result.current.onFieldChange({ target: { name: 'description', value: 'Desc completa del laptop', type: 'text' } })
            result.current.onFieldChange({ target: { name: 'price', value: '500000', type: 'number' } })
            result.current.onFieldChange({ target: { name: 'categoryId', value: '1', type: 'select' } })
            result.current.onFieldChange({ target: { name: 'quantity', value: '10', type: 'number' } })
        })

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })

        await waitFor(() => expect(result.current.resultModal.isOpen).toBe(true))

        act(() => {
            result.current.closeModal()
        })

        expect(result.current.resultModal.isOpen).toBe(false)
    })

    it('onImageFileChange actualiza el imageFile', async () => {
        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        const file = new File(['content'], 'foto.jpg', { type: 'image/jpeg' })
        act(() => {
            result.current.onImageFileChange(file)
        })

        expect(result.current.imageFile).toEqual(file)
    })

    it('displayedTagOptions limita a MAX_VISIBLE_TAG_SUGGESTIONS por defecto', async () => {
        const manyTags = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `tag${i}`, status: true }))
        fetchProductTags.mockResolvedValueOnce(manyTags)
        fetchProductCategories.mockResolvedValueOnce([])

        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        expect(result.current.displayedTagOptions.length).toBe(MAX_VISIBLE_TAG_SUGGESTIONS)
    })

    it('displayedTagOptions muestra todos cuando showAllTagSuggestions es true', async () => {
        const manyTags = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `tag${i}`, status: true }))
        fetchProductTags.mockResolvedValueOnce(manyTags)
        fetchProductCategories.mockResolvedValueOnce([])

        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.setShowAllTagSuggestions(true)
        })

        expect(result.current.displayedTagOptions.length).toBe(10)
    })

    it('sube imagen después de crear el producto si imageFile es un File', async () => {
        createProduct.mockResolvedValueOnce({ id_product: 200 })
        uploadProductImage.mockResolvedValueOnce({ image_url: 'https://cdn.example.com/img.jpg' })

        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        const file = new File(['content'], 'foto.jpg', { type: 'image/jpeg' })
        act(() => {
            result.current.onImageFileChange(file)
            result.current.onFieldChange({ target: { name: 'name', value: 'Laptop', type: 'text' } })
            result.current.onFieldChange({ target: { name: 'description', value: 'Desc completa del laptop', type: 'text' } })
            result.current.onFieldChange({ target: { name: 'price', value: '500000', type: 'number' } })
            result.current.onFieldChange({ target: { name: 'categoryId', value: '1', type: 'select' } })
            result.current.onFieldChange({ target: { name: 'quantity', value: '5', type: 'number' } })
        })

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })

        await waitFor(() => {
            expect(uploadProductImage).toHaveBeenCalledWith(200, file)
        })
    })

    it('removeTag elimina el tag por id', async () => {
        const { result } = renderHook(() => useCreateProduct())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => { result.current.toggleTag({ id: 1, name: 'oferta' }) })
        expect(result.current.selectedTags).toHaveLength(1)

        act(() => { result.current.removeTag(1) })
        expect(result.current.selectedTags).toHaveLength(0)
    })
})
