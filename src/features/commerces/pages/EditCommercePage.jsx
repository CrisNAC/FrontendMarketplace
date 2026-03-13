// src/features/commerces/pages/EditCommercePage.jsx
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";
import { Spinner } from "../../../components/Spinner";
import { CreationResultModal } from "../components/createProduct/CreationResultModal";
import { useEditCommerce } from "../hooks/useEditCommerce";



// ─── Clases reutilizadas (mismas que CommerceCreationForm) ────────────────────
const inputCls =
    "w-full px-3 py-2 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-1 focus:ring-[#5B7B6D] focus:border-[#5B7B6D] disabled:cursor-not-allowed disabled:opacity-60";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export function EditCommercePage() {
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
        removeLogo,
        handleSubmit,
        errorRef,
    } = useEditCommerce();

    // Preview en tiempo real: se usa lo que escribe el usuario; si está vacío,
    // se muestra lo cargado originalmente del servidor.
    const displayedLogoUrl = formData.logoUrl.trim() || logoPreview;

    return (
        <div>
            <Navbar />

            {/* Toast de éxito */}
            {successToast && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg"
                >
                    <svg className="h-[18px] w-[18px] flex-shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-[13px] font-semibold text-emerald-700">
                        Comercio actualizado correctamente
                    </p>
                </div>
            )}

            <div className="flex justify-center w-full mt-3 mb-3">
                <div className="w-full max-w-2xl bg-white p-8 rounded-md shadow-md">

                    {/* Título */}
                    <p className="text-xl text-gray-900 font-bold">Editar Comercio</p>
                    <p className="text-gray-700">
                        Actualizá la información de tu comercio.
                    </p>

                    {/* Error de carga inicial */}
                    {loadError && (
                        <div
                            ref={errorRef}
                            className="mt-3 bg-red-50 text-red-600 p-3 rounded border border-red-200 text-sm"
                            role="alert"
                        >
                            {loadError}
                        </div>
                    )}

                    {/* Spinner de carga inicial */}
                    {isLoadingInitialData ? (
                        <div className="flex justify-center mt-8">
                            <Spinner size="8" color="text-[#5B7B6D]" />
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="flex flex-col gap-4 mt-4"
                        >

                            {/* Nombre */}
                            <div>
                                <label className={labelCls}>Nombre del Comercio *</label>
                                <input
                                    type="text" name="name"
                                    value={formData.name}
                                    onChange={onFieldChange}
                                    placeholder="Ej: Mi Tienda Online"
                                    maxLength={100}
                                    disabled={isFormDisabled}
                                    className={inputCls}
                                />
                                {validationErrors.name && (
                                    <p className="text-xs text-red-600 mt-1">{validationErrors.name}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className={labelCls}>Email de Contacto *</label>
                                <input
                                    type="email" name="email"
                                    value={formData.email}
                                    onChange={onFieldChange}
                                    placeholder="contacto@mitienda.com"
                                    maxLength={100}
                                    disabled={isFormDisabled}
                                    className={inputCls}
                                />
                                {validationErrors.email && (
                                    <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
                                )}
                            </div>

                            {/* Teléfono */}
                            <div>
                                <label className={labelCls}>Teléfono *</label>
                                <input
                                    type="text" name="phone"
                                    value={formData.phone}
                                    onChange={onFieldChange}
                                    placeholder="+595XXXXXXXX"
                                    maxLength={20}
                                    disabled={isFormDisabled}
                                    className={inputCls}
                                />
                                {validationErrors.phone && (
                                    <p className="text-xs text-red-600 mt-1">{validationErrors.phone}</p>
                                )}
                            </div>

                            {/* Dirección */}
                            <div>
                                <label className={labelCls}>Dirección *</label>
                                <input
                                    type="text" name="address"
                                    value={formData.address}
                                    onChange={onFieldChange}
                                    placeholder="Calle Principal 123"
                                    disabled={isFormDisabled}
                                    className={inputCls}
                                />
                                {validationErrors.address && (
                                    <p className="text-xs text-red-600 mt-1">{validationErrors.address}</p>
                                )}
                            </div>

                            {/* Ciudad / Región */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Ciudad *</label>
                                    <input
                                        type="text" name="city"
                                        value={formData.city}
                                        onChange={onFieldChange}
                                        placeholder="Asunción"
                                        maxLength={100}
                                        disabled={isFormDisabled}
                                        className={inputCls}
                                    />
                                    {validationErrors.city && (
                                        <p className="text-xs text-red-600 mt-1">{validationErrors.city}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelCls}>Región *</label>
                                    <input
                                        type="text" name="region"
                                        value={formData.region}
                                        onChange={onFieldChange}
                                        placeholder="Itapúa"
                                        maxLength={100}
                                        disabled={isFormDisabled}
                                        className={inputCls}
                                    />
                                    {validationErrors.region && (
                                        <p className="text-xs text-red-600 mt-1">{validationErrors.region}</p>
                                    )}
                                </div>
                            </div>

                            {/* Código Postal */}
                            <div>
                                <label className={labelCls}>Código Postal</label>
                                <input
                                    type="text" name="postalCode"
                                    value={formData.postalCode}
                                    onChange={onFieldChange}
                                    placeholder="16000"
                                    maxLength={20}
                                    disabled={isFormDisabled}
                                    className={inputCls}
                                />
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className={labelCls}>Categoría Principal *</label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={onFieldChange}
                                    disabled={isFormDisabled}
                                    className={`${inputCls} select-category`}
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {validationErrors.categoryId && (
                                    <p className="text-xs text-red-600 mt-1">{validationErrors.categoryId}</p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className={labelCls}>Descripción del Comercio *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={onFieldChange}
                                    maxLength={500}
                                    rows={4}
                                    disabled={isFormDisabled}
                                    className={inputCls}
                                />
                                <p className="text-xs text-gray-500 mt-1">Máximo 500 caracteres</p>
                                {validationErrors.description && (
                                    <p className="text-xs text-red-600 mt-1">{validationErrors.description}</p>
                                )}
                            </div>

                            {/* Logo */}
                            <p className="text-gray-800 mb-0">Logo del comercio</p>

                            {/* Preview del logo actual */}
                            {displayedLogoUrl && (
                                <div className="flex items-center gap-3 border border-gray-200 rounded p-2 bg-gray-50">
                                    <img
                                        src={displayedLogoUrl}
                                        alt="Logo actual"
                                        className="h-12 w-12 rounded object-contain border border-gray-100"
                                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                                    />
                                    <span className="text-xs text-gray-500 flex-1 truncate">{displayedLogoUrl}</span>
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        disabled={isFormDisabled}
                                        className="text-xs text-red-500 hover:text-red-700 disabled:cursor-not-allowed"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            )}

                            {/* URL del logo */}
                            <div>
                                <label className={labelCls}>URL del Logo</label>
                                <input
                                    type="url" name="logoUrl"
                                    value={formData.logoUrl}
                                    onChange={onFieldChange}
                                    placeholder="https://…"
                                    maxLength={500}
                                    disabled={isFormDisabled}
                                    className={inputCls}
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Ingresá la URL pública de la imagen del logo (formato recomendado: 500×500px).
                                </p>
                                {validationErrors.logoUrl && (
                                    <p className="text-xs text-red-600 mt-1">{validationErrors.logoUrl}</p>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    disabled={isFormDisabled}
                                    className="bg-white text-gray-800 px-4 py-2 rounded border border-gray-800 hover:!bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isFormDisabled}
                                    className="bg-[#5B7B6D] text-white px-4 py-2 rounded hover:bg-green-800 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting
                                        ? <Spinner size="5" color="text-white" />
                                        : "Guardar Cambios"
                                    }
                                </button>
                            </div>

                        </form>
                    )}

                    <p className="text-sm text-gray-500 text-center mt-4">
                        Los campos marcados con * son obligatorios.
                    </p>
                </div>
            </div>

            {/* Modal de error */}
            <CreationResultModal
                isOpen={errorModal.isOpen}
                variant="error"
                title={errorModal.title}
                message={errorModal.message}
                onClose={closeErrorModal}
            />
        </div>
    );
}