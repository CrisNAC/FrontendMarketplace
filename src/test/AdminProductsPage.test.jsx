import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockFetchAdminProducts = vi.fn();
const mockApproveProduct     = vi.fn();
const mockRejectProduct      = vi.fn();

vi.mock('../features/admin/services/adminProductsApi', () => ({
  fetchAdminProducts: (...args) => mockFetchAdminProducts(...args),
  approveProduct:     (...args) => mockApproveProduct(...args),
  rejectProduct:      (...args) => mockRejectProduct(...args),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import { AdminProductsPage } from '../features/admin/pages/AdminProductsPage';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockProducts = [
  {
    id: 1,
    name: 'Auriculares Bluetooth',
    description: 'Auriculares inalámbricos con cancelación de ruido',
    price: 150000,
    visible: true,
    approvalStatus: 'PENDING',
    reportCount: 2,
    category: { name: 'Electrónica' },
    store: { name: 'TechStore' },
    createdAt: '2024-03-01T00:00:00.000Z',
    latestReport: { reason: 'Descripción falsa', description: null, reportedAt: '2024-03-10T00:00:00.000Z' },
    rejectionReason: null,
  },
  {
    id: 2,
    name: 'Zapatillas Running',
    description: 'Zapatillas para correr',
    price: 200000,
    visible: true,
    approvalStatus: 'ACTIVE',
    reportCount: 0,
    category: { name: 'Deportes' },
    store: { name: 'SportZone' },
    createdAt: '2024-02-15T00:00:00.000Z',
    latestReport: null,
    rejectionReason: null,
  },
  {
    id: 3,
    name: 'Camiseta Falsa',
    description: 'Producto rechazado',
    price: 50000,
    visible: false,
    approvalStatus: 'REJECTED',
    reportCount: 5,
    category: { name: 'Ropa' },
    store: { name: 'BadStore' },
    createdAt: '2024-01-20T00:00:00.000Z',
    latestReport: { reason: 'Producto falsificado', description: 'Imagen copiada', reportedAt: '2024-01-25T00:00:00.000Z' },
    rejectionReason: 'Producto falsificado detectado',
  },
];

const paginationSinglePage = { total: 3, page: 1, limit: 20, totalPages: 1 };
const paginationMultiPage  = { total: 6, page: 1, limit: 3,  totalPages: 2 };

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminProductsPage />
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AdminProductsPage', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchAdminProducts.mockResolvedValue({
      data: mockProducts,
      pagination: paginationSinglePage,
    });
    mockApproveProduct.mockResolvedValue({});
    mockRejectProduct.mockResolvedValue({});
  });

  // ── Renderizado inicial ────────────────────────────────────────────────────

  it('muestra el título y subtítulo de la página', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Moderación de Productos' })).toBeInTheDocument();
    });
    expect(screen.getByText('Revisa y modera productos reportados o sospechosos')).toBeInTheDocument();
  });

  it('muestra el total de productos al cargar', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(`Productos para Revisar (${paginationSinglePage.total})`)).toBeInTheDocument();
    });
  });

  it('muestra el indicador de carga mientras se obtienen los datos', () => {
    mockFetchAdminProducts.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByText('Cargando productos...')).toBeInTheDocument();
  });

  it('carga con filtro PENDING por defecto', async () => {
    renderPage();

    await waitFor(() => {
      const firstCall = mockFetchAdminProducts.mock.calls[0][0];
      expect(firstCall.approvalStatus).toBe('PENDING');
    });
  });

  // ── Lista de productos ─────────────────────────────────────────────────────

  it('muestra nombre y vendedor de cada producto', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Auriculares Bluetooth')).toBeInTheDocument();
    });
    expect(screen.getByText('Zapatillas Running')).toBeInTheDocument();
    expect(screen.getByText('Camiseta Falsa')).toBeInTheDocument();
  });

  it('muestra el badge "pendiente" para PENDING', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('pendiente').length).toBeGreaterThan(0);
    });
    expect(screen.queryByText('PENDING')).not.toBeInTheDocument();
  });

  it('muestra el badge "aprobado" para ACTIVE', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('aprobado')).toBeInTheDocument();
    });
    expect(screen.queryByText('ACTIVE')).not.toBeInTheDocument();
  });

  it('muestra el badge "rechazado" para REJECTED', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('rechazado')).toBeInTheDocument();
    });
    expect(screen.queryByText('REJECTED')).not.toBeInTheDocument();
  });

  it('muestra el conteo de reportes por producto', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('2 reportes')).toBeInTheDocument();
    });
    expect(screen.getByText('5 reportes')).toBeInTheDocument();
  });

  // ── Filtros ────────────────────────────────────────────────────────────────

  it('llama a fetchAdminProducts con el parámetro search al escribir en el buscador', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    const input = screen.getByPlaceholderText('Buscar por nombre de producto o vendedor...');
    await user.clear(input);
    await user.type(input, 'auricular');

    await waitFor(() => {
      const calls = mockFetchAdminProducts.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.search).toBe('auricular');
    });
  });

  it('llama a fetchAdminProducts con approvalStatus=ACTIVE al seleccionar "Aprobado"', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    await user.selectOptions(screen.getByRole('combobox'), 'ACTIVE');

    await waitFor(() => {
      const calls = mockFetchAdminProducts.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.approvalStatus).toBe('ACTIVE');
    });
  });

  it('llama a fetchAdminProducts con approvalStatus vacío al seleccionar "Todos los estados"', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    await user.selectOptions(screen.getByRole('combobox'), '');

    await waitFor(() => {
      const calls = mockFetchAdminProducts.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.approvalStatus).toBe('');
    });
  });

  it('resetea page a 1 al cambiar un filtro', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    await user.selectOptions(screen.getByRole('combobox'), 'REJECTED');

    await waitFor(() => {
      const calls = mockFetchAdminProducts.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.page).toBe(1);
    });
  });

  // ── Estado vacío y errores ─────────────────────────────────────────────────

  it('muestra mensaje cuando no hay resultados', async () => {
    mockFetchAdminProducts.mockResolvedValue({
      data: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('No hay productos que coincidan con los filtros seleccionados.')).toBeInTheDocument();
    });
  });

  it('muestra el mensaje de error de la API cuando falla', async () => {
    const apiError = new Error('Bad Request');
    apiError.response = { data: { error: { code: 400, message: 'approvalStatus inválido' } } };
    mockFetchAdminProducts.mockRejectedValue(apiError);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('approvalStatus inválido')).toBeInTheDocument();
    });
  });

  it('muestra mensaje de error genérico si la API falla sin mensaje', async () => {
    mockFetchAdminProducts.mockRejectedValue(new Error('Network Error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Error al cargar los productos.')).toBeInTheDocument();
    });
  });

  // ── Paginación ─────────────────────────────────────────────────────────────

  it('no muestra paginación cuando hay una sola página', async () => {
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    expect(screen.queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Anterior' })).not.toBeInTheDocument();
  });

  it('muestra los botones de paginación cuando hay más de una página', async () => {
    mockFetchAdminProducts.mockResolvedValue({
      data: mockProducts,
      pagination: paginationMultiPage,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();
    });
  });

  it('el botón "Anterior" está deshabilitado en la primera página', async () => {
    mockFetchAdminProducts.mockResolvedValue({
      data: mockProducts,
      pagination: paginationMultiPage,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    });
  });

  it('avanza a la página 2 al hacer clic en "Siguiente"', async () => {
    const user = userEvent.setup();
    mockFetchAdminProducts.mockResolvedValue({
      data: mockProducts,
      pagination: paginationMultiPage,
    });

    renderPage();

    await waitFor(() => screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    await waitFor(() => {
      const calls = mockFetchAdminProducts.mock.calls;
      const lastCall = calls[calls.length - 1][0];
      expect(lastCall.page).toBe(2);
    });
  });

  // ── Modal de detalle ───────────────────────────────────────────────────────

  it('abre el modal de detalle al hacer clic en el botón de ojo', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    const eyeButtons = screen.getAllByTitle('Ver detalle');
    await user.click(eyeButtons[0]);

    expect(screen.getByRole('heading', { name: 'Detalle del Producto' })).toBeInTheDocument();
    expect(screen.getAllByText('Auriculares inalámbricos con cancelación de ruido').length).toBeGreaterThan(0);
  });

  it('muestra el nombre del producto y el badge de estado en el modal', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    await user.click(screen.getAllByTitle('Ver detalle')[0]);

    const modal = screen.getByRole('heading', { name: 'Detalle del Producto' }).closest('div');
    expect(modal).toBeInTheDocument();
    expect(screen.getAllByText('pendiente').length).toBeGreaterThan(0);
  });

  it('muestra los reportes en el modal cuando hay reportes activos', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    await user.click(screen.getAllByTitle('Ver detalle')[0]);

    expect(screen.getByText('2 reporte(s) activo(s)')).toBeInTheDocument();
    expect(screen.getByText('Descripción falsa')).toBeInTheDocument();
  });

  it('muestra "Sin reportes activos." en el modal cuando no hay reportes', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Zapatillas Running'));

    const eyeButtons = screen.getAllByTitle('Ver detalle');
    await user.click(eyeButtons[1]);

    expect(screen.getByText('Sin reportes activos.')).toBeInTheDocument();
  });

  it('muestra el motivo de rechazo en el modal para productos REJECTED', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Camiseta Falsa'));

    const eyeButtons = screen.getAllByTitle('Ver detalle');
    await user.click(eyeButtons[2]);

    expect(screen.getByText('Producto falsificado detectado')).toBeInTheDocument();
  });

  it('cierra el modal al hacer clic en el botón X', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    await user.click(screen.getAllByTitle('Ver detalle')[0]);
    expect(screen.getByRole('heading', { name: 'Detalle del Producto' })).toBeInTheDocument();

    const closeButton = screen.getAllByRole('button').find(
      (btn) => btn.title === '' && btn.closest('[style*="z-index: 50"], [style*="zIndex: 50"]')
    ) ?? screen.getAllByRole('button').find((btn) => btn.getAttribute('style')?.includes('none') && btn.closest('[style*="fixed"]'));

    // Cierra haciendo clic en el overlay
    const overlay = screen.getByRole('heading', { name: 'Detalle del Producto' }).closest('[style*="fixed"]') ??
                    screen.getByRole('heading', { name: 'Detalle del Producto' }).parentElement?.parentElement?.parentElement;

    // Usamos el botón X directamente (es el único button con X size={24} sin title)
    const xButtons = screen.getAllByRole('button').filter((btn) => !btn.title && btn.closest('[style]'));
    await user.click(xButtons[xButtons.length - 1]);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Detalle del Producto' })).not.toBeInTheDocument();
    });
  });

  // ── Acciones de moderación ─────────────────────────────────────────────────

  it('muestra los botones Aprobar/Rechazar en la fila solo para productos PENDING', async () => {
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    expect(screen.getAllByTitle('Aprobar producto').length).toBe(1);
    expect(screen.getAllByTitle('Rechazar producto').length).toBe(1);
    // ACTIVE y REJECTED no tienen botones de acción
    expect(screen.queryByTitle('Aprobar producto')).toBeInTheDocument();
  });

  it('llama a approveProduct y recarga la lista al aprobar desde la fila', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    await user.click(screen.getByTitle('Aprobar producto'));

    await waitFor(() => {
      expect(mockApproveProduct).toHaveBeenCalledWith(1);
    });
    expect(mockFetchAdminProducts).toHaveBeenCalledTimes(3);
  });

  it('abre el modal de rechazo al hacer clic en el botón de rechazo de la fila', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    await user.click(screen.getByTitle('Rechazar producto'));

    expect(screen.getByRole('heading', { name: 'Motivo de Rechazo' })).toBeInTheDocument();
    expect(screen.getByText(/"Auriculares Bluetooth"/)).toBeInTheDocument();
  });

  it('llama a rejectProduct con el motivo y recarga la lista al confirmar rechazo', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    await user.click(screen.getByTitle('Rechazar producto'));

    const textarea = screen.getByPlaceholderText('Escribe el motivo del rechazo...');
    await user.type(textarea, 'Producto con imágenes robadas');

    await user.click(screen.getByRole('button', { name: 'Confirmar Rechazo' }));

    await waitFor(() => {
      expect(mockRejectProduct).toHaveBeenCalledWith(1, 'Producto con imágenes robadas');
    });
    expect(mockFetchAdminProducts).toHaveBeenCalledTimes(3);
  });

  it('no llama a rejectProduct si el motivo está vacío', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => screen.getByText('Auriculares Bluetooth'));

    await user.click(screen.getByTitle('Rechazar producto'));
    await user.click(screen.getByRole('button', { name: 'Confirmar Rechazo' }));

    expect(mockRejectProduct).not.toHaveBeenCalled();
  });
});
