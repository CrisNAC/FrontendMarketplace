import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const defaultSlides = [
  {
    title: "Explora, filtra y descubre productos responsables",
    description:
      "Catálogo con filtros avanzados por precio, categoría, región, sostenibilidad y tipo de comercio. Vive una experiencia de descubrimiento fluida.",
    imageUrl:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e",
    ctas: [
      { label: "Ver productos", to: "/busqueda", variant: "primary" },
      { label: "Ver ofertas", to: "/ofertas", variant: "secondary" },
    ],
  },
  {
    title: "Compra con impacto positivo",
    description:
      "Apoya comercios responsables y sostenibles mientras encuentras productos únicos.",
    imageUrl:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
    ctas: [
      { label: "Ver productos", to: "/busqueda", variant: "primary" },
    ],
  },
];

export const HeroCarousel = ({ slides = [] }) => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const resolvedSlides = slides.length > 0 ? slides : defaultSlides;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === resolvedSlides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [resolvedSlides.length]);

  useEffect(() => {
    setCurrent(0);
  }, [resolvedSlides.length]);

  const handleCtaClick = (cta) => {
    if (!cta) return;
    if (cta.to) {
      navigate(cta.to);
      return;
    }
    if (cta.href) {
      window.location.href = cta.href;
    }
  };

  const currentSlide = resolvedSlides[current] ?? resolvedSlides[0];
  const imageUrl = currentSlide?.imageUrl ?? currentSlide?.image ?? "";
  const ctas = Array.isArray(currentSlide?.ctas) ? currentSlide.ctas : [];

  return (
    <div className="flex justify-center mt-10">
      <div className="w-[1254px] h-[334px] rounded-[30px] overflow-hidden shadow-lg relative">

        {/* Slide */}
        <div className="flex h-full transition-all duration-500">

          {/* Left Side */}
          <div className="w-1/2 bg-[#8BB2A1] text-white flex flex-col justify-center px-16">
            <h2 className="text-2xl font-bold mb-4"  style={{fontSize: "25px", fontWeight: "bold" }}>
              {currentSlide?.title}
            </h2>
            <p className="text-sm text-[#272c2a] mb-6 max-w-[480px]">
              {currentSlide?.description}
            </p>

            {ctas.length > 0 && (
              <div className="flex gap-4">
                {ctas.map((cta, index) => {
                  const isPrimary = cta.variant !== "secondary" && index === 0;
                  return (
                    <button
                      key={`${cta.label}-${index}`}
                      type="button"
                      className={
                        isPrimary
                          ? "bg-[#6A907F] hover:bg-[#5a7d6f] text-white px-6 py-2 rounded-xl text-sm"
                          : "bg-white hover:bg-gray-100 text-black px-6 py-2 rounded-xl text-sm"
                      }
                      style={{
                        fontSize: "14px",
                        borderRadius: "12px",
                        cursor: "pointer"
                      }}
                      onClick={() => handleCtaClick(cta)}
                    >
                      {cta.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="w-1/2">
            <img
              src={imageUrl}
              alt="Slide"
              className="w-full h-full object-cover"
            />
          </div>

        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {resolvedSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full ${
                current === index
                  ? "bg-white"
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
