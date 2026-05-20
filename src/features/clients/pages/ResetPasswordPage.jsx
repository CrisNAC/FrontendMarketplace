import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { z } from "zod";
import apiClient from "../../../lib/apiClient";
import logo from "/src/assets/feather.png";

const schema = z
  .object({
    newPassword: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmá tu contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [tokenStatus, setTokenStatus] = useState("validating"); // validating | valid | invalid
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const validate = async () => {
      try {
        await apiClient.post("/api/users/validate-reset-token", { token }, { skipGlobalErrorRedirect: true });
        setTokenStatus("valid");
      } catch {
        setTokenStatus("invalid");
      }
    };
    validate();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/api/users/reset-password", { token, newPassword: form.newPassword }, { skipGlobalErrorRedirect: true });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Ocurrió un error. Intentá de nuevo.";
      if (err.response?.status === 400) {
        setTokenStatus("invalid");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="auth-bg-gradient" />
        <div className="auth-bg-orbs">
          <span className="auth-bg-orbs__item auth-bg-orbs__item--a" />
          <span className="auth-bg-orbs__item auth-bg-orbs__item--b" />
        </div>
        <div className="auth-bg-dots">
          <span className="auth-bg-dots__cloud auth-bg-dots__cloud--1" />
          <span className="auth-bg-dots__cloud auth-bg-dots__cloud--2" />
          <span className="auth-bg-dots__cloud auth-bg-dots__cloud--3" />
          <span className="auth-bg-dots__cloud auth-bg-dots__cloud--4" />
        </div>
        <ul className="auth-bg-bubbles">
          {Array.from({ length: 10 }, (_, i) => (
            <li key={i} />
          ))}
        </ul>
      </div>

      <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-lg items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/95 p-5 shadow-[0_25px_50px_-12px_rgba(47,91,72,0.22)] backdrop-blur-sm sm:p-7">

          {tokenStatus !== "invalid" && !success && (
            <div className="mb-4 flex items-start">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-[#355347]"
              >
                <ArrowLeft size={16} />
                <span>Volver al inicio de sesión</span>
              </button>
            </div>
          )}

          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#769482] text-white shadow-lg shadow-[#769482]/35 ring-4 ring-[#769482]/15">
              <img src={logo} alt="" className="h-8 w-8 object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">OpenMarket</h1>
            <p className="mt-1 text-sm text-slate-500">Tu marketplace sostenible</p>
          </div>

          {tokenStatus === "validating" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#355347]" />
              <p className="text-sm text-slate-500">Verificando enlace...</p>
            </div>
          )}

          {tokenStatus === "invalid" && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <XCircle size={32} className="text-red-500" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">Enlace no válido</p>
                <p className="mt-1 text-sm text-slate-500">
                  Este enlace de recuperación expiró o ya fue utilizado. Solicitá uno nuevo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/recuperar-contrasena")}
                className="mt-2 w-full rounded-xl bg-[#355347] py-3 text-sm font-semibold text-white shadow-md shadow-[#355347]/25 transition hover:bg-[#2d4030] active:scale-[0.98]"
              >
                Solicitar nuevo enlace
              </button>
            </div>
          )}

          {tokenStatus === "valid" && success && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={32} className="text-[#355347]" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">¡Contraseña restablecida!</p>
                <p className="mt-1 text-sm text-slate-500">
                  Tu contraseña fue actualizada correctamente. Ya podés iniciar sesión.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-2 w-full rounded-xl bg-[#355347] py-3 text-sm font-semibold text-white shadow-md shadow-[#355347]/25 transition hover:bg-[#2d4030] active:scale-[0.98]"
              >
                Iniciar sesión
              </button>
            </div>
          )}

          {tokenStatus === "valid" && !success && (
            <>
              <div className="mb-6 text-center">
                <p className="text-lg font-semibold text-slate-800">Nueva contraseña</p>
                <p className="mt-1 text-sm text-slate-500">Elegí una contraseña segura de al menos 8 caracteres.</p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Nueva contraseña
                  </label>
                  <div className={`flex items-center rounded-xl border px-3 py-2.5 transition focus-within:border-[#769482]/50 focus-within:ring-2 focus-within:ring-[#769482]/20 ${
                    fieldErrors.newPassword ? "border-red-300 bg-red-50" : "border-slate-200/90 bg-slate-50"
                  }`}>
                    <Lock size={18} className="mr-2.5 shrink-0 text-[#769482]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      disabled={loading}
                      className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="ml-2 shrink-0 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {fieldErrors.newPassword && <p className="mt-1 text-xs text-red-600">{fieldErrors.newPassword}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Confirmar contraseña
                  </label>
                  <div className={`flex items-center rounded-xl border px-3 py-2.5 transition focus-within:border-[#769482]/50 focus-within:ring-2 focus-within:ring-[#769482]/20 ${
                    fieldErrors.confirmPassword ? "border-red-300 bg-red-50" : "border-slate-200/90 bg-slate-50"
                  }`}>
                    <Lock size={18} className="mr-2.5 shrink-0 text-[#769482]" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repetí tu nueva contraseña"
                      disabled={loading}
                      className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="ml-2 shrink-0 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#355347] py-3 text-sm font-semibold text-white shadow-md shadow-[#355347]/25 transition hover:bg-[#2d4030] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Guardando..." : "Restablecer contraseña"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
