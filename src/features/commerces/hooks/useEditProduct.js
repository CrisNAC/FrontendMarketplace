import { useState, useEffect, useMemo } from "react";
import {
    fetchProductById,
    fetchProductCategories,
    fetchProductTags,
    updateProduct,
    getBackendErrorMessage,
} from "../services/editProductApi";

const MAX_TAGS = 10;
const MAX_VISIBLE_TAG_SUGGESTIONS = 6;

const validateForm = (formData, selectedTags) => {
    const errors = {};

    if (!formData.name.trim()) {
        errors.name = "El nombre del producto es obligatorio.";
    }

    if (!formData.description.trim()) {
        errors.description = "La descripción es obligatoria.";
    }

    if (formData.price === "" || formData.price === null) {
        errors.price = "El precio es obligatorio.";
    } else {
        const numericPrice = Number(formData.price);
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            errors.price = "El precio debe ser mayor a 0.";
        }
    }

    if (!formData.categoryId) {
        errors.categoryId = "Seleccioná una categoría.";
    }

    if (selectedTags.length > MAX_TAGS) {
        errors.tags = `No podés seleccionar más de ${MAX_TAGS} etiquetas.`;
    }

    if (formData.imageUrl.trim()) {
        try {
            new URL(formData.imageUrl.trim());
        } catch {
            errors.imageUrl = "Ingresá una URL válida para la imagen.";
        }
    }

    return errors;
};

/**
 * Hook que encapsula toda la lógica de edición de producto.
 * La página solo consume este hook y renderiza la UI.
 *
 * @param {number|string} productId - ID del producto a editar
 */
export const useEditProduct = (productId) => {
    // ── Datos de referencia (categorías y tags del servidor) ──────────────────
    const [categories, setCategories] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
    const [loadError, setLoadError] = useState("");

    // ── Estado del formulario ─────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        imageUrl: "",
        isVisible: true,
    });
    const [selectedTags, setSelectedTags] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [showAllTagSuggestions, setShowAllTagSuggestions] = useState(false);

    // ── Estado de envío ────────────────────────────────────────────────────────
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resultModal, setResultModal] = useState({
        isOpen: false,
        variant: "success",
        title: "",
        message: "",
    });

    // ── Carga inicial: producto + categorías + tags en paralelo ───────────────
    useEffect(() => {
        if (!productId) return;

        let active = true;

        const loadAll = async () => {
            setIsLoadingInitialData(true);
            setLoadError("");

            try {
                const [product, categoriesData, tagsData] = await Promise.all([
                    fetchProductById(productId),
                    fetchProductCategories(),
                    fetchProductTags(),
                ]);

                if (!active) return;

                // Pre-llenar el formulario con los datos actuales del producto
                setFormData({
                    name: product.name ?? "",
                    description: product.description ?? "",
                    price: product.price ?? "",
                    categoryId: product.categoryId ? String(product.categoryId) : "",
                    imageUrl: product.imageUrl ?? "",
                    isVisible: product.visible ?? true,
                });

                setSelectedTags(product.tags ?? []);

                const activeCategories = categoriesData.filter(
                    (cat) => cat?.status !== false
                );
                setCategories(activeCategories);
                setAvailableTags(tagsData);
            } catch (error) {
                if (!active) return;
                setLoadError(
                    getBackendErrorMessage(
                        error,
                        "No se pudieron cargar los datos del producto."
                    )
                );
            } finally {
                if (active) setIsLoadingInitialData(false);
            }
        };

        loadAll();
        return () => { active = false; };
    }, [productId]);

    // ── Tags visibles en las sugerencias ─────────────────────────────────────
    const displayedTagOptions = useMemo(() => {
        if (showAllTagSuggestions) return availableTags;
        return availableTags.slice(0, MAX_VISIBLE_TAG_SUGGESTIONS);
    }, [availableTags, showAllTagSuggestions]);

    const selectedTagNames = useMemo(
        () => selectedTags.map((tag) => tag.name).join(", "),
        [selectedTags]
    );

    // ── Handlers del formulario ───────────────────────────────────────────────
    const onFieldChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Limpiar error del campo al modificarlo
        setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const toggleTag = (tag) => {
        const isSelected = selectedTags.some((t) => t.id === tag.id);
        if (isSelected) {
            setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id));
        } else {
            if (selectedTags.length >= MAX_TAGS) return;
            setSelectedTags((prev) => [...prev, tag]);
        }
        setValidationErrors((prev) => ({ ...prev, tags: "" }));
    };

    const removeTag = (tagId) => {
        setSelectedTags((prev) => prev.filter((t) => t.id !== tagId));
    };

    const closeModal = () => {
        setResultModal((prev) => ({ ...prev, isOpen: false }));
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (event) => {
        event.preventDefault();

        const errors = validateForm(formData, selectedTags);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        const payload = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: Number(formData.price),
            categoryId: Number(formData.categoryId),
            visible: formData.isVisible,
            imageUrl: formData.imageUrl.trim() || null,
            tags: selectedTags.map((tag) => tag.id),
        };

        setIsSubmitting(true);
        try {
            await updateProduct({ productId, payload });
            setResultModal({
                isOpen: true,
                variant: "success",
                title: "Producto actualizado",
                message: "Los cambios se guardaron correctamente.",
            });
        } catch (error) {
            setResultModal({
                isOpen: true,
                variant: "error",
                title: "No se pudo actualizar",
                message: getBackendErrorMessage(
                    error,
                    "No se pudo actualizar el producto. Intentá nuevamente."
                ),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        // Estado del formulario
        formData,
        selectedTags,
        validationErrors,
        // Datos de referencia
        categories,
        availableTags,
        displayedTagOptions,
        selectedTagNames,
        showAllTagSuggestions,
        setShowAllTagSuggestions,
        // Estados de carga
        isLoadingInitialData,
        isSubmitting,
        isFormDisabled: isLoadingInitialData || isSubmitting,
        loadError,
        // Modal de resultado
        resultModal,
        closeModal,
        // Handlers
        onFieldChange,
        toggleTag,
        removeTag,
        handleSubmit,
        // Constantes útiles para la UI
        MAX_TAGS,
        MAX_VISIBLE_TAG_SUGGESTIONS,
    };
};