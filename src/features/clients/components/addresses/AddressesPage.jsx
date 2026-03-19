import { useState, useEffect } from "react";
import { MapPin, Plus, Pencil, Trash2, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Navbar from "../../../../components/navbar/Navbar";
import { SidebarClientProfile } from "../../../../components/SidebarClientProfile";
import { useAddresses } from "../../../../hooks/useAddresses";
import axios from "axios";

const useSession = () => {
    const [userId, setUserId] = useState(null);
    const [sessionLoading, setSessionLoading] = useState(true);

    useEffect(() => {
        axios
            .get("http://localhost:3000/api/session/user-session", { withCredentials: true })
            .then(({ data }) => {
                if (data.success) setUserId(data.user.id_user);
            })
            .catch(() => setUserId(null))
            .finally(() => setSessionLoading(false));
    }, []);

    return { userId, sessionLoading };
};

const EMPTY_FORM = {
    address: "",
    city: "",
    region: "",
    postal_code: "",
};

const Toast = ({ message, type, onClose }) => {
    if (!message) return null;
    const isError = type === "error";
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-md shadow-lg text-white text-sm font-medium transition-all ${isError ? "bg-red-500" : "bg-[#2d6a4f]"}`}>
            { isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{message}</span>
            <button onClick={onClose} className="m1-2 hover:opacity-75">
                <X size={14} />
            </button>
        </div>
    );
};

const ConfirmDialog = ({ open, onConfirm, onCancel, loading }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-md shadow-xl p-6 w-full max-w-sm mx-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-red-100 p-2 rounded-full">
                        <Trash2 size={18} className="text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-[15px]">Eliminar dirección</h3>
                </div>
                <p className="text-gray-600 text-sm mb-5">
                    ¿Estás seguro de que querés eliminar esta dirección? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3 justify-end">

                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors flex items-center gap-2 disabled:opacity-60"
                    >
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        Eliminar
                    </button>

                </div>
            </div>
        </div>
    );
};

const AddressFormModal = ({ open, onClose, onSubmit, initialData, loading }) => {
    const isEdit = !!initialData;
    const [form, setForm] = useState(initialData ?? EMPTY_FORM);
    const [formError, setFormError] = useState(null);

    // sincroniza cuando se abre con datos distintos
    useEffect(() => {
        setForm(initialData ?? EMPTY_FORM);
        setFormError(null);
    }, [initialData, open]);

    if (!open) return null;

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        try {
            await onSubmit(form);
        } catch (err) {
            setFormError(err.message);
        }
    };

    const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent transition";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-md shadow-xl w-full max-w-lg mx-4 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#f0f2f1] border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-[#2d4030]" />
                        <h2 className="font-semibold text-[#2d4030] text-[16px]">
                            {isEdit ? "Editar dirección" : "Nueva dirección"}
                        </h2>
                    </div>

                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {formError && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-md">
                            <AlertCircle size={14} />
                            {formError}
                        </div>
                    )}

                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">
                            Direccion <span className="text-red-500">*</span>
                        </label>

                        <input
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Ej: Av. República del Paraguay 1234"
                            required
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                Ciudad <span className="text-red-500">*</span>
                            </label>

                            <input
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                placeholder="Ej: Ciudad del Este"
                                required
                                maxLength={100}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1">
                                Barrio / Región <span className="text-red-500">*</span>
                            </label>

                            <input
                                name="region"
                                value={form.region}
                                onChange={handleChange}
                                placeholder="Ej: Centro"
                                required
                                maxLength={100}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-1">
                            Código postal{" "} <span className="text-gray-400 text-[12px] font-normal">(opcional)</span>
                        </label>

                        <input
                            name="postal_code"
                            value={form.postal_code ?? ""}
                            onChange={handleChange}
                            placeholder="Ej: 7000"
                            maxLength={20}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 text-sm font-medium text-white bg-[#2d4030] hover:bg-[#3d5540] rounded-md transition-colors flex items-center gap-2 disabled:opacity-60"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {isEdit ? "Guardar cambios" : "Agregar dirección"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddressCard = ({ address, onEdit, onDelete }) => {
    return (
        <div className="border border-gray-200 rounded-md bg-white shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">

            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">

                    <div className="bg-[#e8f0e9] p-1.5 rounded-full shrink-0">
                        <MapPin size={15} className="text-[#2d4030]" />
                    </div>
                    <span className="font-semibold text-[#2d4030] text-[14px] leading-tight">
                        {address.city}
                    </span>
                    
                </div>

                <div className="flex gap-1 shrink-0">

                    <button
                        onClick={() => onEdit(address)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-[#2d4030] transition-colors"
                        title="Editar"
                    >
                        <Pencil size={15} />
                    </button>

                    <button
                        onClick={() => onDelete(address.id_address)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={15} />
                    </button>

                </div>
            </div>

            <div className="text-gray-700 text-[13px] space-y-0.5">
                <p>{address.address}</p>
                <p className="text-gray-500">
                    {address.region}
                    {address.postal_code ? ` · CP ${address.postal_code}` : ""}
                </p>
            </div>

        </div>
    );
};

// ─── Section header (reutiliza el estilo de MyAccountPage) ──────────────────
const SectionHeader = ({ title, rightContent }) => (
    <div className="bg-[#f0f2f1] border border-gray-200 px-4 py-3 font-semibold text-black flex justify-between items-center rounded-sm">
        <span className="text-[15px]">{title}</span>
        {rightContent && <div className="text-sm font-normal">{rightContent}</div>}
    </div>
);

// ─── Pagina Principal ────────────────────────────────────────────────────────────
const MAX_ADDRESSES = 5;

export const AddressesPage = () => {
    const { userId , sessionLoading } = useSession();
    //const userId = user?.id_user;

    const { addresses, loading, error, createAddress, updateAddress, deleteAddress } = useAddresses(userId);

    // Modal para crear/editar
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    //confirm delete
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Toast
    const [toast, setToast] = useState({ message: "", type: "success" });

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "success" }), 4000);
    };

    const handleOpenCreate = () => {
        setEditingAddress(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (address) => {
        setEditingAddress({
            id_address: address.id_address,
            address: address.address,
            city: address.city,
            region: address.region,
            postal_code: address.postal_code ?? "",
        });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingAddress(null);
    };

    const handleFormSubmit = async (form) => {
        setFormLoading(true);

        try {
            const payload = {
                address: form.address,
                city: form.city,
                region: form.region,
                postal_code: form.postal_code || null,
            };

            if (editingAddress) {
                await updateAddress(editingAddress.id_address, payload);
                showToast("Dirección actualizada correctamente");
            } else {
                await createAddress(payload);
                showToast("Dirección agregada correctamente");
            }
            handleCloseModal();
        } catch (err) {
            throw err;
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setDeleteLoading(true);
        try {
            await deleteAddress(deleteId);
            showToast("Dirección eliminada correctamente");
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setDeleteLoading(false);
            setDeleteId(null);
        }
    };

    // Espera a que se verifique la sesión antes de renderizar
    if (sessionLoading) {
        return (
            <div className="min-h-screen flex flex-col" >
                <Navbar />
                < div className="flex-1 flex items-center justify-center" >
                    <Loader2 size={28} className="animate-spin text-[#2d4030]" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col" >
            <Navbar />

            <main className="max-w-[1400px] mx-auto w-full px-6 py-10">
                <h1 className="text-[28px] font-bold text-[#2d4030] mb-8">Mi Cuenta</h1>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Sidebar */}
                    <aside className="w-full md:w-[280px] shrink-0">
                        <SidebarClientProfile />
                    </aside>

                    {/* Content */}
                    <div className="flex-1 w-full">

                        {/* Header section */}
                        <div className="bg-[#f0f2f1] border border-gray-200 px-4 py-3 rounded-sm flex justify-between items-center mb-4">
                            <span className="font-semibold text-black text-[15px]">
                                Libreta de direcciones
                            </span>
                            <span className="text-sm text-gray-500">
                                {addresses.length}/{MAX_ADDRESSES} direcciones
                            </span>
                        </div>

                        {/* Error de carga */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md mb-4">
                                <AlertCircle size={15} />
                                {error}
                            </div>
                        )}

                        {/* Loading */}
                        {loading && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {[1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="border border-gray-200 rounded-md bg-white p-5 animate-pulse h-28"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Lista de direcciones */}
                        {!loading && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {addresses.map((address) => (
                                    <AddressCard
                                        key={address.id_address}
                                        address={address}
                                        onEdit={handleOpenEdit}
                                        onDelete={(id) => setDeleteId(id)}
                                    />
                                ))}

                                {/* Agregar una direccion */}
                                {addresses.length < MAX_ADDRESSES && (
                                    <button
                                        onClick={handleOpenCreate}
                                        className="border-2 border-dashed border-gray-300 rounded-md bg-white p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#2d4030] hover:text-[#2d4030] hover:bg-[#f5f7f5] transition-all min-h-[100px]"
                                    >
                                        <Plus size={22} />
                                        <span className="text-[13px] font-medium">
                                            Agregar dirección
                                        </span>
                                    </button>
                                )}

                                {/* Estado vacio */}
                                {addresses.length === 0 && !loading && (
                                    <div className="col-span-2 text-center py-12 text-gray-400">
                                        <MapPin size={36} className="mx-auto mb-3 opacity-40" />
                                        <p className="text-[15px]">No tienes direcciones guardadas.</p>
                                        <p className="text-[13px] mt-1">
                                            Haz click en "Agregar direccion" para empezar.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Limite alcanzado */}
                        {addresses.length >= MAX_ADDRESSES && (
                            <p className="text-[13px] text-gray-500 mt-3">
                                Alcanzaste el límite máximo de {MAX_ADDRESSES} direcciones. Elimina una para agregar otra.
                            </p>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal crear / editar */}
            <AddressFormModal 
                open={modalOpen}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
                initialData={editingAddress}
                loading={formLoading}
            />

            {/* Dialog confirmar eliminación */}
            <ConfirmDialog
                open={!!deleteId}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteId(null)}
                loading={deleteLoading}
            />

            {/* Toast message */}
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: "", type: "success" })}
            />
        </div>
    );
};

export default AddressesPage;