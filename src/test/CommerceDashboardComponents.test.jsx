import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

vi.mock('lucide-react', () => ({
    Plus: () => null, Pencil: () => null,
    CheckCircle2: () => <span>check</span>,
    X: () => <span>X</span>,
    XCircle: () => <span>xcircle</span>,
}))

vi.mock('../lib/formatGuarani', () => ({
    formatGuarani: (v) => `Gs. ${v}`,
}))

import { StatCard } from '../features/commerces/components/dashboard/StatCard'
import { ProductItem } from '../features/commerces/components/dashboard/ProductItem'
import { Topbar } from '../features/commerces/components/dashboard/Topbar'
import { BestRatedSection } from '../features/commerces/components/dashboard/BestRatedSection'
import { CollectionCard } from '../features/commerces/components/dashboard/CollectionCard'
import { CollectionsSection } from '../features/commerces/components/dashboard/CollectionsSection'
import { MostSoldSection } from '../features/commerces/components/dashboard/MostSoldSection'
import { CreationResultModal } from '../features/commerces/components/createProduct/CreationResultModal'
import { CategoryRequestModal } from '../features/commerces/components/createProduct/CategoryRequestModal'

// ─── StatCard ─────────────────────────────────────────────────────────────────
describe('StatCard', () => {
    it('renderiza el título y valor', () => {
        render(<StatCard title="Total Ventas" value={42} />)
        expect(screen.getByText('Total Ventas')).toBeInTheDocument()
        expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renderiza con ícono cuando se provee', () => {
        const Icon = () => <span>ícono</span>
        render(<StatCard title="Test" value={10} icon={Icon} />)
        expect(screen.getByText('ícono')).toBeInTheDocument()
    })

    it('renderiza sin ícono cuando no se provee', () => {
        render(<StatCard title="Sin ícono" value={5} />)
        expect(screen.getByText('Sin ícono')).toBeInTheDocument()
    })
})

// ─── ProductItem ──────────────────────────────────────────────────────────────
describe('ProductItem', () => {
    it('renderiza el nombre y detalle', () => {
        render(<ProductItem name="Laptop" detail="⭐ 4.5" />)
        expect(screen.getByText('Laptop')).toBeInTheDocument()
        expect(screen.getByText('⭐ 4.5')).toBeInTheDocument()
    })

    it('renderiza imagen cuando se provee imageUrl', () => {
        render(<ProductItem name="Producto" detail="detalle" imageUrl="http://img.test/a.jpg" />)
        expect(screen.getByAltText('Producto')).toBeInTheDocument()
    })

    it('renderiza placeholder sin imagen cuando no hay imageUrl', () => {
        render(<ProductItem name="Sin imagen" detail="detalle" />)
        expect(screen.getByText('Sin imagen')).toBeInTheDocument()
        expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
})

// ─── Topbar ───────────────────────────────────────────────────────────────────
describe('Topbar', () => {
    it('renderiza el nombre del comercio por defecto', () => {
        render(<Topbar />)
        expect(screen.getByText('Mi Comercio')).toBeInTheDocument()
    })

    it('renderiza el nombre del comercio proporcionado', () => {
        render(<Topbar storeName="Tienda Test" />)
        expect(screen.getByText('Tienda Test')).toBeInTheDocument()
    })

    it('renderiza el botón "Nuevo Producto"', () => {
        render(<Topbar />)
        expect(screen.getByRole('button', { name: /Nuevo Producto/i })).toBeInTheDocument()
    })

    it('navega al hacer clic en Nuevo Producto', async () => {
        render(<Topbar />)
        await userEvent.click(screen.getByRole('button', { name: /Nuevo Producto/i }))
    })
})

// ─── BestRatedSection ─────────────────────────────────────────────────────────
describe('BestRatedSection', () => {
    it('renderiza el título "Mejor Valorados"', () => {
        render(<BestRatedSection />)
        expect(screen.getByText('Mejor Valorados')).toBeInTheDocument()
    })

    it('renderiza los productos de ejemplo', () => {
        render(<BestRatedSection />)
        expect(screen.getByText('Silla Ergonómica Oficina')).toBeInTheDocument()
        expect(screen.getByText('Organizador de Escritorio')).toBeInTheDocument()
    })

    it('renderiza el enlace "Ver todos"', () => {
        render(<BestRatedSection />)
        expect(screen.getByText('Ver todos')).toBeInTheDocument()
    })
})

// ─── CollectionCard ───────────────────────────────────────────────────────────
describe('CollectionCard', () => {
    it('renderiza el título y descripción', () => {
        render(<CollectionCard title="Colección A" description="Desc A" products="3 productos" />)
        expect(screen.getByText('Colección A')).toBeInTheDocument()
        expect(screen.getByText('Desc A')).toBeInTheDocument()
        expect(screen.getByText('3 productos')).toBeInTheDocument()
    })

    it('renderiza imagen cuando se provee imageUrl', () => {
        render(<CollectionCard title="Col" description="Desc" products="2" imageUrl="http://img.test/col.jpg" />)
        expect(screen.getByAltText('Col')).toBeInTheDocument()
    })

    it('no renderiza imagen cuando no hay imageUrl', () => {
        render(<CollectionCard title="Col" description="Desc" products="2" />)
        expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
})

// ─── CollectionsSection ───────────────────────────────────────────────────────
describe('CollectionsSection', () => {
    it('renderiza el título "Tus Colecciones"', () => {
        render(<CollectionsSection />)
        expect(screen.getByText('Tus Colecciones')).toBeInTheDocument()
    })

    it('renderiza el enlace de gestión', () => {
        render(<CollectionsSection />)
        expect(screen.getByText('Gestionar colecciones')).toBeInTheDocument()
    })
})

// ─── MostSoldSection ──────────────────────────────────────────────────────────
describe('MostSoldSection', () => {
    it('renderiza el título "Más Vendidos"', () => {
        render(<MostSoldSection />)
        expect(screen.getByText('Más Vendidos')).toBeInTheDocument()
    })

    it('muestra "No hay productos disponibles" cuando lista vacía', () => {
        render(<MostSoldSection products={[]} />)
        expect(screen.getByText('No hay productos disponibles.')).toBeInTheDocument()
    })

    it('renderiza productos cuando se proveen', () => {
        const products = [{ id: 1, name: 'Producto A', total_sold: 10, price: 5000, image_url: null }]
        render(<MostSoldSection products={products} />)
        expect(screen.getByText('Producto A')).toBeInTheDocument()
    })
})

// ─── CreationResultModal ──────────────────────────────────────────────────────
describe('CreationResultModal', () => {
    it('no renderiza cuando isOpen=false', () => {
        render(<CreationResultModal isOpen={false} onClose={() => {}} title="Test" message="msg" />)
        expect(screen.queryByText('Test')).not.toBeInTheDocument()
    })

    it('renderiza con variant success', () => {
        render(<CreationResultModal isOpen={true} onClose={() => {}} title="Éxito" message="Creado" variant="success" />)
        expect(screen.getByText('Éxito')).toBeInTheDocument()
        expect(screen.getByText('Creado')).toBeInTheDocument()
    })

    it('renderiza con variant error', () => {
        render(<CreationResultModal isOpen={true} onClose={() => {}} title="Error" message="Falló" variant="error" />)
        expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('llama onClose al hacer clic en el botón de acción principal', async () => {
        const onClose = vi.fn()
        render(<CreationResultModal isOpen={true} onClose={onClose} title="Test" message="msg" />)
        // El modal tiene dos botones: el X de cerrar y el botón principal. Tomamos el último.
        const btns = screen.getAllByRole('button')
        await userEvent.click(btns[btns.length - 1])
        expect(onClose).toHaveBeenCalled()
    })
})

// ─── CategoryRequestModal ─────────────────────────────────────────────────────
describe('CategoryRequestModal', () => {
    const base = {
        isOpen: true,
        onClose: vi.fn(),
        formData: { name: '' },
        validationErrors: {},
        isSubmitting: false,
        onFieldChange: vi.fn(),
        handleSubmit: vi.fn((e) => e?.preventDefault?.()),
        resultModal: { isOpen: false },
        closeResultModal: vi.fn(),
    }

    it('no renderiza cuando isOpen=false', () => {
        render(<CategoryRequestModal {...base} isOpen={false} />)
        expect(screen.queryByText('Solicitar Nueva Categoría')).not.toBeInTheDocument()
    })

    it('renderiza el formulario cuando isOpen=true', () => {
        render(<CategoryRequestModal {...base} />)
        expect(screen.getByText('Solicitar Nueva Categoría')).toBeInTheDocument()
    })

    it('muestra el campo de nombre de categoría', () => {
        render(<CategoryRequestModal {...base} />)
        expect(screen.getByPlaceholderText(/Electrónica/i)).toBeInTheDocument()
    })

    it('llama onClose al hacer clic en Cancelar', async () => {
        const onClose = vi.fn()
        render(<CategoryRequestModal {...base} onClose={onClose} />)
        await userEvent.click(screen.getByRole('button', { name: /Cancelar/i }))
        expect(onClose).toHaveBeenCalled()
    })

    it('muestra estado de envío cuando isSubmitting=true', () => {
        render(<CategoryRequestModal {...base} isSubmitting={true} />)
        expect(screen.getByText('Enviando...')).toBeInTheDocument()
    })
})
