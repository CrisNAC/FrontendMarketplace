import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HeroCarousel, defaultSlides } from "../components/home/HeroCarousel";
import { HomeSections } from "../components/home/HomeSections";
import { SellerCTA } from "../components/home/SellerCTA";
import Navbar from "../../../components/navbar/Navbar";
import DeliveryRatingPromptModal from "../components/orders/DeliveryRatingPromptModal";
import { getSession } from "../../commerces/services/editUserProfileApi";
import { fetchActiveBanners } from "../services/bannerApi";
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
  const [bannerSlides, setBannerSlides] = useState([]);

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

  useEffect(() => {
    let isActive = true;

    const loadBanners = async () => {
      try {
        const banners = await fetchActiveBanners({ limit: 5 });
        if (!isActive) return;
        const slides = banners.map((banner) => ({
          title: banner.title,
          description: banner.description ?? "",
          imageUrl: banner.imageUrl,
          ctas: banner.linkUrl
            ? [{ label: "Ver detalle", href: banner.linkUrl, variant: "primary" }]
            : [],
        }));
        setBannerSlides(slides);
      } catch {
        if (isActive) setBannerSlides([]);
      }
    };

    loadBanners();

    return () => {
      isActive = false;
    };
  }, []);

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

  const combinedSlides = useMemo(
    () => [...defaultSlides, ...bannerSlides],
    [bannerSlides]
  );

  return (
    <div className="bg-white">
      <Navbar />
      <HeroCarousel slides={combinedSlides} />
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
