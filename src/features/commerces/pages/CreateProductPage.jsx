import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createProduct,
  fetchProductCategories,
  fetchProductTags,
  getBackendErrorMessage,
} from "../services/createProductApi";
import { CreationResultModal } from "../components/createProduct/CreationResultModal";
import Toggle from "../components/createProduct/Toggle";

const MAX_TAGS = 10;
const MAX_VISIBLE_TAG_SUGGESTIONS = 6;

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

  if (formData.imageUrl.trim()) {
    try {
      // eslint-disable-next-line no-new
      new URL(formData.imageUrl.trim());
    } catch (_error) {
      errors.imageUrl = "Ingresa una URL valida para la imagen.";
    }
  }

  return errors;
};

const inputClassName =
  "mb-3 w-full rounded-[10px] border border-[#d2d8d4] bg-[#f0f2f1] px-3 py-2 text-[14px] text-[#1f2e27] outline-none transition focus:border-[#8fb6a3] focus:ring-4 focus:ring-[rgba(107,144,128,0.16)] disabled:cursor-not-allowed disabled:opacity-60";
const labelClassName = "mb-2 block text-[14px] font-semibold text-[#273830]";
const errorClassName = "-mt-0.5 mb-2 text-[12px] text-[#b32737]";
const cardClassName =
  "rounded-[14px] border border-[#d8dfdb] bg-[#f7f8f7] px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]";
const cardTitleClassName =
  "mb-3.5 text-[20px] font-semibold leading-tight text-[#6b9080] md:text-[22px]";

export default function CreateProductPage() {
  const navigate = useNavigate();

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

  const isFormDisabled = isLoadingInitialData || isSubmitting;

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

        const activeCategories = categoriesData.filter(
          (category) => category?.status !== false
        );
        setCategories(activeCategories);
        setAvailableTags(tagsData);
        setShowAllTagSuggestions(false);
      } catch (error) {
        if (!active) {
          return;
        }
        setLoadError(
          getBackendErrorMessage(
            error,
            "No se pudieron cargar categorias/tags desde el backend."
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
    const isSelected = selectedTags.some((selectedTag) => selectedTag.id === tag.id);
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
  };

  const handleCancel = () => {
    navigate("/comercio");
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
      await createProduct({ payload });
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

  return (
    <div className="ml-0 mr-auto w-full max-w-[1160px] text-[#22312a]">
      <header className="mb-5 flex items-start gap-2.5">
        <button
          type="button"
          className="mt-0.5 cursor-pointer border-none bg-transparent p-1 text-[#2f63f2]"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="m-0 text-[32px] font-semibold leading-[1.1] text-[#6b9080] md:text-[36px]">
            Crear Nuevo Producto
          </h1>
          <p className="mt-1 text-[14px] text-[#2f3b35]">
            Completa la informacion para agregar un nuevo producto
          </p>
        </div>
      </header>

      {loadError && (
        <div
          className="mb-4 rounded-[10px] border border-[#f5c0c8] bg-[#ffe9ec] px-3 py-2.5 font-semibold text-[#9c1f31]"
          role="alert"
        >
          {loadError}
        </div>
      )}

      <form
        className="ml-0 grid grid-cols-1 gap-5 lg:ml-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:ml-12"
        onSubmit={handleSubmit}
        noValidate
      >
        <section className={cardClassName}>
          <h2 className={cardTitleClassName}>Informacion Basica</h2>

          <label className={labelClassName} htmlFor="name">
            Nombre del Producto *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={onFieldChange}
            className={inputClassName}
            placeholder="Ej: Coca Cola 1L"
            disabled={isFormDisabled}
          />
          {validationErrors.name && (
            <p className={errorClassName}>{validationErrors.name}</p>
          )}

          <label className={labelClassName} htmlFor="description">
            Descripcion *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onFieldChange}
            className={`${inputClassName} min-h-[90px] resize-y`}
            placeholder="Describe las caracteristicas del producto"
            disabled={isFormDisabled}
          />
          {validationErrors.description && (
            <p className={errorClassName}>{validationErrors.description}</p>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={labelClassName} htmlFor="price">
                Precio *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={onFieldChange}
                className={inputClassName}
                placeholder="12000"
                disabled={isFormDisabled}
              />
              {validationErrors.price && (
                <p className={errorClassName}>{validationErrors.price}</p>
              )}
            </div>

            <div>
              <label className={labelClassName} htmlFor="categoryId">
                Categoria *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={onFieldChange}
                className={inputClassName}
                disabled={isFormDisabled}
              >
                <option value="">
                  {isLoadingInitialData
                    ? "Cargando categorias..."
                    : "Selecciona una categoria"}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {validationErrors.categoryId && (
                <p className={errorClassName}>{validationErrors.categoryId}</p>
              )}
            </div>

            <div>
              <label className={labelClassName} htmlFor="quantity">
                Stock Disponible *
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={formData.quantity}
                onChange={onFieldChange}
                className={inputClassName}
                placeholder="20"
                disabled={isFormDisabled}
              />
              {validationErrors.quantity && (
                <p className={errorClassName}>{validationErrors.quantity}</p>
              )}
            </div>
          </div>

          <label className={labelClassName} htmlFor="tags">
            Tags (opcional)
          </label>
          <div>
            <input
              id="tags"
              name="tags"
              type="text"
              value={selectedTagNames}
              className={`${inputClassName} mb-0`}
              placeholder="Selecciona tags desde las sugerencias"
              disabled={isFormDisabled}
              readOnly
            />
          </div>
          {validationErrors.tags && (
            <p className={`${errorClassName} mt-2`}>{validationErrors.tags}</p>
          )}

          {displayedTagOptions.length > 0 && (
            <div className="mt-2 rounded-[10px] border border-[#d2d8d4] bg-white p-2.5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                Sugerencias
              </p>
              <div className="flex flex-wrap gap-2">
                {displayedTagOptions.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                      selectedTags.some((selectedTag) => selectedTag.id === tag.id)
                        ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                        : "border-[#b8d4c7] bg-[#eef7f2] text-[#356852] hover:bg-[#dff0e8]"
                    }`}
                    disabled={isFormDisabled}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>

              {!showAllTagSuggestions &&
                availableTags.length > MAX_VISIBLE_TAG_SUGGESTIONS && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowAllTagSuggestions(true)}
                      className="rounded-md border border-[#9ebde8] bg-[#ebf4ff] px-3 py-1.5 text-xs font-semibold text-[#3b72bd] transition hover:bg-[#ddeeff]"
                      disabled={isFormDisabled}
                    >
                      Ver mas
                    </button>
                  </div>
                )}
            </div>
          )}

          <p className="mb-1.5 mt-3 text-[13px] text-[#44564d]">
            Puedes agregar hasta {MAX_TAGS} tags.
          </p>
        </section>

        <aside className="flex flex-col gap-5">
          <section className={cardClassName}>
            <h2 className={cardTitleClassName}>Imagen del Producto</h2>
            <label className={labelClassName} htmlFor="imageUrl">
              URL de la Imagen (opcional)
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={onFieldChange}
              className={inputClassName}
              placeholder="https://..."
              disabled={isFormDisabled}
            />
            {validationErrors.imageUrl && (
              <p className={errorClassName}>{validationErrors.imageUrl}</p>
            )}
          </section>

          <section className={cardClassName}>
            <h2 className={cardTitleClassName}>Estado del Producto</h2>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`${labelClassName} mb-0.5`}>Estado</p>
                <p
                  className={`mb-0 text-[13px] font-semibold ${
                    formData.isVisible ? "text-emerald-700" : "text-slate-600"
                  }`}
                >
                  {formData.isVisible ? "Visible para clientes" : "No visible"}
                </p>
              </div>

              <Toggle
                isOn={formData.isVisible}
                disabled={isFormDisabled}
                label="Visibilidad del producto"
                onToggle={(nextValue) =>
                  setFormData((previous) => ({
                    ...previous,
                    isVisible: nextValue,
                  }))
                }
              />
            </div>

            <div
              className={`mt-3.5 rounded-[10px] px-3 py-2.5 text-[13px] font-semibold ${
                formData.isVisible
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {formData.isVisible
                ? "Los clientes pueden ver y comprar este producto."
                : "El producto esta oculto y no se mostrara a clientes."}
            </div>
          </section>
        </aside>

        <div className="flex items-center justify-start gap-3 border-t border-[#d0d7d2] pt-4 lg:col-span-2 lg:justify-end">
          <button
            type="button"
            className="min-w-[118px] cursor-pointer rounded-[10px] border border-[#adb8b2] bg-[#f6f7f6] px-4 py-2 font-semibold text-[#5d6661] transition disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleCancel}
            disabled={isFormDisabled}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="min-w-[118px] cursor-pointer rounded-[10px] border border-transparent bg-[#6b9080] px-4 py-2 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isFormDisabled}
          >
            {isSubmitting ? "Creando..." : "Crear Producto"}
          </button>
        </div>
      </form>

      <CreationResultModal
        isOpen={resultModal.isOpen}
        variant={resultModal.variant}
        title={resultModal.title}
        message={resultModal.message}
        onClose={() =>
          setResultModal((previous) => ({ ...previous, isOpen: false }))
        }
      />
    </div>
  );
}
