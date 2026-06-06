/* eslint-disable react/prop-types */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}))

vi.mock('lucide-react', () => ({
    ArrowLeft: ({ onClick }) => <button onClick={onClick} data-testid="arrow-left">←</button>,
    X: ({ onClick }) => <button type="button" onClick={onClick} data-testid="x-icon">×</button>,
}))

vi.mock('../features/commerces/components/createProduct/CreationResultModal', () => ({
    CreationResultModal: ({ isOpen, onClose, message }) =>
        isOpen ? <div data-testid="result-modal"><p>{message}</p><button onClick={onClose}>Cerrar modal</button></div> : null,
}))

vi.mock('../features/commerces/components/createProduct/CategoryRequestModal', () => ({
    CategoryRequestModal: ({ isOpen, onClose }) =>
        isOpen ? <div data-testid="category-modal"><button onClick={onClose}>Cerrar cat</button></div> : null,
}))

vi.mock('../features/commerces/components/createProduct/Toggle', () => ({
    default: ({ isOn, onToggle }) => (
        <button onClick={() => onToggle(!isOn)} data-testid="toggle">Toggle</button>
    ),
}))

vi.mock('../features/commerces/hooks/useCreateProduct', () => ({
    useCreateProduct: vi.fn(),
    MAX_TAGS: 5,
    MAX_VISIBLE_TAG_SUGGESTIONS: 10,
}))

vi.mock('../features/commerces/hooks/useCategoryRequest', () => ({
    useCategoryRequest: vi.fn(),
}))

import { useCreateProduct } from '../features/commerces/hooks/useCreateProduct'
import { useCategoryRequest } from '../features/commerces/hooks/useCategoryRequest'
import CreateProductPage from '../features/commerces/pages/CreateProductPage'

const baseHook = {
    formData: { name: '', description: '', price: '', categoryId: '', quantity: '', isVisible: true },
    categories: [{ id: 1, name: 'Electrónica' }],
    availableTags: [],
    selectedTags: [],
    displayedTagOptions: [],
    selectedTagNames: '',
    showAllTagSuggestions: false,
    validationErrors: {},
    loadError: null,
    resultModal: { isOpen: false, variant: 'success', title: '', message: '' },
    isLoadingInitialData: false,
    isSubmitting: false,
    isFormDisabled: false,
    imageFile: null,
    setFormData: vi.fn(),
    setShowAllTagSuggestions: vi.fn(),
    closeModal: vi.fn(),
    onFieldChange: vi.fn(),
    onImageFileChange: vi.fn(),
    toggleTag: vi.fn(),
    handleSubmit: vi.fn((e) => e?.preventDefault()),
}

const baseCategoryHook = {
    formData: { name: '', description: '' },
    validationErrors: {},
    isSubmitting: false,
    resultModal: { isOpen: false, variant: 'success', title: '', message: '' },
    closeModal: vi.fn(),
    onFieldChange: vi.fn(),
    resetForm: vi.fn(),
    handleSubmit: vi.fn(),
}

describe('CreateProductPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useCreateProduct.mockReturnValue({ ...baseHook })
        useCategoryRequest.mockReturnValue({ ...baseCategoryHook })
    })

    it('muestra el título "Crear Nuevo Producto"', () => {
        render(<CreateProductPage />)
        expect(screen.getByText('Crear Nuevo Producto')).toBeInTheDocument()
    })

    it.each([
        ['nombre', 'Ej: Coca Cola 1L'],
        ['descripción', 'Describe las caracteristicas del producto'],
        ['precio', '12000'],
        ['stock', '20'],
    ])('muestra el campo de %s', (_, placeholder) => {
        render(<CreateProductPage />)
        expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument()
    })

    it.each([
        ['Crear Producto'],
        ['Cancelar'],
    ])('muestra el botón "%s"', (text) => {
        render(<CreateProductPage />)
        expect(screen.getByText(text)).toBeInTheDocument()
    })

    it('navega a /comercio al hacer clic en Cancelar', async () => {
        render(<CreateProductPage />)
        await userEvent.click(screen.getByText('Cancelar'))
        expect(mockNavigate).toHaveBeenCalledWith('/comercio')
    })

    it('muestra "Cargando categorias..." cuando isLoadingInitialData es true', () => {
        useCreateProduct.mockReturnValue({ ...baseHook, isLoadingInitialData: true })
        render(<CreateProductPage />)
        expect(screen.getByText('Cargando categorias...')).toBeInTheDocument()
    })

    it('muestra las categorías en el selector', () => {
        render(<CreateProductPage />)
        expect(screen.getByText('Electrónica')).toBeInTheDocument()
    })

    it('muestra el error de carga cuando loadError no es null', () => {
        useCreateProduct.mockReturnValue({ ...baseHook, loadError: 'Error al cargar datos iniciales' })
        render(<CreateProductPage />)
        expect(screen.getByText('Error al cargar datos iniciales')).toBeInTheDocument()
    })

    it('muestra errores de validación del nombre', () => {
        useCreateProduct.mockReturnValue({
            ...baseHook,
            validationErrors: { name: 'El nombre es requerido' },
        })
        render(<CreateProductPage />)
        expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
    })

    it('muestra "Creando..." cuando isSubmitting es true', () => {
        useCreateProduct.mockReturnValue({ ...baseHook, isSubmitting: true, isFormDisabled: true })
        render(<CreateProductPage />)
        expect(screen.getByText('Creando...')).toBeInTheDocument()
    })

    it('abre el modal de categoría al hacer clic en "Solicitala"', async () => {
        render(<CreateProductPage />)
        await userEvent.click(screen.getByText('¿No encontrás tu categoría? Solicitala'))
        expect(screen.getByTestId('category-modal')).toBeInTheDocument()
    })

    it('muestra el modal de resultado cuando resultModal.isOpen es true', () => {
        useCreateProduct.mockReturnValue({
            ...baseHook,
            resultModal: { isOpen: true, variant: 'success', title: 'Éxito', message: 'Producto creado' },
        })
        render(<CreateProductPage />)
        expect(screen.getByTestId('result-modal')).toBeInTheDocument()
    })

    it('llama handleSubmit al enviar el formulario', async () => {
        const mockHandleSubmit = vi.fn((e) => e?.preventDefault())
        useCreateProduct.mockReturnValue({ ...baseHook, handleSubmit: mockHandleSubmit })
        render(<CreateProductPage />)
        await userEvent.click(screen.getByText('Crear Producto'))
        await waitFor(() => {
            expect(mockHandleSubmit).toHaveBeenCalled()
        })
    })

    it('muestra "Sin imagen" cuando no hay imageFile', () => {
        render(<CreateProductPage />)
        expect(screen.getByText('Sin imagen')).toBeInTheDocument()
    })

    it('muestra "Visible para clientes" cuando isVisible es true', () => {
        render(<CreateProductPage />)
        expect(screen.getByText('Visible para clientes')).toBeInTheDocument()
    })

    it('muestra "No visible" cuando isVisible es false', () => {
        useCreateProduct.mockReturnValue({
            ...baseHook,
            formData: { ...baseHook.formData, isVisible: false },
        })
        render(<CreateProductPage />)
        expect(screen.getByText('No visible')).toBeInTheDocument()
    })

    it('muestra las sugerencias de tags cuando displayedTagOptions tiene elementos', () => {
        useCreateProduct.mockReturnValue({
            ...baseHook,
            displayedTagOptions: [{ id: 1, name: 'gaming' }, { id: 2, name: 'oferta' }],
        })
        render(<CreateProductPage />)
        expect(screen.getByText('gaming')).toBeInTheDocument()
        expect(screen.getByText('oferta')).toBeInTheDocument()
    })
})
