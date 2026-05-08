import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetProductById = vi.fn();
const mockGetProductReviews = vi.fn();
const mockUpdateProduct = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
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

const emptyReviews = {
    reviews: [],
    stats: { averageRating: null, totalReviews: 0, verifiedReviews: 0 },
};

const mockReview = {
    id: 1,
    customerName: "María González",
    rating: 4,
    comment: "Excelente producto, muy recomendable",
    date: "2026-03-15T00:00:00.000Z",
    isVerified: true,
};

describe("ProductDetailView", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetProductById.mockResolvedValue(baseProduct);
        mockGetProductReviews.mockResolvedValue(emptyReviews);
        mockUpdateProduct.mockResolvedValue({
            ...baseProduct,
            price: 8500,
            originalPrice: 10000,
            offerPrice: 8500,
            isOffer: true,
        });
    });

    it("muestra 'Cargando producto...' durante la carga", () => {
        mockGetProductById.mockReturnValue(new Promise(() => {}));
        render(<ProductDetailView />);
        expect(screen.getByText("Cargando producto...")).toBeInTheDocument();
    });

    it("muestra error cuando falla la carga del producto", async () => {
        mockGetProductById.mockRejectedValue({ response: { data: { message: "Producto no encontrado" } } });
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("Producto no encontrado")).toBeInTheDocument();
        });
    });

    it("muestra el nombre del producto en el header", async () => {
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getAllByText("Producto detalle").length).toBeGreaterThan(0);
        });
    });

    it("muestra la descripción del producto", async () => {
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("Descripcion breve")).toBeInTheDocument();
        });
    });

    it("muestra la categoría del producto", async () => {
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("Categoria test")).toBeInTheDocument();
        });
    });

    it("muestra el estado 'Activo' cuando status es active", async () => {
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("Activo")).toBeInTheDocument();
        });
    });

    it("muestra el estado 'Oculto' cuando status no es active", async () => {
        mockGetProductById.mockResolvedValue({ ...baseProduct, status: "inactive" });
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("Oculto")).toBeInTheDocument();
        });
    });

    it("muestra el botón 'Editar Producto'", async () => {
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByRole("button", { name: /editar producto/i })).toBeInTheDocument();
        });
    });

    it("muestra 'Este producto aún no tiene reseñas.' cuando no hay reseñas", async () => {
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("Este producto aún no tiene reseñas.")).toBeInTheDocument();
        });
    });

    it("muestra reseñas cuando existen", async () => {
        mockGetProductReviews.mockResolvedValue({
            reviews: [mockReview],
            stats: { averageRating: 4, totalReviews: 1, verifiedReviews: 1 },
        });
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("María González")).toBeInTheDocument();
            expect(screen.getByText("Excelente producto, muy recomendable")).toBeInTheDocument();
        });
    });

    it("muestra 'Verificada' para reseñas verificadas", async () => {
        mockGetProductReviews.mockResolvedValue({
            reviews: [mockReview],
            stats: { averageRating: 4, totalReviews: 1, verifiedReviews: 1 },
        });
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("Verificada")).toBeInTheDocument();
        });
    });

    it("muestra tags cuando el producto tiene etiquetas", async () => {
        mockGetProductById.mockResolvedValue({
            ...baseProduct,
            tags: [{ id: 1, name: "gaming" }, { id: 2, name: "oferta" }],
        });
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("gaming")).toBeInTheDocument();
            expect(screen.getByText("oferta")).toBeInTheDocument();
        });
    });

    it("muestra 'Desactivada' en la sección de oferta cuando no hay oferta", async () => {
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("Desactivada")).toBeInTheDocument();
        });
    });

    it("muestra 'Activa' cuando se activa la oferta", async () => {
        const user = userEvent.setup();
        render(<ProductDetailView />);
        await waitFor(() => screen.getByRole("switch", { name: /activar oferta/i }));
        await user.click(screen.getByRole("switch", { name: /activar oferta/i }));
        await waitFor(() => {
            expect(screen.getByText("Activa")).toBeInTheDocument();
        });
    });

    it("muestra el campo de precio de oferta al activar la oferta", async () => {
        const user = userEvent.setup();
        render(<ProductDetailView />);
        await waitFor(() => screen.getByRole("switch", { name: /activar oferta/i }));
        await user.click(screen.getByRole("switch", { name: /activar oferta/i }));
        await waitFor(() => {
            expect(screen.getByLabelText(/precio de oferta/i)).toBeInTheDocument();
        });
    });

    it("muestra validación si activan la oferta sin precio", async () => {
        const user = userEvent.setup();
        render(<ProductDetailView />);
        await waitFor(() => screen.getByRole("switch", { name: /activar oferta/i }));
        await user.click(screen.getByRole("switch", { name: /activar oferta/i }));
        await user.click(screen.getByRole("button", { name: /guardar oferta/i }));
        expect(mockUpdateProduct).not.toHaveBeenCalled();
        expect(screen.getByText("Ingresá un precio de oferta válido mayor a 0.")).toBeInTheDocument();
    });

    it("permite actualizar la oferta desde ProductDetailView", async () => {
        const user = userEvent.setup();
        render(<ProductDetailView />);
        await waitFor(() => screen.getByRole("button", { name: /editar producto/i }));
        await user.click(screen.getByRole("switch", { name: /activar oferta/i }));
        const offerInput = await screen.findByLabelText(/precio de oferta/i);
        await user.clear(offerInput);
        await user.type(offerInput, "8500");
        await user.click(screen.getByRole("button", { name: /guardar oferta/i }));
        await waitFor(() => {
            expect(mockUpdateProduct).toHaveBeenCalledWith({
                productId: "7",
                payload: { isOffer: true, offerPrice: 8500 },
            });
        });
        expect(await screen.findByText("La oferta del producto se actualizó correctamente.")).toBeInTheDocument();
    });

    it("muestra error cuando falla la actualización de oferta", async () => {
        mockUpdateProduct.mockRejectedValue(new Error("Error de servidor"));
        const user = userEvent.setup();
        render(<ProductDetailView />);
        await waitFor(() => screen.getByRole("switch", { name: /activar oferta/i }));
        await user.click(screen.getByRole("switch", { name: /activar oferta/i }));
        const offerInput = await screen.findByLabelText(/precio de oferta/i);
        await user.clear(offerInput);
        await user.type(offerInput, "8500");
        await user.click(screen.getByRole("button", { name: /guardar oferta/i }));
        await waitFor(() => {
            expect(screen.getByText("No se pudo actualizar la oferta del producto.")).toBeInTheDocument();
        });
    });

    it("muestra el promedio de calificación cuando existe", async () => {
        mockGetProductById.mockResolvedValue({ ...baseProduct, averageRating: 4.2 });
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("4.2")).toBeInTheDocument();
        });
    });

    it("muestra el precio de oferta cuando el producto tiene oferta activa", async () => {
        mockGetProductById.mockResolvedValue({
            ...baseProduct,
            isOffer: true,
            offerPrice: 7500,
        });
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("Precio de oferta:")).toBeInTheDocument();
        });
    });

    it("muestra 'Sin descripción.' cuando no hay descripción", async () => {
        mockGetProductById.mockResolvedValue({ ...baseProduct, description: "" });
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("Sin descripción.")).toBeInTheDocument();
        });
    });

    it("muestra las estadísticas de reseñas", async () => {
        mockGetProductReviews.mockResolvedValue({
            reviews: [],
            stats: { averageRating: 3.8, totalReviews: 10, verifiedReviews: 7 },
        });
        render(<ProductDetailView />);
        await waitFor(() => {
            expect(screen.getByText("Total de reseñas:")).toBeInTheDocument();
        });
    });
});
