import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { z } from "zod";
import apiClient from "../../../lib/apiClient";
import logo from "/src/assets/feather.png";

const schema = z.object({
  email: z.string().email({ message: "Ingresá un correo válido" }),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/api/users/forgot-password", { email }, { skipGlobalErrorRedirect: true });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Ocurrió un error. Intentá de nuevo.");
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

          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#769482] text-white shadow-lg shadow-[#769482]/35 ring-4 ring-[#769482]/15">
              <img src={logo} alt="" className="h-8 w-8 object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">OpenMarket</h1>
            <p className="mt-1 text-sm text-slate-500">Tu marketplace sostenible</p>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle size={32} className="text-[#355347]" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-800">¡Correo enviado!</p>
                <p className="mt-1 text-sm text-slate-500">
                  Si el correo <span className="font-medium text-slate-700">{email}</span> está registrado,
                  recibirás un enlace para restablecer tu contraseña.
                </p>
                <p className="mt-2 text-xs text-slate-400">Revisá también tu carpeta de spam.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-2 text-sm font-medium text-[#355347] underline-offset-2 hover:underline"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <p className="text-lg font-semibold text-slate-800">Recuperar contraseña</p>
                <p className="mt-1 text-sm text-slate-500">
                  Ingresá tu correo y te enviaremos un enlace para crear una nueva contraseña. Válido por 10 minutos.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Correo electrónico
                  </label>
                  <div className={`flex items-center rounded-xl border px-3 py-2.5 transition focus-within:border-[#769482]/50 focus-within:ring-2 focus-within:ring-[#769482]/20 ${
                    fieldError ? "border-red-300 bg-red-50" : "border-slate-200/90 bg-slate-50"
                  }`}>
                    <Mail size={18} className="mr-2.5 shrink-0 text-[#769482]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFieldError(null); setError(null); }}
                      placeholder="tu@correo.com"
                      disabled={loading}
                      className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                  {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#355347] py-3 text-sm font-semibold text-white shadow-md shadow-[#355347]/25 transition hover:bg-[#2d4030] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
