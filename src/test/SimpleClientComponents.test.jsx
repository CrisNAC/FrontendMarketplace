/* eslint-disable react/prop-types */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../lib/formatGuarani', () => ({
    formatGuarani: (v) => `Gs. ${v}`,
}))

vi.mock('lucide-react', () => ({
    Star: ({ size, className }) => <span data-testid="star-icon" className={className} />,
    X: ({ size }) => <span data-testid="x-icon" />,
    Check: ({ size }) => <span data-testid="check-icon" />,
}))

import WishlistItemCard from '../features/clients/components/wishlist/WishlistItemCard'
import WishlistSummaryCard from '../features/clients/components/wishlist/WishlistSummaryCard'
import DeliveryRatingPromptModal from '../features/clients/components/orders/DeliveryRatingPromptModal'
import { OfferCard } from '../features/clients/components/OfferCard'
import { OrderStepper } from '../features/clients/components/OrderStepper'
import { ProductSummary } from '../features/clients/components/ProductSummary'

// ──────────────────────────────────────────────────────────────────────────────
// WishlistItemCard
// ──────────────────────────────────────────────────────────────────────────────
describe('WishlistItemCard', () => {
    const baseItem = {
        quantity: 2,
        product: {
            id: 1,
            name: 'Laptop Pro',
            price: 500000,
            image_url: null,
        },
    }

    it('muestra el nombre del producto', () => {
        render(<WishlistItemCard item={baseItem} onViewMore={vi.fn()} onAddToCart={vi.fn()} onRemove={vi.fn()} />)
        expect(screen.getByText('Laptop Pro')).toBeInTheDocument()
    })

    it('muestra el precio formateado', () => {
        render(<WishlistItemCard item={baseItem} onViewMore={vi.fn()} onAddToCart={vi.fn()} onRemove={vi.fn()} />)
        expect(screen.getByText('Gs. 500000')).toBeInTheDocument()
    })

    it('muestra la cantidad guardada', () => {
        render(<WishlistItemCard item={baseItem} onViewMore={vi.fn()} onAddToCart={vi.fn()} onRemove={vi.fn()} />)
        expect(screen.getByText(/Cantidad guardada: 2/)).toBeInTheDocument()
    })

    it('llama onViewMore al hacer clic en Ver más', async () => {
        const onViewMore = vi.fn()
        render(<WishlistItemCard item={baseItem} onViewMore={onViewMore} onAddToCart={vi.fn()} onRemove={vi.fn()} />)
        await userEvent.click(screen.getByText('Ver más'))
        expect(onViewMore).toHaveBeenCalledWith(1)
    })

    it('llama onAddToCart al hacer clic en Agregar al carrito', async () => {
        const onAddToCart = vi.fn()
        render(<WishlistItemCard item={baseItem} onViewMore={vi.fn()} onAddToCart={onAddToCart} onRemove={vi.fn()} />)
        await userEvent.click(screen.getByText('Agregar al carrito'))
        expect(onAddToCart).toHaveBeenCalledWith(baseItem)
    })

    it('llama onRemove al hacer clic en Eliminar', async () => {
        const onRemove = vi.fn()
        render(<WishlistItemCard item={baseItem} onViewMore={vi.fn()} onAddToCart={vi.fn()} onRemove={onRemove} />)
        await userEvent.click(screen.getByText('Eliminar'))
        expect(onRemove).toHaveBeenCalledWith(baseItem)
    })

    it('muestra precio de oferta cuando el producto está en oferta', () => {
        const offerItem = {
            quantity: 1,
            product: {
                id: 2,
                name: 'Producto Oferta',
                is_offer: true,
                offer_price: 300000,
                original_price: 500000,
                image_url: null,
            },
        }
        render(<WishlistItemCard item={offerItem} onViewMore={vi.fn()} onAddToCart={vi.fn()} onRemove={vi.fn()} />)
        expect(screen.getByText('Gs. 300000')).toBeInTheDocument()
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// WishlistSummaryCard
// ──────────────────────────────────────────────────────────────────────────────
describe('WishlistSummaryCard', () => {
    it('muestra el título Resumen', () => {
        render(<WishlistSummaryCard totalLists={3} totalItems={10} />)
        expect(screen.getByText('Resumen')).toBeInTheDocument()
    })

    it('muestra el número de listas creadas', () => {
        render(<WishlistSummaryCard totalLists={3} totalItems={10} />)
        expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('muestra el número de productos guardados', () => {
        render(<WishlistSummaryCard totalLists={3} totalItems={10} />)
        expect(screen.getByText('10')).toBeInTheDocument()
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// DeliveryRatingPromptModal
// ──────────────────────────────────────────────────────────────────────────────
describe('DeliveryRatingPromptModal', () => {
    const pending = [{
        orderId: 42,
        storeName: 'Tienda ABC',
        deliveryName: 'Carlos',
    }]

    it('no renderiza nada cuando isOpen=false', () => {
        render(<DeliveryRatingPromptModal isOpen={false} pendingReviews={pending} onClose={vi.fn()} onSubmit={vi.fn()} />)
        expect(screen.queryByText('Califica al delivery')).not.toBeInTheDocument()
    })

    it('no renderiza nada cuando pendingReviews está vacío', () => {
        render(<DeliveryRatingPromptModal isOpen={true} pendingReviews={[]} onClose={vi.fn()} onSubmit={vi.fn()} />)
        expect(screen.queryByText('Califica al delivery')).not.toBeInTheDocument()
    })

    it('muestra el título cuando isOpen=true', () => {
        render(<DeliveryRatingPromptModal isOpen={true} pendingReviews={pending} onClose={vi.fn()} onSubmit={vi.fn()} />)
        expect(screen.getByText('Califica al delivery')).toBeInTheDocument()
    })

    it('muestra el nombre del repartidor', () => {
        render(<DeliveryRatingPromptModal isOpen={true} pendingReviews={pending} onClose={vi.fn()} onSubmit={vi.fn()} />)
        expect(screen.getByText('Carlos')).toBeInTheDocument()
    })

    it('muestra el botón Enviar calificación', () => {
        render(<DeliveryRatingPromptModal isOpen={true} pendingReviews={pending} onClose={vi.fn()} onSubmit={vi.fn()} />)
        expect(screen.getByText('Enviar calificación')).toBeInTheDocument()
    })

    it('muestra "Guardando..." cuando submitting=true', () => {
        render(<DeliveryRatingPromptModal isOpen={true} pendingReviews={pending} submitting={true} onClose={vi.fn()} onSubmit={vi.fn()} />)
        expect(screen.getByText('Guardando...')).toBeInTheDocument()
    })

    it('muestra el error cuando se pasa error prop', () => {
        render(<DeliveryRatingPromptModal isOpen={true} pendingReviews={pending} error="Error de red" onClose={vi.fn()} onSubmit={vi.fn()} />)
        expect(screen.getByText('Error de red')).toBeInTheDocument()
    })

    it('llama onClose al hacer clic en Ahora no', async () => {
        const onClose = vi.fn()
        render(<DeliveryRatingPromptModal isOpen={true} pendingReviews={pending} onClose={onClose} onSubmit={vi.fn()} />)
        await userEvent.click(screen.getByText('Ahora no'))
        expect(onClose).toHaveBeenCalled()
    })

    it('llama onSubmit con rating y comment al enviar', async () => {
        const onSubmit = vi.fn()
        render(<DeliveryRatingPromptModal isOpen={true} pendingReviews={pending} onClose={vi.fn()} onSubmit={onSubmit} />)
        await userEvent.type(screen.getByPlaceholderText(/Cuéntanos/), 'Muy buen servicio')
        await userEvent.click(screen.getByText('Enviar calificación'))
        expect(onSubmit).toHaveBeenCalledWith({
            orderId: 42,
            rating: expect.any(Number),
            comment: 'Muy buen servicio',
        })
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OfferCard
// ──────────────────────────────────────────────────────────────────────────────
describe('OfferCard', () => {
    it('muestra el nombre de la tienda', () => {
        render(<OfferCard storeName="Tienda Genial" description="Oferta especial" price={150000} imageUrl="img.png" />)
        expect(screen.getByText('Tienda Genial')).toBeInTheDocument()
    })

    it('muestra la descripción', () => {
        render(<OfferCard storeName="Tienda" description="Descuento 50%" price={150000} imageUrl="img.png" />)
        expect(screen.getByText('Descuento 50%')).toBeInTheDocument()
    })

    it('muestra el precio formateado', () => {
        render(<OfferCard storeName="Tienda" description="Desc" price={150000} imageUrl="img.png" />)
        expect(screen.getByText('Gs. 150000')).toBeInTheDocument()
    })

    it('muestra el botón Ver más', () => {
        render(<OfferCard storeName="Tienda" description="Desc" price={150000} imageUrl="img.png" />)
        expect(screen.getByText('+ Ver más')).toBeInTheDocument()
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrderStepper
// ──────────────────────────────────────────────────────────────────────────────
describe('OrderStepper', () => {
    it('muestra todos los pasos', () => {
        render(<OrderStepper estado="Pendiente" />)
        expect(screen.getByText('Pendiente')).toBeInTheDocument()
        expect(screen.getByText('Procesando')).toBeInTheDocument()
        expect(screen.getByText('Enviado')).toBeInTheDocument()
        expect(screen.getByText('Entregado')).toBeInTheDocument()
        expect(screen.getByText('Cancelado')).toBeInTheDocument()
    })

    it('renderiza en estado Entregado', () => {
        render(<OrderStepper estado="Entregado" />)
        expect(screen.getByText('Entregado')).toBeInTheDocument()
    })

    it('renderiza en estado Cancelado', () => {
        render(<OrderStepper estado="Cancelado" />)
        expect(screen.getByText('Cancelado')).toBeInTheDocument()
    })

    it('renderiza en estado Enviado', () => {
        render(<OrderStepper estado="Enviado" />)
        expect(screen.getByText('Enviado')).toBeInTheDocument()
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// ProductSummary
// ──────────────────────────────────────────────────────────────────────────────
describe('ProductSummary', () => {
    it('muestra el rango de precios', () => {
        render(<ProductSummary minPrice={100000} maxPrice={500000} mainImage="img.png" />)
        expect(screen.getByText(/Rango de precios/)).toBeInTheDocument()
    })

    it('muestra el precio mínimo formateado', () => {
        render(<ProductSummary minPrice={100000} maxPrice={500000} mainImage="img.png" />)
        expect(screen.getByText(/Gs\. 100000/)).toBeInTheDocument()
    })

    it('muestra el precio máximo formateado', () => {
        render(<ProductSummary minPrice={100000} maxPrice={500000} mainImage="img.png" />)
        expect(screen.getByText(/Gs\. 500000/)).toBeInTheDocument()
    })
})
