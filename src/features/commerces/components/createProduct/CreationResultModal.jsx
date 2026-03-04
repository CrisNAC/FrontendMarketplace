import { CheckCircle2, X, XCircle } from "lucide-react";

export const CreationResultModal = ({
  isOpen,
  onClose,
  title,
  message,
  variant = "success",
}) => {
  if (!isOpen) {
    return null;
  }

  const isSuccess = variant === "success";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-xl border border-[#d8dfdb] bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-product-result-title"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle2 className="text-emerald-600" size={24} />
            ) : (
              <XCircle className="text-red-600" size={24} />
            )}
            <h3
              id="create-product-result-title"
              className={`m-0 text-lg font-semibold ${
                isSuccess ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {title}
            </h3>
          </div>

          <button
            type="button"
            className="cursor-pointer rounded-md border border-[#d1d5db] bg-white p-1 text-[#4b5563] transition hover:bg-[#f3f4f6]"
            onClick={onClose}
            aria-label="Cerrar ventana"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mb-4 text-sm text-[#374151]">{message}</p>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
              isSuccess
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
