import { useState } from 'react';

export const CommentCard = ({ 
  author = 'Usuario', 
  rating = 5, 
  title = 'Título del comentario',
  content = 'Contenido del comentario',
  verified = false,
  location = 'País',
  date = new Date().toLocaleDateString(),
  productDetails = {},
  onReport = () => {}
}) => {
  const [reported, setReported] = useState(false);

  const handleReport = () => {
    setReported(true);
    onReport();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5 transition-shadow hover:shadow-md">
      {/* Header con usuario */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-gray-600 flex-shrink-0">
            {author.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <h4 className="m-0 text-sm font-semibold text-gray-800 mb-1">
              {author}
            </h4>
            
            <div className="flex items-center gap-1.5 mb-2 text-xs">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={i < rating ? 'text-orange-500' : 'text-gray-300'}
                >
                  ★
                </span>
              ))}
              <span className="text-gray-800 font-semibold ml-1">
                {rating}/10 would recommend!!
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ubicación y fecha */}
      <div className="flex gap-1 text-xs text-gray-600 mb-2 flex-wrap">
        <span>Calificado en {location}</span>
        <span> el {date}</span>
      </div>

      {/* Detalles del producto */}
      <div className="flex flex-wrap gap-3 mb-3 text-xs">
        {Object.entries(productDetails).map(([key, value]) => (
          <span key={key} className="text-gray-600">
            <strong className="text-gray-800">{key}:</strong> {value}
          </span>
        ))}
        {verified && (
          <span className="text-orange-500 font-semibold">
            ✓ Compra Verificada
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="mb-4">
        <h5 className="m-0 mb-2 text-sm font-semibold text-gray-800">
          {title}
        </h5>
        <p className="m-0 text-sm text-gray-600 leading-relaxed">
          {content}
        </p>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 pt-3">
        <button className="px-4 py-1.5 border border-gray-300 rounded text-xs text-gray-800 cursor-pointer transition-all hover:border-gray-600 hover:bg-gray-50">
          Útil
        </button>
        <button 
          className="px-4 py-1.5 border border-gray-300 rounded text-xs text-gray-800 cursor-pointer transition-all hover:border-gray-600 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleReport}
          disabled={reported}
        >
          {reported ? '✓ Reportado' : 'Reportar'}
        </button>
      </div>
    </div>
  );
};