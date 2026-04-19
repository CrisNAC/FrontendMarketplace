import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import apiClient from "../../../lib/apiClient";
import logo from "/src/assets/feather.png";

/** Ruta tras login según rol del backend (ADMIN | CUSTOMER | SELLER | DELIVERY). */
function getPostLoginPath(role) {
  switch (role) {
    case "ADMIN":
      return "/admin/usuarios";
    case "SELLER":
      return "/comercio";
    case "CUSTOMER":
    case "DELIVERY":
    default:
      return "/homepage";
  }
}

export default function AuthPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const res = await apiClient.post("/api/session", {
          email: form.email,
          password: form.password,
        });

        const role = res.data?.user?.role;
        const path = getPostLoginPath(role);
        navigate(path, { replace: true });
      } else {
        await apiClient.post("/api/users/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });

        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden">
      {/* Fondo fijo: gradiente marca + orbes (estilo “dots”) + burbujas */}
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
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#769482] text-white shadow-lg shadow-[#769482]/35 ring-4 ring-[#769482]/15">
              <img src={logo} alt="" className="h-8 w-8 object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">OpenMarket</h1>
            <p className="mt-1 text-sm text-slate-500">Tu marketplace sostenible</p>
          </div>

          <div className="mb-6 text-center">
            <p className="text-lg font-semibold text-slate-800">Bienvenido</p>
            <p className="mt-1 text-sm text-slate-500">Accede a tu cuenta o regístrate</p>
          </div>

          <div className="mb-6 flex rounded-full bg-slate-100/90 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 rounded-full px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isLogin
                  ? "bg-white text-[#355347] shadow-md shadow-slate-200/80"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 rounded-full px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                !isLogin
                  ? "bg-white text-[#355347] shadow-md shadow-slate-200/80"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Registrarse
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Nombre completo
                </label>
                <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2.5 transition focus-within:border-[#769482]/50 focus-within:ring-2 focus-within:ring-[#769482]/20">
                  <User size={18} className="mr-2.5 shrink-0 text-[#769482]" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Correo electrónico
              </label>
              <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2.5 transition focus-within:border-[#769482]/50 focus-within:ring-2 focus-within:ring-[#769482]/20">
                <Mail size={18} className="mr-2.5 shrink-0 text-[#769482]" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Contraseña
              </label>
              <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2.5 transition focus-within:border-[#769482]/50 focus-within:ring-2 focus-within:ring-[#769482]/20">
                <Lock size={18} className="mr-2.5 shrink-0 text-[#769482]" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Confirmar contraseña
                </label>
                <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2.5 transition focus-within:border-[#769482]/50 focus-within:ring-2 focus-within:ring-[#769482]/20">
                  <Lock size={18} className="mr-2.5 shrink-0 text-[#769482]" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#769482] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#769482]/30 transition hover:bg-[#6a8879] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Cargando..." : isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
