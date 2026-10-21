/* eslint-disable react/prop-types */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('lucide-react', () => ({
    Phone: () => <span>Phone</span>,
    Mail: () => <span>Mail</span>,
    MapPin: () => <span>MapPin</span>,
    Search: () => <span>Search</span>,
    X: ({ onClick }) => <button type="button" onClick={onClick} data-testid="x-icon">X</button>,
}))

import { CategorySidebar } from '../features/clients/components/search/CategorySidebar'
import { CommerceProfileHeader } from '../features/clients/components/commerceProfile/CommerceProfileHeader'

// ──────────────────────────────────────────────────────────────────────────────
// CategorySidebar
// ──────────────────────────────────────────────────────────────────────────────
describe('CategorySidebar', () => {
    it('muestra el título "Filtrar por"', () => {
        render(<CategorySidebar />)
        expect(screen.getByText('Filtrar por')).toBeInTheDocument()
    })

    it('muestra el título "Categorias"', () => {
        render(<CategorySidebar />)
        expect(screen.getByText('Categorias')).toBeInTheDocument()
    })

    it('muestra las categorías principales', () => {
        render(<CategorySidebar />)
        expect(screen.getByText('Tecnologia')).toBeInTheDocument()
        expect(screen.getByText('Moda')).toBeInTheDocument()
        expect(screen.getByText('Deportes')).toBeInTheDocument()
    })

    it('expande una categoría al hacer clic', async () => {
        render(<CategorySidebar showCheckboxes={true} />)
        expect(screen.getByText('Celulares y Tabletas')).toBeInTheDocument()
    })

    it('colapsa categoría al hacer clic cuando está expandida', async () => {
        render(<CategorySidebar showCheckboxes={true} />)
        await userEvent.click(screen.getByText('Tecnologia'))
        expect(screen.queryByText('Celulares y Tabletas')).not.toBeInTheDocument()
    })

    it('expande Moda al hacer clic', async () => {
        render(<CategorySidebar showCheckboxes={false} />)
        await userEvent.click(screen.getByText('Moda'))
    })

    it('muestra checkboxes de subcategorías cuando showCheckboxes=true', () => {
        render(<CategorySidebar showCheckboxes={true} />)
        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('no muestra checkboxes cuando showCheckboxes=false', () => {
        render(<CategorySidebar showCheckboxes={false} />)
        expect(screen.queryAllByRole('checkbox').length).toBe(0)
    })

    it('muestra filtro de precio cuando showPriceFilter=true', () => {
        render(<CategorySidebar showPriceFilter={true} />)
        expect(screen.getByText('Precio')).toBeInTheDocument()
        expect(screen.getByText('Aplicar')).toBeInTheDocument()
    })

    it('no muestra filtro de precio cuando showPriceFilter=false', () => {
        render(<CategorySidebar showPriceFilter={false} />)
        expect(screen.queryByText('Precio')).not.toBeInTheDocument()
    })

    it('llama onPriceApply con valores al hacer clic en Aplicar', async () => {
        const onPriceApply = vi.fn()
        render(<CategorySidebar showPriceFilter={true} onPriceApply={onPriceApply} />)
        await userEvent.click(screen.getByText('Aplicar'))
        expect(onPriceApply).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
    })

    it('marca/desmarca subcategoría al hacer clic en el checkbox', async () => {
        render(<CategorySidebar showCheckboxes={true} />)
        const checkboxes = screen.getAllByRole('checkbox')
        const firstChecked = checkboxes[0].checked
        await userEvent.click(checkboxes[0])
        expect(checkboxes[0].checked).toBe(!firstChecked)
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// CommerceProfileHeader
// ──────────────────────────────────────────────────────────────────────────────
describe('CommerceProfileHeader', () => {
    const baseProps = {
        name: 'Tienda Tech',
        category: 'Tecnología',
        isOpen: true,
        rating: 4.5,
        reviews: 120,
        closesAt: '20:00',
        phone: '0981123456',
        email: 'tienda@tech.com',
        address: 'Av. Principal 123',
        latitude: -25.3,
        longitude: -57.6,
        searchValue: '',
        onSearchChange: vi.fn(),
        onSearchSubmit: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
        delete window.open
        window.open = vi.fn()
    })

    it('muestra el nombre del comercio', () => {
        render(<CommerceProfileHeader {...baseProps} />)
        expect(screen.getByText('Tienda Tech')).toBeInTheDocument()
    })

    it('muestra la categoría', () => {
        render(<CommerceProfileHeader {...baseProps} />)
        expect(screen.getByText('Tecnología')).toBeInTheDocument()
    })

    it('muestra "Abierto" cuando isOpen=true', () => {
        render(<CommerceProfileHeader {...baseProps} isOpen={true} />)
        expect(screen.getByText('Abierto')).toBeInTheDocument()
    })

    it('muestra "Cerrado" cuando isOpen=false', () => {
        render(<CommerceProfileHeader {...baseProps} isOpen={false} />)
        expect(screen.getByText('Cerrado')).toBeInTheDocument()
    })

    it('muestra el rating', () => {
        render(<CommerceProfileHeader {...baseProps} />)
        expect(screen.getByText('4.5')).toBeInTheDocument()
    })

    it('muestra el número de reseñas', () => {
        render(<CommerceProfileHeader {...baseProps} />)
        expect(screen.getByText(/120 reseñas/)).toBeInTheDocument()
    })

    it('muestra hora de cierre', () => {
        render(<CommerceProfileHeader {...baseProps} />)
        expect(screen.getByText(/Cierra a las 20:00/)).toBeInTheDocument()
    })

    it('no muestra hora de cierre cuando closesAt está vacío', () => {
        render(<CommerceProfileHeader {...baseProps} closesAt="" />)
        expect(screen.queryByText(/Cierra a las/)).not.toBeInTheDocument()
    })

    it('llama window.open con tel: al hacer clic en Llamar', async () => {
        render(<CommerceProfileHeader {...baseProps} />)
        await userEvent.click(screen.getByText('Llamar'))
        expect(window.open).toHaveBeenCalledWith('tel:0981123456', '_self')
    })

    it('llama window.open con mailto: al hacer clic en Email', async () => {
        render(<CommerceProfileHeader {...baseProps} />)
        await userEvent.click(screen.getByText('Email'))
        expect(window.open).toHaveBeenCalledWith('mailto:tienda@tech.com', '_self')
    })

    it('abre el mapa al hacer clic en Cómo llegar', async () => {
        render(<CommerceProfileHeader {...baseProps} />)
        await userEvent.click(screen.getByText('Cómo llegar'))
        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('cierra el mapa al hacer clic en el fondo', async () => {
        render(<CommerceProfileHeader {...baseProps} />)
        await userEvent.click(screen.getByText('Cómo llegar'))
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('dialog'))
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('muestra el input de búsqueda con placeholder correcto', () => {
        render(<CommerceProfileHeader {...baseProps} />)
        expect(screen.getByPlaceholderText('Buscar en Tienda Tech')).toBeInTheDocument()
    })

    it('llama onSearchChange al escribir en el buscador', async () => {
        const onSearchChange = vi.fn()
        render(<CommerceProfileHeader {...baseProps} onSearchChange={onSearchChange} />)
        await userEvent.type(screen.getByPlaceholderText('Buscar en Tienda Tech'), 'laptop')
        expect(onSearchChange).toHaveBeenCalled()
    })

    it('muestra icono X cuando searchValue tiene texto', () => {
        render(<CommerceProfileHeader {...baseProps} searchValue="laptop" />)
        expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    })

    it('muestra la inicial del nombre como logo cuando no hay logoUrl', () => {
        render(<CommerceProfileHeader {...baseProps} logoUrl={undefined} />)
        expect(screen.getByText('T')).toBeInTheDocument()
    })
})
