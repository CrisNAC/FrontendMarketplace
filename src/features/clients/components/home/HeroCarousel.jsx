import { useState, useEffect } from "react";

const slides = [
  {
    title: "Explora, filtra y descubre productos responsables",
    description:
      "Catálogo con filtros avanzados por precio, categoría, región, sostenibilidad y tipo de comercio. Vive una experiencia de descubrimiento fluida.",
    image:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e",
  },
  {
    title: "Compra con impacto positivo",
    description:
      "Apoya comercios responsables y sostenibles mientras encuentras productos únicos.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
  },
];

export const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center mt-10">
      <div className="w-[1254px] h-[334px] rounded-[30px] overflow-hidden shadow-lg relative">

        {/* Slide */}
        <div className="flex h-full transition-all duration-500">

          {/* Left Side */}
          <div className="w-1/2 bg-[#8BB2A1] text-white flex flex-col justify-center px-16">
            <h2 className="text-2xl font-bold mb-4"  style={{fontSize: "25px", fontWeight: "bold" }}>
              {slides[current].title}
            </h2>
            <p className="text-sm text-[#272c2a] mb-6 max-w-[480px]">
              {slides[current].description}
            </p>

            <div className="flex gap-4">
              <button className="bg-[#6A907F] hover:bg-[#5a7d6f] text-white px-6 py-2 rounded-xl text-sm"
                style={{
                  fontSize: "14px",
                  borderRadius: "12px",
                  cursor: "pointer"
                }}>
                Ver productos
              </button>
              <button className="bg-white hover:bg-gray-100 text-black px-6 py-2 rounded-xl text-sm"
              style={{
                  fontSize: "14px",
                  borderRadius: "12px",
                  cursor: "pointer"
                }}>
                Ver ofertas
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-1/2">
            <img
              src={slides[current].image}
              alt="Slide"
              className="w-full h-full object-cover"
            />
          </div>

        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
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