/* eslint-disable react/prop-types */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

vi.mock('../features/clients/components/OrderStepper', () => ({
    OrderStepper: ({ estado }) => <div data-testid="order-stepper">{estado}</div>,
}))

import { OrderCard } from '../components/OrderCard'

const mockOrder = {
    id: 42,
    total: 150000,
    estado: 'Pendiente',
    fecha: '15 de junio del 2024',
    cantidad: 3,
}

describe('OrderCard', () => {
    describe('datos renderizados', () => {
        beforeEach(() => {
            render(<OrderCard order={mockOrder} onClick={() => {}} />)
        })

        it('renderiza el id del pedido', () => {
            expect(screen.getByText('42')).toBeInTheDocument()
        })

        it('renderiza la fecha del pedido', () => {
            expect(screen.getByText('15 de junio del 2024')).toBeInTheDocument()
        })

        it('renderiza la cantidad de productos', () => {
            expect(screen.getByText('3 producto(s)')).toBeInTheDocument()
        })

        it('renderiza el total formateado', () => {
            const total = screen.getByText(/Gs\./)
            expect(total).toBeInTheDocument()
        })

        it('renderiza el OrderStepper con el estado correcto', () => {
            expect(screen.getByTestId('order-stepper')).toHaveTextContent('Pendiente')
        })
    })

    it('llama a onClick cuando se hace clic en la tarjeta', async () => {
        const mockClick = vi.fn()
        const { container } = render(<OrderCard order={mockOrder} onClick={mockClick} />)
        await userEvent.click(container.firstChild)
        expect(mockClick).toHaveBeenCalledTimes(1)
    })

    it('renderiza todos los estados de pedido sin errores', () => {
        const estados = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado', 'Desconocido']
        estados.forEach(estado => {
            const { unmount } = render(
                <OrderCard order={{ ...mockOrder, estado }} onClick={() => {}} />
            )
            unmount()
        })
    })
})
