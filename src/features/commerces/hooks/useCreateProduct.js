//useCreateProduct.js
import { useEffect, useMemo, useState } from "react";
import {
  createProduct,
  fetchProductCategories,
  fetchProductTags,
  uploadProductImage,
  getBackendErrorMessage,
} from "../services/createProductApi";

export const MAX_TAGS = 10;
export const MAX_VISIBLE_TAG_SUGGESTIONS = 6;

const INITIAL_FORM_STATE = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  quantity: "",
  imageUrl: "",
  isVisible: true,
};

const validateForm = (formData, selectedTags) => {
  const errors = {};

  if (!formData.name.trim()) {
    errors.name = "El nombre del producto es obligatorio.";
  }

  if (!formData.description.trim()) {
    errors.description = "La descripcion es obligatoria.";
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
    errors.categoryId = "Selecciona una categoria.";
  }

  if (formData.quantity === "" || formData.quantity === null) {
    errors.quantity = "El stock disponible es obligatorio.";
  } else {
    const numericQuantity = Number(formData.quantity);
    if (
      !Number.isInteger(numericQuantity) ||
      Number.isNaN(numericQuantity) ||
      numericQuantity < 0
    ) {
      errors.quantity = "El stock debe ser un numero entero mayor o igual a 0.";
    }
  }

  if (selectedTags.length > MAX_TAGS) {
    errors.tags = `No puedes seleccionar mas de ${MAX_TAGS} tags.`;
  }

  return errors;
};

export const useCreateProduct = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAllTagSuggestions, setShowAllTagSuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [loadError, setLoadError] = useState("");
  const [resultModal, setResultModal] = useState({
    isOpen: false,
    variant: "success",
    title: "",
    message: "",
  });
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // archivo de imagen seleccionado localmente (se sube después de crear el producto)
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      setIsLoadingInitialData(true);
      setLoadError("");

      try {
        const [categoriesData, tagsData] = await Promise.all([
          fetchProductCategories(),
          fetchProductTags(),
        ]);

        if (!active) {
          return;
        }

        setCategories(
          categoriesData.filter((category) => category?.status !== false)
        );
        setAvailableTags(tagsData.filter((tag) => tag?.status !== false));
        setShowAllTagSuggestions(false);
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadError(
          getBackendErrorMessage(
            error,
            "No se pudieron cargar los datos para crear el producto."
          )
        );
      } finally {
        if (active) {
          setIsLoadingInitialData(false);
        }
      }
    };

    loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  const displayedTagOptions = useMemo(() => {
    if (showAllTagSuggestions) {
      return availableTags;
    }

    return availableTags.slice(0, MAX_VISIBLE_TAG_SUGGESTIONS);
  }, [availableTags, showAllTagSuggestions]);

  const selectedTagNames = useMemo(
    () => selectedTags.map((tag) => tag.name).join(", "),
    [selectedTags]
  );

  const onFieldChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setValidationErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // acepta un File para preview local, o null para limpiar
  const onImageFileChange = (file) => {
    setImageFile(file);
  };

  const addTag = (tag) => {
    if (!tag || selectedTags.length >= MAX_TAGS) {
      return;
    }

    const alreadySelected = selectedTags.some(
      (selectedTag) => selectedTag.id === tag.id
    );

    if (alreadySelected) {
      return;
    }

    setSelectedTags((previous) => [...previous, tag]);
    setValidationErrors((previous) => ({
      ...previous,
      tags: "",
    }));
  };

  const removeTag = (tagId) => {
    setSelectedTags((previous) =>
      previous.filter((tag) => tag.id !== tagId)
    );
  };

  const toggleTag = (tag) => {
    const isSelected = selectedTags.some(
      (selectedTag) => selectedTag.id === tag.id
    );

    if (isSelected) {
      removeTag(tag.id);
      return;
    }

    addTag(tag);
  };

  const closeModal = () => {
    setResultModal((previous) => ({ ...previous, isOpen: false }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setSelectedTags([]);
    setValidationErrors({});
    setShowAllTagSuggestions(false);
    setImageFile(null);
  };

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
      quantity: Number(formData.quantity),
      visible: formData.isVisible,
      tags: selectedTags.map((tag) => tag.id),
    };

    setIsSubmitting(true);

    try {
      const created = await createProduct({ payload });

      // si el usuario seleccionó una imagen, la subimos usando el id del producto recién creado
      if (imageFile instanceof File && (created?.id_product ?? created?.id)) {
        await uploadProductImage(created.id_product ?? created.id, imageFile).catch((err) => {
          // no bloqueamos el éxito del producto por un fallo de imagen
          console.warn("[WARN] No se pudo subir la imagen del producto:", err);
        });
      }

      setResultModal({
        isOpen: true,
        variant: "success",
        title: "Producto creado",
        message: "El producto se creo correctamente.",
      });
      resetForm();
    } catch (error) {
      setResultModal({
        isOpen: true,
        variant: "error",
        title: "No se pudo crear",
        message: getBackendErrorMessage(
          error,
          "No se pudo crear el producto. Intenta nuevamente."
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    categories,
    availableTags,
    selectedTags,
    displayedTagOptions,
    selectedTagNames,
    showAllTagSuggestions,
    validationErrors,
    loadError,
    resultModal,
    isLoadingInitialData,
    isSubmitting,
    isFormDisabled: isLoadingInitialData || isSubmitting,
    imageFile,
    setFormData,
    setShowAllTagSuggestions,
    closeModal,
    onFieldChange,
    onImageFileChange,
    toggleTag,
    removeTag,
    handleSubmit,
  };
};