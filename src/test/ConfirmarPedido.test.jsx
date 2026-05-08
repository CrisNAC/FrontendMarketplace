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
        create: vi.fn(() => ({
            get: vi.fn(),
            post: vi.fn(),
            interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
        })),
    },
}));

vi.mock("react-hot-toast", () => ({
    default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("lucide-react", () => ({
    ArrowLeft: ({ onClick, className }) => (
        <button onClick={onClick} className={className} data-testid="arrow-left">←</button>
    ),
}));

vi.mock("../lib/cartApi", () => ({
    getApiBase: vi.fn(() => "http://localhost:3000"),
}));

const sessionOk = { data: { user: { id_user: 22 } } };
const sessionNull = { data: { user: null } };

const baseCart = {
    id: 55,
    commerce: { id: 3, name: "Tech Store" },
    items: [{
        id: 1,
        quantity: 2,
        product: { id: 10, name: "Teclado", price: 100000, originalPrice: 100000, offerPrice: null, isOffer: false },
    }],
};

const cartResponse = { data: { carts: [baseCart] } };

const addressesResponse = {
    data: {
        data: [{
            id_address: 9,
            address: "Av. Siempre Viva 123",
            city: "Asunción",
            region: "Central",
            postal_code: null,
            latitude: -25.28, longitude: -57.64, status: true, created_at: "", updated_at: "",
        }],
    },
};

const emptyAddressesResponse = { data: { data: [] } };

function setupAxios({ cart = cartResponse, addresses = emptyAddressesResponse, sessionResponse = sessionOk } = {}) {
    axios.get.mockImplementation((url) => {
        if (url.includes("/api/session/user-session")) return Promise.resolve(sessionResponse);
        if (url.includes("/api/users/22/carts")) return Promise.resolve(cart);
        if (url.includes("/api/users/22/addresses")) return Promise.resolve(addresses);
        return Promise.reject(new Error(`URL no mockeada: ${url}`));
    });
}

describe("ConfirmarPedido", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        axios.post.mockResolvedValue({
            data: { id: 999, status: "PENDING", total: 200000, items: [], address: null },
        });
    });

    it("muestra 'Cargando pedido...' mientras carga", () => {
        axios.get.mockReturnValue(new Promise(() => {}));
        render(<ConfirmarPedido />);
        expect(screen.getByText("Cargando pedido...")).toBeInTheDocument();
    });

    it("muestra el título 'Confirmar Pedido'", async () => {
        setupAxios();
        render(<ConfirmarPedido />);
        await waitFor(() => {
            expect(screen.getByText("Confirmar Pedido")).toBeInTheDocument();
        });
    });

    it("muestra las opciones de envío", async () => {
        setupAxios();
        render(<ConfirmarPedido />);
        await waitFor(() => {
            expect(screen.getByText("Retirar en Local")).toBeInTheDocument();
            expect(screen.getByText("Envío Estándar")).toBeInTheDocument();
        });
    });

    it("muestra 'Gratis' para la opción de retiro en local", async () => {
        setupAxios();
        render(<ConfirmarPedido />);
        await waitFor(() => {
            expect(screen.getAllByText("Gratis").length).toBeGreaterThan(0);
        });
    });

    it("muestra 'Según distancia' para envío estándar sin cotización", async () => {
        setupAxios();
        render(<ConfirmarPedido />);
        await waitFor(() => {
            expect(screen.getByText("Según distancia")).toBeInTheDocument();
        });
    });

    it("muestra la sección de dirección al seleccionar 'Envío Estándar'", async () => {
        setupAxios({ addresses: addressesResponse });
        render(<ConfirmarPedido />);
        await waitFor(() => screen.getByText("Envío Estándar"));
        const standardLabel = screen.getByText("Envío Estándar").closest("label");
        await userEvent.click(standardLabel);
        await waitFor(() => {
            expect(screen.getByText("Dirección de Entrega")).toBeInTheDocument();
        });
    });

    it("muestra 'No tienes direcciones registradas.' sin direcciones en envío estándar", async () => {
        setupAxios({ addresses: emptyAddressesResponse });
        render(<ConfirmarPedido />);
        await waitFor(() => screen.getByText("Envío Estándar"));
        await userEvent.click(screen.getByText("Envío Estándar").closest("label"));
        await waitFor(() => {
            expect(screen.getByText("No tienes direcciones registradas.")).toBeInTheDocument();
        });
    });

    it("muestra el selector de direcciones cuando hay direcciones en envío estándar", async () => {
        setupAxios({ addresses: addressesResponse });
        render(<ConfirmarPedido />);
        await waitFor(() => screen.getByText("Envío Estándar"));
        await userEvent.click(screen.getByText("Envío Estándar").closest("label"));
        await waitFor(() => {
            expect(screen.getByText("Av. Siempre Viva 123 - Asunción, Central")).toBeInTheDocument();
        });
    });

    it("muestra sección de 'Notas para la Entrega'", async () => {
        setupAxios();
        render(<ConfirmarPedido />);
        await waitFor(() => {
            expect(screen.getByText("Notas para la Entrega")).toBeInTheDocument();
        });
    });

    it("permite escribir notas en el textarea", async () => {
        setupAxios();
        render(<ConfirmarPedido />);
        await waitFor(() => screen.getByText("Notas para la Entrega"));
        const textarea = screen.getByRole("textbox");
        await userEvent.type(textarea, "Dejar en la puerta");
        expect(textarea).toHaveValue("Dejar en la puerta");
    });

    it("navega hacia atrás al hacer clic en la flecha", async () => {
        setupAxios();
        render(<ConfirmarPedido />);
        await waitFor(() => screen.getByTestId("arrow-left"));
        await userEvent.click(screen.getByTestId("arrow-left"));
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("navega a /login cuando no hay sesión activa", async () => {
        setupAxios({ sessionResponse: sessionNull });
        render(<ConfirmarPedido />);
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/login");
        });
    });

    it("confirma pedido en modo pickup y navega a pedido-confirmado", async () => {
        setupAxios();
        render(<ConfirmarPedido />);
        const confirmBtn = await screen.findByRole("button", { name: /confirmar pedido/i });
        await userEvent.click(confirmBtn);
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining("/api/orders"),
                expect.objectContaining({ cartId: 55, shippingMethod: "pickup", shippingCost: 0, addressId: null }),
                expect.any(Object)
            );
        });
        expect(toast.success).toHaveBeenCalledWith("Pedido confirmado correctamente");
        expect(mockNavigate).toHaveBeenCalledWith("/pedido-confirmado", expect.any(Object));
    });

    it("muestra error cuando falla la confirmación del pedido", async () => {
        setupAxios();
        axios.post.mockRejectedValue({ response: { data: { message: "Error al crear pedido" } } });
        render(<ConfirmarPedido />);
        const confirmBtn = await screen.findByRole("button", { name: /confirmar pedido/i });
        await userEvent.click(confirmBtn);
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Error al crear pedido");
        });
    });

    it("muestra 'Confirmando...' mientras se confirma el pedido", async () => {
        setupAxios();
        axios.post.mockReturnValue(new Promise(() => {}));
        render(<ConfirmarPedido />);
        const confirmBtn = await screen.findByRole("button", { name: /confirmar pedido/i });
        await userEvent.click(confirmBtn);
        await waitFor(() => {
            expect(screen.getByText("Confirmando...")).toBeInTheDocument();
        });
    });

    it("muestra el resumen del pedido con Subtotal", async () => {
        setupAxios();
        render(<ConfirmarPedido />);
        await waitFor(() => {
            expect(screen.getByText("Subtotal:")).toBeInTheDocument();
        });
    });

    it("muestra el 'Total:' en el resumen", async () => {
        setupAxios();
        render(<ConfirmarPedido />);
        await waitFor(() => {
            expect(screen.getByText("Total:")).toBeInTheDocument();
        });
    });

    it("muestra descuento en el resumen cuando hay oferta", async () => {
        const cartWithOffer = {
            data: {
                carts: [{
                    id: 55,
                    commerce: { id: 3, name: "Tech Store" },
                    items: [{
                        id: 1,
                        quantity: 1,
                        product: { id: 10, name: "Laptop", price: 500000, originalPrice: 500000, offerPrice: 400000, isOffer: true },
                    }],
                }],
            },
        };
        setupAxios({ cart: cartWithOffer });
        render(<ConfirmarPedido />);
        await waitFor(() => {
            expect(screen.getByText("Descuento:")).toBeInTheDocument();
        });
    });

    it("muestra el botón '+ Agregar nueva dirección' en envío estándar", async () => {
        setupAxios({ addresses: addressesResponse });
        render(<ConfirmarPedido />);
        await waitFor(() => screen.getByText("Envío Estándar"));
        await userEvent.click(screen.getByText("Envío Estándar").closest("label"));
        await waitFor(() => {
            expect(screen.getByText("+ Agregar nueva dirección")).toBeInTheDocument();
        });
    });

    it("navega a /direcciones al hacer clic en '+ Agregar nueva dirección'", async () => {
        setupAxios({ addresses: addressesResponse });
        render(<ConfirmarPedido />);
        await waitFor(() => screen.getByText("Envío Estándar"));
        await userEvent.click(screen.getByText("Envío Estándar").closest("label"));
        await waitFor(() => screen.getByText("+ Agregar nueva dirección"));
        await userEvent.click(screen.getByText("+ Agregar nueva dirección"));
        expect(mockNavigate).toHaveBeenCalledWith("/direcciones");
    });
});
