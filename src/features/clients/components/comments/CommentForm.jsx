import { useState } from 'react';
import { z } from 'zod';

// ─── Esquema de validación ──────────────────────────────────────────────────
const commentSchema = z.object({
  rating: z.number().min(1, "Debes seleccionar una calificación").max(5, "Calificación inválida"),
  title: z.string().trim().min(1, "El título es obligatorio").max(100, "El título no puede superar 100 caracteres"),
  content: z.string().trim().min(1, "El contenido es obligatorio").max(1000, "El contenido no puede superar 1000 caracteres"),
});

export const CommentForm = ({ onSubmit = () => {} }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    const parsed = commentSchema.safeParse({
      rating,
      title,
      content,
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
    setFieldErrors({});
  };

  return (
    <div className="mb-6">
      <h3 className="text-base font-bold mb-2 text-gray-800">
        Escribir opinión de este producto
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Comparte tu opinión con otros clientes
      </p>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded border border-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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
            className={`w-full px-3 py-2 border rounded text-sm text-gray-800 transition-colors focus:outline-none focus:ring-2 placeholder:text-gray-500 ${
              fieldErrors.title ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-teal-600 focus:ring-teal-100'
            }`}
            placeholder="Ej: Excelente producto, muy recomendado"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
              setFieldErrors({});
            }}
            maxLength={100}
          />
          {fieldErrors.title && <p className="text-xs text-red-600">{fieldErrors.title}</p>}
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
            className={`w-full px-3 py-2 border rounded text-sm text-gray-800 resize-vertical transition-colors focus:outline-none focus:ring-2 placeholder:text-gray-500 ${
              fieldErrors.content ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100' : 'border-gray-300 focus:border-teal-600 focus:ring-teal-100'
            }`}
            placeholder="Describe tu experiencia con este producto..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError('');
              setFieldErrors({});
            }}
            maxLength={1000}
            rows={6}
          />
          {fieldErrors.content && <p className="text-xs text-red-600">{fieldErrors.content}</p>}
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