import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
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
  categoryIds: [],
  quantity: "",
  imageUrl: "",
  isVisible: true,
};

const productSchema = z.object({
  name: z.string().min(1, "El nombre del producto es obligatorio."),
  description: z.string().min(1, "La descripcion es obligatoria."),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0."),
  categoryIds: z.array(z.coerce.number().int().positive()).min(1, "Selecciona al menos una categoria."),
  quantity: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().min(0, "El stock debe ser un número entero mayor o igual a 0.")),
});

const validateForm = (formData, selectedTags) => {
  const parsed = productSchema.safeParse({
    name: formData.name.trim(),
    description: formData.description.trim(),
    price: formData.price,
    categoryIds: formData.categoryIds,
    quantity: formData.quantity,
  });

  const errors = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key && !errors[key]) errors[key] = issue.message;
    }
  }

  if (selectedTags.length > MAX_TAGS) {
    errors.tags = `No puedes seleccionar mas de ${MAX_TAGS} tags.`;
  }

  return errors;
};

export const useCreateProduct = ({ onSuccess, onError } = {}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showAllTagSuggestions, setShowAllTagSuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [loadError, setLoadError] = useState("");
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      onError?.("Revisá los campos del formulario antes de continuar");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      categoryIds: formData.categoryIds.map((categoryId) => Number(categoryId)),
      quantity: Number(formData.quantity),
      visible: formData.isVisible,
      tags: selectedTags.map((tag) => tag.id),
    };

    setIsSubmitting(true);

    try {
      const created = await createProduct({ payload });
      if (imageFile instanceof File && (created?.id_product ?? created?.id)) {
        await uploadProductImage(created.id_product ?? created.id, imageFile).catch(() => {})
      }

      setResultModal({
        isOpen: true,
        variant: "success",
        title: "Producto creado",
        message: "El producto se creo correctamente.",
      });
      onSuccess?.("Producto creado correctamente");
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
      onError?.(getBackendErrorMessage(error, "No se pudo crear el producto. Intenta nuevamente."));
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
    isLoadingInitialData,
    isSubmitting,
    isFormDisabled: isLoadingInitialData || isSubmitting,
    imageFile,
    setFormData,
    setShowAllTagSuggestions,
    onFieldChange,
    onImageFileChange,
    toggleTag,
    removeTag,
    handleSubmit,
  };
};