import { useState, useEffect, useRef } from "react";
import {
    fetchCommerceById,
    fetchCommerceCategories,
    updateCommerce,
    getBackendErrorMessage,
} from "../services/editCommerceApi";

const PHONE_REGEX = /^\+595\d{9}$/;

const validateForm = (formData) => {
    const errors = {};

    if (!formData.name.trim()) {
        errors.name = "El nombre del comercio es obligatorio.";
    }

    if (!formData.email.trim()) {
        errors.email = "El email de contacto es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Ingresá un email válido.";
    }

    if (!formData.phone.trim()) {
        errors.phone = "El teléfono es obligatorio.";
    } else if (!PHONE_REGEX.test(formData.phone)) {
        errors.phone = "El teléfono debe tener el formato +595XXXXXXXXX.";
    }

    if (!formData.address.trim()) {
        errors.address = "La dirección es obligatoria.";
    }

    if (!formData.city.trim()) {
        errors.city = "La ciudad es obligatoria.";
    }

    if (!formData.description.trim()) {
        errors.description = "La descripción es obligatoria.";
    }

    return errors;
};

/**
 * Hook que encapsula toda la lógica de edición de comercio.
 * La página solo consume este hook y renderiza la UI.
 *
 * @param {number|string} commerceId - ID del comercio a editar
 */
export const useEditCommerce = (commerceId) => {
    // ── Estado del formulario ─────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        region: "",
        postalCode: "",
        description: "",
        categoryId: "",
        logoUrl: "",
    });

    // logoPreview: URL temporal para mostrar vista previa del logo seleccionado
    const [logoPreview, setLogoPreview] = useState("");
    // logoFile: archivo File seleccionado (para cuando el BE lo soporte)
    const [logoFile, setLogoFile] = useState(null);

    const [validationErrors, setValidationErrors] = useState({});

    // ── Datos de referencia ───────────────────────────────────────────────────
    const [categories, setCategories] = useState([]);

    // ── Estados de carga ──────────────────────────────────────────────────────
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Toast de éxito ────────────────────────────────────────────────────────
    const [successToast, setSuccessToast] = useState(false);

    // ── Modal de error ────────────────────────────────────────────────────────
    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        title: "",
        message: "",
    });

    // ── Ref para scroll al error ──────────────────────────────────────────────
    const errorRef = useRef(null);

    // ── Carga inicial: comercio + categorías en paralelo ─────────────────────
    useEffect(() => {
        if (!commerceId) return;

        let active = true;

        const loadAll = async () => {
            setIsLoadingInitialData(true);
            setLoadError("");

            try {
                const [commerce, categoriesData] = await Promise.all([
                    fetchCommerceById(commerceId),
                    fetchCommerceCategories(),
                ]);

                if (!active) return;

                // Pre-llenar formulario con los datos actuales del comercio
                setFormData({
                    name: commerce.name ?? "",
                    email: commerce.email ?? "",
                    phone: commerce.phone ?? "",
                    address: commerce.address ?? "",
                    city: commerce.city ?? "",
                    region: commerce.region ?? "",
                    postalCode: commerce.postalCode ?? "",
                    description: commerce.description ?? "",
                    categoryId: commerce.categoryId ? String(commerce.categoryId) : "",
                    logoUrl: commerce.logoUrl ?? "",
                });

                // Si ya tiene logo, mostrarlo como preview inicial
                if (commerce.logoUrl) {
                    setLogoPreview(commerce.logoUrl);
                }

                setCategories(categoriesData);
            } catch (error) {
                if (!active) return;
                setLoadError(
                    getBackendErrorMessage(error, "No se pudieron cargar los datos del comercio.")
                );
            } finally {
                if (active) setIsLoadingInitialData(false);
            }
        };

        loadAll();
        return () => { active = false; };
    }, [commerceId]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const onFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Limpiar error del campo al modificarlo
        setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    };

    /**
     * Maneja la selección del archivo de logo.
     * Genera una URL temporal para la vista previa.
     */
    const onLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLogoFile(file);

        // Revocar la URL anterior para evitar memory leaks
        if (logoPreview && logoPreview.startsWith("blob:")) {
            URL.revokeObjectURL(logoPreview);
        }

        const previewUrl = URL.createObjectURL(file);
        setLogoPreview(previewUrl);
    };

    const removeLogo = () => {
        if (logoPreview && logoPreview.startsWith("blob:")) {
            URL.revokeObjectURL(logoPreview);
        }
        setLogoPreview("");
        setLogoFile(null);
        setFormData((prev) => ({ ...prev, logoUrl: "" }));
    };

    const closeErrorModal = () => {
        setErrorModal((prev) => ({ ...prev, isOpen: false }));
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm(formData);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            // Scroll hacia el primer error
            errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        // Nota: cuando el BE soporte upload de imagen, aquí se usará FormData
        // y se enviará logoFile junto con los demás campos.
        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            region: formData.region.trim(),
            postalCode: formData.postalCode.trim(),
            description: formData.description.trim(),
            fk_store_category: Number(formData.categoryId) || undefined,
        };

        setIsSubmitting(true);
        try {
            await updateCommerce({ commerceId, payload });

            // Mostrar toast de éxito y ocultarlo después de 3 segundos
            setSuccessToast(true);
            setTimeout(() => setSuccessToast(false), 3000);
        } catch (error) {
            setErrorModal({
                isOpen: true,
                title: "No se pudo actualizar",
                message: getBackendErrorMessage(
                    error,
                    "No se pudo actualizar el comercio. Intentá nuevamente."
                ),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        // Estado del formulario
        formData,
        logoPreview,
        validationErrors,
        // Datos de referencia
        categories,
        // Estados de carga
        isLoadingInitialData,
        isSubmitting,
        isFormDisabled: isLoadingInitialData || isSubmitting,
        loadError,
        // Feedback al usuario
        successToast,
        errorModal,
        closeErrorModal,
        // Handlers
        onFieldChange,
        onLogoChange,
        removeLogo,
        handleSubmit,
        // Ref para scroll
        errorRef,
    };
};