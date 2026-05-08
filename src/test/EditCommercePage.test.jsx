import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

vi.mock('../features/commerces/hooks/useEditCommerce', () => ({
    useEditCommerce: vi.fn(),
}))

vi.mock('../features/commerces/components/createProduct/CreationResultModal', () => ({
    CreationResultModal: ({ isOpen, message }) => isOpen ? <div>{message}</div> : null,
}))

vi.mock('../components/Spinner', () => ({
    Spinner: () => <div data-testid="spinner">Cargando...</div>,
}))

vi.mock('../features/clients/components/Map', () => ({
    default: () => <div data-testid="map">Mapa</div>,
}))

vi.mock('lucide-react', () => ({
    Save: () => <span>Save</span>,
    X: ({ onClick }) => <span onClick={onClick} data-testid="x-icon">×</span>,
}))

import { useEditCommerce } from '../features/commerces/hooks/useEditCommerce'
import { EditCommercePage } from '../features/commerces/pages/EditCommercePage'

const baseHookReturn = {
    formData: {
        name: '',
        email: '',
        phone: '',
        description: '',
        website_url: '',
        instagram_url: '',
        tiktok_url: '',
        categoryId: '',
        address: '',
        city: '',
        region: '',
        postal_code: '',
        latitude: null,
        longitude: null,
    },
    logoPreview: null,
    logoFile: null,
    validationErrors: {},
    categories: [{ id: 1, name: 'Tecnología' }],
    isLoadingInitialData: false,
    isSubmitting: false,
    isFormDisabled: false,
    loadError: null,
    successToast: null,
    errorModal: { isOpen: false, title: '', message: '' },
    closeErrorModal: vi.fn(),
    onFieldChange: vi.fn(),
    onLocationChange: vi.fn(),
    onLogoFileChange: vi.fn(),
    removeLogo: vi.fn(),
    handleSubmit: vi.fn(),
    errorRef: { current: null },
}

describe('EditCommercePage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useEditCommerce.mockReturnValue(baseHookReturn)
    })

    it('muestra spinner mientras carga', () => {
        useEditCommerce.mockReturnValue({ ...baseHookReturn, isLoadingInitialData: true })
        render(<EditCommercePage />)
        expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })

    it('muestra error cuando falla la carga', () => {
        useEditCommerce.mockReturnValue({
            ...baseHookReturn,
            loadError: 'Comercio no encontrado.',
        })
        render(<EditCommercePage />)
        expect(screen.getByText('Comercio no encontrado.')).toBeInTheDocument()
    })

    it('muestra el campo de teléfono', () => {
        render(<EditCommercePage />)
        expect(screen.getByPlaceholderText('+595XXXXXXXXX')).toBeInTheDocument()
    })

    it('muestra el campo de sitio web', () => {
        render(<EditCommercePage />)
        expect(screen.getByPlaceholderText('https://mi-comercio.com')).toBeInTheDocument()
    })

    it('muestra el campo de Instagram', () => {
        render(<EditCommercePage />)
        expect(screen.getByPlaceholderText('https://instagram.com/mi_comercio')).toBeInTheDocument()
    })

    it('muestra el campo de TikTok', () => {
        render(<EditCommercePage />)
        expect(screen.getByPlaceholderText('https://tiktok.com/@mi_comercio')).toBeInTheDocument()
    })

    it('muestra el botón de Guardar Cambios', () => {
        render(<EditCommercePage />)
        expect(screen.getByText('Guardar Cambios')).toBeInTheDocument()
    })

    it('muestra el botón de Cancelar', () => {
        render(<EditCommercePage />)
        expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })

    it('navega a /comercio/perfil al hacer clic en Cancelar', async () => {
        render(<EditCommercePage />)
        await userEvent.click(screen.getByText('Cancelar'))
        expect(mockNavigate).toHaveBeenCalledWith('/comercio/perfil')
    })

    it('llama handleSubmit al hacer clic en Guardar Cambios', async () => {
        const mockHandleSubmit = vi.fn()
        useEditCommerce.mockReturnValue({ ...baseHookReturn, handleSubmit: mockHandleSubmit })
        render(<EditCommercePage />)
        await userEvent.click(screen.getByText('Guardar Cambios'))
        expect(mockHandleSubmit).toHaveBeenCalled()
    })

    it('muestra el spinner durante el submit (sin texto Guardar Cambios)', () => {
        useEditCommerce.mockReturnValue({
            ...baseHookReturn,
            isSubmitting: true,
            isFormDisabled: true,
        })
        render(<EditCommercePage />)
        expect(screen.queryByText('Guardar Cambios')).not.toBeInTheDocument()
    })

    it('muestra error de validación del nombre', () => {
        useEditCommerce.mockReturnValue({
            ...baseHookReturn,
            validationErrors: { name: 'El nombre es requerido.' },
        })
        render(<EditCommercePage />)
        expect(screen.getByText('El nombre es requerido.')).toBeInTheDocument()
    })

    it('muestra la categoría disponible en el selector', () => {
        render(<EditCommercePage />)
        expect(screen.getByText('Tecnología')).toBeInTheDocument()
    })

    it('muestra el mapa', () => {
        render(<EditCommercePage />)
        expect(screen.getByTestId('map')).toBeInTheDocument()
    })

    it('muestra el modal de error cuando está abierto', () => {
        useEditCommerce.mockReturnValue({
            ...baseHookReturn,
            errorModal: { isOpen: true, title: 'Error', message: 'No se pudo actualizar el comercio' },
        })
        render(<EditCommercePage />)
        expect(screen.getByText('No se pudo actualizar el comercio')).toBeInTheDocument()
    })

    it('muestra "Sin logo" cuando logoPreview es null', () => {
        render(<EditCommercePage />)
        expect(screen.getByText('Sin logo')).toBeInTheDocument()
    })

    it('muestra la vista previa del logo cuando logoPreview está disponible', () => {
        useEditCommerce.mockReturnValue({
            ...baseHookReturn,
            logoPreview: 'https://example.com/logo.png',
        })
        render(<EditCommercePage />)
        const img = screen.getByAltText('Logo')
        expect(img).toBeInTheDocument()
    })

    it('muestra el toast de éxito cuando successToast está disponible', () => {
        useEditCommerce.mockReturnValue({
            ...baseHookReturn,
            successToast: 'any-truthy-value',
        })
        render(<EditCommercePage />)
        expect(screen.getByText('✓ Comercio actualizado exitosamente')).toBeInTheDocument()
    })

    it('muestra "Limpiar punto" cuando hay coordenadas en formData', () => {
        useEditCommerce.mockReturnValue({
            ...baseHookReturn,
            formData: { ...baseHookReturn.formData, latitude: -25.2867, longitude: -57.647 },
        })
        render(<EditCommercePage />)
        expect(screen.getByText('Limpiar punto')).toBeInTheDocument()
    })

    it('llama onLocationChange al hacer clic en Limpiar punto', async () => {
        const mockOnLocationChange = vi.fn()
        useEditCommerce.mockReturnValue({
            ...baseHookReturn,
            formData: { ...baseHookReturn.formData, latitude: -25.2867, longitude: -57.647 },
            onLocationChange: mockOnLocationChange,
        })
        render(<EditCommercePage />)
        await userEvent.click(screen.getByText('Limpiar punto'))
        expect(mockOnLocationChange).toHaveBeenCalledWith(null)
    })

    it('muestra la categoría seleccionada como chip cuando categoryId coincide', () => {
        useEditCommerce.mockReturnValue({
            ...baseHookReturn,
            formData: { ...baseHookReturn.formData, categoryId: '1' },
        })
        render(<EditCommercePage />)
        // "Tecnología" appears both in the select option and in the chip
        expect(screen.getAllByText('Tecnología').length).toBeGreaterThanOrEqual(2)
    })
})
