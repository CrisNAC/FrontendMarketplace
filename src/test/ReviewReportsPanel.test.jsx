import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

vi.mock('react-hot-toast', () => ({
    default: { success: vi.fn(), error: vi.fn() }
}))

vi.mock('../lib/reviewReportsApi', () => ({
    fetchFilteredReviewReports: vi.fn(),
    resolveReviewReport: vi.fn(),
}))

import toast from 'react-hot-toast'
import { fetchFilteredReviewReports, resolveReviewReport } from '../lib/reviewReportsApi'
import ReviewReportsPanel from '../features/reports/ReviewReportsPanel'

const mockMeta = { total: 1, page: 1, limit: 10, totalPages: 1 }

const mockReport = {
    id_review_report: 1,
    report_status: 'PENDING',
    reason: 'SPAM',
    reporter: { name: 'Usuario Reportador' },
    product_review: {
        author: { name: 'Autor Reseña' },
        rating: 3,
        comment: 'Mala experiencia',
        product: { id_product: 10, name: 'Laptop Gaming' }
    }
}

async function renderLoaded() {
    render(<ReviewReportsPanel />)
    await waitFor(() => screen.getByText('Laptop Gaming'))
}

describe('ReviewReportsPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchFilteredReviewReports.mockResolvedValue({ data: [mockReport], meta: mockMeta })
    })

    it('muestra "Cargando reportes..." durante la carga', () => {
        fetchFilteredReviewReports.mockReturnValue(new Promise(() => {}))
        render(<ReviewReportsPanel />)
        expect(screen.getByText('Cargando reportes…')).toBeInTheDocument()
    })

    it('renderiza el reporte cargado', async () => {
        await renderLoaded()
        expect(screen.getByText('Laptop Gaming')).toBeInTheDocument()
    })

    it('muestra "No hay reportes" cuando la lista está vacía', async () => {
        fetchFilteredReviewReports.mockResolvedValueOnce({ data: [], meta: { ...mockMeta, total: 0 } })
        render(<ReviewReportsPanel />)
        await waitFor(() => {
            expect(screen.getByText('No hay reportes de reseñas con estos criterios.')).toBeInTheDocument()
        })
    })

    it('muestra botones de acción en el reporte', async () => {
        await renderLoaded()
        expect(screen.getByText('Aceptar reseña')).toBeInTheDocument()
        expect(screen.getByText('Eliminar reseña')).toBeInTheDocument()
    })

    it('abre modal de confirmación al hacer clic en Eliminar reseña', async () => {
        await renderLoaded()
        await userEvent.click(screen.getByText('Eliminar reseña'))
        expect(screen.getByText('Confirmar acción')).toBeInTheDocument()
    })

    it('cancela el modal al hacer clic en Cancelar', async () => {
        await renderLoaded()
        await userEvent.click(screen.getByText('Eliminar reseña'))
        await userEvent.click(screen.getByText('Cancelar'))
        await waitFor(() => {
            expect(screen.queryByText('Confirmar acción')).not.toBeInTheDocument()
        })
    })

    it('resuelve el reporte con KEEP_REVIEW al hacer clic en Aceptar reseña', async () => {
        resolveReviewReport.mockResolvedValueOnce({})
        fetchFilteredReviewReports.mockResolvedValueOnce({ data: [mockReport], meta: mockMeta })
        fetchFilteredReviewReports.mockResolvedValueOnce({ data: [], meta: { ...mockMeta, total: 0 } })
        await renderLoaded()
        await userEvent.click(screen.getByText('Aceptar reseña'))
        await waitFor(() => {
            expect(resolveReviewReport).toHaveBeenCalledWith(1, { decision: 'KEEP_REVIEW' })
            expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/reporte descartado/i))
        })
    })

    it('resuelve el reporte con REMOVE_REVIEW en el modal', async () => {
        resolveReviewReport.mockResolvedValueOnce({})
        fetchFilteredReviewReports.mockResolvedValueOnce({ data: [mockReport], meta: mockMeta })
        fetchFilteredReviewReports.mockResolvedValueOnce({ data: [], meta: { ...mockMeta, total: 0 } })
        await renderLoaded()
        await userEvent.click(screen.getByText('Eliminar reseña'))
        await waitFor(() => {
            expect(screen.getByText('Sí, ocultar')).toBeInTheDocument()
        })
        await userEvent.click(screen.getByText('Sí, ocultar'))
        await waitFor(() => {
            expect(resolveReviewReport).toHaveBeenCalledWith(1, { decision: 'REMOVE_REVIEW' })
            expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/ocultada/i))
        })
    })

    it('muestra el input de búsqueda', async () => {
        await renderLoaded()
        expect(screen.getByPlaceholderText('Buscar por quien reporta, autor de la reseña o producto.')).toBeInTheDocument()
    })

    it('muestra el select de estado', async () => {
        await renderLoaded()
        expect(screen.getByText('Todos los estados')).toBeInTheDocument()
    })
})
