/* eslint-disable react/prop-types */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn();
const mockAxiosGet = vi.fn();
const mockApiClientGet = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "10" }),
}));

vi.mock("axios", () => ({
    default: {
        get: (...args) => mockAxiosGet(...args),
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

vi.mock("../lib/apiClient", () => ({
    default: { get: (...args) => mockApiClientGet(...args) },
}));

vi.mock("react-hot-toast", () => ({
    default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../lib/cartApi", () => ({
    addToCartApi: vi.fn(),
    getApiBase: vi.fn(() => "http://localhost:3000"),
}));

vi.mock("../lib/cartLocalStorage", () => ({
    mergeCartResponseFromApi: vi.fn(),
}));

vi.mock("../features/clients/services/wishlistService", () => ({
    getWishlists: vi.fn(),
    createWishlist: vi.fn(),
    addWishlistItem: vi.fn(),
}));

vi.mock("../features/clients/services/productReportApi", () => ({
    REPORT_REASON_LABELS: [
        { value: "DEFECTIVE", label: "Producto en mal estado" },
        { value: "OTHER", label: "Otro" },
    ],
    fetchPendingProductReport: vi.fn(),
    fetchProductReportReasons: vi.fn(),
    hasLocalReportForProduct: vi.fn(() => false),
    rememberLocalReport: vi.fn(),
    submitProductReport: vi.fn(),
}));

vi.mock("lucide-react", () => ({
    ArrowLeft: ({ onClick, className }) => (
        <button onClick={onClick} className={className} data-testid="arrow-left">←</button>
    ),
    MoreVertical: () => <span data-testid="more-vertical">⋮</span>,
}));

vi.mock("../lib/formatGuarani", () => ({
    formatGuarani: (v) => `Gs. ${v}`,
}));

import DetalleProducto from "../features/clients/pages/DetalleProducto";
import {
    getWishlists,
    addWishlistItem,
} from "../features/clients/services/wishlistService";
import {
    fetchPendingProductReport,
    fetchProductReportReasons,
    submitProductReport,
} from "../features/clients/services/productReportApi";

const baseProduct = {
    id: 10,
    name: "Mouse gamer",
    description: "Mouse RGB de alta precisión",
    price: 150000,
    quantity: 5,
    averageRating: 4.5,
    reviewCount: 12,
    category: { name: "Electrónica" },
    commerce: { name: "TechStore" },
    imageUrl: "",
    tags: [],
    isOffer: false,
};

const customerSession = { data: { user: { id_user: 7, role: "CUSTOMER" } } };

function setupFetch(product = baseProduct) {
    globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => product,
    });
}

describe("DetalleProducto", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAxiosGet.mockResolvedValue({ data: { user: null } });
        setupFetch();
        fetchPendingProductReport.mockResolvedValue(null);
        fetchProductReportReasons.mockResolvedValue([]);
        getWishlists.mockResolvedValue([]);
        mockApiClientGet.mockResolvedValue({ data: { user: { id_user: 7 } } });
    });

    it("muestra 'Cargando producto...' durante la carga", async () => {
        globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
        render(<DetalleProducto />);
        await waitFor(() => {
            expect(screen.getByText("Cargando producto...")).toBeInTheDocument();
        });
    });

    it("muestra error cuando el fetch falla", async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
        render(<DetalleProducto />);
        await waitFor(() => {
            expect(screen.getByText(/No se pudo cargar el producto/i)).toBeInTheDocument();
        });
    });

    it.each([
        ['nombre', 'Mouse gamer'],
        ['descripción', 'Mouse RGB de alta precisión'],
        ['precio', 'Gs. 150000'],
        ['stock', 'En stock'],
        ['sin imagen', 'Sin imagen'],
        ['calificación', '4.5'],
        ['conteo de reseñas', '12 calificaciones'],
        ['título compuesto', 'TechStore / Electrónica'],
        ['botón Comentarios', 'Comentarios'],
    ])('muestra el/la %s del producto', async (_, text) => {
        render(<DetalleProducto />);
        await waitFor(() => {
            expect(screen.getByText(text)).toBeInTheDocument();
        });
    });

    it("muestra 'Sin detalles adicionales.' cuando no hay descripción ni tags", async () => {
        setupFetch({ ...baseProduct, description: "", tags: [] });
        render(<DetalleProducto />);
        await waitFor(() => {
            expect(screen.getByText("Sin detalles adicionales.")).toBeInTheDocument();
        });
    });

    it("muestra etiquetas en lista cuando no hay descripción pero hay tags", async () => {
        setupFetch({ ...baseProduct, description: "", tags: [{ id: 1, name: "gaming" }, { id: 2, name: "rgb" }] });
        render(<DetalleProducto />);
        await waitFor(() => {
            expect(screen.getByText("gaming")).toBeInTheDocument();
            expect(screen.getByText("rgb")).toBeInTheDocument();
        });
    });

    it("muestra 'Sin stock' cuando quantity = 0", async () => {
        setupFetch({ ...baseProduct, quantity: 0 });
        render(<DetalleProducto />);
        await waitFor(() => {
            expect(screen.getByText("Sin stock")).toBeInTheDocument();
        });
    });

    it("muestra la imagen del producto cuando hay imageUrl", async () => {
        setupFetch({ ...baseProduct, imageUrl: "https://example.com/mouse.png" });
        render(<DetalleProducto />);
        await waitFor(() => {
            expect(screen.getByAltText("Mouse gamer")).toBeInTheDocument();
        });
    });

    it("muestra 'Ver calificaciones' cuando reviewCount es null", async () => {
        setupFetch({ ...baseProduct, reviewCount: null });
        render(<DetalleProducto />);
        await waitFor(() => {
            expect(screen.getByText("Ver calificaciones")).toBeInTheDocument();
        });
    });

    it("muestra 'Detalle del producto' cuando no hay comercio ni categoría", async () => {
        setupFetch({ ...baseProduct, category: null, commerce: null });
        render(<DetalleProducto />);
        await waitFor(() => {
            expect(screen.getByText("Detalle del producto")).toBeInTheDocument();
        });
    });

    it("navega hacia atrás al hacer clic en la flecha", async () => {
        render(<DetalleProducto />);
        await userEvent.click(await screen.findByTestId("arrow-left"));
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("no muestra el menú de reporte cuando el usuario no está autenticado", async () => {
        render(<DetalleProducto />);
        await waitFor(() => {
            expect(screen.getByText("Mouse gamer")).toBeInTheDocument();
        });
        expect(screen.queryByTestId("more-vertical")).not.toBeInTheDocument();
    });

    it("muestra el menú de reporte cuando el usuario es CUSTOMER", async () => {
        mockAxiosGet.mockResolvedValue(customerSession);
        render(<DetalleProducto />);
        await waitFor(() => {
            expect(screen.getByTestId("more-vertical")).toBeInTheDocument();
        });
    });

    it("abre el menú de opciones al hacer clic en MoreVertical", async () => {
        mockAxiosGet.mockResolvedValue(customerSession);
        render(<DetalleProducto />);
        await waitFor(() => screen.getByTestId("more-vertical"));
        await userEvent.click(screen.getByRole("button", { name: /más opciones/i }));
        expect(screen.getByText("Reportar producto")).toBeInTheDocument();
    });

    it("abre el modal de reporte al hacer clic en 'Reportar producto'", async () => {
        mockAxiosGet.mockResolvedValue(customerSession);
        render(<DetalleProducto />);
        await waitFor(() => screen.getByTestId("more-vertical"));
        await userEvent.click(screen.getByRole("button", { name: /más opciones/i }));
        await userEvent.click(screen.getByText("Reportar producto"));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Reportar producto", { selector: "h2" })).toBeInTheDocument();
    });

    it("cierra el modal de reporte al hacer clic en Cancelar", async () => {
        mockAxiosGet.mockResolvedValue(customerSession);
        render(<DetalleProducto />);
        await waitFor(() => screen.getByTestId("more-vertical"));
        await userEvent.click(screen.getByRole("button", { name: /más opciones/i }));
        await userEvent.click(screen.getByText("Reportar producto"));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
        await waitFor(() => {
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });
    });

    it("muestra opciones de motivo en el modal de reporte", async () => {
        mockAxiosGet.mockResolvedValue(customerSession);
        render(<DetalleProducto />);
        await waitFor(() => screen.getByTestId("more-vertical"));
        await userEvent.click(screen.getByRole("button", { name: /más opciones/i }));
        await userEvent.click(screen.getByText("Reportar producto"));
        expect(screen.getByText("Producto en mal estado")).toBeInTheDocument();
        expect(screen.getByText("Otro")).toBeInTheDocument();
    });

    it("abre el modal de lista de deseos al hacer clic en el botón de favoritos", async () => {
        render(<DetalleProducto />);
        await waitFor(() => screen.getByText("Mouse gamer"));
        await userEvent.click(screen.getByRole("button", { name: /agregar a favoritos/i }));
        await waitFor(() => {
            expect(screen.getByText("Agregar a lista de deseos")).toBeInTheDocument();
        });
    });

    it("muestra 'Cargando listas...' mientras carga el modal de wishlist", async () => {
        getWishlists.mockReturnValue(new Promise(() => {}));
        render(<DetalleProducto />);
        await waitFor(() => screen.getByText("Mouse gamer"));
        await userEvent.click(screen.getByRole("button", { name: /agregar a favoritos/i }));
        await waitFor(() => {
            expect(screen.getByText("Cargando listas...")).toBeInTheDocument();
        });
    });

    it("muestra 'No tenés listas creadas todavía.' cuando no hay listas", async () => {
        getWishlists.mockResolvedValue([]);
        render(<DetalleProducto />);
        await waitFor(() => screen.getByText("Mouse gamer"));
        await userEvent.click(screen.getByRole("button", { name: /agregar a favoritos/i }));
        await waitFor(() => {
            expect(screen.getByText("No tenés listas creadas todavía.")).toBeInTheDocument();
        });
    });

    it("muestra las listas de deseos disponibles", async () => {
        getWishlists.mockResolvedValue([
            { id: 1, name: "Mi lista favorita", itemCount: 3 },
            { id: 2, name: "Regalos", itemCount: 1 },
        ]);
        render(<DetalleProducto />);
        await waitFor(() => screen.getByText("Mouse gamer"));
        await userEvent.click(screen.getByRole("button", { name: /agregar a favoritos/i }));
        await waitFor(() => {
            expect(screen.getByText("Mi lista favorita")).toBeInTheDocument();
            expect(screen.getByText("Regalos")).toBeInTheDocument();
        });
    });

    it("cierra el modal de wishlist al hacer clic en Cancelar", async () => {
        render(<DetalleProducto />);
        await waitFor(() => screen.getByText("Mouse gamer"));
        await userEvent.click(screen.getByRole("button", { name: /agregar a favoritos/i }));
        await waitFor(() => screen.getByText("No tenés listas creadas todavía."));
        await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
        await waitFor(() => {
            expect(screen.queryByText("Agregar a lista de deseos")).not.toBeInTheDocument();
        });
    });

    it("llama a addWishlistItem al hacer clic en una lista", async () => {
        getWishlists.mockResolvedValue([{ id: 5, name: "Gaming gear", itemCount: 0 }]);
        addWishlistItem.mockResolvedValue({});
        render(<DetalleProducto />);
        await waitFor(() => screen.getByText("Mouse gamer"));
        await userEvent.click(screen.getByRole("button", { name: /agregar a favoritos/i }));
        await waitFor(() => screen.getByText("Gaming gear"));
        await userEvent.click(screen.getByText("Gaming gear"));
        await waitFor(() => {
            expect(addWishlistItem).toHaveBeenCalledWith(7, 5, 10, 1);
        });
    });

    it("muestra el botón 'Agregar al carrito'", async () => {
        render(<DetalleProducto />);
        await waitFor(() => {
            expect(screen.getByRole("button", { name: /agregar al carrito/i })).toBeInTheDocument();
        });
    });

    it("llama a submitProductReport al enviar el reporte", async () => {
        mockAxiosGet.mockResolvedValue(customerSession);
        submitProductReport.mockResolvedValue({ status: 201 });
        render(<DetalleProducto />);
        await waitFor(() => screen.getByTestId("more-vertical"));
        await userEvent.click(screen.getByRole("button", { name: /más opciones/i }));
        await userEvent.click(screen.getByText("Reportar producto"));
        await userEvent.selectOptions(screen.getByRole("combobox"), "DEFECTIVE");
        await userEvent.click(screen.getByRole("button", { name: /enviar/i }));
        await waitFor(() => {
            expect(submitProductReport).toHaveBeenCalledWith({
                productId: 10,
                reason: "DEFECTIVE",
                description: "",
            });
        });
    });
});
