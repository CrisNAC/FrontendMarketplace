import { useMemo, useState } from "react";
import { Star, X } from "lucide-react";

const stars = [1, 2, 3, 4, 5];

const DeliveryRatingPromptModal = ({
  isOpen,
  pendingReviews,
  submitting,
  error,
  onClose,
  onSubmit
}) => {
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const currentPending = useMemo(
    () => (Array.isArray(pendingReviews) && pendingReviews.length > 0 ? pendingReviews[0] : null),
    [pendingReviews]
  );

  if (!isOpen || !currentPending) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      orderId: currentPending.orderId,
      rating: selectedRating,
      comment: comment.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_30px_80px_-30px_rgba(47,91,72,0.42)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        <div className="bg-gradient-to-r from-[#e8efeb] via-[#f3f7f5] to-white px-6 pb-4 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#5a7a69]">
            Tu experiencia importa
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            Califica al delivery
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Pedido #{currentPending.orderId} de {currentPending.storeName}. Te llevo el pedido{" "}
            <span className="font-semibold text-slate-800">{currentPending.deliveryName}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6 pt-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Puntuación
            </label>
            <div className="flex items-center gap-2">
              {stars.map((starValue) => {
                const active = starValue <= (hoveredRating || selectedRating);
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setSelectedRating(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="rounded-md p-1.5 transition hover:bg-[#eef4f0]"
                    aria-label={`Calificar con ${starValue} estrellas`}
                  >
                    <Star
                      size={28}
                      className={active ? "fill-[#f4a942] text-[#f4a942]" : "text-slate-300"}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="delivery-review-comment" className="mb-2 block text-sm font-medium text-slate-700">
              Comentario (opcional)
            </label>
            <textarea
              id="delivery-review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Cuéntanos cómo fue el servicio del delivery"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#769482]/60 focus:ring-2 focus:ring-[#769482]/20"
            />
            <p className="mt-1 text-right text-xs text-slate-400">{comment.length}/1000</p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Ahora no
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#769482] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#769482]/25 transition hover:bg-[#688777] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Guardando..." : "Enviar calificación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryRatingPromptModal;
