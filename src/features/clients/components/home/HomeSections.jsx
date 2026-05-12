import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SearchProductCard } from "../search/SearchProductCard";

const scrollerArrowClass =
  "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#EEE4D8] bg-white/90 text-[#5F5A55] shadow-[0_6px_20px_rgba(121,100,80,0.10)] backdrop-blur-sm transition-all duration-300 hover:bg-[#FFF9F3] hover:shadow-[0_10px_24px_rgba(121,100,80,0.14)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40";

function HorizontalScroller({ children, watchKey, className = "" }) {
  const scrollerRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const refreshEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 4) {
      setShowLeft(false);
      setShowRight(false);
      return;
    }

    setShowLeft(scrollLeft > 4);
    setShowRight(scrollLeft < maxScroll - 4);
  }, []);

  useLayoutEffect(() => {
    refreshEdges();
  }, [refreshEdges, watchKey]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => refreshEdges());
    ro.observe(el);
    el.addEventListener("scroll", refreshEdges, { passive: true });

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", refreshEdges);
    };
  }, [refreshEdges]);

  const scrollToAlignedStep = (forward) => {
    const el = scrollerRef.current;
    if (!el) return;

    const firstChild = el.children[0];
    if (!firstChild) return;

    const childWidth = firstChild.getBoundingClientRect().width;
    const styles = window.getComputedStyle(el);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const amount = childWidth + gap;

    el.scrollBy({
      left: forward ? amount : -amount,
      behavior: "smooth",
    });
  };

  const gutter = showLeft || showRight;

  return (
    <div className={`relative ${gutter ? "px-12 sm:px-14" : ""} ${className}`}>
      {showLeft && (
        <button
          type="button"
          aria-label="Desplazar a la izquierda"
          className={`${scrollerArrowClass} left-0 sm:left-1`}
          onClick={() => scrollToAlignedStep(false)}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
        </button>
      )}

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-7 overflow-x-auto scroll-smooth px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {showRight && (
        <button
          type="button"
          aria-label="Desplazar a la derecha"
          className={`${scrollerArrowClass} right-0 sm:right-1`}
          onClick={() => scrollToAlignedStep(true)}
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
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

  const categoriesEndpoint = useMemo(() => {
    return apiBase ? `${apiBase}/api/categories/products` : "/api/categories/products";
  }, [apiBase]);

  const offersEndpoint = useMemo(() => {
    return apiBase ? `${apiBase}/products` : "/products";
  }, [apiBase]);

  const storesEndpoint = useMemo(() => {
    return apiBase ? `${apiBase}/api/commerces` : "/api/commerces";
  }, [apiBase]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        setCategoriesStatus("loading");
        setCategoriesError("");

        const response = await fetch(categoriesEndpoint, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

        const data = await response.json();
        const list = Array.isArray(data) ? data : [];

        if (!isActive) return;
        setCategories(list);
        setCategoriesStatus("success");
      } catch (error) {
        if (error?.name === "AbortError") return;
        if (!isActive) return;

        setCategories([]);
        setCategoriesStatus("error");
        setCategoriesError(
          error instanceof Error ? error.message : "No se pudieron cargar categorias."
        );
      }
    };

    load();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [categoriesEndpoint]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        setOffersStatus("loading");
        setOffersError("");

        const url = new URL(offersEndpoint, window.location.origin);
        url.searchParams.set("isOffer", "true");
        url.searchParams.set("limit", "4");

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

        const data = await response.json();
        const list = Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data)
            ? data
            : [];

        if (!isActive) return;
        setOffers(list);
        setOffersStatus("success");
      } catch (error) {
        if (error?.name === "AbortError") return;
        if (!isActive) return;

        setOffers([]);
        setOffersStatus("error");
        setOffersError(
          error instanceof Error ? error.message : "No se pudieron cargar ofertas."
        );
      }
    };

    load();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [offersEndpoint]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        setStoresStatus("loading");
        setStoresError("");

        const response = await fetch(storesEndpoint, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

        const data = await response.json();
        const list = Array.isArray(data) ? data : [];

        if (!isActive) return;
        setStores(list);
        setStoresStatus("success");
      } catch (error) {
        if (error?.name === "AbortError") return;
        if (!isActive) return;

        setStores([]);
        setStoresStatus("error");
        setStoresError(
          error instanceof Error ? error.message : "No se pudieron cargar comercios."
        );
      }
    };

    load();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [storesEndpoint]);

  const handleCategoryClick = (category) => {
    const id = category?.id_product_category ?? category?.id;
    if (!id) return;
    navigate(
      `/busqueda?categoryId=${id}&categoryName=${encodeURIComponent(
        category.name || ""
      )}`
    );
  };

  const handleCommerceClick = (store) => {
    if (!store?.id_store) return;
    navigate(
      `/perfil-comercio?storeId=${store.id_store}&storeName=${encodeURIComponent(
        store.name || ""
      )}`
    );
  };

  return (
    <div className="w-full max-w-[1254px] px-4 mx-auto mt-[56px]">
      <section className="mb-[72px]">
        <h3 className="mb-[28px] text-[22px] font-semibold tracking-[-0.02em] text-[#2F3A34]">
          Compra por categorías
        </h3>

        {categoriesStatus === "loading" && (
          <div className="text-sm text-[#7A7A7A]">Cargando categorías...</div>
        )}

        {categoriesStatus === "error" && (
          <div className="text-sm text-red-600">
            No se pudieron cargar categorías{categoriesError ? `: ${categoriesError}` : "."}
          </div>
        )}

        {categoriesStatus === "success" && categories.length === 0 && (
          <div className="text-sm text-[#7A7A7A]">No hay categorías disponibles.</div>
        )}

        {categoriesStatus === "success" && categories.length > 0 && (
          <HorizontalScroller watchKey={`${categoriesStatus}-${categories.length}`}>
            {categories.map((cat) => (
              <div
                key={cat.id_product_category ?? cat.id}
                className="group flex w-[152px] flex-shrink-0 snap-start flex-col items-center gap-3 cursor-pointer"
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="flex h-[152px] w-[152px] select-none items-center justify-center rounded-full border border-[#EFE7DD] bg-[radial-gradient(circle_at_top,_#FFFDFB,_#F5EEE6)] text-[18px] font-semibold text-[#5A5148] shadow-[0_8px_24px_rgba(120,102,84,0.08)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(120,102,84,0.12)]">
                  {(cat.name || "").slice(0, 1).toUpperCase()}
                </div>

                <span className="max-w-[145px] text-center text-[14px] font-medium leading-snug text-[#5B5B5B] transition-colors duration-300 group-hover:text-[#3E4B43]">
                  {cat.name}
                </span>
              </div>
            ))}
          </HorizontalScroller>
        )}
      </section>

      <section className="mb-[72px] rounded-[32px] border border-[#F0E6DA] bg-[linear-gradient(180deg,_#FFFDFB_0%,_#FCF6EF_100%)] px-8 py-9 shadow-[0_10px_30px_rgba(142,117,90,0.08)]">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-[22px] font-semibold tracking-[-0.02em] text-[#2F3A34]">
              Ofertas
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#7A746D]">
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
          <div className="text-sm text-[#7A7A7A]">Cargando ofertas...</div>
        )}

        {offersStatus === "error" && (
          <div className="text-sm text-red-600">
            No se pudieron cargar ofertas{offersError ? `: ${offersError}` : "."}
          </div>
        )}

        {offersStatus === "success" && offers.length === 0 && (
          <div className="text-sm text-[#7A7A7A]">No hay ofertas disponibles en este momento.</div>
        )}

        {offersStatus === "success" && offers.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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
                  resolveApiAssetUrl(
                    offer.image_url ?? offer.imageUrl ?? null,
                    apiBase || window.location.origin
                  ) || "https://placehold.co/600x600?text=Oferta"
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-[28px] text-[22px] font-semibold tracking-[-0.02em] text-[#2F3A34]">
          Comercios
        </h3>

        {storesStatus === "loading" && (
          <div className="text-sm text-[#7A7A7A]">Cargando comercios...</div>
        )}

        {storesStatus === "error" && (
          <div className="text-sm text-red-600">
            No se pudieron cargar comercios{storesError ? `: ${storesError}` : "."}
          </div>
        )}

        {storesStatus === "success" && stores.length === 0 && (
          <div className="text-sm text-[#7A7A7A]">No hay comercios disponibles.</div>
        )}

        {storesStatus === "success" && stores.length > 0 && (
          <HorizontalScroller watchKey={`${storesStatus}-${stores.length}`}>
            {stores.map((store) => {
              const logoUrl = store.logo
                ? resolveApiAssetUrl(store.logo, apiBase || window.location.origin)
                : null;

              return (
                <div
                  key={store.id_store}
                  className="group flex w-[152px] flex-shrink-0 snap-start flex-col items-center gap-3"
                >
                  <div
                    className="flex h-[152px] w-[152px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#DCE7E0] bg-[radial-gradient(circle_at_top,_#F7FBF8,_#DDEBE2)] text-[18px] font-semibold text-[#476253] shadow-[0_8px_24px_rgba(94,128,108,0.10)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_30px_rgba(94,128,108,0.14)]"
                    onClick={() => handleCommerceClick(store)}
                  >
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={store.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement.innerText = (store.name || "")
                            .slice(0, 1)
                            .toUpperCase();
                        }}
                      />
                    ) : (
                      (store.name || "").slice(0, 1).toUpperCase()
                    )}
                  </div>

                  <span className="max-w-[145px] text-center text-[14px] font-medium leading-snug text-[#5B5B5B] transition-colors duration-300 group-hover:text-[#3E4B43]">
                    {store.name}
                  </span>
                </div>
              );
            })}
          </HorizontalScroller>
        )}
      </section>
    </div>
  );
};