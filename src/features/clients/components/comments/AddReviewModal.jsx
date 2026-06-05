import { useState } from 'react';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1, "Debes seleccionar una calificación").max(5, "Calificación inválida"),
  comment: z.string().trim().min(1, "El comentario es obligatorio").max(1000, "El comentario no puede superar 1000 caracteres"),
});

export const AddReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    const parsed = reviewSchema.safeParse({
      rating,
      comment,
    });

    if (!parsed.success) {
      const errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setError('Revisá los datos del formulario');
      return;
    }

    onSubmit({
      rating,
      comment,
      date: new Date().toLocaleDateString('es-ES')
    });

    setRating(5);
    setComment('');
    setFieldErrors({});
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

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded border border-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-800">
              Comentario
            </label>
            <textarea
              className={`w-full p-3 border rounded text-sm text-gray-800 resize-vertical transition-colors focus:outline-none focus:ring-2 placeholder:text-gray-500 ${
                fieldErrors.comment ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-teal-600 focus:ring-teal-100'
              }`}
              placeholder="Tu comentario"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setError('');
                setFieldErrors({});
              }}
              maxLength={1000}
              rows={6}
            />
            {fieldErrors.comment && <p className="text-xs text-red-600">{fieldErrors.comment}</p>}
          </div>

          <button 
            type="submit" 
            className="px-5 py-3 bg-teal-600 text-white rounded font-semibold cursor-pointer transition-all hover:bg-teal-700 active:translate-y-0.5 mt-2"
            style={{ background: '#6B9080' }}
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
};