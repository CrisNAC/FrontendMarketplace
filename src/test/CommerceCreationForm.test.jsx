/* eslint-disable react/prop-types */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
}))

vi.mock('lucide-react', () => ({
    X: () => <span data-testid="x-icon" />,
}))

vi.mock('../components/Spinner', () => ({
    Spinner: () => <span data-testid="spinner" />,
}))

vi.mock('../features/clients/components/Map', () => ({
    default: ({ onPointChange }) => (
        <button
            type="button"
            onClick={() => onPointChange?.({ lat: -25.3, lng: -57.6 })}
        >
            Seleccionar punto en mapa
        </button>
    ),
}))

import { CommerceCreationForm } from '../features/clients/components/CommerceCreationForm'

const makeOk = (data) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
})

const makeError = (msg = 'Error') => ({
    ok: false,
    status: 400,
    json: () => Promise.resolve({ message: msg }),
})

const setupFetch = (userId = 7, categories = [{ id: 1, name: 'Tecnología' }]) => {
    globalThis.fetch = vi.fn((url) => {
        const u = String(url)
        if (u.includes('/api/session/user-session')) {
            return Promise.resolve(makeOk({ success: true, user: { id_user: userId } }))
        }
        if (u.includes('/api/commerces/categories')) {
            return Promise.resolve(makeOk(categories))
        }
        if (u.includes('/api/commerces')) {
            return Promise.resolve(makeOk({ id_store: 99 }))
        }
        return Promise.resolve(makeOk({}))
    })
}

const fillRequiredFields = async () => {
    await userEvent.type(screen.getByPlaceholderText('Ej: Mi Tienda Online'), 'Mi Tienda')
    await userEvent.type(screen.getByPlaceholderText('contacto@mitienda.com'), 'tienda@test.com')
    await userEvent.type(screen.getByPlaceholderText('+595XXXXXXXXX'), '+595981123456')
    await userEvent.type(screen.getByPlaceholderText('Calle Principal 123'), 'Av. Principal 123')
    await userEvent.type(document.querySelector('textarea[name="description"]'), 'Mi descripción de prueba')
    await userEvent.type(screen.getByPlaceholderText('Ej: 2500'), '2500')
    await userEvent.type(screen.getByPlaceholderText('Ej: 4000'), '4000')
    await userEvent.click(screen.getByText('Seleccionar punto en mapa'))
}

describe('CommerceCreationForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        setupFetch()
    })

    it('renderiza el formulario con el campo Nombre del Comercio', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Ej: Mi Tienda Online')).toBeInTheDocument()
        })
    })

    it('muestra el campo de email de contacto', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => {
            expect(screen.getByPlaceholderText('contacto@mitienda.com')).toBeInTheDocument()
        })
    })

    it('muestra el campo de teléfono', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => {
            expect(screen.getByPlaceholderText('+595XXXXXXXXX')).toBeInTheDocument()
        })
    })

    it('muestra el campo de dirección', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Calle Principal 123')).toBeInTheDocument()
        })
    })

    it('muestra el selector de categoría', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => {
            expect(screen.getByText('Selecciona una categoría')).toBeInTheDocument()
        })
    })

    it('carga y muestra las categorías del backend', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => {
            expect(screen.getByText('Tecnología')).toBeInTheDocument()
        })
    })

    it('muestra botones Cancelar y Registrar Comercio', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => {
            expect(screen.getByText('Cancelar')).toBeInTheDocument()
            expect(screen.getByText('Registrar Comercio')).toBeInTheDocument()
        })
    })

    it('muestra error cuando faltan campos obligatorios', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => screen.getByText('Registrar Comercio'))
        await userEvent.click(screen.getByText('Registrar Comercio'))
        await waitFor(() => {
            expect(screen.getByText('Por favor completá todos los campos obligatorios.')).toBeInTheDocument()
        })
    })

    it('muestra error por formato de teléfono inválido', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => screen.getByPlaceholderText('Ej: Mi Tienda Online'))

        await userEvent.type(screen.getByPlaceholderText('Ej: Mi Tienda Online'), 'Mi Tienda')
        await userEvent.type(screen.getByPlaceholderText('contacto@mitienda.com'), 'tienda@test.com')
        await userEvent.type(screen.getByPlaceholderText('+595XXXXXXXXX'), '0981123456')
        await userEvent.type(screen.getByPlaceholderText('Calle Principal 123'), 'Av. Principal 123')
        await userEvent.type(document.querySelector('textarea[name="description"]'), 'Descripción')
        await userEvent.type(screen.getByPlaceholderText('Ej: 2500'), '2500')
        await userEvent.type(screen.getByPlaceholderText('Ej: 4000'), '4000')
        await userEvent.click(screen.getByText('Seleccionar punto en mapa'))
        await userEvent.click(screen.getByText('Registrar Comercio'))

        await waitFor(() => {
            expect(screen.getByText(/número de teléfono debe tener el formato/)).toBeInTheDocument()
        })
    })

    it('muestra error cuando no se selecciona un punto en el mapa', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => screen.getByPlaceholderText('Ej: Mi Tienda Online'))

        await userEvent.type(screen.getByPlaceholderText('Ej: Mi Tienda Online'), 'Mi Tienda')
        await userEvent.type(screen.getByPlaceholderText('contacto@mitienda.com'), 'tienda@test.com')
        await userEvent.type(screen.getByPlaceholderText('+595XXXXXXXXX'), '+595981123456')
        await userEvent.type(screen.getByPlaceholderText('Calle Principal 123'), 'Av. Principal 123')
        await userEvent.type(document.querySelector('textarea[name="description"]'), 'Descripción')
        await userEvent.type(screen.getByPlaceholderText('Ej: 2500'), '2500')
        await userEvent.type(screen.getByPlaceholderText('Ej: 4000'), '4000')
        await userEvent.click(screen.getByText('Registrar Comercio'))

        await waitFor(() => {
            expect(screen.getByText(/Seleccioná un punto en el mapa/)).toBeInTheDocument()
        })
    })

    it('muestra los campos de redes sociales', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => screen.getByPlaceholderText('https://mi-comercio.com'))
        expect(screen.getByPlaceholderText('https://instagram.com/mi_comercio')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('https://tiktok.com/@mi_comercio')).toBeInTheDocument()
    })

    it('llama a la API de creación de comercio con los datos del formulario', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => screen.getByPlaceholderText('Ej: Mi Tienda Online'))

        await fillRequiredFields()
        await userEvent.click(screen.getByText('Registrar Comercio'))

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/commerces'),
                expect.objectContaining({ method: 'POST' })
            )
        })
    })

    it('muestra el error cuando el API retorna error', async () => {
        globalThis.fetch = vi.fn((url) => {
            const u = String(url)
            if (u.includes('/api/session/user-session')) {
                return Promise.resolve(makeOk({ success: true, user: { id_user: 7 } }))
            }
            if (u.includes('/api/commerces/categories')) {
                return Promise.resolve(makeOk([]))
            }
            if (u.includes('/api/commerces')) {
                return Promise.resolve(makeError('Nombre ya registrado'))
            }
            return Promise.resolve(makeOk({}))
        })

        render(<CommerceCreationForm />)
        await waitFor(() => screen.getByPlaceholderText('Ej: Mi Tienda Online'))

        await fillRequiredFields()
        await userEvent.click(screen.getByText('Registrar Comercio'))

        await waitFor(() => {
            expect(screen.getByText('Nombre ya registrado')).toBeInTheDocument()
        })
    })

    it('muestra error cuando falla la sesión', async () => {
        globalThis.fetch = vi.fn((url) => {
            const u = String(url)
            if (u.includes('/api/session/user-session')) {
                return Promise.resolve(makeOk({ success: false }))
            }
            return Promise.resolve(makeOk([]))
        })

        render(<CommerceCreationForm />)
        await waitFor(() => {
            expect(screen.getByText(/No se pudo verificar la sesión/)).toBeInTheDocument()
        })
    })

    it('muestra el mensaje de ubicación seleccionada', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => screen.getByText('Seleccionar punto en mapa'))
        await userEvent.click(screen.getByText('Seleccionar punto en mapa'))
        await waitFor(() => {
            expect(screen.getByText(/Punto seleccionado/)).toBeInTheDocument()
        })
    })

    it('muestra el botón Limpiar punto después de seleccionar', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => screen.getByText('Seleccionar punto en mapa'))
        await userEvent.click(screen.getByText('Seleccionar punto en mapa'))
        await waitFor(() => {
            expect(screen.getByText('Limpiar punto')).toBeInTheDocument()
        })
    })

    it('limpia el punto al hacer clic en Limpiar punto', async () => {
        render(<CommerceCreationForm />)
        await waitFor(() => screen.getByText('Seleccionar punto en mapa'))
        await userEvent.click(screen.getByText('Seleccionar punto en mapa'))
        await waitFor(() => screen.getByText('Limpiar punto'))
        await userEvent.click(screen.getByText('Limpiar punto'))
        await waitFor(() => {
            expect(screen.queryByText('Limpiar punto')).not.toBeInTheDocument()
        })
    })
})
