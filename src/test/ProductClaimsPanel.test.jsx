import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockShowToast = vi.hoisted(() => vi.fn())

vi.mock('@/hooks', () => ({
    useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('../lib/productReportsApi', () => ({
    fetchFilteredProductReports: vi.fn(),
    updateProductReport: vi.fn(),
}))

import { fetchFilteredProductReports, updateProductReport } from '../lib/productReportsApi'
import ProductClaimsPanel from '../features/reports/ProductClaimsPanel'

const mockMeta = { total: 1, page: 1, limit: 10, totalPages: 1 }

const mockClaim = {
    id_product_report: 1,
    report_status: 'PENDING',
    reason: 'Producto defectuoso',
    description: 'El producto llegó roto',
    reporter: { name: 'Cliente Reclamo' },
    product: { id_product: 5, name: 'Auriculares BT' },
}

describe('ProductClaimsPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        fetchFilteredProductReports.mockResolvedValue({ data: [mockClaim], meta: mockMeta })
    })

    it('muestra el indicador de carga mientras carga', () => {
        fetchFilteredProductReports.mockReturnValue(new Promise(() => {}))

        render(<ProductClaimsPanel canResolve={true} />)

        expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('renderiza el reclamo cargado', async () => {
        render(<ProductClaimsPanel canResolve={true} />)

        await waitFor(() => {
            expect(screen.getByText('Auriculares BT')).toBeInTheDocument()
        })
    })

    it('muestra "No hay reclamos" cuando la lista está vacía', async () => {
        fetchFilteredProductReports.mockResolvedValueOnce({ data: [], meta: { ...mockMeta, total: 0 } })

        render(<ProductClaimsPanel canResolve={true} />)

        await waitFor(() => {
            expect(screen.getByText('No hay reclamos con estos criterios.')).toBeInTheDocument()
        })
    })

    it('muestra botón Tomar reclamo en estado PENDING', async () => {
        render(<ProductClaimsPanel canResolve={true} />)

        await waitFor(() => {
            expect(screen.getByText('Tomar reclamo (en curso)')).toBeInTheDocument()
        })
    })

    it('toma el reclamo al hacer clic en Tomar reclamo', async () => {
        updateProductReport.mockResolvedValueOnce({})
        fetchFilteredProductReports.mockResolvedValueOnce({ data: [mockClaim], meta: mockMeta })
        fetchFilteredProductReports.mockResolvedValueOnce({ data: [{ ...mockClaim, report_status: 'IN_PROGRESS' }], meta: mockMeta })

        render(<ProductClaimsPanel canResolve={true} />)

        await waitFor(() => {
            expect(screen.getByText('Tomar reclamo (en curso)')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Tomar reclamo (en curso)'))

        await waitFor(() => {
            expect(updateProductReport).toHaveBeenCalledWith(1, { report_status: 'IN_PROGRESS' })
            expect(mockShowToast).toHaveBeenCalledWith('Reclamo marcado en curso', 'success')
        })
    })

    it('muestra botones Resolver y Rechazar en estado IN_PROGRESS', async () => {
        fetchFilteredProductReports.mockResolvedValueOnce({
            data: [{ ...mockClaim, report_status: 'IN_PROGRESS' }],
            meta: mockMeta
        })

        render(<ProductClaimsPanel canResolve={true} />)

        await waitFor(() => {
            expect(screen.getByText('Resolver')).toBeInTheDocument()
            expect(screen.getByText('Rechazar')).toBeInTheDocument()
        })
    })

    it('muestra textarea de nota para IN_PROGRESS', async () => {
        fetchFilteredProductReports.mockResolvedValueOnce({
            data: [{ ...mockClaim, report_status: 'IN_PROGRESS' }],
            meta: mockMeta
        })

        render(<ProductClaimsPanel canResolve={true} />)

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Nota al resolver o rechazar (obligatoria)')).toBeInTheDocument()
        })
    })

    it('muestra el input de búsqueda', async () => {
        render(<ProductClaimsPanel canResolve={true} />)

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Buscar por nombre de quien reportó...')).toBeInTheDocument()
        })
    })

    it('muestra descripción de admin cuando canResolve=false', async () => {
        render(<ProductClaimsPanel canResolve={false} />)

        await waitFor(() => {
            expect(screen.getByText(/Vista de supervisión/)).toBeInTheDocument()
        })
    })

    it('muestra descripción de seller cuando canResolve=true', async () => {
        render(<ProductClaimsPanel canResolve={true} />)

        await waitFor(() => {
            expect(screen.getByText(/Gestioná los reclamos/)).toBeInTheDocument()
        })
    })

    it('muestra error al resolver sin nota', async () => {
        fetchFilteredProductReports.mockResolvedValueOnce({
            data: [{ ...mockClaim, report_status: 'IN_PROGRESS' }],
            meta: mockMeta
        })

        render(<ProductClaimsPanel canResolve={true} />)

        await waitFor(() => {
            expect(screen.getByText('Resolver')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByText('Resolver'))

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith('Agregá una nota explicando cómo se resolvió')
        })
    })
})
