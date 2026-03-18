/**
 * PÁGINA DE PRUEBA TEMPORAL — OM-274
 * Eliminar cuando se valide que el manejo de errores funciona correctamente.
 * Ruta: /test-errors
 */
import axios from 'axios';
import apiClient from '../../lib/apiClient';

const mockError = (status) => {
  const error = new Error('Simulated error');
  error.response = {
    status,
    data: { error: { code: status, message: `Error simulado ${status}` } },
  };
  return Promise.reject(error);
};

export const TestErrorsPage = () => {
  const triggerViaInterceptor = async (code) => {
    // Reemplaza el adaptador de la request para devolver el error simulado
    // sin hacer una llamada real al backend
    try {
      await apiClient.get(`/test-${code}`, {
        adapter: () => mockError(code),
      });
    } catch {
      // El interceptor ya redirigió — no hay nada que hacer aquí
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 gap-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Test — Páginas de Error</h1>
        <p className="mt-2 text-gray-500 text-sm">Eliminar esta página luego de validar (OM-274)</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md space-y-6">

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Navegación directa</p>
          <div className="flex flex-col gap-2">
            {['/error/404', '/error/403', '/error/500'].map((path) => (
              <a
                key={path}
                href={path}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-center text-sm transition-colors"
              >
                {path}
              </a>
            ))}
          </div>
        </div>

        <hr />

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
            Via interceptor de apiClient
          </p>
          <p className="text-xs text-gray-400 mb-3">
            Simula una respuesta de error del backend sin llamada real.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => triggerViaInterceptor(401)}
              className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-sm transition-colors"
            >
              Simular 401 → redirige a /login
            </button>
            <button
              onClick={() => triggerViaInterceptor(403)}
              className="px-4 py-2 rounded-lg bg-orange-100 text-orange-800 hover:bg-orange-200 text-sm transition-colors"
            >
              Simular 403 → redirige a /error/403
            </button>
            <button
              onClick={() => triggerViaInterceptor(500)}
              className="px-4 py-2 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 text-sm transition-colors"
            >
              Simular 500 → redirige a /error/500
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
