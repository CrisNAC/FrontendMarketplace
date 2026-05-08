import { render, screen, waitFor } from "@testing-library/react";
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
        delete: vi.fn(),
        patch: vi.fn(),
        create: vi.fn(() => ({
            get: vi.fn(),
            post: vi.fn(),
            interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
        })),
    },
}));

vi.mock("../components/navbar/Navbar", () => ({
    default: () => <div>Navbar</div>,
}));

vi.mock("lucide-react", () => ({
    Minus: () => <span>-</span>,
    Plus: () => <span>+</span>,
    Trash2: () => <span>Eliminar</span>,
    ArrowLeft: ({ onClick, className }) => (
        <button onClick={onClick} className={className} data-testid="arrow-left">←</button>
    ),
}));

vi.mock("react-hot-toast", () => ({
    default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../lib/cartApi", () => ({
    getApiBase: vi.fn(() => "http://localhost:3000"),
}));

vi.mock("../lib/formatGuarani", () => ({
    formatGuarani: (v) => `Gs. ${v}`,
}));

const sessionOk = { data: { user: { id_user: 22 } } };

const cartWithItem = (overrides = {}) => ({
    data: {
        carts: [{
            id: 55,
            commerce: { id: 5, name: "Tienda Demo" },
            items: [{
                id: 1,
                quantity: 2,
                product: {
                    id: 10,
                    name: "Auriculares",
                    price: 100000,
                    originalPrice: 100000,
                    offerPrice: null,
                    isOffer: false,
                    imageUrl: "",
                },
            }],
            ...overrides,
        }],
    },
});

const cartWithOfferItem = {
    data: {
        carts: [{
            id: 55,
            commerce: { id: 5, name: "Tienda Demo" },
            items: [{
                id: 1,
                quantity: 1,
                product: {
                    id: 10,
                    name: "Teclado",
                    price: 200000,
                    originalPrice: 200000,
                    offerPrice: 150000,
                    isOffer: true,
                    imageUrl: "",
                },
            }],
        }],
    },
};

function setupAxios(cartData = cartWithItem()) {
    axios.get.mockImplementation((url) => {
        if (url.includes("/api/session/user-session")) return Promise.resolve(sessionOk);
        if (url.includes("/api/users/22/carts")) return Promise.resolve(cartData);
        return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });
}

describe("CartPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("muestra 'Cargando carrito...' mientras carga", () => {
        axios.get.mockReturnValue(new Promise(() => {}));
        render(<CartPage />);
        expect(screen.getByText("Cargando carrito...")).toBeInTheDocument();
    });

    it("muestra el nombre del comercio en el título", async () => {
        setupAxios();
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getByText("Tienda Demo")).toBeInTheDocument();
        });
    });

    it("muestra el nombre del producto en el carrito", async () => {
        setupAxios();
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getByText("Auriculares")).toBeInTheDocument();
        });
    });

    it("muestra el precio del producto formateado", async () => {
        setupAxios();
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getByText("Gs. 100000")).toBeInTheDocument();
        });
    });

    it("muestra 'Resumen del pedido' en el panel lateral", async () => {
        setupAxios();
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getByText("Resumen del pedido")).toBeInTheDocument();
        });
    });

    it("navega a confirmar pedido al hacer clic en el botón", async () => {
        setupAxios();
        render(<CartPage />);
        await waitFor(() => screen.getByText("Ir a Confirmar Pedido"));
        await userEvent.click(screen.getByText("Ir a Confirmar Pedido"));
        expect(mockNavigate).toHaveBeenCalledWith("/confirmar-pedido/55");
    });

    it("navega hacia atrás al hacer clic en la flecha", async () => {
        setupAxios();
        render(<CartPage />);
        await waitFor(() => screen.getByTestId("arrow-left"));
        await userEvent.click(screen.getByTestId("arrow-left"));
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("muestra error cuando el carrito no se encuentra", async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes("/api/session/user-session")) return Promise.resolve(sessionOk);
            if (url.includes("/api/users/22/carts")) return Promise.resolve({ data: { carts: [{ id: 99, commerce: null, items: [] }] } });
            return Promise.reject(new Error("no mock"));
        });
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getByText("No se pudo cargar el carrito.")).toBeInTheDocument();
        });
    });

    it("muestra error cuando no hay sesión (userId null)", async () => {
        axios.get.mockResolvedValue({ data: { user: null } });
        render(<CartPage />);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    it("muestra error cuando la llamada al API falla", async () => {
        axios.get.mockRejectedValue(new Error("Error de red"));
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getByText("No se pudo cargar el carrito.")).toBeInTheDocument();
        });
    });

    it("muestra error y navega a login en error 401", async () => {
        const error = { response: { status: 401 } };
        axios.get.mockRejectedValue(error);
        render(<CartPage />);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    it("muestra precio de oferta y tachado cuando isOffer es true", async () => {
        setupAxios(cartWithOfferItem);
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getAllByText("Gs. 150000").length).toBeGreaterThan(0);
            expect(screen.getAllByText("Gs. 200000").length).toBeGreaterThan(0);
            expect(screen.getByText("Oferta")).toBeInTheDocument();
        });
    });

    it("muestra 'Descuentos:' cuando hay items con oferta", async () => {
        setupAxios(cartWithOfferItem);
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getByText("Descuentos:")).toBeInTheDocument();
        });
    });

    it("no muestra 'Descuentos:' cuando no hay ofertas", async () => {
        setupAxios();
        render(<CartPage />);
        await waitFor(() => screen.getByText("Auriculares"));
        expect(screen.queryByText("Descuentos:")).not.toBeInTheDocument();
    });

    it("incrementa la cantidad al hacer clic en '+'", async () => {
        setupAxios();
        render(<CartPage />);
        await waitFor(() => screen.getByText("Auriculares"));
        const plusBtns = screen.getAllByText("+");
        await userEvent.click(plusBtns[0].closest("button"));
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("decrementa la cantidad al hacer clic en '-' (no baja de 1)", async () => {
        setupAxios();
        render(<CartPage />);
        await waitFor(() => screen.getByText("Auriculares"));
        const minusBtns = screen.getAllByText("-");
        await userEvent.click(minusBtns[0].closest("button"));
        expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("elimina el item al hacer clic en 'Eliminar'", async () => {
        setupAxios();
        render(<CartPage />);
        await waitFor(() => screen.getByText("Auriculares"));
        await userEvent.click(screen.getByText("Eliminar").closest("button"));
        await waitFor(() => {
            expect(screen.queryByText("Auriculares")).not.toBeInTheDocument();
        });
    });

    it("muestra 'Tu carrito está vacío.' cuando no hay items", async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes("/api/session/user-session")) return Promise.resolve(sessionOk);
            if (url.includes("/api/users/22/carts")) return Promise.resolve({
                data: { carts: [{ id: 55, commerce: { id: 5, name: "Tienda Demo" }, items: [] }] },
            });
            return Promise.reject(new Error("no mock"));
        });
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getByText("Tu carrito está vacío.")).toBeInTheDocument();
        });
    });

    it("muestra 'Sin imagen' cuando el producto no tiene imagen", async () => {
        setupAxios();
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getByText("Sin imagen")).toBeInTheDocument();
        });
    });

    it("muestra imagen del producto cuando imageUrl está disponible", async () => {
        const cartWithImage = {
            data: {
                carts: [{
                    id: 55,
                    commerce: { id: 5, name: "Tienda Demo" },
                    items: [{
                        id: 1,
                        quantity: 1,
                        product: { id: 10, name: "Laptop", price: 5000000, originalPrice: 5000000, offerPrice: null, isOffer: false, imageUrl: "https://example.com/laptop.jpg" },
                    }],
                }],
            },
        };
        setupAxios(cartWithImage);
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getByAltText("Laptop")).toBeInTheDocument();
        });
    });

    it("muestra el subtotal del item en el carrito", async () => {
        setupAxios();
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getAllByText(/Subtotal:/).length).toBeGreaterThan(0);
        });
    });

    it("muestra el reintentar button cuando hay error", async () => {
        axios.get.mockRejectedValue(new Error("Falla de red"));
        render(<CartPage />);
        await waitFor(() => {
            expect(screen.getByText("Reintentar")).toBeInTheDocument();
        });
    });
});
