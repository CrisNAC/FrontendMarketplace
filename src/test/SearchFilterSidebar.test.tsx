import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SearchFilterSidebar } from '../features/clients/components/search/SearchFilterSidebar'

const categories = [
    { id: 1, name: 'Electrónica' },
    { id: 2, name: 'Ropa' },
    { id: 3, name: 'Alimentos' },
]

describe('SearchFilterSidebar', () => {
    it('renderiza el título "Filtrar por"', () => {
        render(<SearchFilterSidebar />)
        expect(screen.getByText('Filtrar por')).toBeInTheDocument()
    })

    it('renderiza la sección de Categoría y Precio', () => {
        render(<SearchFilterSidebar />)
        expect(screen.getByText('Categoría')).toBeInTheDocument()
        expect(screen.getByText('Precio')).toBeInTheDocument()
    })

    it('renderiza la opción "Todas" por defecto', () => {
        render(<SearchFilterSidebar />)
        expect(screen.getByText('Todas')).toBeInTheDocument()
    })

    it('renderiza las categorías pasadas como prop', () => {
        render(<SearchFilterSidebar categories={categories} />)
        expect(screen.getByText('Electrónica')).toBeInTheDocument()
        expect(screen.getByText('Ropa')).toBeInTheDocument()
        expect(screen.getByText('Alimentos')).toBeInTheDocument()
    })

    it('las categorías se muestran ordenadas alfabéticamente', () => {
        render(<SearchFilterSidebar categories={categories} />)
        const items = screen.getAllByRole('radio')
        // "Todas" es la primera, luego Alimentos, Electrónica, Ropa
        const labels = items.map((el) => el.closest('label')?.textContent?.trim())
        expect(labels[0]).toBe('Todas')
        expect(labels[1]).toBe('Alimentos')
    })

    it('muestra el input Min y Max de precio', () => {
        render(<SearchFilterSidebar />)
        expect(screen.getByPlaceholderText('Min')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Max')).toBeInTheDocument()
    })

    it('muestra el botón Aplicar', () => {
        render(<SearchFilterSidebar />)
        expect(screen.getByText('Aplicar')).toBeInTheDocument()
    })

    it('llama a onFiltersApply y onPriceApply al hacer clic en Aplicar sin precios', async () => {
        const onFiltersApply = vi.fn()
        const onPriceApply = vi.fn()
        render(<SearchFilterSidebar onFiltersApply={onFiltersApply} onPriceApply={onPriceApply} />)
        await userEvent.click(screen.getByText('Aplicar'))
        expect(onFiltersApply).toHaveBeenCalledWith({ min: null, max: null, categoryId: null })
        expect(onPriceApply).toHaveBeenCalledWith(0, 0)
    })

    it('llama a onFiltersApply con precios válidos', async () => {
        const onFiltersApply = vi.fn()
        render(<SearchFilterSidebar onFiltersApply={onFiltersApply} />)
        await userEvent.type(screen.getByPlaceholderText('Min'), '100')
        await userEvent.type(screen.getByPlaceholderText('Max'), '500')
        await userEvent.click(screen.getByText('Aplicar'))
        expect(onFiltersApply).toHaveBeenCalledWith({ min: 100, max: 500, categoryId: null })
    })

    it('muestra alerta cuando precio mínimo > precio máximo', async () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
        render(<SearchFilterSidebar />)
        await userEvent.type(screen.getByPlaceholderText('Min'), '500')
        await userEvent.type(screen.getByPlaceholderText('Max'), '100')
        await userEvent.click(screen.getByText('Aplicar'))
        expect(alertMock).toHaveBeenCalledWith('El precio mínimo no puede ser mayor al máximo')
        alertMock.mockRestore()
    })

    it('muestra alerta cuando precio es <= 0', async () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
        render(<SearchFilterSidebar />)
        await userEvent.type(screen.getByPlaceholderText('Min'), '-10')
        await userEvent.click(screen.getByText('Aplicar'))
        expect(alertMock).toHaveBeenCalledWith('Los precios deben ser mayores a 0')
        alertMock.mockRestore()
    })

    it('selecciona una categoría al hacer clic en el radio', async () => {
        const onFiltersApply = vi.fn()
        render(<SearchFilterSidebar categories={categories} onFiltersApply={onFiltersApply} />)
        const radios = screen.getAllByRole('radio')
        // radios[0] = Todas, radios[1] = Alimentos (primero alfabéticamente), etc.
        await userEvent.click(radios[1])
        await userEvent.click(screen.getByText('Aplicar'))
        expect(onFiltersApply).toHaveBeenCalledWith(
            expect.objectContaining({ categoryId: expect.any(Number) })
        )
    })

    it('actualiza localCategoryId cuando cambia selectedCategoryId prop', () => {
        const { rerender } = render(<SearchFilterSidebar categories={categories} selectedCategoryId={null} />)
        rerender(<SearchFilterSidebar categories={categories} selectedCategoryId={1} />)
        const radios = screen.getAllByRole('radio')
        const checkedRadio = radios.find((r) => (r as HTMLInputElement).checked)
        expect(checkedRadio).toBeTruthy()
    })

    it('no llama onFiltersApply cuando no se provee la prop', async () => {
        render(<SearchFilterSidebar />)
        await userEvent.click(screen.getByText('Aplicar'))
        // No debe lanzar error cuando no se proveen los callbacks
    })
})
