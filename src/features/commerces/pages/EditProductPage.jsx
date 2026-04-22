import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditProduct } from "../hooks/useEditProduct";
import { CreationResultModal } from "../components/createProduct/CreationResultModal";
import { CategoryRequestModal } from "../components/createProduct/CategoryRequestModal";
import Toggle from "../components/createProduct/Toggle";
import { useCategoryRequest } from "../hooks/useCategoryRequest";

// ─── Clases reutilizadas de CreateProductPage (misma apariencia) ──────────────
const inputClassName =
    "mb-3 w-full rounded-[10px] border border-[#d2d8d4] bg-[#f0f2f1] px-3 py-2 text-[14px] text-[#1f2e27] outline-none transition focus:border-[#8fb6a3] focus:ring-4 focus:ring-[rgba(107,144,128,0.16)] disabled:cursor-not-allowed disabled:opacity-60";
const labelClassName = "mb-2 block text-[14px] font-semibold text-[#273830]";
const errorClassName = "-mt-0.5 mb-2 text-[12px] text-[#b32737]";
const cardClassName =
    "rounded-[14px] border border-[#d8dfdb] bg-[#f7f8f7] px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]";
const cardTitleClassName =
    "mb-3.5 text-[20px] font-semibold leading-tight text-[#6b9080] md:text-[22px]";

export default function EditProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        formData,
        selectedTags,
        validationErrors,
        categories,
        displayedTagOptions,
        showAllTagSuggestions,
        setShowAllTagSuggestions,
        isLoadingInitialData,
        isSubmitting,
        isFormDisabled,
        loadError,
        resultModal,
        closeModal,
        onFieldChange,
        onImageFileChange,
        imageFile,
        toggleTag,
        removeTag,
        handleSubmit,
        MAX_TAGS,
        availableTags,
    } = useEditProduct(id);

    // ── Modal de solicitud de categoría ──────────────────────────────────────
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const {
        formData: categoryRequestFormData,
        validationErrors: categoryRequestErrors,
        isSubmitting: isSubmittingCategoryRequest,
        resultModal: categoryRequestResultModal,
        closeModal: closeCategoryRequestResultModal,
        onFieldChange: onCategoryRequestFieldChange,
        resetForm: resetCategoryRequestForm,
        handleSubmit: handleCategoryRequestSubmit,
    } = useCategoryRequest();

    const handleCloseCategoryModal = () => {
        setIsCategoryModalOpen(false);
        if (!isSubmittingCategoryRequest) resetCategoryRequestForm();
    };

    const handleCategoryRequestSuccess = () => {
        if (categoryRequestResultModal.variant === "success") {
            // En EditProduct no tenemos setFormData, usamos onFieldChange
            onFieldChange({ target: { name: "categoryId", value: "", type: "text" } });
            setIsCategoryModalOpen(false);
            resetCategoryRequestForm();
        }
    };

    return (
        <div className="ml-0 mr-auto w-full max-w-[1160px] text-[#22312a]">

            {/* ── Encabezado ── */}
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
                        Editar Producto
                    </h1>
                    <p className="mt-1 text-[14px] text-[#2f3b35]">
                        Modificá la información de tu producto
                    </p>
                </div>
            </header>

            {/* ── Error de carga ── */}
            {loadError && (
                <div
                    className="mb-4 rounded-[10px] border border-[#f5c0c8] bg-[#ffe9ec] px-3 py-2.5 font-semibold text-[#9c1f31]"
                    role="alert"
                >
                    {loadError}
                </div>
            )}

            {/* ── Formulario ── */}
            <form
                className="ml-0 grid grid-cols-1 gap-5 lg:ml-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:ml-12"
                onSubmit={handleSubmit}
                noValidate
            >

                {/* ════════════════ INFORMACIÓN BÁSICA ════════════════ */}
                <section className={cardClassName}>
                    <h2 className={cardTitleClassName}>Información Básica</h2>

                    {/* Nombre */}
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
                        placeholder="Ej: Silla Ergonómica de Oficina"
                        disabled={isFormDisabled}
                    />
                    {validationErrors.name && (
                        <p className={errorClassName}>{validationErrors.name}</p>
                    )}

                    {/* Descripción */}
                    <label className={labelClassName} htmlFor="description">
                        Descripción *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={onFieldChange}
                        className={`${inputClassName} min-h-[90px] resize-y`}
                        placeholder="Describí las características del producto"
                        disabled={isFormDisabled}
                    />
                    {validationErrors.description && (
                        <p className={errorClassName}>{validationErrors.description}</p>
                    )}

                    {/* Precio + Categoría */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                placeholder="89990"
                                disabled={isFormDisabled}
                            />
                            {validationErrors.price && (
                                <p className={errorClassName}>{validationErrors.price}</p>
                            )}
                        </div>

                        <div>
                            <label className={labelClassName} htmlFor="categoryId">
                                Categoría *
                            </label>
                            <div className="flex flex-col gap-1.5">
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
                                            ? "Cargando categorías..."
                                            : "Seleccioná una categoría"}
                                    </option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {/* ── Solicitar nueva categoría ── */}
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    disabled={isFormDisabled}
                                    className="self-start text-xs font-semibold text-[#2f63f2] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    ¿No encontrás tu categoría? Solicitala
                                </button>
                            </div>
                            {validationErrors.categoryId && (
                                <p className={errorClassName}>{validationErrors.categoryId}</p>
                            )}
                        </div>
                    </div>

                    {/* ── Oferta ── */}
                    <div className="mt-1 rounded-[12px] border border-[#d2d8d4] bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className={`${labelClassName} mb-0.5`}>Producto en oferta</p>
                                <p
                                    className={`mb-0 text-[13px] font-semibold ${
                                        formData.isOffer ? "text-amber-700" : "text-slate-600"
                                    }`}
                                >
                                    {formData.isOffer ? "Oferta activa" : "Precio regular"}
                                </p>
                            </div>

                            <Toggle
                                isOn={formData.isOffer}
                                disabled={isFormDisabled}
                                label="Producto en oferta"
                                onToggle={(nextValue) =>
                                    onFieldChange({
                                        target: {
                                            name: "isOffer",
                                            value: nextValue,
                                            type: "checkbox",
                                            checked: nextValue,
                                        },
                                    })
                                }
                            />
                        </div>

                        {formData.isOffer ? (
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,220px)_1fr]">
                                <div>
                                    <label className={labelClassName} htmlFor="offerPrice">
                                        Precio de oferta *
                                    </label>
                                    <input
                                        id="offerPrice"
                                        name="offerPrice"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={formData.offerPrice}
                                        onChange={onFieldChange}
                                        className={`${inputClassName} mb-0`}
                                        placeholder="74990"
                                        disabled={isFormDisabled}
                                    />
                                    {validationErrors.offerPrice && (
                                        <p className="mb-0 mt-2 text-[12px] text-[#b32737]">
                                            {validationErrors.offerPrice}
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-[10px] bg-amber-50 px-3 py-3 text-[13px] font-medium text-amber-800">
                                    Tus clientes verán este producto con precio de oferta.
                                </div>
                            </div>
                        ) : (
                            <div className="mt-3 rounded-[10px] bg-slate-100 px-3 py-2.5 text-[13px] font-semibold text-slate-700">
                                El producto se mostrara con su precio normal y se enviara sin precio de oferta.
                            </div>
                        )}
                    </div>

                    {/* ── Etiquetas actuales (chips removibles) ── */}
                    <label className={labelClassName}>
                        Etiquetas actuales
                    </label>

                    {selectedTags.length > 0 ? (
                        <div className="mb-3 flex flex-wrap gap-2">
                            {selectedTags.map((tag) => (
                                <span
                                    key={tag.id}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                                >
                                    {tag.name}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag.id)}
                                        disabled={isFormDisabled}
                                        className="flex items-center justify-center rounded-full p-0 text-emerald-600 transition hover:text-emerald-900 disabled:cursor-not-allowed"
                                        aria-label={`Quitar etiqueta ${tag.name}`}
                                    >
                                        <X size={12} strokeWidth={2.5} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="mb-3 text-[13px] text-[#6b7280]">
                            No hay etiquetas seleccionadas.
                        </p>
                    )}

                    {validationErrors.tags && (
                        <p className={errorClassName}>{validationErrors.tags}</p>
                    )}

                    {/* ── Sugerencias de etiquetas ── */}
                    {displayedTagOptions.length > 0 && (
                        <div className="mb-3 rounded-[10px] border border-[#d2d8d4] bg-white p-2.5">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                                Agregar etiquetas
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {displayedTagOptions.map((tag) => {
                                    const isSelected = selectedTags.some((t) => t.id === tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            disabled={isFormDisabled || (!isSelected && selectedTags.length >= MAX_TAGS)}
                                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${isSelected
                                                    ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                                                    : "border-[#b8d4c7] bg-[#eef7f2] text-[#356852] hover:bg-[#dff0e8]"
                                                }`}
                                        >
                                            {isSelected ? `✓ ${tag.name}` : tag.name}
                                        </button>
                                    );
                                })}
                            </div>

                            {!showAllTagSuggestions &&
                                availableTags.length > 6 && (
                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAllTagSuggestions(true)}
                                            className="rounded-md border border-[#9ebde8] bg-[#ebf4ff] px-3 py-1.5 text-xs font-semibold text-[#3b72bd] transition hover:bg-[#ddeeff]"
                                            disabled={isFormDisabled}
                                        >
                                            Ver más
                                        </button>
                                    </div>
                                )}
                        </div>
                    )}

                    <p className="text-[13px] text-[#44564d]">
                        Podés agregar hasta {MAX_TAGS} etiquetas.{" "}
                        <span className="font-semibold text-[#6b9080]">
                            {selectedTags.length}/{MAX_TAGS} seleccionadas.
                        </span>
                    </p>
                </section>

                {/* ════════════════ ASIDE DERECHO ════════════════ */}
                <aside className="flex flex-col gap-5">

                    {/* ── Imagen del Producto ── */}
                    <section className={cardClassName}>
                        <h2 className={cardTitleClassName}>Imagen del Producto</h2>

                        {/* Preview: muestra la imagen nueva si se seleccionó, o la actual del producto */}
                        {(formData.imageUrl || imageFile) ? (
                            <div className="relative overflow-hidden rounded-[10px] border border-[#d2d8d4] bg-[#f0f2f1] mb-3">
                                <img
                                    src={imageFile ? URL.createObjectURL(imageFile) : formData.imageUrl}
                                    alt="Vista previa del producto"
                                    className="h-[160px] w-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                                {/* Botón para quitar la imagen seleccionada o limpiar la actual */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        onImageFileChange(null);
                                        onFieldChange({ target: { name: "imageUrl", value: "", type: "text" } });
                                    }}
                                    disabled={isFormDisabled}
                                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed"
                                    aria-label="Eliminar imagen"
                                >
                                    <X size={14} className="text-red-500" />
                                </button>
                            </div>
                        ) : (
                            <div className="mb-3 flex h-[100px] items-center justify-center rounded-[10px] border border-dashed border-[#d2d8d4] bg-[#f0f2f1] text-[13px] text-[#9ca3af]">
                                Sin imagen
                            </div>
                        )}

                        {/* Selector de archivo — reemplaza el campo de URL */}
                        <label className={`cursor-pointer inline-flex items-center gap-2 bg-[#6b9080] text-white px-4 py-2 rounded-[10px] text-[13px] font-semibold hover:bg-[#5a7d6d] transition ${isFormDisabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}>
                            Seleccionar imagen
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isFormDisabled}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) onImageFileChange(file);
                                }}
                            />
                        </label>
                        <p className="mt-2 text-[11px] text-[#9ca3af]">JPG o PNG recomendado</p>

                        {validationErrors.imageUrl && (
                            <p className={errorClassName}>{validationErrors.imageUrl}</p>
                        )}
                    </section>

                    {/* ── Estado del Producto ── */}
                    <section className={cardClassName}>
                        <h2 className={cardTitleClassName}>Estado del Producto</h2>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className={`${labelClassName} mb-0.5`}>Estado</p>
                                <p
                                    className={`mb-0 text-[13px] font-semibold ${formData.isVisible ? "text-emerald-700" : "text-slate-600"
                                        }`}
                                >
                                    {formData.isVisible ? "Visible para clientes" : "No visible"}
                                </p>
                            </div>

                            {/* Reutilizamos Toggle de CreateProductPage */}
                            <Toggle
                                isOn={formData.isVisible}
                                disabled={isFormDisabled}
                                label="Visibilidad del producto"
                                onToggle={(nextValue) =>
                                    onFieldChange({
                                        target: {
                                            name: "isVisible",
                                            value: nextValue,
                                            type: "checkbox",
                                            checked: nextValue,
                                        },
                                    })
                                }
                            />
                        </div>

                        <div
                            className={`mt-3.5 rounded-[10px] px-3 py-2.5 text-[13px] font-semibold ${formData.isVisible
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                        >
                            {formData.isVisible
                                ? "✓ Los clientes pueden ver y comprar este producto."
                                : "El producto está oculto y no se mostrará a clientes."}
                        </div>
                    </section>
                </aside>

                {/* ── Botones de acción ── */}
                <div className="flex items-center justify-start gap-3 border-t border-[#d0d7d2] pt-4 lg:col-span-2 lg:justify-end">
                    <button
                        type="button"
                        className="min-w-[118px] cursor-pointer rounded-[10px] border border-[#adb8b2] bg-[#f6f7f6] px-4 py-2 font-semibold text-[#5d6661] transition hover:bg-[#eaecea] disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => navigate(-1)}
                        disabled={isFormDisabled}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="min-w-[118px] cursor-pointer rounded-[10px] border border-transparent bg-[#6b9080] px-4 py-2 font-semibold text-white transition hover:bg-[#5a7d6d] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isFormDisabled}
                    >
                        {isSubmitting ? "Guardando..." : "Actualizar Producto"}
                    </button>
                </div>
            </form>

            {/* ── Modal de resultado (reutilizado de CreateProductPage) ── */}
            <CreationResultModal
                isOpen={resultModal.isOpen}
                variant={resultModal.variant}
                title={resultModal.title}
                message={resultModal.message}
                onClose={resultModal.variant === "success"
                    ? () => navigate("/comercio/productos")
                    : closeModal
                }
                closeLabel={resultModal.variant === "success" ? "Ir a Productos" : "Cerrar"}
            />

            {/* ── Modal de solicitud de categoría ── */}
            <CategoryRequestModal
                isOpen={isCategoryModalOpen}
                onClose={handleCloseCategoryModal}
                formData={categoryRequestFormData}
                validationErrors={categoryRequestErrors}
                isSubmitting={isSubmittingCategoryRequest}
                onFieldChange={onCategoryRequestFieldChange}
                handleSubmit={handleCategoryRequestSubmit}
                resultModal={categoryRequestResultModal}
                closeResultModal={() => {
                    closeCategoryRequestResultModal();
                    handleCategoryRequestSuccess();
                }}
            />
        </div>
    );
}