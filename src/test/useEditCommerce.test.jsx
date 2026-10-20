import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../features/commerces/services/editCommerceApi', () => ({
    fetchCommerceById: vi.fn(),
    fetchCommerceCategories: vi.fn(),
    updateCommerce: vi.fn(),
    uploadStoreImage: vi.fn(),
    getBackendErrorMessage: vi.fn((_err, fb) => fb),
    apiClient: { get: vi.fn() },
}))

import {
    fetchCommerceById,
    fetchCommerceCategories,
    updateCommerce,
    uploadStoreImage,
    apiClient,
} from '../features/commerces/services/editCommerceApi'
import { useEditCommerce } from '../features/commerces/hooks/useEditCommerce'

const mockCommerce = {
    name: 'Mi Tienda',
    email: 'tienda@test.com',
    phone: '+595981000000',
    description: 'Descripcion del comercio',
    logo: 'https://cdn.example.com/logo.png',
    fk_store_category: 3,
    website_url: 'https://mitienda.com',
    instagram_url: 'https://instagram.com/tienda',
    tiktok_url: 'https://tiktok.com/@tienda',
    addresses: [{ address: 'Av. Test 123', latitude: -25.2867, longitude: -57.647 }],
    shipping_zones: [{ base_price: 10000, distance_price: 5000 }],
}

const mockCategories = [{ id: 1, name: 'Tecnologia' }, { id: 2, name: 'Ropa' }]

describe('useEditCommerce', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        apiClient.get.mockResolvedValue({ data: { user: { id_store: 5 } } })
        fetchCommerceById.mockResolvedValue(mockCommerce)
        fetchCommerceCategories.mockResolvedValue(mockCategories)
    })

    it('inicia en estado de carga', () => {
        apiClient.get.mockReturnValue(new Promise(() => {}))

        const { result } = renderHook(() => useEditCommerce())

        expect(result.current.isLoadingInitialData).toBe(true)
    })

    it('carga los datos del comercio y categorias correctamente', async () => {
        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => {
            expect(result.current.isLoadingInitialData).toBe(false)
        })

        expect(result.current.formData.name).toBe('Mi Tienda')
        expect(result.current.formData.email).toBe('tienda@test.com')
        expect(result.current.categories).toHaveLength(2)
    })

    it('setea logoPreview cuando el comercio tiene logo', async () => {
        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        expect(result.current.logoPreview).toBe('https://cdn.example.com/logo.png')
    })

    it('setea loadError cuando no hay id_store en sesion', async () => {
        apiClient.get.mockResolvedValueOnce({ data: { user: { id_store: null } } })

        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => {
            expect(result.current.loadError).toBeTruthy()
        })
    })

    it('setea loadError cuando falla fetchCommerceById', async () => {
        fetchCommerceById.mockRejectedValue(new Error('Error de red'))

        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => {
            expect(result.current.loadError).toBeTruthy()
        })
    })

    it('onFieldChange actualiza formData', async () => {
        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.onFieldChange({ target: { name: 'phone', value: '+595981999999' } })
        })

        expect(result.current.formData.phone).toBe('+595981999999')
    })

    it('handleSubmit muestra errores de validacion con formulario vacio', async () => {
        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        // Limpiar los campos requeridos manualmente
        act(() => {
            result.current.onFieldChange({ target: { name: 'name', value: '' } })
            result.current.onFieldChange({ target: { name: 'email', value: '' } })
            result.current.onFieldChange({ target: { name: 'phone', value: '' } })
        })

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })

        expect(result.current.validationErrors.name).toBe('El nombre del comercio es obligatorio.')
        expect(result.current.validationErrors.email).toBe('El email de contacto es obligatorio.')
        expect(result.current.validationErrors.phone).toBe('El teléfono es obligatorio.')
    })

    it('handleSubmit llama updateCommerce cuando el formulario es valido', async () => {
        updateCommerce.mockResolvedValueOnce({})

        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })

        await waitFor(() => {
            expect(updateCommerce).toHaveBeenCalled()
            expect(result.current.successToast).toBe(true)
        })
    })

    it('handleSubmit abre errorModal cuando updateCommerce falla', async () => {
        updateCommerce.mockRejectedValueOnce(new Error('Error al actualizar'))

        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })

        await waitFor(() => {
            expect(result.current.errorModal.isOpen).toBe(true)
        })
    })

    it('closeErrorModal cierra el modal de error', async () => {
        updateCommerce.mockRejectedValueOnce(new Error('Error'))

        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })

        await waitFor(() => expect(result.current.errorModal.isOpen).toBe(true))

        act(() => {
            result.current.closeErrorModal()
        })

        expect(result.current.errorModal.isOpen).toBe(false)
    })

    it('onLocationChange actualiza latitude y longitude', async () => {
        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.onLocationChange({ lat: -25.3, lng: -57.6 })
        })

        expect(result.current.formData.latitude).toBe(-25.3)
        expect(result.current.formData.longitude).toBe(-57.6)
    })

    it('onLocationChange con null setea null en lat/lng', async () => {
        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.onLocationChange(null)
        })

        expect(result.current.formData.latitude).toBe(null)
        expect(result.current.formData.longitude).toBe(null)
    })

    it('onLogoFileChange actualiza logoFile', async () => {
        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        const file = new File(['content'], 'logo.png', { type: 'image/png' })
        act(() => {
            result.current.onLogoFileChange(file)
        })

        expect(result.current.logoFile).toEqual(file)
    })

    it('onLogoFileChange con null limpia el logo', async () => {
        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.onLogoFileChange(null)
        })

        expect(result.current.logoFile).toBe(null)
    })

    it('removeLogo limpia el logo completamente', async () => {
        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        act(() => {
            result.current.removeLogo()
        })

        expect(result.current.logoPreview).toBe('')
        expect(result.current.logoFile).toBe(null)
        expect(result.current.formData.logoUrl).toBe('')
    })

    it('sube imagen de logo despues de updateCommerce si hay logoFile', async () => {
        updateCommerce.mockResolvedValueOnce({})
        uploadStoreImage.mockResolvedValueOnce({ logo: 'https://cdn.example.com/new-logo.png' })

        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        const file = new File(['content'], 'logo.png', { type: 'image/png' })
        act(() => {
            result.current.onLogoFileChange(file)
        })

        await act(async () => {
            await result.current.handleSubmit({ preventDefault: vi.fn() })
        })

        await waitFor(() => {
            expect(uploadStoreImage).toHaveBeenCalledWith(5, file)
        })
    })

    it('isFormDisabled es true durante la carga inicial', () => {
        apiClient.get.mockReturnValue(new Promise(() => {}))

        const { result } = renderHook(() => useEditCommerce())

        expect(result.current.isFormDisabled).toBe(true)
    })

    it('carga shipping zones correctamente', async () => {
        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        expect(result.current.formData.basePrice).toBe('10000')
        expect(result.current.formData.distancePrice).toBe('5000')
    })

    it('carga coordenadas de addresses correctamente', async () => {
        const { result } = renderHook(() => useEditCommerce())

        await waitFor(() => expect(result.current.isLoadingInitialData).toBe(false))

        expect(result.current.formData.latitude).toBe(-25.2867)
        expect(result.current.formData.longitude).toBe(-57.647)
    })
})
