import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RatingsDistribution } from '../components/comments/RatingsDistribution';
import { CommentsList } from '../components/comments/CommentsList';
import { AddReviewModal } from '../components/comments/AddReviewModal';
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import toast from 'react-hot-toast';


export const CommentsPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState(null);
  const [ratings, setRatings] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();


  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`/products/reviews/${id}`);

      const mapped = data.reviews.map((r) => ({
        id: r.id,
        author: r.customerName,
        rating: r.rating,
        title: `${r.rating}/5`,
        content: r.comment,
        verified: r.isVerified,
        location: '',
        date: new Date(r.date).toLocaleDateString('es-PY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        productDetails: {},
      }));

      setComments(mapped);
      setStats(data.stats);

      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      data.reviews.forEach((r) => {
        if (dist[r.rating] !== undefined) dist[r.rating]++;
      });
      setRatings(dist);

    } catch (error) {
      setError(error.response?.data?.message || 'No se pudieron cargar las reseñas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const handleAddReview = async (reviewData) => {
    try {
      const { data } = await axios.post(`/products/${id}/reviews`, {
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      //mapear respuesta
      const newComment = {
        id: data.id,
        author: data.customerName,
        rating: data.rating,
        title: `${data.rating}/10`,
        content: data.comment,
        verified: data.isVerified,
        location: 'Paraguay',
        date: new Date().toLocaleDateString('es-PY', {
          year: 'numeric', month: 'long', day: 'numeric',
        }),
        productDetails: {},
      };

      setComments([newComment, ...comments]);
      setShowModal(false);
      await fetchReviews(); //recargar para actualizar
      toast.success('¡Reseña enviada exitosamente!');
    }
    catch (error) {
      const data = error.response?.data;
      const message = data?.errors?.auth?.messsage || data?.message || 'No se pudo enviar la reseña.';
      toast.error(message);
    }
  };


  return (
    <div className="min-h-screen p-0" style={{ background: '#F5F5F5' }}>
      <div className="max-w-6xl mx-auto min-h-screen">
        {/* Header - SIN fondo blanco, sobre el fondo gris */}
        <div className="px-6 py-4 flex items-center">
          <ArrowLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-2xl font-bold">Comentarios</h1>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-[300px_1fr] gap-6 px-6 pb-8">
          {/* Sidebar izquierdo */}
          <aside className="flex flex-col gap-4">
            {/* Card de ratings */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <RatingsDistribution ratings={ratings} averageRating={stats?.averageRating ?? 0} /> {/**ahora se le pasa averageRating como prop */}

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
            {loading && (
              <p className="text-gray-500 text-sm">Cargando reseñas...</p>
            )}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            {!loading && !error && (
              <CommentsList comments={comments} />
            )}
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