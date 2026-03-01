import { useState } from 'react';

export const AddReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      alert('Por favor escribe un comentario');
      return;
    }

    onSubmit({
      rating,
      comment,
      date: new Date().toLocaleDateString('es-ES')
    });

    // Reset form
    setRating(5);
    setComment('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-11/12 relative shadow-xl">
        <button 
          className="absolute top-4 right-4 bg-none border-none text-2xl cursor-pointer text-gray-500 p-0 w-8 h-8 flex items-center justify-center hover:text-gray-800"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Agregar una reseña
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Valoración */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              Valoración
            </label>
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`text-3xl cursor-pointer p-0 bg-none border-none transition-transform hover:scale-110 ${
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
          </div>

          {/* Comentario */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              Comentario
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded text-sm text-gray-800 resize-vertical transition-colors focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 placeholder:text-gray-500"
              placeholder="Tu comentario"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={6}
            />
          </div>

          {/* Botón guardar */}
          <button 
            type="submit" 
            className="px-5 py-3 bg-teal-600 text-white rounded font-semibold cursor-pointer transition-all hover:bg-teal-700 active:translate-y-0.5 mt-2"
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};