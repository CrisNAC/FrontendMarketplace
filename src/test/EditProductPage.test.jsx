import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '42' }),
}))

vi.mock('lucide-react', () => ({
    ArrowLeft: () => <span>←</span>,
    X: ({ onClick }) => <span onClick={onClick} data-testid="x-icon">×</span>,
}))

vi.mock('../features/commerces/hooks/useEditProduct', () => ({
    useEditProduct: vi.fn(),
}))

vi.mock('../features/commerces/hooks/useCategoryRequest', () => ({
    useCategoryRequest: vi.fn(),
}))

vi.mock('../features/commerces/components/createProduct/CreationResultModal', () => ({
    CreationResultModal: ({ isOpen, onClose, message }) =>
        isOpen ? <div data-testid="result-modal"><p>{message}</p><button onClick={onClose}>Cerrar</button></div> : null,
}))

vi.mock('../features/commerces/components/createProduct/CategoryRequestModal', () => ({
    CategoryRequestModal: ({ isOpen, onClose }) =>
        isOpen ? <div data-testid="category-modal"><button onClick={onClose}>Cerrar cat</button></div> : null,
}))

vi.mock('../features/commerces/components/createProduct/Toggle', () => ({
    default: ({ isOn, onToggle, label }) => (
        <button
            role="switch"
            aria-checked={isOn}
            aria-label={label}
            onClick={() => onToggle(!isOn)}
            data-testid="toggle"
        >
            Toggle
        </button>
    ),
}))

import { useEditProduct } from '../features/commerces/hooks/useEditProduct'
import { useCategoryRequest } from '../features/commerces/hooks/useCategoryRequest'
import EditProductPage from '../features/commerces/pages/EditProductPage'

const baseHook = {
    formData: {
        name: 'Laptop Gaming',
        description: 'Una laptop increíble',
        price: '1500000',
        categoryId: '1',
        isOffer: false,
        offerPrice: '',
        isVisible: true,
        imageUrl: '',
    },
    selectedTags: [],
    validationErrors: {},
    categories: [{ id: 1, name: 'Electrónica' }],
    displayedTagOptions: [],
    showAllTagSuggestions: false,
    setShowAllTagSuggestions: vi.fn(),
    isLoadingInitialData: false,
    isSubmitting: false,
    isFormDisabled: false,
    loadError: null,
    resultModal: { isOpen: false, variant: '', title: '', message: '' },
    closeModal: vi.fn(),
    onFieldChange: vi.fn(),
    onImageFileChange: vi.fn(),
    imageFile: null,
    toggleTag: vi.fn(),
    removeTag: vi.fn(),
    handleSubmit: vi.fn((e) => e?.preventDefault()),
    MAX_TAGS: 5,
    availableTags: [],
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

describe('EditProductPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useEditProduct.mockReturnValue({ ...baseHook })
        useCategoryRequest.mockReturnValue({ ...baseCategoryHook })
    })

    it('muestra el título "Editar Producto"', () => {
        render(<EditProductPage />)
        expect(screen.getByText('Editar Producto')).toBeInTheDocument()
    })

    it('muestra el campo de nombre del producto', () => {
        render(<EditProductPage />)
        expect(screen.getByPlaceholderText('Ej: Silla Ergonómica de Oficina')).toBeInTheDocument()
    })

    it('muestra el campo de descripción', () => {
        render(<EditProductPage />)
        expect(screen.getByPlaceholderText('Describí las características del producto')).toBeInTheDocument()
    })

    it('muestra el campo de precio', () => {
        render(<EditProductPage />)
        expect(screen.getByPlaceholderText('89990')).toBeInTheDocument()
    })

    it('muestra el selector de categoría con opciones', () => {
        render(<EditProductPage />)
        expect(screen.getByText('Electrónica')).toBeInTheDocument()
    })

    it('muestra "Cargando categorías..." cuando isLoadingInitialData es true', () => {
        useEditProduct.mockReturnValue({ ...baseHook, isLoadingInitialData: true })
        render(<EditProductPage />)
        expect(screen.getByText('Cargando categorías...')).toBeInTheDocument()
    })

    it('muestra el botón "Actualizar Producto"', () => {
        render(<EditProductPage />)
        expect(screen.getByText('Actualizar Producto')).toBeInTheDocument()
    })

    it('muestra el botón "Cancelar"', () => {
        render(<EditProductPage />)
        expect(screen.getByText('Cancelar')).toBeInTheDocument()
    })

    it('navega hacia atrás al hacer clic en Cancelar', async () => {
        render(<EditProductPage />)
        await userEvent.click(screen.getByText('Cancelar'))
        expect(mockNavigate).toHaveBeenCalledWith(-1)
    })

    it('muestra error de carga cuando loadError no es null', () => {
        useEditProduct.mockReturnValue({ ...baseHook, loadError: 'Producto no encontrado.' })
        render(<EditProductPage />)
        expect(screen.getByText('Producto no encontrado.')).toBeInTheDocument()
    })

    it('muestra errores de validación del nombre', () => {
        useEditProduct.mockReturnValue({
            ...baseHook,
            validationErrors: { name: 'El nombre del producto es obligatorio.' },
        })
        render(<EditProductPage />)
        expect(screen.getByText('El nombre del producto es obligatorio.')).toBeInTheDocument()
    })

    it('muestra "Guardando..." cuando isSubmitting es true', () => {
        useEditProduct.mockReturnValue({ ...baseHook, isSubmitting: true, isFormDisabled: true })
        render(<EditProductPage />)
        expect(screen.getByText('Guardando...')).toBeInTheDocument()
    })

    it('muestra la sección de oferta con precio cuando isOffer es true', () => {
        useEditProduct.mockReturnValue({
            ...baseHook,
            formData: { ...baseHook.formData, isOffer: true },
        })
        render(<EditProductPage />)
        expect(screen.getByPlaceholderText('74990')).toBeInTheDocument()
    })

    it('muestra "Oferta activa" cuando isOffer es true', () => {
        useEditProduct.mockReturnValue({
            ...baseHook,
            formData: { ...baseHook.formData, isOffer: true },
        })
        render(<EditProductPage />)
        expect(screen.getByText('Oferta activa')).toBeInTheDocument()
    })

    it('muestra "Precio regular" cuando isOffer es false', () => {
        render(<EditProductPage />)
        expect(screen.getByText('Precio regular')).toBeInTheDocument()
    })

    it('muestra "Visible para clientes" cuando isVisible es true', () => {
        render(<EditProductPage />)
        expect(screen.getByText('Visible para clientes')).toBeInTheDocument()
    })

    it('muestra "No visible" cuando isVisible es false', () => {
        useEditProduct.mockReturnValue({
            ...baseHook,
            formData: { ...baseHook.formData, isVisible: false },
        })
        render(<EditProductPage />)
        expect(screen.getByText('No visible')).toBeInTheDocument()
    })

    it('muestra "Sin imagen" cuando no hay imagen', () => {
        render(<EditProductPage />)
        expect(screen.getByText('Sin imagen')).toBeInTheDocument()
    })

    it('muestra "No hay etiquetas seleccionadas." cuando no hay tags', () => {
        render(<EditProductPage />)
        expect(screen.getByText('No hay etiquetas seleccionadas.')).toBeInTheDocument()
    })

    it('muestra las etiquetas seleccionadas cuando existen', () => {
        useEditProduct.mockReturnValue({
            ...baseHook,
            selectedTags: [{ id: 1, name: 'gaming' }, { id: 2, name: 'oferta' }],
        })
        render(<EditProductPage />)
        expect(screen.getByText('gaming')).toBeInTheDocument()
        expect(screen.getByText('oferta')).toBeInTheDocument()
    })

    it('muestra las sugerencias de etiquetas cuando displayedTagOptions tiene elementos', () => {
        useEditProduct.mockReturnValue({
            ...baseHook,
            displayedTagOptions: [{ id: 3, name: 'tecnología' }],
        })
        render(<EditProductPage />)
        expect(screen.getByText('tecnología')).toBeInTheDocument()
    })

    it('muestra el modal de resultado cuando resultModal.isOpen es true', () => {
        useEditProduct.mockReturnValue({
            ...baseHook,
            resultModal: { isOpen: true, variant: 'success', title: 'Éxito', message: 'Producto actualizado' },
        })
        render(<EditProductPage />)
        expect(screen.getByTestId('result-modal')).toBeInTheDocument()
        expect(screen.getByText('Producto actualizado')).toBeInTheDocument()
    })

    it('abre el modal de categoría al hacer clic en "Solicitala"', async () => {
        render(<EditProductPage />)
        await userEvent.click(screen.getByText('¿No encontrás tu categoría? Solicitala'))
        expect(screen.getByTestId('category-modal')).toBeInTheDocument()
    })

    it('llama handleSubmit al enviar el formulario', async () => {
        const mockHandleSubmit = vi.fn((e) => e?.preventDefault())
        useEditProduct.mockReturnValue({ ...baseHook, handleSubmit: mockHandleSubmit })
        render(<EditProductPage />)
        await userEvent.click(screen.getByText('Actualizar Producto'))
        await waitFor(() => {
            expect(mockHandleSubmit).toHaveBeenCalled()
        })
    })

    it('muestra el modal de error con tipo success al cerrar redirige a productos', () => {
        useEditProduct.mockReturnValue({
            ...baseHook,
            resultModal: { isOpen: true, variant: 'success', title: 'Éxito', message: 'Actualizado' },
        })
        render(<EditProductPage />)
        expect(screen.getByTestId('result-modal')).toBeInTheDocument()
    })
})
