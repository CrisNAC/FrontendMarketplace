// src/features/commerces/hooks/useEditCommerce.js
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import {
    fetchCommerceById,
    fetchCommerceCategories,
    updateCommerce,
    uploadStoreImage,
    getBackendErrorMessage,
    apiClient,
} from "../services/editCommerceApi";

const HTTP_URL_REGEX = /^https?:\/\//i;

// ─── Esquema de validación con Zod ──────────────────────────────────────────
const commerceEditSchema = z.object({
    name: z.string().min(1, "El nombre del comercio es obligatorio").max(100, "El nombre no puede superar 100 caracteres"),
    email: z.string().email("Ingresá un email válido"),
    phone: z.string().min(1, "El teléfono es obligatorio").max(20, "El teléfono no puede superar 20 caracteres"),
    address: z.string().min(1, "La dirección es obligatoria"),
    latitude: z.number().nullable().refine((val) => val !== null, { message: "Selecciona un punto en el mapa" }),
    longitude: z.number().nullable().refine((val) => val !== null, { message: "Selecciona un punto en el mapa" }),
    logoUrl: z.string().max(500, "La URL del logo no puede superar 500 caracteres").optional(),
    basePrice: z.coerce.number().min(0, "Ingresá un precio base válido mayor o igual a 0"),
    distancePrice: z.coerce.number().min(0, "Ingresá un precio para larga distancia válido mayor o igual a 0"),
    websiteUrl: z.string().refine((val) => {
        const trimmed = val.trim();
        return !trimmed || /^https?:\/\//.test(trimmed);
    }, "La URL de sitio web debe iniciar con http:// o https://").optional(),
    instagramUrl: z.string().refine((val) => {
        const trimmed = val.trim();
        return !trimmed || /^https?:\/\//.test(trimmed);
    }, "La URL de Instagram debe iniciar con http:// o https://").optional(),
    tiktokUrl: z.string().refine((val) => {
        const trimmed = val.trim();
        return !trimmed || /^https?:\/\//.test(trimmed);
    }, "La URL de TikTok debe iniciar con http:// o https://").optional(),
});

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * Encapsula toda la lógica de la página Editar Comercio.
 *
 * Mapeo de campos backend → formulario:
 *   store.name               → formData.name
 *   store.email              → formData.email
 *   store.phone              → formData.phone
 *   store.description        → formData.description
 *   store.logo               → formData.logoUrl / logoPreview
 *   store.website_url        → formData.websiteUrl
 *   store.instagram_url      → formData.instagramUrl
 *   store.tiktok_url         → formData.tiktokUrl
 *   store.categories         → formData.categoryIds (array para <select multiple>)
 *   store.addresses[0].address     → formData.address
 *   store.addresses[0].latitude    → formData.latitude
 *   store.addresses[0].longitude   → formData.longitude
 *
 * @param {number|string} commerceId  id_store en Prisma
 */
export const useEditCommerce = () => {
    // id_store obtenido de la sesión del backend (no hardcodeado)
    const [commerceId, setCommerceId] = useState(null);

    // ── Estado del formulario ─────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        description: "",
        categoryIds: [],
        logoUrl: "",
        address: "",
        latitude: null,
        longitude: null,
        websiteUrl: "",
        instagramUrl: "",
        tiktokUrl: "",
        basePrice: "",
        distancePrice: "",
    });

    // logoPreview: URL para mostrar la imagen en pantalla
    const [logoPreview, setLogoPreview] = useState("");

    // archivo de logo seleccionado localmente (antes de subir)
    const [logoFile, setLogoFile] = useState(null);

    const [validationErrors, setValidationErrors] = useState({});

    // ── Datos de referencia ───────────────────────────────────────────────────
    const [categories, setCategories] = useState([]);

    // ── Estados de carga ──────────────────────────────────────────────────────
    const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Feedback ──────────────────────────────────────────────────────────────
    const [successToast, setSuccessToast] = useState(false);
    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        title: "",
        message: "",
    });

    const errorRef = useRef(null);

    // ── Carga inicial ─────────────────────────────────────────────────────────
    useEffect(() => {
        let active = true;

        const loadAll = async () => {
            setIsLoadingInitialData(true);
            setLoadError("");

            try {
                // 1. Obtener id_store desde la sesión activa
                // El backend devuelve user.id_store (null si no tiene comercio)
                const sessionRes = await apiClient.get("/api/session/user-session");
                const sessionIdStore = sessionRes.data?.user?.id_store;

                if (!sessionIdStore) {
                    throw { message: "No tenés un comercio registrado. Creá tu comercio primero." };
                }

                if (!active) return;
                setCommerceId(sessionIdStore);

                // 2. Comercio y categorías en paralelo para minimizar tiempo de carga
                const [commerce, categoriesData] = await Promise.all([
                    fetchCommerceById(sessionIdStore),
                    fetchCommerceCategories(),
                ]);

                if (!active) return;

                // addresses viene ordenado por created_at ASC → [0] es la dirección principal
                const firstAddress = commerce.addresses?.[0] ?? {};
                const firstShippingZone = commerce.shipping_zones?.[0] ?? {};

                setFormData({
                    name: commerce.name ?? "",
                    email: commerce.email ?? "",
                    phone: commerce.phone ?? "",
                    description: commerce.description ?? "",
                    categoryIds: Array.isArray(commerce.categories) && commerce.categories.length > 0
                        ? commerce.categories
                            .map((category) => Number(category.id))
                            .filter((id) => Number.isInteger(id) && id > 0)
                            .map(String)
                        : (() => {
                            const id = Number(commerce.store_category?.id_store_category);
                            return Number.isInteger(id) && id > 0 ? [String(id)] : [];
                        })(),
                    logoUrl: commerce.logo ?? "",
                    // Campos de Addresses (primer registro del comercio)
                    address: firstAddress.address ?? "",
                    latitude:
                        firstAddress.latitude !== undefined &&
                        firstAddress.latitude !== null
                            ? Number(firstAddress.latitude)
                            : null,
                    longitude:
                        firstAddress.longitude !== undefined &&
                        firstAddress.longitude !== null
                            ? Number(firstAddress.longitude)
                            : null,
                    // Redes sociales opcionales
                    websiteUrl: commerce.website_url ?? "",
                    instagramUrl: commerce.instagram_url ?? "",
                    tiktokUrl: commerce.tiktok_url ?? "",
                    basePrice:
                        firstShippingZone.base_price !== undefined &&
                        firstShippingZone.base_price !== null
                            ? String(Number(firstShippingZone.base_price))
                            : "",
                    distancePrice:
                        firstShippingZone.distance_price !== undefined &&
                        firstShippingZone.distance_price !== null
                            ? String(Number(firstShippingZone.distance_price))
                            : "",
                });

                // Preview inicial del logo si el comercio ya tiene uno
                if (commerce.logo) {
                    setLogoPreview(commerce.logo);
                }

                setCategories(categoriesData);
            } catch (error) {
                if (!active) return;
                setLoadError(
                    getBackendErrorMessage(
                        error,
                        "No se pudieron cargar los datos del comercio."
                    )
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
        // Limpiar el error del campo modificado
        setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    };

    // acepta un File para preview local, o null para limpiar
    const onLogoFileChange = (file) => {
        setLogoFile(file);
        if (file) {
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setLogoPreview(formData.logoUrl || "");
        }
    };

    const removeLogo = () => {
        setLogoPreview("");
        setLogoFile(null);
        setFormData((prev) => ({ ...prev, logoUrl: "" }));
    };

    const closeErrorModal = () =>
        setErrorModal((prev) => ({ ...prev, isOpen: false }));

    const onLocationChange = (point) => {
        setFormData((prev) => ({
            ...prev,
            latitude: point?.lat ?? null,
            longitude: point?.lng ?? null,
        }));
        setValidationErrors((prev) => ({ ...prev, location: "" }));
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        const parsed = commerceEditSchema.safeParse({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            latitude: formData.latitude,
            longitude: formData.longitude,
            logoUrl: formData.logoUrl.trim(),
            basePrice: formData.basePrice,
            distancePrice: formData.distancePrice,
            websiteUrl: formData.websiteUrl.trim(),
            instagramUrl: formData.instagramUrl.trim(),
            tiktokUrl: formData.tiktokUrl.trim(),
        });

        if (!parsed.success) {
            const errors = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path[0];
                if (key && !errors[key]) errors[key] = issue.message;
            }
            // Mapear 'latitude' y 'longitude' a 'location'
            if (errors.latitude || errors.longitude) {
                errors.location = "Selecciona un punto en el mapa.";
                delete errors.latitude;
                delete errors.longitude;
            }
            setValidationErrors(errors);
            errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        // Construir payload con los nombres exactos que espera updateStoreService.
        // Solo se envían los campos que el backend reconoce; campos undefined
        // son ignorados por el service (no se actualizan).
        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            description: formData.description.trim() || null,
            ...(formData.categoryIds.length > 0 && {
                category_ids: formData.categoryIds
                    .map((id) => Number(id))
                    .filter((id) => Number.isInteger(id) && id > 0),
            }),
            // logo → string URL o null para borrar (solo si no se subió un archivo nuevo)
            logo: logoFile ? undefined : (formData.logoUrl.trim() || null),
            // Redes sociales → null si vacío (validateOptionalStringField acepta null)
            website_url: formData.websiteUrl.trim() || null,
            instagram_url: formData.instagramUrl.trim() || null,
            tiktok_url: formData.tiktokUrl.trim() || null,
            base_price: Number(formData.basePrice),
            distance_price: Number(formData.distancePrice),
            // Dirección principal del comercio (addresses[0])
            address: formData.address.trim(),
            latitude: formData.latitude,
            longitude: formData.longitude,
        };

        setIsSubmitting(true);
        try {
            await updateCommerce({ commerceId, payload });

            // si el usuario seleccionó un archivo de logo, lo subimos a Supabase
            if (logoFile instanceof File) {
                const { logo } = await uploadStoreImage(commerceId, logoFile);
                setLogoPreview(logo);
                setFormData((prev) => ({ ...prev, logoUrl: logo }));
                setLogoFile(null);
            } else if (formData.logoUrl.trim()) {
                // si se cambió por URL, actualizamos el preview
                setLogoPreview(formData.logoUrl.trim());
            }

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
        formData,
        logoPreview,
        logoFile,
        validationErrors,
        categories,
        isLoadingInitialData,
        isSubmitting,
        isFormDisabled: isLoadingInitialData || isSubmitting,
        loadError,
        successToast,
        errorModal,
        closeErrorModal,
        onFieldChange,
        onLocationChange,
        onLogoFileChange,
        removeLogo,
        handleSubmit,
        errorRef,
    };
};