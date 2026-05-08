import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

vi.mock('../lib/formatGuarani', () => ({
    formatGuarani: (v) => `Gs. ${v}`,
}))

import { SearchProductCard } from '../features/clients/components/search/SearchProductCard'
import { ProductCard as SearchProductCardSimple } from '../features/clients/components/search/ProductCard'
import { ProductCard as CommerceProductCard } from '../features/clients/components/commerceProfile/ProductCard'
import { FeaturedProducts } from '../features/clients/components/commerceProfile/FeaturedProducts'
import { CategoryFilterSidebar } from '../features/clients/components/commerceProfile/CategoryFilterSidebar'
import { Pagination as SearchPagination } from '../features/clients/components/search/Pagination'
import { Pagination as CommercePagination } from '../features/clients/components/commerceProfile/Pagination'

// ──────────────────────────────────────────────────────────────────────────────
// SearchProductCard (search/SearchProductCard.tsx)
// ──────────────────────────────────────────────────────────────────────────────
describe('SearchProductCard', () => {
    it('muestra el nombre del producto', () => {
        render(<SearchProductCard name="Laptop HP" price={500000} />)
        expect(screen.getByText('Laptop HP')).toBeInTheDocument()
    })

    it('muestra el precio formateado con "Desde"', () => {
        render(<SearchProductCard name="Laptop HP" price={500000} />)
        expect(screen.getByText(/Desde Gs\. 500000/)).toBeInTheDocument()
    })

    it('muestra el botón "Comparar precios" por defecto', () => {
        render(<SearchProductCard name="Laptop HP" price={500000} />)
        expect(screen.getByText('Comparar precios')).toBeInTheDocument()
    })

    it('muestra un label personalizado en el botón', () => {
        render(<SearchProductCard name="Laptop HP" price={500000} buttonLabel="Ver oferta" />)
        expect(screen.getByText('Ver oferta')).toBeInTheDocument()
    })

    it('muestra porcentaje de descuento cuando hay oferta', () => {
        render(<SearchProductCard name="TV" price={0} isOffer={true} offerPrice={300000} originalPrice={500000} />)
        expect(screen.getByText(/-\d+%/)).toBeInTheDocument()
    })

    it('llama onButtonClick cuando se provee', async () => {
        const onButtonClick = vi.fn()
        render(<SearchProductCard name="Laptop" price={500000} onButtonClick={onButtonClick} />)
        await userEvent.click(screen.getByText('Comparar precios'))
        expect(onButtonClick).toHaveBeenCalled()
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// ProductCard (search/ProductCard.jsx) - simple version
// ──────────────────────────────────────────────────────────────────────────────
describe('ProductCard (search simple)', () => {
    it('muestra el nombre del producto', () => {
        render(<SearchProductCardSimple name="Monitor" price={200000} />)
        expect(screen.getByText('Monitor')).toBeInTheDocument()
    })

    it('muestra el precio formateado', () => {
        render(<SearchProductCardSimple name="Monitor" price={200000} />)
        expect(screen.getByText('Gs. 200000')).toBeInTheDocument()
    })

    it('muestra el botón "Ver más" por defecto', () => {
        render(<SearchProductCardSimple name="Monitor" price={200000} />)
        expect(screen.getByText('Ver más')).toBeInTheDocument()
    })

    it('muestra label personalizado en el botón', () => {
        render(<SearchProductCardSimple name="Monitor" price={200000} buttonLabel="Comprar" />)
        expect(screen.getByText('Comprar')).toBeInTheDocument()
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// ProductCard (commerceProfile/ProductCard.tsx) - con navigate
// ──────────────────────────────────────────────────────────────────────────────
describe('ProductCard (commerceProfile)', () => {
    it('muestra el nombre del producto', () => {
        render(<CommerceProductCard name="Teclado" price="50000" />)
        expect(screen.getByText('Teclado')).toBeInTheDocument()
    })

    it('muestra el precio formateado', () => {
        render(<CommerceProductCard name="Teclado" price="50000" />)
        expect(screen.getByText('Gs. 50000')).toBeInTheDocument()
    })

    it('muestra el botón "Ver más"', () => {
        render(<CommerceProductCard name="Teclado" price="50000" />)
        expect(screen.getByText('Ver más')).toBeInTheDocument()
    })

    it('navega al hacer clic en Ver más sin error', async () => {
        render(<CommerceProductCard name="Teclado" price="50000" productId={5} />)
        await userEvent.click(screen.getByText('Ver más'))
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// FeaturedProducts
// ──────────────────────────────────────────────────────────────────────────────
describe('FeaturedProducts', () => {
    const products = [
        { id: 1, name: 'Producto A', price: '100000' },
        { id: 2, name: 'Producto B', price: '200000' },
    ]

    it('muestra el título "Productos Destacados"', () => {
        render(<FeaturedProducts products={products} />)
        expect(screen.getByText('Productos Destacados')).toBeInTheDocument()
    })

    it('muestra los nombres de los productos', () => {
        render(<FeaturedProducts products={products} />)
        expect(screen.getByText('Producto A')).toBeInTheDocument()
        expect(screen.getByText('Producto B')).toBeInTheDocument()
    })

    it('muestra la lista vacía sin error', () => {
        render(<FeaturedProducts products={[]} />)
        expect(screen.getByText('Productos Destacados')).toBeInTheDocument()
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// CategoryFilterSidebar
// ──────────────────────────────────────────────────────────────────────────────
describe('CategoryFilterSidebar', () => {
    const categories = [
        { id: 1, name: 'Electrónica' },
        { id: 2, name: 'Ropa' },
    ]

    it('muestra "Filtrar por"', () => {
        render(<CategoryFilterSidebar categories={categories} />)
        expect(screen.getByText('Filtrar por')).toBeInTheDocument()
    })

    it('muestra "Categorías"', () => {
        render(<CategoryFilterSidebar categories={categories} />)
        expect(screen.getByText('Categorías')).toBeInTheDocument()
    })

    it('muestra opción "Todas" seleccionada por defecto', () => {
        render(<CategoryFilterSidebar categories={categories} />)
        expect(screen.getByText('Todas')).toBeInTheDocument()
    })

    it('muestra las categorías recibidas', () => {
        render(<CategoryFilterSidebar categories={categories} />)
        expect(screen.getByText('Electrónica')).toBeInTheDocument()
        expect(screen.getByText('Ropa')).toBeInTheDocument()
    })

    it('muestra el filtro de precio', () => {
        render(<CategoryFilterSidebar categories={categories} />)
        expect(screen.getByText('Precio')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Min')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Max')).toBeInTheDocument()
    })

    it('llama onApply al hacer clic en Aplicar', async () => {
        const onApply = vi.fn()
        render(<CategoryFilterSidebar categories={categories} onApply={onApply} />)
        await userEvent.click(screen.getByText('Aplicar'))
        expect(onApply).toHaveBeenCalledWith({
            categoryId: null,
            minPrice: null,
            maxPrice: null,
        })
    })

    it('selecciona una categoría al hacer clic en radio', async () => {
        const onApply = vi.fn()
        render(<CategoryFilterSidebar categories={categories} onApply={onApply} />)
        const radioButtons = screen.getAllByRole('radio')
        await userEvent.click(radioButtons[1])
        await userEvent.click(screen.getByText('Aplicar'))
        expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ categoryId: 1 }))
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// Pagination (search/Pagination.jsx)
// ──────────────────────────────────────────────────────────────────────────────
describe('Pagination (search)', () => {
    it('muestra botones Previous y Next', () => {
        render(<SearchPagination totalPages={10} />)
        expect(screen.getByText(/← Previous/)).toBeInTheDocument()
        expect(screen.getByText(/Next →/)).toBeInTheDocument()
    })

    it('muestra números de página', () => {
        render(<SearchPagination totalPages={10} />)
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('muestra "..." para páginas omitidas', () => {
        render(<SearchPagination totalPages={10} />)
        expect(screen.getByText('...')).toBeInTheDocument()
    })

    it('navega a la página siguiente al hacer clic en Next', async () => {
        render(<SearchPagination totalPages={10} />)
        await userEvent.click(screen.getByText(/Next →/))
        expect(screen.getByText('2')).toBeInTheDocument()
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// Pagination (commerceProfile/Pagination.tsx)
// ──────────────────────────────────────────────────────────────────────────────
describe('Pagination (commerceProfile)', () => {
    it('muestra Previous y Next', () => {
        render(<CommercePagination totalPages={5} />)
        expect(screen.getByText(/← Previous/)).toBeInTheDocument()
        expect(screen.getByText(/Next →/)).toBeInTheDocument()
    })

    it('muestra los números de página cuando son pocos', () => {
        render(<CommercePagination totalPages={3} />)
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('deshabilita Previous en la primera página', () => {
        render(<CommercePagination totalPages={5} />)
        const prev = screen.getByText(/← Previous/)
        expect(prev).toBeDisabled()
    })

    it('llama onPageChange al hacer clic en Next', async () => {
        const onPageChange = vi.fn()
        render(<CommercePagination totalPages={5} currentPage={1} onPageChange={onPageChange} />)
        await userEvent.click(screen.getByText(/Next →/))
        expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('muestra "..." cuando hay muchas páginas', () => {
        render(<CommercePagination totalPages={10} />)
        expect(screen.getByText('...')).toBeInTheDocument()
    })
})
