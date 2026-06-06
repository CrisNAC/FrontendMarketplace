/* eslint-disable react/prop-types */
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

// Navbar se importa desde src/components/navbar/Navbar
// Relativo al test (src/test/) → ../components/navbar/Navbar
vi.mock('../components/navbar/Navbar', () => ({
    default: () => <div>Navbar</div>,
}))

// BecomeDeliveryModal: src/features/clients/components/BecomeDeliveryModal
vi.mock('../features/clients/components/BecomeDeliveryModal', () => ({
    default: ({ onClose, onSuccess }) => (
        <div>
            <span>BecomeDeliveryModal</span>
            <button onClick={onClose}>Cerrar</button>
            <button onClick={onSuccess}>Éxito</button>
        </div>
    ),
}))

// CommerceCreationForm: src/features/clients/components/CommerceCreationForm
vi.mock('../features/clients/components/CommerceCreationForm', () => ({
    CommerceCreationForm: () => <div>CommerceCreationForm</div>,
}))

import { BecomeDeliveryPage } from '../features/clients/pages/BecomeDeliveryPage'
import { CreateCommercePage } from '../features/clients/pages/CreateCommercePage'

// ─── BecomeDeliveryPage ────────────────────────────────────────────────────────
describe('BecomeDeliveryPage', () => {
    it('renderiza sin errores', () => {
        render(<BecomeDeliveryPage />)
        expect(screen.getByText('BecomeDeliveryModal')).toBeInTheDocument()
    })

    it('contiene el modal de delivery', () => {
        render(<BecomeDeliveryPage />)
        expect(screen.getByText('BecomeDeliveryModal')).toBeInTheDocument()
    })

    it('contiene los botones de acción del modal', () => {
        render(<BecomeDeliveryPage />)
        expect(screen.getByText('Cerrar')).toBeInTheDocument()
        expect(screen.getByText('Éxito')).toBeInTheDocument()
    })
})

// ─── CreateCommercePage ────────────────────────────────────────────────────────
describe('CreateCommercePage', () => {
    it('renderiza el título "Crear Comercio"', () => {
        render(<CreateCommercePage />)
        expect(screen.getByText('Crear Comercio')).toBeInTheDocument()
    })

    it('renderiza el formulario de creación de comercio', () => {
        render(<CreateCommercePage />)
        expect(screen.getByText('CommerceCreationForm')).toBeInTheDocument()
    })

    it('muestra el texto de descripción del formulario', () => {
        render(<CreateCommercePage />)
        expect(screen.getByText(/Completa el formulario para registrar tu comercio/i)).toBeInTheDocument()
    })

    it('muestra el texto de campos obligatorios', () => {
        render(<CreateCommercePage />)
        expect(screen.getByText(/campos marcados con \*/i)).toBeInTheDocument()
    })
})
