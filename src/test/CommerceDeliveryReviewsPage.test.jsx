/* eslint-disable react/prop-types */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('lucide-react', () => ({
    Search: () => <span>Search</span>,
    Star: ({ style }) => <span style={style}>★</span>,
    MessageSquare: () => <span>MessageSquare</span>,
    UserRound: () => <span>UserRound</span>,
    Truck: () => <span>Truck</span>,
    Filter: () => <span>Filter</span>,
}))

vi.mock('../features/commerces/services/editCommerceApi', () => ({
    apiClient: { get: vi.fn() },
}))

vi.mock('../features/commerces/services/deliveryReviewsApi', () => ({
    getStoreDeliveryReviews: vi.fn(),
    getDeliveryReviewsErrorMessage: vi.fn((err) => err?.message || 'Error al cargar reseñas'),
}))

import { apiClient } from '../features/commerces/services/editCommerceApi'
import { getStoreDeliveryReviews } from '../features/commerces/services/deliveryReviewsApi'
import { CommerceDeliveryReviewsPage } from '../features/commerces/pages/CommerceDeliveryReviewsPage'

const mockReview = {
    id_delivery_review: 1,
    rating: 4,
    comment: 'Muy buen servicio',
    created_at: '2024-01-15T10:00:00Z',
    delivery: { name: 'Carlos López' },
    order: { id_order: 42 },
}

describe('CommerceDeliveryReviewsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        apiClient.get.mockResolvedValue({ data: { user: { id_store: 3 } } })
    })

    it('muestra "Cargando reseñas..." mientras carga la sesión', () => {
        apiClient.get.mockReturnValue(new Promise(() => {}))
        render(<CommerceDeliveryReviewsPage />)
        expect(screen.getByText(/Cargando reseñas/)).toBeInTheDocument()
    })

    it('muestra el título "Reseñas de Repartidores"', async () => {
        render(<CommerceDeliveryReviewsPage />)
        await waitFor(() => {
            expect(screen.getByText('Reseñas de Repartidores')).toBeInTheDocument()
        })
    })

    it('muestra el campo para ID del repartidor', async () => {
        render(<CommerceDeliveryReviewsPage />)
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Ej: 12')).toBeInTheDocument()
        })
    })

    it('muestra error cuando no hay comercio registrado', async () => {
        apiClient.get.mockResolvedValue({ data: { user: { id_store: null } } })
        render(<CommerceDeliveryReviewsPage />)
        await waitFor(() => {
            expect(screen.getByText(/No tenés un comercio registrado/)).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la sesión', async () => {
        apiClient.get.mockRejectedValue(new Error('Error de sesión'))
        render(<CommerceDeliveryReviewsPage />)
        await waitFor(() => {
            expect(screen.getByText(/No se pudo cargar la sesión/)).toBeInTheDocument()
        })
    })

    it('muestra error cuando busca sin ingresar ID de repartidor', async () => {
        render(<CommerceDeliveryReviewsPage />)
        await waitFor(() => screen.getByText(/Buscar/))
        await userEvent.click(screen.getByText('Aplicar filtros'))
        await waitFor(() => {
            expect(screen.getByText(/Ingresá el ID del repartidor/)).toBeInTheDocument()
        })
    })

    it('muestra error cuando el ID del repartidor es 0 (no válido)', async () => {
        render(<CommerceDeliveryReviewsPage />)
        await waitFor(() => screen.getByPlaceholderText('Ej: 12'))
        await userEvent.type(screen.getByPlaceholderText('Ej: 12'), '0')
        await userEvent.click(screen.getByText('Aplicar filtros'))
        await waitFor(() => {
            expect(screen.getByText(/El ID del repartidor debe ser un número válido/)).toBeInTheDocument()
        })
    })

    it('carga y muestra las reseñas al buscar con ID válido', async () => {
        getStoreDeliveryReviews.mockResolvedValueOnce({
            reviews: [mockReview],
            total: 1,
        })
        render(<CommerceDeliveryReviewsPage />)
        await waitFor(() => screen.getByPlaceholderText('Ej: 12'))
        await userEvent.type(screen.getByPlaceholderText('Ej: 12'), '5')
        await userEvent.click(screen.getByText('Aplicar filtros'))
        await waitFor(() => {
            expect(screen.getByText('Muy buen servicio')).toBeInTheDocument()
        })
    })

    it('muestra "Sin reseñas" cuando no hay resultados', async () => {
        getStoreDeliveryReviews.mockResolvedValueOnce({ reviews: [], total: 0 })
        render(<CommerceDeliveryReviewsPage />)
        await waitFor(() => screen.getByPlaceholderText('Ej: 12'))
        await userEvent.type(screen.getByPlaceholderText('Ej: 12'), '5')
        await userEvent.click(screen.getByText('Aplicar filtros'))
        await waitFor(() => {
            expect(screen.getByText(/No hay reseñas para los filtros aplicados/)).toBeInTheDocument()
        })
    })
})
