import { useEffect, useState } from "react";

const REASON_OPTIONS = [
  { value: "SPAM", label: "Spam" },
  { value: "OFFENSIVE", label: "Contenido ofensivo" },
  { value: "FAKE", label: "Posible reseña falsa" },
  { value: "OTHER", label: "Otro motivo" },
];

export const ReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setDescription("");
      setLocalError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setLocalError("");
    if (!reason) {
      setLocalError("Elegí un motivo para el reporte.");
      return;
    }
    if (reason === "OTHER" && !description.trim()) {
      setLocalError("Para “Otro motivo” tenés que describir el problema.");
      return;
    }
    onSubmit({
      reason,
      description: reason === "OTHER" ? description.trim() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[400px] max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold mb-4">Reportar comentario</h2>

        <fieldset className="border-0 p-0 m-0 mb-3">
          <legend className="text-sm font-medium text-gray-700 mb-2 block">
            Motivo
          </legend>
          <div className="flex flex-col gap-2">
            {REASON_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm text-gray-800 cursor-pointer"
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={opt.value}
                  checked={reason === opt.value}
                  onChange={() => setReason(opt.value)}
                  className="accent-[#6B9080]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        {reason === "OTHER" && (
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Describí el motivo
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              rows={3}
              placeholder="Contanos qué problema ves con esta reseña"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        )}

        {localError && (
          <p className="text-sm text-red-600 m-0 mb-2">{localError}</p>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 text-sm rounded-md bg-gray-200 disabled:opacity-50"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="px-4 py-2 text-sm rounded-md text-white disabled:opacity-50"
            style={{ background: "#6B9080" }}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando…" : "Enviar reporte"}
          </button>
        </div>
      </div>
    </div>
  );
};
