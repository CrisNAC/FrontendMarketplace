import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusquedaPage } from "../features/clients/pages/BusquedaPage";

vi.mock("../features/clients/components/search/SearchFilterSidebar", () => ({
  SearchFilterSidebar: () => null,
}));

vi.mock("../features/clients/components/commerceProfile/Pagination", () => ({
  Pagination: () => null,
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

    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain("/products");
    expect(calledUrl).toContain("search=mate");
    expect(calledUrl).toContain("isOffer=true");
  });
});
