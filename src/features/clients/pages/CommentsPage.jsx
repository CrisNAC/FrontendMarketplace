import { useState } from 'react';
import { RatingsDistribution } from '../components/comments/RatingsDistribution';
import { CommentsList } from '../components/comments/CommentsList';
import { AddReviewModal } from '../components/comments/AddReviewModal';

export const CommentsPage = ({ productId = '123', onBack = () => {} }) => {
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

  return (
    <div className="bg-gray-100 min-h-screen p-0">
      <div className="max-w-6xl mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="p-10 border-b border-gray-200 flex items-center">
          <button 
            className="bg-none border-none text-2xl cursor-pointer text-gray-800 p-0 font-semibold transition-colors hover:text-gray-600"
            onClick={onBack}
          >
            ← Comentarios
          </button>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-[350px_1fr] gap-10 p-8">
          {/* Sidebar izquierdo */}
          <aside className="flex flex-col gap-5">
            {/* Wrapper de ratings */}
            <div className="bg-white border border-gray-200 rounded-lg p-0">
              <RatingsDistribution
                ratings={{
                  5: 56,
                  4: 33,
                  3: 11,
                  2: 0,
                  1: 0
                }}
              />

              {/* Textos dentro del contenedor */}
              <div className="px-5 pb-5 border-t border-gray-200 mt-5">
                <h3 className="text-base font-bold m-0 mb-2 text-gray-800">
                  Escribir opinión de este producto
                </h3>
                <p className="text-sm text-gray-600 m-0">
                  Comparte tu opinión con otros clientes
                </p>
              </div>
            </div>

            {/* Sección de botón */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <button 
                className="w-full py-3 px-4 bg-teal-600 text-white rounded font-semibold cursor-pointer transition-all hover:bg-teal-700 active:translate-y-0.5"
                onClick={() => setShowModal(true)}
              >
                Escribir mi opinión
              </button>
            </div>
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