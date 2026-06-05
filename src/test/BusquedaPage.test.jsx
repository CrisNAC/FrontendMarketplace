import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusquedaPage } from "../features/clients/pages/BusquedaPage";

vi.mock("lucide-react", () => ({
  ArrowLeft: ({ onClick }) => (
    <button onClick={onClick} data-testid="arrow-left">
      ←
    </button>
  ),
}));

vi.mock("../features/clients/components/search/SearchFilterSidebar", () => ({
  SearchFilterSidebar: ({ onFiltersApply }) => (
    <button
      type="button"
      onClick={() => onFiltersApply?.({ min: 100, max: 500, categoryId: null })}
    >
      Aplicar precio
    </button>
  ),
}));

vi.mock("../features/clients/components/search/SearchProductCard", () => ({
  SearchProductCard: ({ name, productId }) => (
    <div data-testid={`product-card-${productId}`}>{name}</div>
  ),
}));

vi.mock("../features/clients/components/commerceProfile/Pagination", () => ({
  Pagination: ({ currentPage, onPageChange }) => (
    <div>
      <span>Página actual: {currentPage}</span>
      <button type="button" onClick={() => onPageChange?.(2)}>
        Ir a página 2
      </button>
    </div>
  ),
}));

function createFetchMock({
  categoriesData = [],
  productsData = {
    products: [],
    pagination: { totalProducts: 0, page: 1, limit: 20, totalPages: 1 },
  },
  failProducts = false,
  failCategories = false,
} = {}) {
  return vi.fn().mockImplementation((url) => {
    const urlStr = String(url);
    if (urlStr.includes("/api/categories")) {
      if (failCategories) return Promise.resolve({ ok: false, status: 500 });
      return Promise.resolve({ ok: true, json: async () => categoriesData });
    }
    if (urlStr.includes("/products")) {
      if (failProducts)
        return Promise.reject(new Error("Error de red"));
      return Promise.resolve({ ok: true, json: async () => productsData });
    }
    return Promise.reject(new Error(`URL no mockeada: ${url}`));
  });
}

function renderBusqueda(path = "/busqueda", route = "/busqueda", props = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={route} element={<BusquedaPage {...props} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("BusquedaPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("consulta productos en oferta cuando se entra a /ofertas", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        products: [],
        pagination: {
          totalProducts: 0,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/ofertas?search=mate"]}>
        <Routes>
          <Route path="/ofertas" element={<BusquedaPage query="Ofertas" />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const calledUrl =
      fetchMock.mock.calls
        .map((call) => String(call[0]))
        .find((url) => url.includes("/products?")) || "";
    expect(calledUrl).toContain("/products?");
    expect(calledUrl).toContain("search=mate");
    expect(calledUrl).toContain("isOffer=true");
  });

  it("aplica el rango de precios en la query y reinicia la paginacion", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        products: [],
        pagination: {
          totalProducts: 0,
          page: 1,
          limit: 20,
          totalPages: 3,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter initialEntries={["/ofertas?search=mate"]}>
        <Routes>
          <Route path="/ofertas" element={<BusquedaPage query="Ofertas" />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const productFilterCalls = fetchMock.mock.calls.filter((call) =>
        String(call[0]).includes("/products?")
      );
      expect(productFilterCalls).toHaveLength(1);
    });

    await user.click(screen.getByRole("button", { name: /ir a página 2/i }));

    await waitFor(() => {
      const productFilterCalls = fetchMock.mock.calls.filter((call) =>
        String(call[0]).includes("/products?")
      );
      expect(productFilterCalls).toHaveLength(2);
    });

    const paginatedUrl =
      fetchMock.mock.calls
        .map((call) => String(call[0]))
        .filter((url) => url.includes("/products?"))[1] || "";
    expect(paginatedUrl).toContain("page=2");

    await user.click(screen.getByRole("button", { name: /aplicar precio/i }));

    await waitFor(() => {
      const productFilterCalls = fetchMock.mock.calls.filter((call) =>
        String(call[0]).includes("/products?")
      );
      expect(productFilterCalls).toHaveLength(3);
    });

    const filteredUrl =
      fetchMock.mock.calls
        .map((call) => String(call[0]))
        .filter((url) => url.includes("/products?"))[2] || "";
    expect(filteredUrl).toContain("minPrice=100");
    expect(filteredUrl).toContain("maxPrice=500");
    expect(filteredUrl).toContain("page=1");
  });

  it("muestra 'Cargando productos...' mientras carga", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    renderBusqueda();
    expect(screen.getByText("Cargando productos...")).toBeInTheDocument();
  });

  it("muestra error cuando falla la carga de productos", async () => {
    vi.stubGlobal("fetch", createFetchMock({ failProducts: true }));
    renderBusqueda();
    await waitFor(() => {
      expect(
        screen.getByText(/No se pudieron cargar productos con este filtro/)
      ).toBeInTheDocument();
    });
  });

  it("muestra 'No hay productos para ese filtro.' cuando la búsqueda retorna vacío", async () => {
    vi.stubGlobal("fetch", createFetchMock());
    renderBusqueda();
    await waitFor(() => {
      expect(
        screen.getByText("No hay productos para ese filtro.")
      ).toBeInTheDocument();
    });
  });

  it("muestra productos cuando hay resultados", async () => {
    const productsData = {
      products: [
        { id_product: 1, name: "Laptop", price: 500000 },
        { id_product: 2, name: "Mouse", price: 50000 },
      ],
      pagination: { totalProducts: 2, page: 1, limit: 20, totalPages: 1 },
    };
    vi.stubGlobal("fetch", createFetchMock({ productsData }));
    renderBusqueda();
    await waitFor(() => {
      expect(screen.getByText("Laptop")).toBeInTheDocument();
      expect(screen.getByText("Mouse")).toBeInTheDocument();
    });
  });

  it("muestra título 'Ofertas' en /ofertas sin search ni categoría", async () => {
    vi.stubGlobal("fetch", createFetchMock());
    renderBusqueda("/ofertas", "/ofertas");
    await waitFor(() => {
      expect(screen.getByText("Ofertas")).toBeInTheDocument();
    });
  });

  it("muestra título 'Ofertas para: ...' en /ofertas con search", async () => {
    vi.stubGlobal("fetch", createFetchMock());
    renderBusqueda("/ofertas?search=laptop", "/ofertas");
    await waitFor(() => {
      expect(screen.getByText("Ofertas para: laptop")).toBeInTheDocument();
    });
  });

  it("muestra título 'Ofertas en ...' en /ofertas con categoryName", async () => {
    vi.stubGlobal("fetch", createFetchMock());
    renderBusqueda("/ofertas?categoryName=Electrónica", "/ofertas");
    await waitFor(() => {
      expect(screen.getByText("Ofertas en Electrónica")).toBeInTheDocument();
    });
  });

  it("muestra título 'Resultado de Busqueda para: ...' con search", async () => {
    vi.stubGlobal("fetch", createFetchMock());
    renderBusqueda("/busqueda?search=teclado");
    await waitFor(() => {
      expect(
        screen.getByText("Resultado de Busqueda para: teclado")
      ).toBeInTheDocument();
    });
  });

  it("muestra título con categoryName de la URL en página de búsqueda", async () => {
    vi.stubGlobal("fetch", createFetchMock());
    renderBusqueda("/busqueda?categoryName=Laptops");
    await waitFor(() => {
      expect(
        screen.getByText("Resultado de Busqueda para: Laptops")
      ).toBeInTheDocument();
    });
  });

  it("muestra título con query prop cuando no hay search ni categoría", async () => {
    vi.stubGlobal("fetch", createFetchMock());
    renderBusqueda("/busqueda", "/busqueda", { query: "Electrónica" });
    await waitFor(() => {
      expect(
        screen.getByText("Resultado de Busqueda para: Electrónica")
      ).toBeInTheDocument();
    });
  });

  it("incluye categoryId en la query cuando viene en la URL", async () => {
    const fetchMock = createFetchMock();
    vi.stubGlobal("fetch", fetchMock);
    renderBusqueda("/busqueda?categoryId=3");
    await waitFor(() => {
      const calledUrl =
        fetchMock.mock.calls
          .map((call) => String(call[0]))
          .find((url) => url.includes("/products?")) || "";
      expect(calledUrl).toContain("categoryId=3");
    });
  });

  it("muestra error de categorías cuando falla la carga de categorías", async () => {
    vi.stubGlobal("fetch", createFetchMock({ failCategories: true }));
    renderBusqueda();
    await waitFor(() => {
      expect(screen.getByText(/Error categorías/)).toBeInTheDocument();
    });
  });

  it("navega atrás al hacer clic en la flecha", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", createFetchMock());
    render(
      <MemoryRouter initialEntries={["/inicio", "/busqueda?search=algo"]} initialIndex={1}>
        <Routes>
          <Route path="/inicio" element={<div>Página anterior</div>} />
          <Route path="/busqueda" element={<BusquedaPage />} />
        </Routes>
      </MemoryRouter>
    );
    await screen.findByTestId("arrow-left");
    await user.click(screen.getByTestId("arrow-left"));
    expect(screen.getByText("Página anterior")).toBeInTheDocument();
  });

  it("usa data.content como fallback cuando no hay data.products", async () => {
    const productsData = {
      content: [{ id_product: 5, name: "Silla", price: 200000 }],
      pagination: { totalProducts: 1, page: 1, limit: 20, totalPages: 1 },
    };
    vi.stubGlobal("fetch", createFetchMock({ productsData }));
    renderBusqueda();
    await waitFor(() => {
      expect(screen.getByText("Silla")).toBeInTheDocument();
    });
  });

  it("usa total_pages como fallback cuando no hay pagination.totalPages", async () => {
    const user = userEvent.setup();
    const fetchMock = createFetchMock({
      productsData: {
        products: [{ id_product: 6, name: "Mesa", price: 300000 }],
        total_pages: 5,
      },
    });
    vi.stubGlobal("fetch", fetchMock);
    renderBusqueda();
    expect(await screen.findByText("Mesa")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /ir a página 2/i }));
    await waitFor(() => {
      const calledUrl =
        fetchMock.mock.calls.map((c: unknown[]) => String(c[0])).find((u: string) => u.includes("page=2")) || "";
      expect(calledUrl).toContain("page=2");
    });
  });
});
