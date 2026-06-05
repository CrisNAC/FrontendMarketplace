import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../lib/formatGuarani', () => ({
    formatGuarani: (v) => `Gs. ${v}`,
}))

import { AddReviewModal } from '../features/clients/components/comments/AddReviewModal'
import { CommentCard } from '../features/clients/components/comments/CommentCard'
import { CommentForm } from '../features/clients/components/comments/CommentForm'
import { CommentsList } from '../features/clients/components/comments/CommentsList'
import { RatingsDistribution } from '../features/clients/components/comments/RatingsDistribution'

// ──────────────────────────────────────────────────────────────────────────────
// AddReviewModal
// ──────────────────────────────────────────────────────────────────────────────
describe('AddReviewModal', () => {
    it('no renderiza nada cuando isOpen=false', () => {
        render(<AddReviewModal isOpen={false} onClose={() => {}} onSubmit={() => {}} />)
        expect(screen.queryByText('Agregar una reseña')).not.toBeInTheDocument()
    })

    it('renderiza el modal cuando isOpen=true', () => {
        render(<AddReviewModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />)
        expect(screen.getByText('Agregar una reseña')).toBeInTheDocument()
    })

    it('muestra el placeholder del comentario', () => {
        render(<AddReviewModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />)
        expect(screen.getByPlaceholderText('Tu comentario')).toBeInTheDocument()
    })

    it('muestra el botón Guardar', () => {
        render(<AddReviewModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />)
        expect(screen.getByText('Guardar')).toBeInTheDocument()
    })

    it('llama onClose al hacer clic en el botón de cierre', async () => {
        const onClose = vi.fn()
        render(<AddReviewModal isOpen={true} onClose={onClose} onSubmit={() => {}} />)
        await userEvent.click(screen.getByText('×'))
        expect(onClose).toHaveBeenCalled()
    })

    it('llama onSubmit con rating y comentario al guardar', async () => {
        const onSubmit = vi.fn()
        render(<AddReviewModal isOpen={true} onClose={() => {}} onSubmit={onSubmit} />)

        await userEvent.type(screen.getByPlaceholderText('Tu comentario'), 'Excelente producto!')
        await userEvent.click(screen.getByText('Guardar'))

        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
            rating: expect.any(Number),
            comment: 'Excelente producto!',
        }))
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// CommentCard
// ──────────────────────────────────────────────────────────────────────────────
describe('CommentCard', () => {
    const baseProps = {
        author: 'Juan Pérez',
        rating: 4,
        title: 'Buen producto',
        content: 'Me gustó mucho',
        verified: true,
        location: 'Asunción',
        date: '2024-01-15',
        reportedByViewer: false,
        onReport: vi.fn(),
    }

    it('muestra el nombre del autor', () => {
        render(<CommentCard {...baseProps} />)
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    })

    it('muestra el contenido del comentario', () => {
        render(<CommentCard {...baseProps} />)
        expect(screen.getByText('Me gustó mucho')).toBeInTheDocument()
    })

    it('muestra "Compra Verificada" cuando verified=true', () => {
        render(<CommentCard {...baseProps} />)
        expect(screen.getByText(/Compra Verificada/)).toBeInTheDocument()
    })

    it('muestra el botón Reportar', () => {
        render(<CommentCard {...baseProps} />)
        expect(screen.getByText('Reportar')).toBeInTheDocument()
    })

    it('muestra "Reportado" cuando reportedByViewer=true', () => {
        render(<CommentCard {...baseProps} reportedByViewer={true} />)
        expect(screen.getByText(/Reportado/)).toBeInTheDocument()
    })

    it('llama onReport al hacer clic en Reportar', async () => {
        const onReport = vi.fn()
        render(<CommentCard {...baseProps} onReport={onReport} />)
        await userEvent.click(screen.getByText('Reportar'))
        expect(onReport).toHaveBeenCalled()
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// CommentForm
// ──────────────────────────────────────────────────────────────────────────────
describe('CommentForm', () => {
    it('muestra el título "Escribir opinión"', () => {
        render(<CommentForm />)
        expect(screen.getByText('Escribir opinión de este producto')).toBeInTheDocument()
    })

    it('muestra el placeholder del título', () => {
        render(<CommentForm />)
        expect(screen.getByPlaceholderText('Ej: Excelente producto, muy recomendado')).toBeInTheDocument()
    })

    it('muestra el placeholder del comentario', () => {
        render(<CommentForm />)
        expect(screen.getByPlaceholderText('Describe tu experiencia con este producto...')).toBeInTheDocument()
    })

    it('muestra el botón "Enviar mi opinión"', () => {
        render(<CommentForm />)
        expect(screen.getByText('Enviar mi opinión')).toBeInTheDocument()
    })

    it('llama onSubmit con datos al enviar el formulario completo', async () => {
        const onSubmit = vi.fn()
        render(<CommentForm onSubmit={onSubmit} />)

        await userEvent.type(screen.getByPlaceholderText('Ej: Excelente producto, muy recomendado'), 'Muy buen producto')
        await userEvent.type(screen.getByPlaceholderText('Describe tu experiencia con este producto...'), 'Descripción completa del producto')

        await userEvent.click(screen.getByText('Enviar mi opinión'))

        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
            rating: expect.any(Number),
            title: 'Muy buen producto',
            content: 'Descripción completa del producto',
        }))
    })

    it('muestra alerta cuando se envía sin título o contenido', async () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
        render(<CommentForm />)

        await userEvent.click(screen.getByText('Enviar mi opinión'))

        expect(alertMock).toHaveBeenCalledWith('Por favor completa todos los campos')
        alertMock.mockRestore()
    })

    it('cambia la calificación al hacer clic en una estrella', async () => {
        render(<CommentForm />)

        const stars = screen.getAllByRole('button', { name: /Calificar con/i })
        await userEvent.click(stars[1])

        expect(screen.getByText('2/5')).toBeInTheDocument()
    })

    it('muestra hover al pasar el mouse sobre una estrella', async () => {
        render(<CommentForm />)

        const stars = screen.getAllByRole('button', { name: /Calificar con/i })
        await userEvent.hover(stars[2])
        expect(stars[2]).toBeInTheDocument()
        await userEvent.unhover(stars[2])
        expect(stars[2]).toBeInTheDocument()
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// CommentsList
// ──────────────────────────────────────────────────────────────────────────────
describe('CommentsList', () => {
    const baseComment = {
        id: 1,
        author: 'María',
        rating: 5,
        title: 'Perfecto',
        content: 'Muy bueno',
        verified: true,
        location: 'Asunción',
        date: '2024-01-01',
        reportedByViewer: false,
    }

    it('muestra "No hay comentarios" cuando la lista está vacía', () => {
        render(<CommentsList comments={[]} onReport={() => {}} />)
        expect(screen.getByText('No hay comentarios')).toBeInTheDocument()
    })

    it('renderiza los comentarios cuando hay elementos', () => {
        render(<CommentsList comments={[baseComment]} onReport={() => {}} />)
        expect(screen.getByText('María')).toBeInTheDocument()
    })

    it('llama onReport al reportar un comentario', async () => {
        const onReport = vi.fn()
        render(<CommentsList comments={[baseComment]} onReport={onReport} />)
        await userEvent.click(screen.getByText('Reportar'))
        expect(onReport).toHaveBeenCalledWith(baseComment)
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// RatingsDistribution
// ──────────────────────────────────────────────────────────────────────────────
describe('RatingsDistribution', () => {
    const mockRatings = { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }

    it('muestra el promedio de valoración', () => {
        render(<RatingsDistribution ratings={mockRatings} averageRating={4.5} />)
        expect(screen.getByText(/4.5 de 5/)).toBeInTheDocument()
    })

    it('muestra el total de calificaciones globales', () => {
        render(<RatingsDistribution ratings={mockRatings} averageRating={4.5} />)
        expect(screen.getByText(/18 calificaciones globales/)).toBeInTheDocument()
    })

    it('muestra 5 barras de distribución', () => {
        render(<RatingsDistribution ratings={mockRatings} averageRating={4.5} />)
        expect(screen.getAllByText(/estrella/).length).toBeGreaterThanOrEqual(5)
    })

    it('muestra con ratings vacíos', () => {
        render(<RatingsDistribution ratings={{}} averageRating={0} />)
        expect(screen.getByText(/0 de 5/)).toBeInTheDocument()
    })
})
