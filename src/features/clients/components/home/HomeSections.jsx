import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export const HomeSections = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [categoriesStatus, setCategoriesStatus] = useState("idle"); // idle | loading | success | error
  const [categoriesError, setCategoriesError] = useState("");
  const [stores, setStores] = useState([]);
  const [storesStatus, setStoresStatus] = useState("idle"); // idle | loading | success | error
  const [storesError, setStoresError] = useState("");
  const [storesPage, setStoresPage] = useState(0);
  const STORES_PER_PAGE = 5;

  const categoriesEndpoint = useMemo(() => {
    const base = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
    return base ? `${base}/api/categories/products` : "/api/categories/products";
  }, []);

  const storesEndpoint = useMemo(() => {
    const base = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "");
    return base ? `${base}/api/commerces` : "/api/commerces";
  }, []);

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
          error instanceof Error ? error.message : "No se pudieron cargar categorías."
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
    <div className="w-[1254px] mx-auto mt-[50px]">

      {/* ================= CATEGORÍAS ================= */}
      <section className="mb-[60px]">
        <h3 className="font-semibold text-[20px] mb-[25px] text-[#333]"
          style={{ fontSize: "20px", fontWeight: "bold" }}>
          Compra por categorías
        </h3>

        <div className="flex justify-between">
          {categoriesStatus === "loading" && (
            <div className="text-[#666]">Cargando categorías...</div>
          )}

          {categoriesStatus === "error" && (
            <div className="text-red-600">
              No se pudieron cargar categorías{categoriesError ? `: ${categoriesError}` : "."}
            </div>
          )}

          {categoriesStatus === "success" && categories.length === 0 && (
            <div className="text-[#666]">No hay categorías disponibles.</div>
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

      {/* ================= COMERCIOS ================= */}
      <section>
        <h3 className="font-semibold text-[20px] mb-[25px] text-[#333]"
          style={{ fontSize: "20px", fontWeight: "bold" }}>
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
                className="px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed mr-4"
                onClick={() => setStoresPage((prev) => Math.max(0, prev - 1))}
                disabled={storesPage === 0}
              >
                {"<"}
              </button>

              <div className="flex justify-between gap-6 flex-1">
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
                className="px-3 py-1 rounded bg-gray-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed ml-4"
                onClick={() => {
                  const maxPage = Math.max(
                    0,
                    Math.ceil(stores.length / STORES_PER_PAGE) - 1
                  );
                  setStoresPage((prev) => Math.min(maxPage, prev + 1));
                }}
                disabled={
                  storesPage >= Math.ceil(stores.length / STORES_PER_PAGE) - 1
                }
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