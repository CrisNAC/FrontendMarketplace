import { useState } from 'react';

export const CommentCard = ({
  author = 'Usuario',
  rating = 5,
  title = 'Título del comentario',
  content = 'Contenido del comentario',
  verified = false,
  location = 'País',
  date = new Date(),
  productDetails = {},
  onReport = () => { }
}) => {
  const [reported, setReported] = useState(false);

  const handleReport = () => {
    setReported(true);
    onReport();
  };

  const formatDate = (value) => {
    const parsed = new Date(value);
    if (isNaN(parsed)) return value; // si ya viene formateado

    return parsed.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 transition-shadow hover:shadow-sm">
      {/* Header con usuario y estrellas en una línea */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500 flex-shrink-0">
          {author.charAt(0).toUpperCase()}
        </div>

        <span className="text-sm font-semibold text-gray-800">
          {author}
        </span>
      </div>

      {/* Estrellas + título de rating */}
      <div className="flex items-center gap-1 mb-1.5">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-xs ${i < rating ? 'text-orange-500' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
        <span className="text-xs text-gray-800 font-semibold ml-1">
          10/10 would recommend!!
        </span>
      </div>

      {/* Ubicación y fecha */}
      <div className="text-xs text-gray-500 mb-1.5">
        Calificado en {location} el {formatDate(date)}
      </div>

      {/* Detalles del producto */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-2 text-xs">
        {Object.entries(productDetails).map(([key, value]) => (
          <span key={key} className="text-gray-500">
            <strong className="text-gray-700">{key}:</strong> {value}
          </span>
        ))}
        {verified && (
          <span className="text-orange-500 font-semibold">
            ✓ Compra Verificada
          </span>
        )}
      </div>

      {/* Contenido */}
      <p className="m-0 text-sm text-gray-600 leading-relaxed mb-3">
        {content}
      </p>

      {/* Acciones */}
      <div className="flex items-center gap-3 pt-2">
        <button className="px-4 py-1 border border-gray-300 rounded text-xs text-gray-700 cursor-pointer transition-all hover:border-gray-500 hover:bg-gray-50">
          Útil
        </button>
        <span className="text-gray-300">|</span>
        <button
          className="text-xs text-gray-500 cursor-pointer bg-transparent border-none p-0 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleReport}
          disabled={reported}
        >
          {reported ? '✓ Reportado' : 'Reportar'}
        </button>
      </div>
    </div>
  );
};