import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner } from '../components/Spinner'

describe('Spinner', () => {
    it('renderiza el SVG del spinner', () => {
        const { container } = render(<Spinner />)
        const svg = container.querySelector('svg')
        expect(svg).toBeInTheDocument()
        expect(svg).toHaveClass('animate-spin')
    })

    it('aplica el tamaño por defecto h-5 w-5', () => {
        const { container } = render(<Spinner />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveClass('h-5')
        expect(svg).toHaveClass('w-5')
    })

    it('aplica el color por defecto text-white', () => {
        const { container } = render(<Spinner />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveClass('text-white')
    })

    it('acepta un tamaño personalizado', () => {
        const { container } = render(<Spinner size="10" />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveClass('h-10')
        expect(svg).toHaveClass('w-10')
    })

    it('acepta un color personalizado', () => {
        const { container } = render(<Spinner color="text-blue-500" />)
        const svg = container.querySelector('svg')
        expect(svg).toHaveClass('text-blue-500')
    })
})
