import { useState, useEffect } from "react";
import { Plus, MapPin } from "lucide-react";
import Navbar from "../../../../components/navbar/Navbar";
import { SidebarClientProfile } from "../../../../components/SidebarClientProfile";
import AddressCard from "./AddressCard";
import AddressFormModal from "./AddressFormModal";

// ─── API helpers ────────────────────────────────────────────────────────────
const API = "http://localhost:3000/api";

const fetchAddresses = (userId) =>
    fetch(`${API}/addresses/user/${userId}`, { credentials: "include" }).then((r) => r.json());

const createAddress = (data) =>
    fetch(`${API}/addresses`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }).then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.message || "Error al crear dirección");
        return json;
    });

const updateAddress = (userId, addressId, data) =>
    fetch(`${API}/addresses/${userId}/addresses/${addressId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }).then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.message || "Error al actualizar dirección");
        return json;
    });

const deleteAddress = (addressId) =>
    fetch(`${API}/addresses/${addressId}`, {
        method: "DELETE",
        credentials: "include",
    }).then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.message || "Error al eliminar dirección");
        return json;
    });

// ─── Section header (reutiliza el estilo de MyAccountPage) ──────────────────
const SectionHeader = ({ title, rightContent }) => (
    <div className="bg-[#f0f2f1] border border-gray-200 px-4 py-3 font-semibold text-black flex justify-between items-center rounded-sm">
        <span className="text-[15px]">{title}</span>
        {rightContent && <div className="text-sm font-normal">{rightContent}</div>}
    </div>
);

// ─── Empty state ─────────────────────────────────────────────────────────────
const EmptyAddresses = ({ onAdd }) => (
    <div className="border border-dashed border-gray-300 rounded-sm bg-white py-14 flex flex-col items-center gap-3 text-center">
        <MapPin size={32} className="text-gray-300" />
        <p className="text-gray-500 text-[14px]">No tienes direcciones guardadas aún.</p>
        <button
            onClick={onAdd}
            className="mt-1 text-[14px] text-[#1b7bd5] hover:underline"
        >
            Agregar tu primera dirección
        </button>
    </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const AddressesPage = () => {
    // Replace with your auth context / hook
    const authUser = { id_user: 18 };

    const [addresses, setAddresses] = useState([]);
    const [loadingPage, setLoadingPage] = useState(true);
    const [pageError, setPageError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    const [confirmDelete, setConfirmDelete] = useState(null); // id_address to delete

    // ── Load addresses ──
    useEffect(() => {
        setLoadingPage(true);
        fetchAddresses(authUser.id_user)
            .then(setAddresses)
            .catch((e) => setPageError(e.message))
            .finally(() => setLoadingPage(false));
    }, [authUser.id_user]);

    // ── Handlers ──
    const openCreate = () => {
        setEditingAddress(null);
        setFormError(null);
        setModalOpen(true);
    };

    const openEdit = (address) => {
        setEditingAddress(address);
        setFormError(null);
        setModalOpen(true);
    };

    const handleSubmit = async (formData) => {
        setSaving(true);
        setFormError(null);
        try {
            if (editingAddress) {
                const res = await updateAddress(authUser.id_user, editingAddress.id_address, formData);
                setAddresses((prev) =>
                    prev.map((a) => (a.id_address === editingAddress.id_address ? res.data : a))
                );
            } else {
                const newAddr = await createAddress({ ...formData, fk_user: authUser.id_user });
                setAddresses((prev) => [...prev, newAddr]);
            }
            setModalOpen(false);
        } catch (e) {
            setFormError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!confirmDelete) return;
        try {
            await deleteAddress(confirmDelete);
            setAddresses((prev) => prev.filter((a) => a.id_address !== confirmDelete));
        } catch (e) {
            alert(e.message);
        } finally {
            setConfirmDelete(null);
        }
    };

    const canAddMore = addresses.length < 5;

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="max-w-[1400px] mx-auto w-full px-6 py-10">
                <h1 className="text-[28px] font-bold text-[#2d4030] mb-8">Mi Cuenta</h1>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <aside className="w-full md:w-[280px] shrink-0">
                        <SidebarClientProfile />
                    </aside>

                    <div className="flex-1 w-full space-y-6">
                        <SectionHeader
                            title={`Libreta de direcciones ${addresses.length > 0 ? `(${addresses.length}/5)` : ""}`}
                            rightContent={
                                canAddMore ? (
                                    <button
                                        onClick={openCreate}
                                        className="flex items-center gap-1.5 text-[#1b7bd5] hover:underline"
                                    >
                                        <Plus size={14} />
                                        Agregar dirección
                                    </button>
                                ) : (
                                    <span className="text-gray-400 text-[13px]">Límite alcanzado</span>
                                )
                            }
                        />

                        {loadingPage ? (
                            <div className="py-12 text-center text-gray-400 text-[14px]">
                                Cargando direcciones...
                            </div>
                        ) : pageError ? (
                            <div className="py-12 text-center text-red-500 text-[14px]">
                                {pageError}
                            </div>
                        ) : addresses.length === 0 ? (
                            <EmptyAddresses onAdd={openCreate} />
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {addresses.map((addr) => (
                                    <AddressCard
                                        key={addr.id_address}
                                        address={addr}
                                        onEdit={openEdit}
                                        onDelete={(id) => setConfirmDelete(id)}
                                    />
                                ))}

                                {/* Add more card */}
                                {canAddMore && (
                                    <button
                                        onClick={openCreate}
                                        className="border border-dashed border-gray-300 rounded-sm bg-white min-h-[120px] flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#1b7bd5] hover:text-[#1b7bd5] transition-colors"
                                    >
                                        <Plus size={20} />
                                        <span className="text-[13px]">Nueva dirección</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Create / Edit modal */}
            <AddressFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingAddress}
                loading={saving}
            />
            {formError && modalOpen && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-50 border border-red-300 text-red-700 text-[13px] px-5 py-3 rounded-sm shadow z-[60]">
                    {formError}
                </div>
            )}

            {/* Delete confirmation dialog */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white w-full max-w-sm rounded-sm shadow-xl p-6">
                        <h3 className="text-[15px] font-semibold text-[#2d4030] mb-2">
                            Eliminar dirección
                        </h3>
                        <p className="text-[14px] text-gray-600 mb-6">
                            ¿Estás seguro de que deseas eliminar esta dirección? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 text-[14px] border border-gray-300 rounded-sm text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 text-[14px] bg-red-500 text-white rounded-sm hover:bg-red-600"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressesPage;