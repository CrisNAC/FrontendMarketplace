import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2 } from "lucide-react";
import Navbar from "../../../components/navbar/Navbar";
import { SidebarClientProfile } from "../../../components/SidebarClientProfile";
import {
    getSession,
    fetchUserProfile,
    getBackendErrorMessage,
} from "../../commerces/services/editUserProfileApi";

const AccountSectionHeader = ({ title, rightContent }) => (
    <div className="bg-[#f0f2f1] border border-gray-200 px-4 py-3 font-semibold text-black flex justify-between items-center rounded-sm">
        <span className="text-[15px]">{title}</span>
        {rightContent && <div className="text-sm font-normal">{rightContent}</div>}
    </div>
);

const AccountInfoCard = ({ title, children, footer }) => (
    <div className="border border-gray-200 rounded-sm bg-white flex flex-col h-full shadow-sm">
        <div className="p-5 flex-1">
            <h3 className="font-semibold text-black text-[15px] mb-4">{title}</h3>
            <div className="text-gray-800 text-[15px] space-y-1.5">{children}</div>
        </div>
        {footer && (
            <div className="px-5 pb-5 mt-auto flex justify-between items-center text-[14px] text-[#1b7bd5]">
                {footer}
            </div>
        )}
    </div>
);

const MyAccountPage = () => {
    const navigate = useNavigate();
    const didLoad = useRef(false);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        if (didLoad.current) return;
        didLoad.current = true;

        const loadProfile = async () => {
            try {
                const sessionData = await getSession();
                const userId = sessionData.user?.id_user;

                if (!userId) {
                    setError("No hay sesión activa.");
                    setLoading(false);
                    return;
                }

                const response = await fetchUserProfile(userId);
                setUser(response.data);
            } catch (err) {
                setError(getBackendErrorMessage(err, "Error cargando perfil"));
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Preview local - la subida real depende del endpoint de tu backend
        setPhotoPreview(URL.createObjectURL(file));
        // Aquí iría la lógica de upload cuando tengas el endpoint
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 size={28} className="animate-spin text-[#2d4030]" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="max-w-[1400px] mx-auto w-full px-6 py-10">
                <h1 className="text-[28px] font-bold text-[#2d4030] mb-8">Mi Cuenta</h1>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <aside className="w-full md:w-[280px] shrink-0">
                        <SidebarClientProfile />
                    </aside>

                    <div className="flex-1 w-full space-y-10">
                        {/* Foto de perfil */}
                        <section className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-[#e8f0e9] border-2 border-[#2d4030] overflow-hidden flex items-center justify-center">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Foto de perfil"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-3xl font-bold text-[#2d4030]">
                                            {user?.name?.[0]?.toUpperCase() ?? "?"}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingPhoto}
                                    className="absolute bottom-0 right-0 bg-[#2d4030] text-white rounded-full p-1.5 hover:bg-[#3d5540] transition-colors shadow-md"
                                    title="Cambiar foto"
                                >
                                    {uploadingPhoto
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : <Camera size={14} />
                                    }
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                            </div>
                            <div>
                                <p className="text-[18px] font-semibold text-[#2d4030]">{user?.name ?? "—"}</p>
                                <p className="text-[14px] text-gray-500">{user?.email ?? "—"}</p>
                            </div>
                        </section>

                        {/* Información de la cuenta */}
                        <section>
                            <AccountSectionHeader title="Información de la cuenta" />
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <AccountInfoCard
                                    title="Información de Contacto"
                                    footer={
                                        <>
                                            <button
                                                className="hover:underline"
                                                onClick={() => navigate("/mi-perfil")}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="hover:underline"
                                                onClick={() => navigate("/cambiar-contrasena")}
                                            >
                                                Cambiar contraseña
                                            </button>
                                        </>
                                    }
                                >
                                    <p>{user?.name ?? "—"}</p>
                                    <p>{user?.email ?? "—"}</p>
                                    {user?.phone && <p>{user.phone}</p>}
                                </AccountInfoCard>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyAccountPage;