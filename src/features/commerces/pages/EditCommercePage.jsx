import { useNavigate } from "react-router-dom";
import { X, CheckCircle } from "lucide-react";
import Navbar from "../../../components/navbar/Navbar";
import { Spinner } from "../../../components/Spinner";
import { CreationResultModal } from "../components/createProduct/CreationResultModal";
import { useEditCommerce } from "../hooks/useEditCommerce";

// ID del comercio — reemplazar por el id real que venga del contexto de autenticación
const COMMERCE_ID = 1;

export const EditCommercePage = () => {
    const navigate = useNavigate();

    const {
        formData,
        logoPreview,
        validationErrors,
        categories,
        isLoadingInitialData,
        isSubmitting,
        isFormDisabled,
        loadError,
        successToast,
        errorModal,
        closeErrorModal,
        onFieldChange,
        onLogoChange,
        removeLogo,
        handleSubmit,
        errorRef,
    } = useEditCommerce(COMMERCE_ID);

    // ── Clases reutilizadas de CommerceCreationForm (misma apariencia) ─────────
    const inputClass =
        "w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D] focus:border-[#5B7B6D] disabled:opacity-60 disabled:cursor-not-allowed";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    const errorClass = "text-xs text-red-500 mt-1";

    if (isLoadingInitialData) {
        return (
            <div>
                <Navbar />
                <div className="flex justify-center items-center min-h-[60vh]">
                    <Spinner size="10" color="text-[#5B7B6D]" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />

            {/* ── Toast de éxito ── */}
            {successToast && (
                <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-white border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
                    <CheckCircle size={18} className="text-green-600 shrink-0" />
                    ¡Comercio actualizado correctamente!
                </div>
            )}

            <div className="flex justify-center w-full mt-3 mb-8">
                <div className="w-full max-w-2xl bg-white p-8 rounded-md shadow-md">

                    {/* ── Título — consistente con CreateCommercePage ── */}
                    <p className="text-xl text-gray-900 font-bold">Editar Comercio</p>
                    <p className="text-gray-700 mb-0">
                        Actualizá la información de tu comercio.
                    </p>

                    {/* ── Error de carga ── */}
                    {loadError && (
                        <div
                            ref={errorRef}
                            className="bg-red-50 text-red-600 p-3 rounded border border-red-200 text-sm mt-4"
                        >
                            {loadError}
                        </div>
                    )}

                    {/* ════════════════ FORMULARIO ════════════════ */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">

                        {/* Nombre del Comercio */}
                        <div>
                            <label className={labelClass}>Nombre del Comercio *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onFieldChange}
                                placeholder="Ej: Mi Tienda Online"
                                maxLength={100}
                                disabled={isFormDisabled}
                                className={inputClass}
                            />
                            {validationErrors.name && (
                                <p className={errorClass}>{validationErrors.name}</p>
                            )}
                        </div>

                        {/* Email de Contacto */}
                        <div>
                            <label className={labelClass}>Email de Contacto *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={onFieldChange}
                                placeholder="contacto@mitienda.com"
                                disabled={isFormDisabled}
                                className={inputClass}
                            />
                            {validationErrors.email && (
                                <p className={errorClass}>{validationErrors.email}</p>
                            )}
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className={labelClass}>Teléfono *</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={onFieldChange}
                                placeholder="+595XXXXXXXXX"
                                maxLength={20}
                                disabled={isFormDisabled}
                                className={inputClass}
                            />
                            {validationErrors.phone && (
                                <p className={errorClass}>{validationErrors.phone}</p>
                            )}
                        </div>

                        {/* Dirección */}
                        <div>
                            <label className={labelClass}>Dirección *</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={onFieldChange}
                                placeholder="Calle Principal 123"
                                disabled={isFormDisabled}
                                className={inputClass}
                            />
                            {validationErrors.address && (
                                <p className={errorClass}>{validationErrors.address}</p>
                            )}
                        </div>

                        {/* Ciudad + Región */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Ciudad *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={onFieldChange}
                                    placeholder="Encarnación"
                                    disabled={isFormDisabled}
                                    className={inputClass}
                                />
                                {validationErrors.city && (
                                    <p className={errorClass}>{validationErrors.city}</p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>Región</label>
                                <input
                                    type="text"
                                    name="region"
                                    value={formData.region}
                                    onChange={onFieldChange}
                                    placeholder="Itapúa"
                                    disabled={isFormDisabled}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Código Postal */}
                        <div>
                            <label className={labelClass}>Código Postal</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={onFieldChange}
                                placeholder="16000"
                                disabled={isFormDisabled}
                                className={inputClass}
                            />
                        </div>

                        {/* Categoría Principal */}
                        <div>
                            <label className={labelClass}>Categoría Principal</label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={onFieldChange}
                                disabled={isFormDisabled}
                                className={inputClass}
                            >
                                <option value="">Seleccioná una categoría</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className={labelClass}>Descripción del Comercio *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={onFieldChange}
                                maxLength={500}
                                rows={4}
                                disabled={isFormDisabled}
                                className={inputClass}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.description.length}/500 caracteres
                            </p>
                            {validationErrors.description && (
                                <p className={errorClass}>{validationErrors.description}</p>
                            )}
                        </div>

                        {/* ── Logo del comercio ── */}
                        <div>
                            <p className="text-gray-800 mb-1 text-sm font-medium">
                                Logo del comercio
                            </p>

                            {/* Vista previa */}
                            {logoPreview ? (
                                <div className="mb-3 relative w-fit">
                                    <img
                                        src={logoPreview}
                                        alt="Vista previa del logo"
                                        className="w-32 h-32 object-cover rounded-lg border border-green-100"
                                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                                    />
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        disabled={isFormDisabled}
                                        className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-red-500 hover:bg-red-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Eliminar logo"
                                    >
                                        <X size={13} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ) : (
                                <div className="mb-3 w-32 h-32 flex items-center justify-center rounded-lg border border-dashed border-green-200 bg-green-50/30 text-xs text-gray-400">
                                    Sin logo
                                </div>
                            )}

                            {/* Selector de archivo */}
                            <div className="border border-gray-200 rounded flex items-center overflow-hidden">
                                <span className="px-3 py-2 bg-gray-50 border-r border-gray-200 text-gray-600 text-sm">
                                    Archivo:
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={onLogoChange}
                                    disabled={isFormDisabled}
                                    className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:border-0
                    file:text-sm file:font-semibold
                    file:bg-gray-100 file:text-gray-700
                    hover:file:bg-gray-200
                    cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Formato recomendado: 500px × 500px, 72ppi
                            </p>
                        </div>

                        {/* ── Botones de acción ── */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                disabled={isFormDisabled}
                                className="bg-white text-gray-800 px-4 py-2 rounded border border-gray-800 hover:bg-green-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isFormDisabled}
                                className="bg-[#5B7B6D] text-white px-4 py-2 rounded hover:bg-green-800 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? (
                                    <Spinner size="5" color="text-white" />
                                ) : (
                                    "Actualizar Comercio"
                                )}
                            </button>
                        </div>

                    </form>

                    <p className="text-sm text-gray-500 text-center mt-4">
                        Los campos marcados con * son requeridos.
                    </p>
                </div>
            </div>

            {/* ── Modal de error (reutilizado de CreateProductPage) ── */}
            <CreationResultModal
                isOpen={errorModal.isOpen}
                variant="error"
                title={errorModal.title}
                message={errorModal.message}
                onClose={closeErrorModal}
            />
        </div>
    );
};