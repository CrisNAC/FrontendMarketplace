import { useEffect, useMemo, useState } from "react";
import { HeroCarousel, defaultSlides, HomeSections, SellerCTA } from "@/features/clients/components/home";
import { Navbar } from "@/components";
import { DeliveryRatingPromptModal } from "@/features/clients/components/orders/DeliveryRatingPromptModal";
import { getSession } from "../../commerces/services/editUserProfileApi";
import { fetchActiveBanners } from "@/features/clients/services";
import {
  createDeliveryReview,
  getBackendErrorMessage,
  getPendingDeliveryReviews
} from "../../commerces/services/orderApi";
import { useToast } from "@/hooks";

export const HomePage = () => {
  const { showToast } = useToast();
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [bannerSlides, setBannerSlides] = useState([]);

  useEffect(() => {
    const loadPendingReviews = async () => {
      try {
        const sessionData = await getSession();
        console.log("[DeliveryModal] session:", sessionData?.user?.role);
        if (sessionData?.user?.role !== "CUSTOMER") return;

        const pending = await getPendingDeliveryReviews();
        console.log("[DeliveryModal] pending reviews:", pending);
        if (Array.isArray(pending) && pending.length > 0) {
          setPendingReviews(pending);
          setIsModalOpen(true);
        }
      } catch (err) {
        console.error("[DeliveryModal] error:", err);
      }
    };

    loadPendingReviews();
  }, []);

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
      showToast("Gracias por calificar al delivery.", "success");
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
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>
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
