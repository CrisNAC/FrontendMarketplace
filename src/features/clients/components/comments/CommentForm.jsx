import { useState } from 'react';

export const CommentForm = ({ onSubmit = () => {} }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    const comment = {
      rating,
      title,
      content,
      date: new Date().toLocaleDateString('es-ES'),
      author: 'Tú'
    };

    onSubmit(comment);

    // Resetear formulario
    setRating(5);
    setTitle('');
    setContent('');
  };

  return (
    <div className="mb-6">
      <h3 className="text-base font-bold mb-2 text-gray-800">
        Escribir opinión de este producto
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Comparte tu opinión con otros clientes
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Calificación */}
        <div className="flex flex-col gap-2">
          <label htmlFor="rating" className="text-sm font-semibold text-gray-800">
            Calificación:
          </label>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`text-2xl cursor-pointer p-0 bg-none border-none transition-transform hover:scale-110 ${
                    i < (hoveredRating || rating) ? 'text-orange-500' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  aria-label={`Calificar con ${i + 1} estrellas`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-600 font-semibold">
              {rating}/5
            </span>
          </div>
        </div>

        {/* Título */}
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="text-sm font-semibold text-gray-800">
            Título de tu comentario:
          </label>
          <input
            id="title"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 transition-colors focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 placeholder:text-gray-500"
            placeholder="Ej: Excelente producto, muy recomendado"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <span className="text-xs text-gray-500 text-right">
            {title.length}/100
          </span>
        </div>

        {/* Contenido */}
        <div className="flex flex-col gap-2">
          <label htmlFor="content" className="text-sm font-semibold text-gray-800">
            Tu comentario:
          </label>
          <textarea
            id="content"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 resize-vertical transition-colors focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 placeholder:text-gray-500"
            placeholder="Describe tu experiencia con este producto..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            rows={6}
          />
          <span className="text-xs text-gray-500 text-right">
            {content.length}/1000
          </span>
        </div>

        {/* Botón */}
        <button 
          type="submit" 
          className="px-4 py-2 bg-teal-600 text-white rounded font-semibold cursor-pointer transition-all hover:bg-teal-700 active:translate-y-0.5"
        >
          Enviar mi opinión
        </button>
      </form>
    </div>
  );
};