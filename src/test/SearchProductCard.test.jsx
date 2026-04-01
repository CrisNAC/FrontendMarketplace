import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SearchProductCard } from "../features/clients/components/search/SearchProductCard";

describe("SearchProductCard", () => {
  it("muestra precio original, precio con descuento y badge de porcentaje", () => {
    render(
      <MemoryRouter>
        <SearchProductCard
          name="Auriculares"
          price={150000}
          isOffer
          offerPrice={150000}
          originalPrice={200000}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Auriculares")).toBeInTheDocument();
    expect(screen.getByText("Gs. 200.000")).toBeInTheDocument();
    expect(screen.getByText("Gs. 150.000")).toBeInTheDocument();
    expect(screen.getByText("-25%")).toBeInTheDocument();
  });
});
