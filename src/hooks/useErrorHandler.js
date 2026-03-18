import { useNavigate } from 'react-router-dom';

/**
 * Hook para manejar errores de API manualmente.
 *
 * CUÁNDO USAR ESTO en lugar de apiClient:
 * ─────────────────────────────────────────────────────
 * Cuando necesitás controlar qué hacer con el error antes de redirigir
 * (ej: mostrar un toast, limpiar estado, loguear algo).
 *
 * EJEMPLO DE USO:
 * ─────────────────────────────────────────────────────
 * const handleError = useErrorHandler();
 *
 * try {
 *   const data = await fetchSomething();
 * } catch (error) {
 *   handleError(error); // redirige según el código de error
 * }
 * ─────────────────────────────────────────────────────
 *
 * Códigos que maneja:
 *   401 → /login
 *   403 → /error/403
 *   500+ → /error/500
 *   404  → /error/404  (opcional, pasar { redirect404: true })
 */
export const useErrorHandler = ({ redirect404 = false } = {}) => {
  const navigate = useNavigate();

  return (error) => {
    const rawCode =
      error?.response?.data?.error?.code ?? error?.response?.status;
    const code = Number(rawCode);
    if (Number.isNaN(code)) return;

    if (code === 401) navigate('/login');
    else if (code === 403) navigate('/error/403');
    else if (code === 404 && redirect404) navigate('/error/404');
    else if (code >= 500) navigate('/error/500');
  };
};
