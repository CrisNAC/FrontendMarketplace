/* eslint-disable react/prop-types */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: '1' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

vi.mock('react-hot-toast', () => ({
    default: { error: vi.fn(), success: vi.fn() },
    toast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('lucide-react', () => ({
    AlertTriangle: () => null, Box: () => null, MessageSquareWarning: () => null,
    ShoppingCart: () => null, Store: () => null, TrendingUp: () => null,
    UserRound: () => null, Users: () => null, Search: () => null,
    Shield: () => null, Truck: () => null, Eye: () => null,
    Check: () => null, X: () => <span>X</span>, Tag: () => null,
    Package: () => null, Pencil: () => null, Plus: () => null,
    CheckCircle: () => null, XCircle: () => null, Clock: () => null,
    Trash2: () => null, ArrowLeft: () => null, EyeOff: () => null,
    Flag: () => null, Calendar: () => null, MessageSquare: () => null,
}))

vi.mock('../features/reports/ProductClaimsPanel', () => ({
    default: () => <div>ProductClaimsPanel</div>,
}))

vi.mock('../features/reports/ReviewReportsPanel', () => ({
    default: () => <div>ReviewReportsPanel</div>,
}))

import { AdminModulePlaceholderPage } from '../features/admin/pages/AdminModulePlaceholderPage'
import ModeracionResenas from '../features/admin/pages/ReclamosPage'
import ReclamosList from '../features/admin/pages/Reclamos'

// ─── AdminModulePlaceholderPage ───────────────────────────────────────────────
describe('AdminModulePlaceholderPage', () => {
    it('renderiza el título y descripción', () => {
        render(<AdminModulePlaceholderPage title="Módulo Test" description="Descripción del módulo" />)
        expect(screen.getByText('Módulo Test')).toBeInTheDocument()
        expect(screen.getByText('Descripción del módulo')).toBeInTheDocument()
    })

    it('renderiza sin props (sin error)', () => {
        render(<AdminModulePlaceholderPage />)
        expect(screen.getByText(/listo para recibir/i)).toBeInTheDocument()
    })
})

// ─── ReclamosPage ─────────────────────────────────────────────────────────────
describe('ReclamosPage (ModeracionResenas)', () => {
    it('renderiza el título de moderación', () => {
        render(<ModeracionResenas />)
        expect(screen.getByText(/Moderación de reseñas/i)).toBeInTheDocument()
    })

    it('muestra los tabs de Reseñas y Reclamos', () => {
        render(<ModeracionResenas />)
        expect(screen.getByRole('button', { name: /Reseñas reportadas/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Reclamos/i })).toBeInTheDocument()
    })

    it('cambia al tab de Reclamos al hacer clic', async () => {
        render(<ModeracionResenas />)
        const reclamosBtn = screen.getByRole('button', { name: /Reclamos de producto/i })
        await userEvent.click(reclamosBtn)
        expect(screen.getByText('ProductClaimsPanel')).toBeInTheDocument()
    })
})

// ─── Reclamos (ReclamosList) ──────────────────────────────────────────────────
describe('ReclamosList', () => {
    it('renderiza "Reclamos de usuarios"', () => {
        render(<ReclamosList />)
        expect(screen.getByText('Reclamos de usuarios')).toBeInTheDocument()
    })

    it('renderiza el panel de reclamos', () => {
        render(<ReclamosList />)
        expect(screen.getByText('ProductClaimsPanel')).toBeInTheDocument()
    })
})
