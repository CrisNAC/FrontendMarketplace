import axios from 'axios';

/**
 * Cliente centralizado de Axios para el Marketplace.
 *
 * CÓMO USARLO EN NUEVOS ARCHIVOS:
 * ─────────────────────────────────────────────────────
 * import apiClient from '../../lib/apiClient';
 *
 * const data = await apiClient.get('/api/products');
 * const result = await apiClient.post('/api/orders', body);
 * ─────────────────────────────────────────────────────
 *
 * El interceptor maneja automáticamente:
 *   401 → redirige a /login
 *   403 → redirige a /error/403
 *   500+ → redirige a /error/500
 *
 * Para errores que quieras manejar manualmente (ej: mostrar toast),
 * usa el hook useErrorHandler en su lugar.
 *
 * NOTA: Los servicios existentes no necesitan migrar de inmediato.
 * Usar este cliente en código nuevo es suficiente.
 */

let _navigate = null;

/**
 * Inyecta el navigate de React Router en el cliente.
 * Se llama automáticamente desde el componente <NavigationSetter /> en App.tsx.
 * No es necesario llamarlo manualmente.
 */
export const setNavigate = (nav) => {
  _navigate = nav;
};

const apiBaseUrl = import.meta.env.VITE_API_URL;
if (!apiBaseUrl && !import.meta.env.DEV) {
  console.warn('VITE_API_URL no definida. Se usa fallback a http://localhost:3000');
}

const apiClient = axios.create({
  baseURL: apiBaseUrl ?? 'http://localhost:3000',
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const rawCode =
      error?.response?.data?.error?.code ?? error?.response?.status;
    const code = Number(rawCode);

    if (!Number.isNaN(code) && _navigate) {
      if (code === 401) _navigate('/login');
      else if (code === 403) _navigate('/error/403');
      else if (code >= 500 && code < 600) _navigate('/error/500');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
