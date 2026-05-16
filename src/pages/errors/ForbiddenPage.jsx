import { useNavigate } from 'react-router-dom';

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="app-page flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-extrabold select-none" style={{ color: 'var(--primary-light)' }}>
          403
        </p>
        <h1 className="mt-2">Acceso denegado</h1>
        <p className="mt-3 text-gray-500">
          No tenés permisos para acceder a este recurso.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Volver atrás
          </button>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
};
