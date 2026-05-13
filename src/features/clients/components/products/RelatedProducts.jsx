import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import apiClient from "../../../../lib/apiClient";
import { formatGuarani } from "../../../../lib/formatGuarani";

/**
 * Componente de carrusel de productos relacionados.
 * Muestra productos de la misma categoría, excluyendo el actual.
 *
 * Props:
 *   - productId: número del producto actual
 *   - limit: número máximo de productos (default: 8)
 */
export default function RelatedProducts({ productId, limit = 8 }) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Cargar productos relacionados
  useEffect(() => {
    if (!productId || !Number.isFinite(productId)) {
      setRelatedProducts([]);
      setLoading(false);
      return;
    }

    let isActive = true;

    const fetchRelated = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.get(`/products/${productId}/related`, {
          params: { limit },
        });

        if (!isActive) return;

        setRelatedProducts(response.data || []);
      } catch (err) {
        if (!isActive) return;
        console.error("Error al obtener productos relacionados:", err);
        setRelatedProducts([]);
        // No mostramos error en UI, simplemente no renderizamos nada
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchRelated();
    return () => {
      isActive = false;
    };
  }, [productId, limit]);

  // Detectar si se puede hacer scroll
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [relatedProducts]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 320; // ancho de tarjeta + gap
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // No renderizar si no hay productos o está cargando
  if (loading || relatedProducts.length === 0) {
    return null;
  }

  if (error) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-[#d0d7d2]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[20px] font-semibold text-[#2f3e39]">
          Inspirado en tu historial
        </h2>

        {/* Botones de scroll - solo visibles si hay suficientes productos */}
        {relatedProducts.length > 3 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="p-2 rounded-lg border border-[#d1d5db] bg-white hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Desplazar izquierda"
            >
              <ChevronLeft size={20} className="text-[#374151]" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="p-2 rounded-lg border border-[#d1d5db] bg-white hover:bg-[#f3f4f6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Desplazar derecha"
            >
              <ChevronRight size={20} className="text-[#374151]" />
            </button>
          </div>
        )}
      </div>

      {/* Carrusel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {relatedProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => navigate(`/productos/${product.id}`)}
            className="flex-shrink-0 w-[280px] rounded-lg overflow-hidden border border-[#d8dfdb] bg-white hover:shadow-md transition-shadow cursor-pointer"
            type="button"
          >
            {/* Imagen */}
            <div className="relative h-[200px] bg-[#f0f2f1] overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#9ca3af] text-[12px]">
                  Sin imagen
                </div>
              )}

              {/* Badge "Oferta" */}
              {product.isOffer && (
                <div className="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-semibold px-2 py-1 rounded-full">
                  Oferta
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="p-3">
              {/* Nombre */}
              <h3 className="text-[13px] font-semibold text-[#1f2e27] line-clamp-2 mb-1">
                {product.name}
              </h3>

              {/* Categoría */}
              {product.categories && product.categories.length > 0 && (
                <p className="text-[11px] text-[#6b7280] mb-2">
                  {product.categories[0].name}
                </p>
              )}

              {/* Precio */}
              <div className="mb-2">
                {product.isOffer ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[#1f2e27]">
                      {formatGuarani(product.offerPrice)}
                    </span>
                    <span className="text-[12px] text-[#9ca3af] line-through">
                      {formatGuarani(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-[14px] font-semibold text-[#1f2e27]">
                    {formatGuarani(product.price)}
                  </span>
                )}
              </div>

              {/* Rating */}
              {product.averageRating !== undefined && product.averageRating !== null && (
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-semibold text-yellow-500">
                    ★ {product.averageRating.toFixed(1)}
                  </span>
                  {product.reviewCount > 0 && (
                    <span className="text-[11px] text-[#6b7280]">
                      ({product.reviewCount})
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}