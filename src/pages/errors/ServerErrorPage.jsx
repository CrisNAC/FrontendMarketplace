import { useNavigate } from 'react-router-dom';

export const ServerErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="app-page flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-extrabold select-none" style={{ color: 'var(--primary-light)' }}>
          500
        </p>
        <h1 className="mt-2">Error del servidor</h1>
        <p className="mt-3 text-gray-500">
          Algo salió mal de nuestro lado. Intentá de nuevo en unos minutos.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => window.location.reload()} className="btn btn-secondary">
            Reintentar
          </button>
          <button onClick={() => navigate('/homepage')} className="btn btn-primary">
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
};
