import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetProductById = vi.fn();
const mockGetProductReviews = vi.fn();
const mockUpdateProduct = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: "7" }),
}));

vi.mock("../features/commerces/services/productDetailApi", () => ({
  getProductById: (...args) => mockGetProductById(...args),
}));

vi.mock("../features/commerces/services/productReviewApi", () => ({
  getProductReviews: (...args) => mockGetProductReviews(...args),
}));

vi.mock("../features/commerces/services/editProductApi", () => ({
  updateProduct: (...args) => mockUpdateProduct(...args),
  getBackendErrorMessage: (_error, fallbackMessage) => fallbackMessage,
}));

import ProductDetailView from "../features/commerces/pages/ProductDetailView";

const baseProduct = {
  id: 7,
  name: "Producto detalle",
  description: "Descripcion breve",
  price: 10000,
  originalPrice: 10000,
  offerPrice: null,
  isOffer: false,
  status: "active",
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-04-02T00:00:00.000Z",
  category: { name: "Categoria test" },
  averageRating: null,
  tags: [],
  imageUrl: "",
};

describe("ProductDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProductById.mockResolvedValue(baseProduct);
    mockGetProductReviews.mockResolvedValue({
      reviews: [],
      stats: {
        averageRating: null,
        totalReviews: 0,
        verifiedReviews: 0,
      },
    });
    mockUpdateProduct.mockResolvedValue({
      ...baseProduct,
      price: 8500,
      originalPrice: 10000,
      offerPrice: 8500,
      isOffer: true,
    });
  });

  it("permite actualizar la oferta desde ProductDetailView", async () => {
    const user = userEvent.setup();

    render(<ProductDetailView />);

    expect(
      await screen.findByRole("button", { name: /editar producto/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("switch", { name: /activar oferta/i }));

    const offerInput = await screen.findByLabelText(/precio de oferta/i);
    await user.clear(offerInput);
    await user.type(offerInput, "8500");

    await user.click(screen.getByRole("button", { name: /guardar oferta/i }));

    await waitFor(() => {
      expect(mockUpdateProduct).toHaveBeenCalledWith({
        productId: "7",
        payload: {
          isOffer: true,
          offerPrice: 8500,
        },
      });
    });

    expect(
      await screen.findByText("La oferta del producto se actualizó correctamente.")
    ).toBeInTheDocument();
  });

  it("muestra validacion si activan la oferta sin precio", async () => {
    const user = userEvent.setup();

    render(<ProductDetailView />);

    expect(
      await screen.findByRole("button", { name: /editar producto/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("switch", { name: /activar oferta/i }));
    await user.click(screen.getByRole("button", { name: /guardar oferta/i }));

    expect(mockUpdateProduct).not.toHaveBeenCalled();
    expect(
      screen.getByText("Ingresá un precio de oferta válido mayor a 0.")
    ).toBeInTheDocument();
  });
});
