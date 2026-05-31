// src/features/clients/components/home/HomeSections.jsx
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SearchProductCard } from "../search/SearchProductCard";
import { ProductCardSkeleton } from "../../../../components/ProductCardSkeleton";
import { CategoryIcon } from "../../../admin/components/CategoryIconPicker";

const scrollerArrowClass =
  "absolute top-1/2 z-10 flex h-9 w-9 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#EEE4D8] bg-white/90 text-[#5F5A55] shadow-[0_6px_20px_rgba(121,100,80,0.10)] backdrop-blur-sm transition-all duration-300 hover:bg-[#FFF9F3] hover:shadow-[0_10px_24px_rgba(121,100,80,0.14)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40";

function HorizontalScroller({ children, watchKey, className = "" }) {
  const scrollerRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const refreshEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 4) { setShowLeft(false); setShowRight(false); return; }
    setShowLeft(scrollLeft > 4);
    setShowRight(scrollLeft < maxScroll - 4);
  }, []);

  useLayoutEffect(() => { refreshEdges(); }, [refreshEdges, watchKey]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => refreshEdges());
    ro.observe(el);
    el.addEventListener("scroll", refreshEdges, { passive: true });
    return () => { ro.disconnect(); el.removeEventListener("scroll", refreshEdges); };
  }, [refreshEdges]);

  const scrollToAlignedStep = (forward) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstChild = el.children[0];
    if (!firstChild) return;
    const childWidth = firstChild.getBoundingClientRect().width;
    const styles = window.getComputedStyle(el);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    el.scrollBy({ left: forward ? childWidth + gap : -(childWidth + gap), behavior: "smooth" });
  };

  const gutter = showLeft || showRight;

  return (
    <div className={`relative ${gutter ? "px-10 sm:px-12 md:px-14" : ""} ${className}`}>
      {showLeft && (
        <button type="button" aria-label="Desplazar a la izquierda"
          className={`${scrollerArrowClass} left-0 sm:left-1`}
          onClick={() => scrollToAlignedStep(false)}>
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.8} />
        </button>
      )}
      <div ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 sm:gap-7 overflow-x-auto scroll-smooth px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      {showRight && (
        <button type="button" aria-label="Desplazar a la derecha"
          className={`${scrollerArrowClass} right-0 sm:right-1`}
          onClick={() => scrollToAlignedStep(true)}>
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}

function resolveApiAssetUrl(path, apiBase) {
  if (!path || typeof path !== "string" || !path.trim()) return undefined;
  const value = path.trim();
  if (/^https?:\/\//i.test(value)) return value;
  const base = apiBase.replace(/\/$/, "");
  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
}

export const HomeSections = () => {
  const navigate = useNavigate();

  const apiBase = useMemo(() => {
    return (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
  }, []);

  const [categories, setCategories] = useState([]);
  const [categoriesStatus, setCategoriesStatus] = useState("idle");
  const [categoriesError, setCategoriesError] = useState("");
  const [offers, setOffers] = useState([]);
  const [offersStatus, setOffersStatus] = useState("idle");
  const [offersError, setOffersError] = useState("");
  const [stores, setStores] = useState([]);
  const [storesStatus, setStoresStatus] = useState("idle");
  const [storesError, setStoresError] = useState("");
  const [brokenStoreLogos, setBrokenStoreLogos] = useState(() => new Set());

  const categoriesEndpoint = useMemo(() => apiBase ? `${apiBase}/api/categories/products` : "/api/categories/products", [apiBase]);
  const offersEndpoint     = useMemo(() => apiBase ? `${apiBase}/products` : "/products", [apiBase]);
  const storesEndpoint     = useMemo(() => apiBase ? `${apiBase}/api/commerces` : "/api/commerces", [apiBase]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const load = async () => {
      try {
        setCategoriesStatus("loading"); setCategoriesError("");
        const response = await fetch(categoriesEndpoint, { signal: controller.signal, headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
        const data = await response.json();
        if (!isActive) return;
        setCategories(Array.isArray(data) ? data : []);
        setCategoriesStatus("success");
      } catch (error) {
        if (error?.name === "AbortError" || !isActive) return;
        setCategories([]); setCategoriesStatus("error");
        setCategoriesError(error instanceof Error ? error.message : "No se pudieron cargar categorias.");
      }
    };
    load();
    return () => { isActive = false; controller.abort(); };
  }, [categoriesEndpoint]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const load = async () => {
      try {
        setOffersStatus("loading"); setOffersError("");
        const url = new URL(offersEndpoint, window.location.origin);
        url.searchParams.set("isOffer", "true");
        url.searchParams.set("limit", "4");
        const response = await fetch(url.toString(), { signal: controller.signal, headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
        const data = await response.json();
        if (!isActive) return;
        setOffers(Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : []);
        setOffersStatus("success");
      } catch (error) {
        if (error?.name === "AbortError" || !isActive) return;
        setOffers([]); setOffersStatus("error");
        setOffersError(error instanceof Error ? error.message : "No se pudieron cargar ofertas.");
      }
    };
    load();
    return () => { isActive = false; controller.abort(); };
  }, [offersEndpoint]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const load = async () => {
      try {
        setStoresStatus("loading"); setStoresError("");
        const response = await fetch(storesEndpoint, { signal: controller.signal, headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
        const data = await response.json();
        if (!isActive) return;
        setStores(Array.isArray(data) ? data : []);
        setStoresStatus("success");
      } catch (error) {
        if (error?.name === "AbortError" || !isActive) return;
        setStores([]); setStoresStatus("error");
        setStoresError(error instanceof Error ? error.message : "No se pudieron cargar comercios.");
      }
    };
    load();
    return () => { isActive = false; controller.abort(); };
  }, [storesEndpoint]);

  const handleCategoryClick = (category) => {
    const id = category?.id;
    if (!id) return;
    navigate(`/busqueda?categoryId=${id}&categoryName=${encodeURIComponent(category.name || "")}`);
  };

  const handleCommerceClick = (store) => {
    if (!store?.id_store) return;
    navigate(`/perfil-comercio?storeId=${store.id_store}&storeName=${encodeURIComponent(store.name || "")}`);
  };

  return (
    <div className="w-full max-w-[1254px] px-4 mx-auto mt-10 sm:mt-[56px]">

      {/* ── Categorías ── */}
      <section className="mb-12 sm:mb-[72px]">
        <h3 className="mb-5 sm:mb-[28px] text-[18px] sm:text-[22px] font-semibold tracking-[-0.02em] text-[#2F3A34]">
          Compra por categorías
        </h3>

        {categoriesStatus === "loading" && <div className="text-sm text-[#7A7A7A]">Cargando categorías...</div>}
        {categoriesStatus === "error" && (
          <div className="text-sm text-red-600">No se pudieron cargar categorías{categoriesError ? `: ${categoriesError}` : "."}</div>
        )}
        {categoriesStatus === "success" && categories.length === 0 && (
          <div className="text-sm text-[#7A7A7A]">No hay categorías disponibles.</div>
        )}

        {categoriesStatus === "success" && categories.length > 0 && (
          <HorizontalScroller watchKey={`${categoriesStatus}-${categories.length}`}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className="group flex w-[110px] sm:w-[152px] flex-shrink-0 snap-start flex-col items-center gap-2 sm:gap-3 cursor-pointer bg-transparent border-none p-0"
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="flex h-[110px] w-[110px] sm:h-[152px] sm:w-[152px] select-none items-center justify-center rounded-full border border-[#EFE7DD] bg-[radial-gradient(circle_at_top,_#FFFDFB,_#F5EEE6)] text-[16px] sm:text-[18px] font-semibold text-[#5A5148] shadow-[0_8px_24px_rgba(120,102,84,0.08)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(120,102,84,0.12)]">
                  {cat.icon
                    ? <CategoryIcon name={cat.icon} size={36} color="#5A5148" />
                    : (cat.name || "").slice(0, 1).toUpperCase()
                  }
                </div>
                <span className="max-w-[110px] sm:max-w-[145px] text-center text-[12px] sm:text-[14px] font-medium leading-snug text-[#5B5B5B] transition-colors duration-300 group-hover:text-[#3E4B43]">
                  {cat.name}
                </span>
              </button>
            ))}
          </HorizontalScroller>
        )}
      </section>

      {/* ── Ofertas ── */}
      <section className="mb-12 sm:mb-[72px] rounded-[20px] sm:rounded-[32px] border border-[#F0E6DA] bg-[linear-gradient(180deg,_#FFFDFB_0%,_#FCF6EF_100%)] px-5 py-7 sm:px-8 sm:py-9 shadow-[0_10px_30px_rgba(142,117,90,0.08)]">
        <div className="mb-5 sm:mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[18px] sm:text-[22px] font-semibold tracking-[-0.02em] text-[#2F3A34]">Ofertas</h3>
            <p className="mt-1 sm:mt-2 text-sm leading-relaxed text-[#7A746D]">
              Productos con descuento disponibles ahora mismo.
            </p>
          </div>
          <button
            type="button"
            className="w-fit rounded-full border border-[#E7CFC3] bg-white px-5 py-2.5 text-sm font-semibold text-[#9E5A49] shadow-sm transition-all duration-300 hover:bg-[#FFF7F2] hover:shadow-md"
            onClick={() => navigate("/ofertas")}
          >
            Ver todas las ofertas
          </button>
        </div>

        {offersStatus === "loading" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} variant="search" />)}
          </div>
        )}
        {offersStatus === "error" && (
          <div className="text-sm text-red-600">No se pudieron cargar ofertas{offersError ? `: ${offersError}` : "."}</div>
        )}
        {offersStatus === "success" && offers.length === 0 && (
          <div className="text-sm text-[#7A7A7A]">No hay ofertas disponibles en este momento.</div>
        )}
        {offersStatus === "success" && offers.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
            {offers.map((offer) => (
              <SearchProductCard
                key={offer.id_product}
                productId={offer.id_product}
                name={offer.name}
                price={offer.price}
                isOffer={offer.is_offer}
                offerPrice={offer.offer_price}
                originalPrice={offer.original_price}
                imageUrl={
                  resolveApiAssetUrl(offer.image_url ?? offer.imageUrl ?? null, apiBase || window.location.origin)
                  || "https://placehold.co/600x600?text=Oferta"
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Comercios ── */}
      <section className="mb-12 sm:mb-0">
        <h3 className="mb-5 sm:mb-[28px] text-[18px] sm:text-[22px] font-semibold tracking-[-0.02em] text-[#2F3A34]">
          Comercios
        </h3>

        {storesStatus === "loading" && <div className="text-sm text-[#7A7A7A]">Cargando comercios...</div>}
        {storesStatus === "error" && (
          <div className="text-sm text-red-600">No se pudieron cargar comercios{storesError ? `: ${storesError}` : "."}</div>
        )}
        {storesStatus === "success" && stores.length === 0 && (
          <div className="text-sm text-[#7A7A7A]">No hay comercios disponibles.</div>
        )}

        {storesStatus === "success" && stores.length > 0 && (
          <HorizontalScroller watchKey={`${storesStatus}-${stores.length}`}>
            {stores.map((store) => {
              const hasBrokenLogo = brokenStoreLogos.has(store.id_store);
              const logoUrl = store.logo && !hasBrokenLogo
                ? resolveApiAssetUrl(store.logo, apiBase || window.location.origin)
                : null;
              return (
                <button
                  key={store.id_store}
                  type="button"
                  className="group flex w-[110px] sm:w-[152px] flex-shrink-0 snap-start flex-col items-center gap-2 sm:gap-3 bg-transparent border-none p-0 cursor-pointer"
                  onClick={() => handleCommerceClick(store)}
                >
                  <div className="flex h-[110px] w-[110px] sm:h-[152px] sm:w-[152px] items-center justify-center overflow-hidden rounded-full border border-[#DCE7E0] bg-[radial-gradient(circle_at_top,_#F7FBF8,_#DDEBE2)] text-[16px] sm:text-[18px] font-semibold text-[#476253] shadow-[0_8px_24px_rgba(94,128,108,0.10)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(94,128,108,0.14)]">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={store.name}
                        className="h-full w-full object-cover"
                        onError={() =>
                          setBrokenStoreLogos((prev) => {
                            const next = new Set(prev);
                            next.add(store.id_store);
                            return next;
                          })
                        }
                      />
                    ) : (
                      (store.name || "").slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <span className="max-w-[110px] sm:max-w-[145px] text-center text-[12px] sm:text-[14px] font-medium leading-snug text-[#5B5B5B] transition-colors duration-300 group-hover:text-[#3E4B43]">
                    {store.name}
                  </span>
                </button>
              );
            })}
          </HorizontalScroller>
        )}
      </section>

    </div>
  );
};