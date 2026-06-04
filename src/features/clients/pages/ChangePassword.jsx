import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { PageLoader } from "../../../components/PageLoader";
import axios from "axios";
import {
    getSession,
    getBackendErrorMessage,
} from "../../commerces/services/editUserProfileApi";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").trim();

const apiClient = axios.create({
    baseURL: API_BASE_URL || undefined,
    withCredentials: true,
});

const PasswordInput = ({ label, name, value, onChange, placeholder }) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required
                    className="w-full px-3 py-2 pr-10 border border-green-100 rounded-md bg-green-50/30 focus:outline-none focus:ring-2 focus:ring-[#5B7B6D]"
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
};

export const ChangePassword = () => {
    const navigate = useNavigate();
    const didLoad = useRef(false);

    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    useEffect(() => {
        if (didLoad.current) return;
        didLoad.current = true;

        const loadSession = async () => {
            try {
                const sessionData = await getSession();
                const id = sessionData.user?.id_user;
                if (!id) {
                    setError("No hay sesión activa. Por favor iniciá sesión.");
                } else {
                    setUserId(id);
                }
            } catch (err) {
                setError(getBackendErrorMessage(err, "Error al verificar sesión"));
            } finally {
                setLoading(false);
            }
        };

        loadSession();
    }, []);

    const validate = () => {
        if (!formData.currentPassword.trim()) return "La contraseña actual es obligatoria";
        if (!formData.newPassword.trim()) return "La nueva contraseña es obligatoria";
        if (formData.newPassword.trim().length < 6) return "La nueva contraseña debe tener al menos 6 caracteres";
        if (formData.newPassword !== formData.confirmPassword) return "Las contraseñas no coinciden";
        if (formData.currentPassword === formData.newPassword) return "La nueva contraseña debe ser diferente a la actual";
        return null;
    };

    const handleSubmit = async () => {
        if (!userId) {
            setError("No hay sesión activa.");
            return;
        }

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await apiClient.put(`/api/users/${userId}/password`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            setSuccess("Contraseña actualizada correctamente. Redirigiendo al login...");

            // Cerrar sesión y redirigir al login
            setTimeout(async () => {
                try {
                    await apiClient.delete("/api/session");
                } catch {
                    // ignorar error de logout
                }
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(getBackendErrorMessage(err, "Error al cambiar contraseña"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <PageLoader />;

    return (
        <div className="flex justify-center w-full mt-3 mb-3">
                <div className="w-full max-w-2xl bg-white p-8 rounded-md shadow-md">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="bg-[#e8f0e9] p-2 rounded-full">
                            <Lock size={20} className="text-[#2d4030]" />
                        </div>
                        <p className="text-xl text-gray-900 font-bold">Cambiar Contraseña</p>
                    </div>
                    <p className="text-gray-700 mb-6 ml-1">
                        Ingresá tu contraseña actual y elegí una nueva.
                    </p>

                    <div className="flex flex-col gap-4">
                        <PasswordInput
                            label="Contraseña actual"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder="Tu contraseña actual"
                        />

                        <PasswordInput
                            label="Nueva contraseña"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Mínimo 6 caracteres"
                        />

                        <PasswordInput
                            label="Confirmar nueva contraseña"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repetí la nueva contraseña"
                        />

                        <div className="flex gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => navigate("/perfil")}
                                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving || !!success}
                                className="flex-1 bg-[#5B7B6D] text-white px-4 py-2 rounded hover:bg-green-800 transition disabled:opacity-60"
                            >
                                {saving ? "Guardando..." : "Cambiar contraseña"}
                            </button>
                        </div>
                    </div>

                    {error && <div className="text-red-500 mt-4 text-sm">{error}</div>}
                    {success && <div className="text-green-600 mt-4 text-sm">{success}</div>}
                </div>
        </div>
    );
};

export default ChangePassword;