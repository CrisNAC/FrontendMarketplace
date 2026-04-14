import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import apiClient from "../../../lib/apiClient";
import logo from "/src/assets/feather.png";
import loginBackground from "/src/assets/login background.png";

export default function AuthPage() {
  const AUTH_BG_IMAGE = loginBackground;

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

    // Validación de pass en registro
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

        console.log(res.data);
        window.location = "/homepage";
      } else {
        const res = await apiClient.post("/api/users/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });

        console.log("Registro exitoso:", res.data);
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat px-4 py-8 md:px-8"
      style={{
        backgroundImage: `linear-gradient(rgba(12, 25, 31, 0.5), rgba(12, 25, 31, 0.5)), url('${AUTH_BG_IMAGE}')`
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/16 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6B9080] text-white shadow-md">
              <img
                src={logo}
                alt="OpenMarket logo"
                className="h-6 w-6 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">OpenMarket</h1>
              <p className="text-xs text-white/80">Tu marketplace sostenible</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-white">
              {isLogin ? "Inicia sesión" : "Crea tu cuenta"}
            </h2>
            <p className="mt-1 text-sm text-white/80">
              {isLogin
                ? "Accede para descubrir productos y ofertas."
                : "Regístrate para empezar a comprar en OpenMarket."}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-white/20 p-1.5">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isLogin ? "bg-white text-[#355347] shadow" : "text-white/85 hover:bg-white/10"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                !isLogin ? "bg-white text-[#355347] shadow" : "text-white/85 hover:bg-white/10"
              }`}
            >
              Registrarse
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-300/70 bg-red-500/15 px-4 py-2 text-sm text-red-100">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/90">
                  Nombre completo
                </label>
                <div className="flex items-center rounded-xl border border-white/40 bg-white/15 px-3 py-2 text-white">
                  <User size={18} className="mr-2 text-white/80" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/90">
                Correo electrónico
              </label>
              <div className="flex items-center rounded-xl border border-white/40 bg-white/15 px-3 py-2 text-white">
                <Mail size={18} className="mr-2 text-white/80" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/90">
                Contraseña
              </label>
              <div className="flex items-center rounded-xl border border-white/40 bg-white/15 px-3 py-2 text-white">
                <Lock size={18} className="mr-2 text-white/80" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="********"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/90">
                  Confirmar contraseña
                </label>
                <div className="flex items-center rounded-xl border border-white/40 bg-white/15 px-3 py-2 text-white">
                  <Lock size={18} className="mr-2 text-white/80" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="********"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/60 outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[#6B9080] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5f8273] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Cargando..." : isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}