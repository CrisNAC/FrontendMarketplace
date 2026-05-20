import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { CartPage } from "../features/clients/pages/CartPage";

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

vi.mock("../components/navbar/Navbar", () => ({
  default: () => <div>Navbar</div>,
}));

describe("CartPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra detalle del carrito y permite ir a confirmar pedido", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/session/user-session")) {
        return Promise.resolve({ data: { user: { id_user: 22 } } });
      }
      if (url.includes("/api/users/22/carts")) {
        return Promise.resolve({
          data: {
            carts: [
              {
                id: 55,
                commerce: { id: 5, name: "Tienda Demo" },
                items: [
                  {
                    id: 1,
                    quantity: 1,
                    product: {
                      id: 10,
                      name: "Auriculares",
                      price: 100000,
                      originalPrice: 100000,
                      isOffer: false,
                      stock: 5,
                    },
                  },
                ],
              },
            ],
          },
        });
      }
      return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });

    render(<CartPage />);

    expect(await screen.findByText("Auriculares")).toBeInTheDocument();
    expect(screen.getAllByText("Gs. 100.000").length).toBeGreaterThan(0);
    expect(screen.getByText(/Resumen del pedido/i)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /Ir a Confirmar Pedido/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/confirmar-pedido/55");
  });
});
