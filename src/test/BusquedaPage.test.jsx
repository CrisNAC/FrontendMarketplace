import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusquedaPage } from "../features/clients/pages/BusquedaPage";

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
});
