import { useState, useEffect, useMemo } from "react";
import {
    fetchProductById,
    fetchProductCategories,
    fetchProductTags,
    updateProduct,
    uploadProductImage,
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

    if (formData.quantity === "" || formData.quantity === null || formData.quantity === undefined) {
        errors.quantity = "El stock es obligatorio.";
    } else {
        const numericQuantity = Number(formData.quantity);
        if (!Number.isInteger(numericQuantity) || numericQuantity < 0) {
            errors.quantity = "El stock debe ser un número entero mayor o igual a 0.";
        }
    }

    if (!Array.isArray(formData.categoryIds) || formData.categoryIds.length === 0) {
        errors.categoryIds = "Seleccioná al menos una categoría.";
    }

    if (selectedTags.length > MAX_TAGS) {
        errors.tags = `No podés seleccionar más de ${MAX_TAGS} etiquetas.`;
    }

    if (formData.isOffer) {
        if (formData.offerPrice === "" || formData.offerPrice === null) {
            errors.offerPrice = "El precio de oferta es obligatorio.";
        } else {
            const numericOfferPrice = Number(formData.offerPrice);
            if (!Number.isFinite(numericOfferPrice) || numericOfferPrice <= 0) {
                errors.offerPrice = "El precio de oferta debe ser mayor a 0.";
            }
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
export const useEditProduct = (productId, { onSuccess, onError } = {}) => {
    const [categories, setCategories] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        categoryIds: [],
        imageUrl: "",
        isVisible: true,
        isOffer: false,
        offerPrice: "",
        quantity: 0,
    });
    const [selectedTags, setSelectedTags] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [showAllTagSuggestions, setShowAllTagSuggestions] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                setFormData({
                    name: product.name ?? "",
                    description: product.description ?? "",
                    price: product.price ?? "",
                    categoryIds: Array.isArray(product.categories) && product.categories.length > 0
                        ? product.categories.map((category) => String(category.id))
                        : product.categoryId
                            ? [String(product.categoryId)]
                            : [],
                    imageUrl: product.imageUrl ?? product.image_url ?? "",
                    isVisible: product.visible ?? true,
                    isOffer: Boolean(product.isOffer),
                    offerPrice: product.offerPrice ?? "",
                    quantity: product.quantity ?? 0,
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

    const displayedTagOptions = useMemo(() => {
        if (showAllTagSuggestions) return availableTags;
        return availableTags.slice(0, MAX_VISIBLE_TAG_SUGGESTIONS);
    }, [availableTags, showAllTagSuggestions]);

    const selectedTagNames = useMemo(
        () => selectedTags.map((tag) => tag.name).join(", "),
        [selectedTags]
    );

    const onFieldChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setValidationErrors((prev) => ({
            ...prev,
            [name]: "",
            ...(name === "isOffer" ? { offerPrice: "" } : {}),
        }));
    };

    const onImageFileChange = (file) => {
        setImageFile(file);
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errors = validateForm(formData, selectedTags);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            onError?.("Revisá los campos del formulario antes de continuar");
            return;
        }

        const payload = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: Number(formData.price),
            categoryIds: formData.categoryIds.map((categoryId) => Number(categoryId)),
            visible: formData.isVisible,
            isOffer: formData.isOffer,
            offerPrice: formData.isOffer ? Number(formData.offerPrice) : null,
            imageUrl: formData.imageUrl.trim() || null,
            tags: selectedTags.map((tag) => tag.id),
            quantity: Number(formData.quantity),
        };

        setIsSubmitting(true);
        try {
            await updateProduct({ productId, payload });
            if (imageFile instanceof File) {
                const { image_url } = await uploadProductImage(productId, imageFile);
                setFormData(prev => ({ ...prev, imageUrl: image_url }));
                setImageFile(null);
            }

            onSuccess?.("Producto actualizado correctamente");
        } catch (error) {
            onError?.(getBackendErrorMessage(error, "No se pudo actualizar el producto. Intenta nuevamente."));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        selectedTags,
        validationErrors,
        categories,
        availableTags,
        displayedTagOptions,
        selectedTagNames,
        showAllTagSuggestions,
        setShowAllTagSuggestions,
        isLoadingInitialData,
        isSubmitting,
        isFormDisabled: isLoadingInitialData || isSubmitting,
        loadError,
        onFieldChange,
        onImageFileChange,
        imageFile,
        toggleTag,
        removeTag,
        handleSubmit,
        MAX_TAGS,
        MAX_VISIBLE_TAG_SUGGESTIONS,
    };
};