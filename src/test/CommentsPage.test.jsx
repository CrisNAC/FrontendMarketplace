/* eslint-disable react/prop-types */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '42' }),
}))

vi.mock('../lib/apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    }
}))

vi.mock('../lib/reviewReportsApi', () => ({
    reportProductReview: vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    }
}))

vi.mock('../features/clients/components/comments/RatingsDistribution', () => ({
    RatingsDistribution: ({ averageRating }) => <div>Rating: {averageRating}</div>,
}))

vi.mock('../features/clients/components/comments/CommentsList', () => ({
    CommentsList: ({ comments }) => (
        <div>
            {comments.map(c => <div key={c.id}>{c.author}: {c.content}</div>)}
        </div>
    ),
}))

vi.mock('../features/clients/components/comments/AddReviewModal', () => ({
    AddReviewModal: ({ isOpen, onSubmit, onClose }) => isOpen ? (
        <div>
            <span>Modal de reseña</span>
            <button onClick={() => onSubmit({ rating: 5, comment: 'Excelente' })}>Enviar reseña</button>
            <button onClick={onClose}>Cerrar</button>
        </div>
    ) : null,
}))

vi.mock('../features/clients/components/comments/ReportModal', () => ({
    ReportModal: ({ isOpen, onSubmit, onClose }) => isOpen ? (
        <div>
            <span>Modal de reporte</span>
            <button onClick={() => onSubmit({ reason: 'SPAM', description: 'Reporte de prueba' })}>Enviar reporte</button>
            <button onClick={onClose}>Cerrar reporte</button>
        </div>
    ) : null,
}))

import apiClient from '../lib/apiClient'
import { reportProductReview } from '../lib/reviewReportsApi'
import toast from 'react-hot-toast'
import { CommentsPage } from '../features/clients/pages/CommentsPage'

const mockReviewsResponse = {
    data: {
        reviews: [
            {
                id: 1,
                customerName: 'Juan Pérez',
                rating: 5,
                comment: 'Excelente producto',
                isVerified: true,
                date: new Date().toISOString(),
            },
            {
                id: 2,
                customerName: 'María López',
                rating: 3,
                comment: 'Producto regular',
                isVerified: false,
                date: new Date().toISOString(),
            },
        ],
        stats: { averageRating: 4, totalReviews: 2 },
    },
}

describe('CommentsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        apiClient.get.mockResolvedValue(mockReviewsResponse)
    })

    it('muestra "Cargando reseñas..." mientras carga', () => {
        apiClient.get.mockReturnValue(new Promise(() => {}))

        render(<CommentsPage />)

        expect(screen.getByText('Cargando reseñas...')).toBeInTheDocument()
    })

    it('muestra el título "Comentarios"', async () => {
        render(<CommentsPage />)

        await waitFor(() => {
            expect(screen.getByText('Comentarios')).toBeInTheDocument()
        })
    })

    it('renderiza los comentarios cuando carga exitosamente', async () => {
        render(<CommentsPage />)

        await waitFor(() => {
            expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument()
        })

        expect(screen.getByText(/María López/)).toBeInTheDocument()
    })

    it('muestra el rating promedio', async () => {
        render(<CommentsPage />)

        await waitFor(() => {
            expect(screen.getByText('Rating: 4')).toBeInTheDocument()
        })
    })

    it('muestra el error cuando falla la carga', async () => {
        apiClient.get.mockRejectedValueOnce({
            response: { data: { message: 'Error al cargar las reseñas' } }
        })

        render(<CommentsPage />)

        await waitFor(() => {
            expect(screen.getByText('Error al cargar las reseñas')).toBeInTheDocument()
        })
    })

    it('muestra mensaje por defecto cuando no hay mensaje de error', async () => {
        apiClient.get.mockRejectedValueOnce(new Error('Network Error'))

        render(<CommentsPage />)

        await waitFor(() => {
            expect(screen.getByText('No se pudieron cargar las reseñas.')).toBeInTheDocument()
        })
    })

    it('abre el modal de reseña al hacer clic en "Escribir mi opinión"', async () => {
        render(<CommentsPage />)

        await waitFor(() => {
            expect(screen.getByText('Comentarios')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Escribir mi opinión'))

        expect(screen.getByText('Modal de reseña')).toBeInTheDocument()
    })

    it('cierra el modal al hacer clic en Cerrar', async () => {
        render(<CommentsPage />)

        await waitFor(() => {
            expect(screen.getByText('Comentarios')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Escribir mi opinión'))
        await userEvent.click(screen.getByText('Cerrar'))

        expect(screen.queryByText('Modal de reseña')).not.toBeInTheDocument()
    })

    it('envía una reseña y muestra toast de éxito', async () => {
        apiClient.post.mockResolvedValueOnce({
            data: {
                id: 99,
                customerName: 'Nuevo Usuario',
                rating: 5,
                comment: 'Excelente',
                isVerified: false,
            }
        })

        render(<CommentsPage />)

        await waitFor(() => {
            expect(screen.getByText('Escribir mi opinión')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Escribir mi opinión'))
        await userEvent.click(screen.getByText('Enviar reseña'))

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith(
                '/products/42/reviews',
                { rating: 5, comment: 'Excelente' }
            )
        })

        expect(toast.success).toHaveBeenCalledWith('¡Reseña enviada exitosamente!')
    })

    it('muestra toast de error cuando falla el envío de reseña', async () => {
        apiClient.post.mockRejectedValueOnce({
            response: { data: { message: 'No autorizado' } }
        })

        render(<CommentsPage />)

        await waitFor(() => {
            expect(screen.getByText('Escribir mi opinión')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Escribir mi opinión'))
        await userEvent.click(screen.getByText('Enviar reseña'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('No autorizado')
        })
    })

    it('navega atrás al hacer clic en el icono de retroceso', async () => {
        render(<CommentsPage />)

        await waitFor(() => {
            expect(screen.getByText('Comentarios')).toBeInTheDocument()
        })

        const backBtn = screen.getByTestId('back-button')
        await userEvent.click(backBtn)

        expect(mockNavigate).toHaveBeenCalledWith(-1)
    })

    it('tiene configurado el mock de reporte de reseña', async () => {
        reportProductReview.mockResolvedValueOnce({})

        render(<CommentsPage />)

        await waitFor(() => {
            expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument()
        })
        expect(reportProductReview).not.toHaveBeenCalled()
    })
})
