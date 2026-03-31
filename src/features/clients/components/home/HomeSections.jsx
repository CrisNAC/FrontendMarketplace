import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchProductCard } from "../search/SearchProductCard";

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
  const [storesPage, setStoresPage] = useState(0);
  const STORES_PER_PAGE = 5;

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
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

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

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

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

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

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
    if (!category?.id) return;
    navigate(
      `/busqueda?categoryId=${category.id}&categoryName=${encodeURIComponent(
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
    <div className="w-full max-w-[1254px] px-4 mx-auto mt-[50px]">
      <section className="mb-[60px]">
        <h3
          className="font-semibold text-[20px] mb-[25px] text-[#333]"
          style={{ fontSize: "20px", fontWeight: "bold" }}
        >
          Compra por categorias
        </h3>

        <div className="flex justify-between">
          {categoriesStatus === "loading" && (
            <div className="text-[#666]">Cargando categorias...</div>
          )}

          {categoriesStatus === "error" && (
            <div className="text-red-600">
              No se pudieron cargar categorias{categoriesError ? `: ${categoriesError}` : "."}
            </div>
          )}

          {categoriesStatus === "success" && categories.length === 0 && (
            <div className="text-[#666]">No hay categorias disponibles.</div>
          )}

          {categoriesStatus === "success" &&
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex flex-col items-center gap-[10px] cursor-pointer"
                onClick={() => handleCategoryClick(cat)}
              >
                <div className="w-[150px] h-[150px] rounded-full flex items-center justify-center bg-[#D9D9D9] text-black font-semibold text-[18px] transition duration-300 hover:scale-105 select-none">
                  {(cat.name || "").slice(0, 1).toUpperCase()}
                </div>
                <span className="text-center">{cat.name}</span>
              </div>
            ))}
        </div>
      </section>

      <section className="mb-[60px] rounded-[28px] border border-[#E4D7C6] bg-[#FBF3EA] px-8 py-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3
              className="font-semibold text-[20px] text-[#333]"
              style={{ fontSize: "20px", fontWeight: "bold" }}
            >
              Ofertas
            </h3>
            <p className="mt-2 text-sm text-[#6b7280]">
              Productos con descuento disponibles ahora mismo.
            </p>
          </div>

          <button
            type="button"
            className="w-fit rounded-full bg-[#B75D4B] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9F4C3B]"
            onClick={() => navigate("/ofertas")}
          >
            Ver todas las ofertas
          </button>
        </div>

        {offersStatus === "loading" && (
          <div className="text-[#666]">Cargando ofertas...</div>
        )}

        {offersStatus === "error" && (
          <div className="text-red-600">
            No se pudieron cargar ofertas{offersError ? `: ${offersError}` : "."}
          </div>
        )}

        {offersStatus === "success" && offers.length === 0 && (
          <div className="text-[#666]">No hay ofertas disponibles en este momento.</div>
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
        <h3
          className="font-semibold text-[20px] mb-[25px] text-[#333]"
          style={{ fontSize: "20px", fontWeight: "bold" }}
        >
          Comercios
        </h3>

        <div className="flex justify-between items-center">
          {storesStatus === "loading" && (
            <div className="text-[#666]">Cargando comercios...</div>
          )}

          {storesStatus === "error" && (
            <div className="text-red-600">
              No se pudieron cargar comercios{storesError ? `: ${storesError}` : "."}
            </div>
          )}

          {storesStatus === "success" && stores.length === 0 && (
            <div className="text-[#666]">No hay comercios disponibles.</div>
          )}

          {storesStatus === "success" && stores.length > 0 && (
            <>
              <button
                type="button"
                className="mr-4 rounded bg-gray-200 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setStoresPage((prev) => Math.max(0, prev - 1))}
                disabled={storesPage === 0}
              >
                {"<"}
              </button>

              <div className="flex flex-1 justify-between gap-6">
                {stores
                  .slice(
                    storesPage * STORES_PER_PAGE,
                    storesPage * STORES_PER_PAGE + STORES_PER_PAGE
                  )
                  .map((store) => (
                    <div key={store.id_store} className="flex flex-col items-center gap-[10px]">
                      <div
                        className="w-[150px] h-[150px] rounded-full flex items-center justify-center font-semibold text-[18px] cursor-pointer transition duration-300 hover:scale-105 bg-[#6A907F] text-black"
                        onClick={() => handleCommerceClick(store)}
                      >
                        {(store.name || "").slice(0, 1).toUpperCase()}
                      </div>
                      <span className="text-center">{store.name}</span>
                    </div>
                  ))}
              </div>

              <button
                type="button"
                className="ml-4 rounded bg-gray-200 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => {
                  const maxPage = Math.max(
                    0,
                    Math.ceil(stores.length / STORES_PER_PAGE) - 1
                  );
                  setStoresPage((prev) => Math.min(maxPage, prev + 1));
                }}
                disabled={storesPage >= Math.ceil(stores.length / STORES_PER_PAGE) - 1}
              >
                {">"}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
