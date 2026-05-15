import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import toast from 'react-hot-toast';

const mockFetchPendingStores = vi.fn();
const mockApproveStore = vi.fn();
const mockRejectStore = vi.fn();

vi.mock('../features/admin/services/adminUsersApi', () => ({
  fetchPendingStores: (...args) => mockFetchPendingStores(...args),
  approveStore: (...args) => mockApproveStore(...args),
  rejectStore: (...args) => mockRejectStore(...args),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

import { AdminPendingStoresPage } from '../features/admin/pages/AdminPendingStoresPage';

const mockStores = [
  {
    id_store: 1,
    name: 'Tienda 1',
    email: 'tienda1@email.com',
    created_at: '2024-01-15T00:00:00.000Z',
    user: { name: 'Juan Perez' },
    store_category: { name: 'Electronica' },
    description: 'Venta de electronica',
    logo: '/uploads/stores/1/logo.png'
  },
  {
    id_store: 2,
    name: 'Tienda 2',
    email: 'tienda2@email.com',
    created_at: '2024-01-16T00:00:00.000Z',
    user: { name: 'Maria Gomez' },
    store_category: { name: 'Ropa' },
    description: 'Venta de ropa',
    logo: ''
  }
];

const paginationSinglePage = { total: 2, page: 1, limit: 20, totalPages: 1 };

function renderPage() {
  return render(<AdminPendingStoresPage />);
}

describe('AdminPendingStoresPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchPendingStores.mockResolvedValue({
      data: mockStores,
      pagination: paginationSinglePage,
    });
  });

  it('muestra el título de comercios por aprobar', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Comercios por Aprobar' })).toBeInTheDocument();
    });
  });

  it('muestra la lista de comercios pendientes', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Tienda 1')).toBeInTheDocument();
      expect(screen.getByText('Tienda 2')).toBeInTheDocument();
      expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    });
  });

  it('muestra el mensaje de estado si no hay pendientes', async () => {
    mockFetchPendingStores.mockResolvedValue({
      data: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 1 },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No hay solicitudes de comercios por aprobar.')).toBeInTheDocument();
    });
  });

  it('abre el modal de detalles al darle clic en evaluar', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tienda 1')).toBeInTheDocument();
    });

    const evalButtons = screen.getAllByTitle('Ver y Evaluar');
    await user.click(evalButtons[0]);

    await waitFor(() => {
      // Debería mostrar la descripción en el modal 
      expect(screen.getByText('Detalles del Comercio')).toBeInTheDocument();
      expect(screen.getByText('Venta de electronica')).toBeInTheDocument();
    });
  });

  it('muestra el logo del comercio en listado y detalles', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tienda 1')).toBeInTheDocument();
    });

    const listLogo = screen.getByRole('img', { name: 'Logo de Tienda 1' });
    expect(listLogo).toHaveAttribute('src', 'http://localhost:3000/uploads/stores/1/logo.png');

    const evalButtons = screen.getAllByTitle('Ver y Evaluar');
    await user.click(evalButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByRole('img', { name: 'Logo de Tienda 1' })).toHaveLength(2);
    });
  });

  it('aprueba el comercio desde el modal detallado', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tienda 1')).toBeInTheDocument();
    });

    const evalButtons = screen.getAllByTitle('Ver y Evaluar');
    await user.click(evalButtons[0]);

    // Esperar a que el modal se muestre
    await waitFor(() => {
      expect(screen.getByText('Detalles del Comercio')).toBeInTheDocument();
    });

    mockApproveStore.mockResolvedValue({});

    const approveButton = screen.getByText('Aprobar');
    await user.click(approveButton);

    await waitFor(() => {
      expect(mockApproveStore).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Comercio aprobado exitosamente');
      // Debería recargar los datos
      expect(mockFetchPendingStores).toHaveBeenCalledTimes(2);
    });
  });

  it('rechaza el comercio de forma rápida abre modal de razon', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tienda 1')).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByTitle('Rechazar rápido');
    await user.click(rejectButtons[0]);

    // Debería mostrar modal de razon
    await waitFor(() => {
      expect(screen.getByText('Motivo de Rechazo')).toBeInTheDocument();
    });

    const reasonInput = screen.getByPlaceholderText('Escribe el motivo...');
    await user.type(reasonInput, 'Motivo inválido de prueba');
    
    mockRejectStore.mockResolvedValue({});
    const confirmButton = screen.getByText('Confirmar Rechazo');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockRejectStore).toHaveBeenCalledWith(1, 'Motivo inválido de prueba');
      expect(toast.success).toHaveBeenCalledWith('Comercio rechazado');
      // Recarga de datos
      expect(mockFetchPendingStores).toHaveBeenCalledTimes(2);
    });
  });

  it('lanza un error si no se escribe motivo en el rechazo', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tienda 1')).toBeInTheDocument();
    });

    const rejectButtons = screen.getAllByTitle('Rechazar rápido');
    await user.click(rejectButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Motivo de Rechazo')).toBeInTheDocument();
    });
    
    const confirmButton = screen.getByText('Confirmar Rechazo');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('El motivo es obligatorio');
      // No debe llamar
      expect(mockRejectStore).not.toHaveBeenCalled();
    });
  });

});
