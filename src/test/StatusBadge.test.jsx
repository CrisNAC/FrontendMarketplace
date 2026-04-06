import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

function StatusBadge({ status }) {
    const cfg = {
        DELIVERED:  { label: "Entregado",  bg: "#dcfce7", color: "#15803d" },
        CANCELLED:  { label: "Cancelado",  bg: "#fee2e2", color: "#991b1b" },
        PROCESSING: { label: "Procesando", bg: "#dbeafe", color: "#1e40af" },
        SHIPPED:    { label: "Enviado",    bg: "#d1fae5", color: "#065f46" },
        PENDING:    { label: "Pendiente",  bg: "#fef3c7", color: "#92400e" },
    }[status] ?? { label: status, bg: "#f3f4f6", color: "#374151" };

    return (
        <span style={{ backgroundColor: cfg.bg, color: cfg.color }}>
            {cfg.label}
        </span>
    );
}

describe('StatusBadge', () => {
    it('muestra "Pendiente" para estado PENDING', () => {
        render(<StatusBadge status="PENDING" />)
        expect(screen.getByText('Pendiente')).toBeInTheDocument()
    })

    it('muestra "Entregado" para estado DELIVERED', () => {
        render(<StatusBadge status="DELIVERED" />)
        expect(screen.getByText('Entregado')).toBeInTheDocument()
    })

    it('muestra "Cancelado" para estado CANCELLED', () => {
        render(<StatusBadge status="CANCELLED" />)
        expect(screen.getByText('Cancelado')).toBeInTheDocument()
    })

    it('muestra el status tal cual si no está en el mapa', () => {
        render(<StatusBadge status="DESCONOCIDO" />)
        expect(screen.getByText('DESCONOCIDO')).toBeInTheDocument()
    })
})