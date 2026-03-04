import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RatingsDistribution } from '../components/comments/RatingsDistribution';
import { CommentsList } from '../components/comments/CommentsList';
import { AddReviewModal } from '../components/comments/AddReviewModal';

export const CommentsPage = ({ productId = '123' }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState([]);

  const handleAddReview = (reviewData) => {
    const newComment = {
      id: comments.length + 1,
      author: 'Tú',
      rating: reviewData.rating,
      title: `${reviewData.rating}/10 would recommend!!`,
      content: reviewData.comment,
      verified: false,
      location: 'Paraguay',
      date: reviewData.date,
      productDetails: {
        'Tamaño': '128GB',
        'Color': 'Rosado'
      }
    };

    setComments([newComment, ...comments]);
    alert('¡Tu reseña ha sido enviada exitosamente!');
  };

  const handleBack = () => {
    navigate('/homepage');
  };

  return (
    <div className="min-h-screen p-0" style={{ background: '#F5F5F5' }}>
      <div className="max-w-6xl mx-auto min-h-screen">
        {/* Header - SIN fondo blanco, sobre el fondo gris */}
        <div className="px-6 py-4 flex items-center">
          <button 
            className="bg-none border-none text-lg cursor-pointer text-gray-800 p-0 font-semibold transition-colors hover:text-gray-600"
            onClick={handleBack}
          >
            ← Comentarios
          </button>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-[300px_1fr] gap-6 px-6 pb-8">
          {/* Sidebar izquierdo */}
          <aside className="flex flex-col gap-4">
            {/* Card de ratings */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <RatingsDistribution
                ratings={{
                  5: 56,
                  4: 33,
                  3: 11,
                  2: 0,
                  1: 0
                }}
              />

              {/* Texto escribir opinión - dentro del card */}
              <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                <h3 className="text-base font-bold m-0 mb-1 text-gray-800">
                  Escribir opinión de este producto
                </h3>
                <p className="text-xs text-gray-500 m-0">
                  Comparte tu opinión con otros clientes
                </p>
              </div>
            </div>

            {/* Botón fuera del card, directamente sobre el fondo gris */}
            <button 
              className="w-full py-2.5 px-4 text-white rounded-full text-sm font-semibold cursor-pointer transition-all hover:opacity-90 active:translate-y-0.5"
              style={{ background: '#6B9080' }}
              onClick={() => setShowModal(true)}
            >
              Escribir mi opinión
            </button>
          </aside>

          {/* Contenido principal: Comentarios */}
          <main className="flex flex-col gap-0">
            <CommentsList comments={comments} />
          </main>
        </div>
      </div>

      {/* Modal para agregar reseña */}
      <AddReviewModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddReview}
      />
    </div>
  );
};