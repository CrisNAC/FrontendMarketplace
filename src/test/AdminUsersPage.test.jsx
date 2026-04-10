import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mock del servicio — evita llamadas reales a axios/apiClient ──────────────
const mockFetchAdminUsers = vi.fn();

vi.mock('../features/admin/services/adminUsersApi', () => ({
  fetchAdminUsers: (...args) => mockFetchAdminUsers(...args),
}));

import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';

// ── Helpers ──────────────────────────────────────────────────────────────────

const mockUsers = [
  { id: 1, name: 'María González', email: 'maria@email.com',  role: 'CUSTOMER', status: true,  createdAt: '2024-01-15T00:00:00.000Z' },
  { id: 2, name: 'TechStore S.A.', email: 'tech@store.com',   role: 'SELLER',   status: true,  createdAt: '2024-01-10T00:00:00.000Z' },
  { id: 3, name: 'Carlos Ruiz',    email: 'carlos@email.com', role: 'CUSTOMER', status: false, createdAt: '2024-01-12T00:00:00.000Z' },
];

const paginationSinglePage = { total: 3, page: 1, limit: 20, totalPages: 1 };
const paginationMultiPage  = { total: 5, page: 1, limit: 3,  totalPages: 2 };

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminUsersPage />
    </MemoryRouter>
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('AdminUsersPage', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchAdminUsers.mockResolvedValue({
      data: mockUsers,
      pagination: paginationSinglePage,
    });
  });

  // ── Renderizado inicial ────────────────────────────────────────────────────

  it('muestra el título y subtítulo de la página', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Gestión de Usuarios' })).toBeInTheDocument();
    });
    expect(screen.getByText('Administra compradores y comercios de la plataforma')).toBeInTheDocument();
  });

  it('muestra el total de usuarios al cargar', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(`Usuarios (${paginationSinglePage.total})`)).toBeInTheDocument();
    });
  });

  it('muestra el indicador de carga mientras se obtienen los datos', () => {
    mockFetchAdminUsers.mockReturnValue(new Promise(() => {})); // Promise que nunca resuelve
    renderPage();

    expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();
  });

  it('muestra nombre y email de cada usuario', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('María González')).toBeInTheDocument();
    });
    expect(screen.getByText('maria@email.com')).toBeInTheDocument();
    expect(screen.getByText('TechStore S.A.')).toBeInTheDocument();
    expect(screen.getByText('tech@store.com')).toBeInTheDocument();
  });

  // ── Mapeo de roles y estados ───────────────────────────────────────────────

  it('muestra "Comprador" para rol CUSTOMER y no muestra el valor crudo', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('Comprador').length).toBeGreaterThan(0);
    });
    expect(screen.queryByText('CUSTOMER')).not.toBeInTheDocument();
  });

  it('muestra "Comercio" para rol SELLER y no muestra el valor crudo', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Comercio')).toBeInTheDocument();
    });
    expect(screen.queryByText('SELLER')).not.toBeInTheDocument();
  });

  it('muestra badge "activo" para status true', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('activo').length).toBeGreaterThan(0);
    });
  });

  it('muestra badge "suspendido" para status false (Carlos Ruiz)', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('suspendido')).toBeInTheDocument();
    });
  });

  // ── Filtros ────────────────────────────────────────────────────────────────

  it('llama a fetchAdminUsers con el parámetro search al escribir en el buscador', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('María González'));

    const input = screen.getByPlaceholderText('Buscar por nombre o email...');
    await user.clear(input);
    await user.type(input, 'maria');

    await waitFor(() => {
      const calls = mockFetchAdminUsers.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.search).toBe('maria');
    });
  });

  it('llama a fetchAdminUsers con role=CUSTOMER al seleccionar "Comprador"', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('María González'));

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'CUSTOMER');

    await waitFor(() => {
      const calls = mockFetchAdminUsers.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.role).toBe('CUSTOMER');
    });
  });

  it('llama a fetchAdminUsers con status="false" al seleccionar "Suspendido"', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('María González'));

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], 'false');

    await waitFor(() => {
      const calls = mockFetchAdminUsers.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.status).toBe('false');
    });
  });

  it('resetea page a 1 al cambiar un filtro', async () => {
    const user = userEvent.setup();

    // Simular que estamos en página 2
    mockFetchAdminUsers.mockResolvedValue({
      data: mockUsers,
      pagination: { ...paginationMultiPage, page: 2 },
    });

    renderPage();
    await waitFor(() => screen.getByText('María González'));

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'SELLER');

    await waitFor(() => {
      const calls = mockFetchAdminUsers.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.page).toBe(1);
    });
  });

  // ── Estado vacío y errores ─────────────────────────────────────────────────

  it('muestra mensaje cuando no hay resultados', async () => {
    mockFetchAdminUsers.mockResolvedValue({
      data: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('No se encontraron usuarios con los filtros seleccionados.')).toBeInTheDocument();
    });
  });

  it('muestra el mensaje de error de la API cuando falla con 400', async () => {
    const apiError = new Error('Bad Request');
    apiError.response = { data: { error: { code: 400, message: 'role inválido' } } };
    mockFetchAdminUsers.mockRejectedValue(apiError);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('role inválido')).toBeInTheDocument();
    });
  });

  it('muestra mensaje de error genérico si la API falla sin mensaje', async () => {
    mockFetchAdminUsers.mockRejectedValue(new Error('Network Error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Error al cargar los usuarios.')).toBeInTheDocument();
    });
  });

  // ── Paginación ─────────────────────────────────────────────────────────────

  it('no muestra la paginación cuando hay una sola página', async () => {
    renderPage();

    await waitFor(() => screen.getByText('María González'));

    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Anterior' })).not.toBeInTheDocument();
  });

  it('muestra los botones de paginación cuando hay más de una página', async () => {
    mockFetchAdminUsers.mockResolvedValue({
      data: mockUsers,
      pagination: paginationMultiPage,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();
    });
  });

  it('el botón "Anterior" está deshabilitado en la primera página', async () => {
    mockFetchAdminUsers.mockResolvedValue({
      data: mockUsers,
      pagination: paginationMultiPage,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    });
  });

  it('avanza a la página 2 al hacer clic en "Siguiente"', async () => {
    const user = userEvent.setup();
    mockFetchAdminUsers.mockResolvedValue({
      data: mockUsers,
      pagination: paginationMultiPage,
    });

    renderPage();

    await waitFor(() => screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() => {
      const calls = mockFetchAdminUsers.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.page).toBe(2);
    });
  });
});
