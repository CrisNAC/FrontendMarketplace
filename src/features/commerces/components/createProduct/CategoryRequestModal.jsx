// ../components/createProduct/CategoryRequestModal.jsx
import { X } from "lucide-react";
import { CreationResultModal } from "./CreationResultModal";

const inputClassName =
  "mb-3 w-full rounded-[10px] border border-[#d2d8d4] bg-[#f0f2f1] px-3 py-2 text-[14px] text-[#1f2e27] outline-none transition focus:border-[#8fb6a3] focus:ring-4 focus:ring-[rgba(107,144,128,0.16)] disabled:cursor-not-allowed disabled:opacity-60";
const labelClassName = "mb-2 block text-[14px] font-semibold text-[#273830]";
const errorClassName = "mb-2 text-[12px] text-[#b32737]";

export function CategoryRequestModal({
  isOpen,
  onClose,
  formData,
  validationErrors,
  isSubmitting,
  onFieldChange,
  handleSubmit,
  resultModal,
  closeResultModal,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay*/}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={isSubmitting ? undefined : onClose}
        role="presentation"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-request-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-[#d8dfdb] bg-white shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#d8dfdb] px-5 py-4">
          <h2
            id="category-request-title"
            className="text-[17px] font-semibold text-[#273830]"
          >
            Solicitar Nueva Categoría
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex items-center justify-center rounded-full p-1 text-[#6b7280] transition hover:bg-[#f0f2f1] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate className="px-5 py-4">
          <p className="mb-4 text-[13px] text-[#44564d]">
            Si no encontrás la categoría que necesitás, podés solicitar que el
            administrador la cree.
          </p>

          {/* Nombre */}
          <label className={labelClassName} htmlFor="categoryName">
            Nombre de la categoría *
          </label>
          <input
            id="categoryName"
            name="name"
            type="text"
            value={formData.name}
            onChange={onFieldChange}
            className={inputClassName}
            placeholder="Ej: Electrónica"
            disabled={isSubmitting}
          />
          {validationErrors.name && (
            <p className={errorClassName}>{validationErrors.name}</p>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 border-t border-[#d0d7d2] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-w-[100px] rounded-[10px] border border-[#adb8b2] bg-[#f6f7f6] px-4 py-2 font-semibold text-[#5d6661] transition hover:bg-[#eaecea] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px] rounded-[10px] border border-transparent bg-[#6b9080] px-4 py-2 font-semibold text-white transition hover:bg-[#5a7d6d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de resultado */}
      <CreationResultModal
        isOpen={resultModal.isOpen}
        variant={resultModal.variant}
        title={resultModal.title}
        message={resultModal.message}
        onClose={closeResultModal}
      />
    </>
  );
}