import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { addToCartApi } from "../lib/cartApi";
import { mergeCartResponseFromApi } from "../lib/cartLocalStorage";
import DetalleProducto from "../features/clients/pages/DetalleProducto";

const mockNavigate = vi.fn();
const mockShowToast = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: "10" }),
}));

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

vi.mock('@/hooks', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

vi.mock("../lib/cartApi", () => ({
  addToCartApi: vi.fn(),
}));

vi.mock("../lib/cartLocalStorage", () => ({
  mergeCartResponseFromApi: vi.fn(),
}));

describe("DetalleProducto - agregar al carrito", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 10,
        name: "Mouse gamer",
        description: "Mouse RGB",
        price: 150000,
        quantity: 5,
        averageRating: 4.5,
        reviewCount: 2,
      }),
    });
  });

  it("agrega al carrito cuando hay sesión activa", async () => {
    axios.get.mockResolvedValue({
      data: { user: { id_user: 7 } },
    });
    addToCartApi.mockResolvedValue({
      id: 1,
      items: [{ id: 1, quantity: 1 }],
    });

    render(<DetalleProducto />);

    const addButton = await screen.findByRole("button", {
      name: /agregar al carrito/i,
    });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(addToCartApi).toHaveBeenCalledWith(7, { productId: 10, quantity: 1 });
    });
    expect(mergeCartResponseFromApi).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith("Producto agregado al carrito", "success");
  });
});
