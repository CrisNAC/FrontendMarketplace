import { useState, useEffect } from "react";
import { X } from "lucide-react";

const EMPTY_FORM = {
    address: "",
    city: "",
    region: "",
    postal_code: "",
};

const AddressFormModal = ({ isOpen, onClose, onSubmit, initialData = null, loading = false }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setForm({
                address: initialData.address || "",
                city: initialData.city || "",
                region: initialData.region || "",
                postal_code: initialData.postal_code || "",
            });
        } else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [initialData, isOpen]);

    const validate = () => {
        const newErrors = {};
        if (!form.address.trim()) newErrors.address = "La dirección es requerida";
        if (!form.city.trim()) newErrors.city = "La ciudad es requerida";
        else if (form.city.length > 100) newErrors.city = "Máximo 100 caracteres";
        if (!form.region.trim()) newErrors.region = "La región es requerida";
        else if (form.region.length > 100) newErrors.region = "Máximo 100 caracteres";
        if (form.postal_code && form.postal_code.length > 20) newErrors.postal_code = "Máximo 20 caracteres";
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        onSubmit({
            ...form,
            postal_code: form.postal_code.trim() || null,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white w-full max-w-lg rounded-sm shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-[16px] font-semibold text-[#2d4030]">
                        {isEditing ? "Editar dirección" : "Nueva dirección"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">
                            Dirección <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Ej: Calle Principal 123, Apto 4B"
                            className={`w-full border rounded-sm px-3 py-2 text-[14px] outline-none focus:border-[#1b7bd5] focus:ring-1 focus:ring-[#1b7bd5]/30 transition ${
                                errors.address ? "border-red-400" : "border-gray-300"
                            }`}
                        />
                        {errors.address && (
                            <p className="text-red-500 text-[12px] mt-1">{errors.address}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                Ciudad <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                placeholder="Ej: Bogotá"
                                className={`w-full border rounded-sm px-3 py-2 text-[14px] outline-none focus:border-[#1b7bd5] focus:ring-1 focus:ring-[#1b7bd5]/30 transition ${
                                    errors.city ? "border-red-400" : "border-gray-300"
                                }`}
                            />
                            {errors.city && (
                                <p className="text-red-500 text-[12px] mt-1">{errors.city}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                Región / Departamento <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="region"
                                value={form.region}
                                onChange={handleChange}
                                placeholder="Ej: Cundinamarca"
                                className={`w-full border rounded-sm px-3 py-2 text-[14px] outline-none focus:border-[#1b7bd5] focus:ring-1 focus:ring-[#1b7bd5]/30 transition ${
                                    errors.region ? "border-red-400" : "border-gray-300"
                                }`}
                            />
                            {errors.region && (
                                <p className="text-red-500 text-[12px] mt-1">{errors.region}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">
                            Código postal{" "}
                            <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <input
                            type="text"
                            name="postal_code"
                            value={form.postal_code}
                            onChange={handleChange}
                            placeholder="Ej: 110111"
                            className={`w-full border rounded-sm px-3 py-2 text-[14px] outline-none focus:border-[#1b7bd5] focus:ring-1 focus:ring-[#1b7bd5]/30 transition ${
                                errors.postal_code ? "border-red-400" : "border-gray-300"
                            }`}
                        />
                        {errors.postal_code && (
                            <p className="text-red-500 text-[12px] mt-1">{errors.postal_code}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-[14px] border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 text-[14px] bg-[#2d4030] text-white rounded-sm hover:bg-[#3a5040] transition disabled:opacity-60"
                        >
                            {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar dirección"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddressFormModal;