import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import toast from "react-hot-toast";
import ConfirmarPedido from "../features/clients/pages/ConfirmarPedido";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ cartId: "55" }),
}));

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("ConfirmarPedido", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("confirma pedido y navega a pedido confirmado", async () => {
    const cartResponse = {
      data: {
        carts: [
          {
            id: 55,
            commerce: { id: 3, name: "Tech Store" },
            items: [
              {
                id: 1,
                quantity: 2,
                product: {
                  id: 10,
                  name: "Teclado",
                  price: 100000,
                  originalPrice: 120000,
                  offerPrice: 100000,
                  isOffer: true,
                },
              },
            ],
          },
        ],
      },
    };

    const addressesResponse = {
      data: {
        data: [
          {
            id_address: 9,
            address: "Av. Siempre Viva 123",
            city: "Asunción",
            region: "Central",
          },
        ],
      },
    };

    axios.get.mockImplementation((url) => {
      if (url.includes("/api/session/user-session")) {
        return Promise.resolve({ data: { user: { id_user: 22 } } });
      }
      if (url.includes("/api/users/22/carts")) return Promise.resolve(cartResponse);
      if (url.includes("/api/users/22/addresses")) return Promise.resolve(addressesResponse);
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    axios.post.mockImplementation((url) => {
      if (url.includes("/api/orders")) {
        return Promise.resolve({
          data: { id: 999, status: "PENDING", total: 200000, items: [] },
        });
      }
      return Promise.reject(new Error(`POST no mockeado: ${url}`));
    });

    render(<ConfirmarPedido />);

    const confirmBtn = await screen.findByRole("button", {
      name: /confirmar pedido/i,
    });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/orders"),
        expect.objectContaining({
          cartId: 55,
          addressId: null,
          shippingMethod: "pickup",
          shippingCost: 0,
        }),
        expect.objectContaining({ withCredentials: true })
      );
    });

    expect(toast.success).toHaveBeenCalledWith("Pedido confirmado correctamente");
    expect(mockNavigate).toHaveBeenCalledWith(
      "/pedido-confirmado",
      expect.objectContaining({
        state: expect.objectContaining({
          shippingMethod: "pickup",
        }),
      })
    );
  });
});
