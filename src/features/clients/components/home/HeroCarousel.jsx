import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const defaultSlides = [
  {
    title: "Explora, filtra y descubre productos responsables",
    description:
      "Catálogo con filtros avanzados por precio, categoría, región, sostenibilidad y tipo de comercio. Vive una experiencia de descubrimiento fluida.",
    imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e",
    ctas: [
      { label: "Ver productos", to: "/busqueda", variant: "primary" },
      { label: "Ver ofertas", to: "/ofertas", variant: "secondary" },
    ],
  },
  {
    title: "Compra con impacto positivo",
    description:
      "Apoya comercios responsables y sostenibles mientras encuentras productos únicos.",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
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
    if (cta.to) { navigate(cta.to); return; }
    if (cta.href) {
      try {
        const url = new URL(cta.href, globalThis.location?.origin);
        if (url.protocol === "http:" || url.protocol === "https:") {
          globalThis.location.assign(url.toString());
        }
      } catch {
      // href inválido: no navegar
      }
    }
  };

  const currentSlide = resolvedSlides[current] ?? resolvedSlides[0];
  const imageUrl = currentSlide?.imageUrl ?? currentSlide?.image ?? "";
  const ctas = Array.isArray(currentSlide?.ctas) ? currentSlide.ctas : [];

  return (
    <div className="w-full px-4 mt-6 sm:mt-10 flex justify-center">
      <div className="w-full max-w-[1254px] rounded-[20px] sm:rounded-[30px] overflow-hidden shadow-lg relative">
        <div className="flex flex-col sm:flex-row sm:h-[334px]">
          <div className="w-full h-[180px] sm:hidden">
            <img src={imageUrl} alt="Slide" className="w-full h-full object-cover" />
          </div>

          <div className="w-full sm:w-1/2 bg-[#8BB2A1] text-white flex flex-col justify-center px-6 py-8 sm:px-16 sm:py-0">
            <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4" style={{ fontWeight: "bold" }}>
              {currentSlide?.title}
            </h2>
            <p className="text-sm text-[#272c2a] mb-5 sm:mb-6 max-w-[480px]">
              {currentSlide?.description}
            </p>

            {ctas.length > 0 && (
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {ctas.map((cta, index) => {
                  const isPrimary = cta.variant !== "secondary" && index === 0;
                  return (
                    <button
                      key={`${cta.label}-${index}`}
                      type="button"
                      className={
                        isPrimary
                          ? "bg-[#6A907F] hover:bg-[#5a7d6f] text-white px-5 py-2 rounded-xl text-sm"
                          : "bg-white hover:bg-gray-100 text-black px-5 py-2 rounded-xl text-sm"
                      }
                      style={{ fontSize: "14px", borderRadius: "12px", cursor: "pointer" }}
                      onClick={() => handleCtaClick(cta)}
                    >
                      {cta.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden sm:block sm:w-1/2">
            <img src={imageUrl} alt="Slide" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {resolvedSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Ir al slide ${index + 1}`}
              aria-current={current === index ? "true" : undefined}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full ${current === index ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};