/* eslint-disable react/prop-types */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/test' }),
    Link: ({ children, to, ...rest }) => <a href={to} {...rest}>{children}</a>,
}))

vi.mock('lucide-react', () => ({
    LayoutDashboard: () => null, Users: () => null, Package: () => null,
    MessageSquare: () => null, Tag: () => null, LogOut: () => null,
    ChevronLeft: () => null, ChevronRight: () => null,
    ShieldCheck: () => null, Store: () => null, Flag: () => null,
    Plus: () => null, History: () => null, HelpCircle: () => null,
    Layers: () => null, ShoppingBag: () => null, User: () => null,
    Truck: () => null,
}))

vi.mock('../hooks/useLogout', () => ({
    useLogout: () => vi.fn(),
}))

import { SidebarAdmin } from '../components/SidebarAdmin'
import { SidebarClientProfile } from '../components/SidebarClientProfile'
import { SidebarDelivery } from '../components/SidebarDelivery'
import { SidebarMyCommerce } from '../components/SidebarMyCommerce'
import { SellerCTA } from '../features/clients/components/home/SellerCTA'
import { HeroCarousel } from '../features/clients/components/home/HeroCarousel'
import { ReportModal } from '../features/clients/components/comments/ReportModal'

// ─── SidebarAdmin ─────────────────────────────────────────────────────────────
describe('SidebarAdmin', () => {
    it('renderiza "Admin Panel" cuando no está colapsado', () => {
        render(<SidebarAdmin collapsed={false} onToggle={() => {}} />)
        expect(screen.getByText('Admin Panel')).toBeInTheDocument()
    })

    it('renderiza los items de navegación principales', () => {
        render(<SidebarAdmin collapsed={false} onToggle={() => {}} />)
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument()
        expect(screen.getByText('Comercios por Aprobar')).toBeInTheDocument()
        expect(screen.getByText('Gestión de Categorías')).toBeInTheDocument()
    })

    it('no muestra "Admin Panel" cuando está colapsado', () => {
        render(<SidebarAdmin collapsed={true} onToggle={() => {}} />)
        expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument()
    })

    it('renderiza el botón de toggle', () => {
        render(<SidebarAdmin collapsed={false} onToggle={() => {}} />)
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
    })
})

// ─── SidebarClientProfile ──────────────────────────────────────────────────────
describe('SidebarClientProfile', () => {
    it('renderiza los 4 links del perfil', () => {
        render(<SidebarClientProfile />)
        expect(screen.getByText('Mi cuenta')).toBeInTheDocument()
        expect(screen.getByText('Mis pedidos')).toBeInTheDocument()
        expect(screen.getByText('Mi lista de deseos')).toBeInTheDocument()
        expect(screen.getByText('Libreta de direcciones')).toBeInTheDocument()
    })

    it('tiene exactamente 4 links de navegación', () => {
        render(<SidebarClientProfile />)
        expect(screen.getAllByRole('link').length).toBe(4)
    })
})

// ─── SellerCTA ────────────────────────────────────────────────────────────────
describe('SellerCTA', () => {
    it('renderiza el texto principal', () => {
        render(<SellerCTA />)
        expect(screen.getByText('¿Eres vendedor?')).toBeInTheDocument()
    })

    it('renderiza el botón "Crear comercio"', () => {
        render(<SellerCTA />)
        expect(screen.getByRole('button', { name: /Crear comercio/i })).toBeInTheDocument()
    })

    it('llama a navigate al hacer clic', async () => {
        render(<SellerCTA />)
        await userEvent.click(screen.getByRole('button', { name: /Crear comercio/i }))
        expect(mockNavigate).toHaveBeenCalled()
    })
})

// ─── HeroCarousel ─────────────────────────────────────────────────────────────
describe('HeroCarousel', () => {
    it('renderiza el título del primer slide', () => {
        render(<HeroCarousel />)
        expect(screen.getByText(/Explora, filtra y descubre/i)).toBeInTheDocument()
    })

    it('renderiza la descripción del primer slide', () => {
        render(<HeroCarousel />)
        expect(screen.getByText(/Catálogo con filtros avanzados/i)).toBeInTheDocument()
    })
})

// ─── ReportModal ──────────────────────────────────────────────────────────────
describe('ReportModal', () => {
    it('no renderiza cuando isOpen=false', () => {
        render(<ReportModal isOpen={false} onClose={() => {}} onSubmit={() => {}} />)
        expect(screen.queryByText('Reportar comentario')).not.toBeInTheDocument()
    })

    it('renderiza el título cuando isOpen=true', () => {
        render(<ReportModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />)
        expect(screen.getByText('Reportar comentario')).toBeInTheDocument()
    })

    it('muestra las opciones de motivo', () => {
        render(<ReportModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />)
        expect(screen.getByText('Spam')).toBeInTheDocument()
        expect(screen.getByText('Contenido ofensivo')).toBeInTheDocument()
    })

    it('muestra error cuando se envía sin elegir motivo', async () => {
        render(<ReportModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />)
        await userEvent.click(screen.getByRole('button', { name: /Enviar/i }))
        expect(screen.getByText(/Elegí un motivo/i)).toBeInTheDocument()
    })

    it('llama onClose al hacer clic en Cancelar', async () => {
        const onClose = vi.fn()
        render(<ReportModal isOpen={true} onClose={onClose} onSubmit={() => {}} />)
        await userEvent.click(screen.getByRole('button', { name: /Cancelar/i }))
        expect(onClose).toHaveBeenCalled()
    })

    it('limpia el estado al cerrar', () => {
        const { rerender } = render(<ReportModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />)
        rerender(<ReportModal isOpen={false} onClose={() => {}} onSubmit={() => {}} />)
        rerender(<ReportModal isOpen={true} onClose={() => {}} onSubmit={() => {}} />)
        expect(screen.getByText('Reportar comentario')).toBeInTheDocument()
    })

    it('llama onSubmit con reason y description al enviar válido', async () => {
        const onSubmit = vi.fn()
        render(<ReportModal isOpen={true} onClose={() => {}} onSubmit={onSubmit} />)
        await userEvent.click(screen.getByRole('radio', { name: /spam/i }))
        await userEvent.click(screen.getByRole('button', { name: /Enviar/i }))
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ reason: 'SPAM' }))
    })
})

// ─── SidebarDelivery ──────────────────────────────────────────────────────────
describe('SidebarDelivery', () => {
    it('renderiza "Panel Delivery" cuando no está colapsado', () => {
        render(<SidebarDelivery collapsed={false} onToggle={() => {}} />)
        expect(screen.getByText('Panel Delivery')).toBeInTheDocument()
    })

    it('no muestra "Panel Delivery" cuando está colapsado', () => {
        render(<SidebarDelivery collapsed={true} onToggle={() => {}} />)
        expect(screen.queryByText('Panel Delivery')).not.toBeInTheDocument()
    })

    it('renderiza los items de navegación principales', () => {
        render(<SidebarDelivery collapsed={false} onToggle={() => {}} />)
        expect(screen.getByText('Mi Perfil')).toBeInTheDocument()
        expect(screen.getByText('Órdenes')).toBeInTheDocument()
        expect(screen.getByText('Mis Pedidos')).toBeInTheDocument()
        expect(screen.getByText('Historial')).toBeInTheDocument()
        expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument()
    })

    it('muestra el box de ayuda cuando no está colapsado', () => {
        render(<SidebarDelivery collapsed={false} onToggle={() => {}} />)
        expect(screen.getByText('¿Necesitas ayuda?')).toBeInTheDocument()
    })

    it('no muestra el box de ayuda cuando está colapsado', () => {
        render(<SidebarDelivery collapsed={true} onToggle={() => {}} />)
        expect(screen.queryByText('¿Necesitas ayuda?')).not.toBeInTheDocument()
    })

    it('renderiza el botón de toggle', () => {
        render(<SidebarDelivery collapsed={false} onToggle={() => {}} />)
        expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
    })

    it('llama onToggle al hacer clic en el botón de colapso', async () => {
        const onToggle = vi.fn()
        render(<SidebarDelivery collapsed={false} onToggle={onToggle} />)
        await userEvent.click(screen.getAllByRole('button')[0])
        expect(onToggle).toHaveBeenCalled()
    })

    it('no muestra labels de nav cuando está colapsado', () => {
        render(<SidebarDelivery collapsed={true} onToggle={() => {}} />)
        expect(screen.queryByText('Órdenes')).not.toBeInTheDocument()
    })
})

// ─── SidebarMyCommerce ────────────────────────────────────────────────────────
describe('SidebarMyCommerce', () => {
    it('renderiza "Mi Comercio" cuando no está colapsado', () => {
        render(<SidebarMyCommerce collapsed={false} onToggle={() => {}} />)
        expect(screen.getAllByText('Mi Comercio').length).toBeGreaterThan(0)
    })

    it('no muestra el título "Mi Comercio" del header cuando está colapsado', () => {
        render(<SidebarMyCommerce collapsed={true} onToggle={() => {}} />)
        // collapsed=true: nav items hidden, only toggle button
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })

    it('renderiza los items de navegación principales', () => {
        render(<SidebarMyCommerce collapsed={false} onToggle={() => {}} />)
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Productos')).toBeInTheDocument()
        expect(screen.getByText('Colecciones')).toBeInTheDocument()
        expect(screen.getByText('Mis Pedidos')).toBeInTheDocument()
        expect(screen.getByText('Reclamos')).toBeInTheDocument()
        expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument()
    })

    it('muestra el box de ayuda cuando no está colapsado', () => {
        render(<SidebarMyCommerce collapsed={false} onToggle={() => {}} />)
        expect(screen.getByText('¿Necesitas ayuda?')).toBeInTheDocument()
    })

    it('no muestra el box de ayuda cuando está colapsado', () => {
        render(<SidebarMyCommerce collapsed={true} onToggle={() => {}} />)
        expect(screen.queryByText('¿Necesitas ayuda?')).not.toBeInTheDocument()
    })

    it('llama onToggle al hacer clic en el botón de colapso', async () => {
        const onToggle = vi.fn()
        render(<SidebarMyCommerce collapsed={false} onToggle={onToggle} />)
        await userEvent.click(screen.getAllByRole('button')[0])
        expect(onToggle).toHaveBeenCalled()
    })
})
