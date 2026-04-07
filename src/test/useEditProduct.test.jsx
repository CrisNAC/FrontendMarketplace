import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetchProductById = vi.fn();
const mockFetchProductCategories = vi.fn();
const mockFetchProductTags = vi.fn();
const mockUpdateProduct = vi.fn();

vi.mock("../features/commerces/services/editProductApi", () => ({
  fetchProductById: (...args) => mockFetchProductById(...args),
  fetchProductCategories: (...args) => mockFetchProductCategories(...args),
  fetchProductTags: (...args) => mockFetchProductTags(...args),
  updateProduct: (...args) => mockUpdateProduct(...args),
  getBackendErrorMessage: (_error, fallbackMessage) => fallbackMessage,
}));

import { useEditProduct } from "../features/commerces/hooks/useEditProduct";

const baseProduct = {
  name: "Producto Test",
  description: "Descripcion de prueba",
  price: 10000,
  categoryId: 2,
  imageUrl: "",
  visible: true,
  isOffer: false,
  offerPrice: null,
  tags: [],
};

describe("useEditProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchProductById.mockResolvedValue(baseProduct);
    mockFetchProductCategories.mockResolvedValue([
      { id: 2, name: "Categoria test", status: true },
    ]);
    mockFetchProductTags.mockResolvedValue([]);
    mockUpdateProduct.mockResolvedValue({});
  });

  it("envia isOffer=true y offerPrice cuando la oferta esta activa", async () => {
    const { result } = renderHook(() => useEditProduct(15));

    await waitFor(() => {
      expect(result.current.isLoadingInitialData).toBe(false);
    });

    act(() => {
      result.current.onFieldChange({
        target: {
          name: "isOffer",
          value: true,
          type: "checkbox",
          checked: true,
        },
      });
    });

    act(() => {
      result.current.onFieldChange({
        target: {
          name: "offerPrice",
          value: "8500",
          type: "number",
        },
      });
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(mockUpdateProduct).toHaveBeenCalledWith({
      productId: 15,
      payload: expect.objectContaining({
        isOffer: true,
        offerPrice: 8500,
      }),
    });
  });

  it("envia offerPrice=null cuando la oferta se desactiva", async () => {
    mockFetchProductById.mockResolvedValueOnce({
      ...baseProduct,
      isOffer: true,
      offerPrice: 9000,
    });

    const { result } = renderHook(() => useEditProduct(21));

    await waitFor(() => {
      expect(result.current.isLoadingInitialData).toBe(false);
    });

    act(() => {
      result.current.onFieldChange({
        target: {
          name: "isOffer",
          value: false,
          type: "checkbox",
          checked: false,
        },
      });
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(mockUpdateProduct).toHaveBeenCalledWith({
      productId: 21,
      payload: expect.objectContaining({
        isOffer: false,
        offerPrice: null,
      }),
    });
  });

  it("bloquea el submit si activan oferta sin precio de oferta", async () => {
    const { result } = renderHook(() => useEditProduct(33));

    await waitFor(() => {
      expect(result.current.isLoadingInitialData).toBe(false);
    });

    act(() => {
      result.current.onFieldChange({
        target: {
          name: "isOffer",
          value: true,
          type: "checkbox",
          checked: true,
        },
      });
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(mockUpdateProduct).not.toHaveBeenCalled();
    expect(result.current.validationErrors.offerPrice).toBe(
      "El precio de oferta es obligatorio."
    );
  });
});
