import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HeroCarousel } from "../components/home/HeroCarousel";
import { HomeSections } from "../components/home/HomeSections";
import { SellerCTA } from "../components/home/SellerCTA";
import Navbar from "../../../components/navbar/Navbar";
import DeliveryRatingPromptModal from "../components/orders/DeliveryRatingPromptModal";
import { getSession } from "../../commerces/services/editUserProfileApi";
import {
  createDeliveryReview,
  getBackendErrorMessage,
  getPendingDeliveryReviews
} from "../../commerces/services/orderApi";

export const HomePage = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const shouldCheckPrompt = useMemo(
    () => sessionStorage.getItem("showDeliveryReviewPrompt") === "1",
    []
  );

  useEffect(() => {
    const loadPendingReviews = async () => {
      if (!shouldCheckPrompt) return;
      sessionStorage.removeItem("showDeliveryReviewPrompt");

      try {
        const sessionData = await getSession();
        if (sessionData?.user?.role !== "CUSTOMER") return;

        const pending = await getPendingDeliveryReviews();
        if (Array.isArray(pending) && pending.length > 0) {
          setPendingReviews(pending);
          setIsModalOpen(true);
        }
      } catch {
        // Si falla el chequeo, no interrumpir la experiencia del home.
      }
    };

    loadPendingReviews();
  }, [shouldCheckPrompt]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmitError(null);
  };

  const handleSubmitReview = async ({ orderId, rating, comment }) => {
    try {
      setSubmitError(null);
      setSubmitting(true);

      await createDeliveryReview(orderId, { rating, comment });

      setPendingReviews((current) => {
        const remaining = current.filter((item) => item.orderId !== orderId);
        setIsModalOpen(remaining.length > 0);
        return remaining;
      });
      toast.success("Gracias por calificar al delivery.");
    } catch (error) {
      setSubmitError(getBackendErrorMessage(error, "No se pudo guardar la calificación"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      <Navbar />
      <HeroCarousel />
      <HomeSections />
      <SellerCTA />
      <DeliveryRatingPromptModal
        isOpen={isModalOpen}
        pendingReviews={pendingReviews}
        submitting={submitting}
        error={submitError}
        onClose={handleCloseModal}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
};
