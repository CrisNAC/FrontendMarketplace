// ../hooks/useCategoryRequest.js
import { useState } from "react";
import {
  submitCategoryRequest,
  getBackendErrorMessage,
} from "../services/categoryRequestApi";

export const useCategoryRequest = () => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState({
    isOpen: false,
    variant: "success",
    title: "",
    message: "",
  });

  const onFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setValidationErrors({});
  };

  const closeModal = () => {
    setResultModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validación
    if (!formData.name.trim()) {
      setValidationErrors({ name: "El nombre de la categoría es obligatorio." });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitCategoryRequest({ name: formData.name.trim() });

      setResultModal({
        isOpen: true,
        variant: "success",
        title: "Solicitud enviada",
        message: "Tu solicitud fue enviada. El administrador la revisará pronto.",
      });

      resetForm();
    } catch (error) {
      setResultModal({
        isOpen: true,
        variant: "error",
        title: "No se pudo enviar",
        message: getBackendErrorMessage(
          error,
          "No se pudo enviar la solicitud. Intentá nuevamente."
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    validationErrors,
    isSubmitting,
    resultModal,
    closeModal,
    onFieldChange,
    resetForm,
    handleSubmit,
  };
};