import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import axios from "axios";
import logo from "/src/assets/feather.png";

export default function AuthPage() {
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
        const res = await axios.post("/api/session", {
          email: form.email,
          password: form.password,
        });

        console.log(res.data);
        window.location = "/homepage";
      } else {
        const res = await axios.post("/api/users/register", {
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
    <div className="min-h-screen bg-[#DCE5E1] flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div className="flex flex-col items-center mb-8 mt-10">
        <div className="w-20 h-20 bg-[#6B9080] rounded-full flex items-center justify-center mb-4">
          <span>
            <img src={logo} alt="Logo" className="w-[30px] h-auto" />
          </span>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900"
        style={{ fontSize: "25px", fontWeight: "bold" }}>
          OpenMarket
        </h1>
        <p className="text-sm text-gray-600">
          Tu marketplace sostenible
        </p>
      </div>

      {/* Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">

        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-[#6B9080]"
                  style={{ fontSize: "20px", fontWeight: "bold" }}>
            {isLogin ? "Bienvenido" : "Crear Cuenta"}
          </h2>
          <p className="text-sm text-gray-500">
            {isLogin
              ? "Accede a tu cuenta"
              : "Regístrate para comenzar"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#E5EAE9] rounded-full p-1 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
              isLogin
                ? "bg-white shadow"
                : "text-gray-600"
            }`}
            style={{
              padding: "6px 10px",
              borderRadius: "12px",
              cursor: "pointer"
            }}
          >
            Iniciar Sesión
          </button>

          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${
              !isLogin
                ? "bg-white shadow"
                : "text-gray-600"
            }`}
            style={{
              padding: "6px 10px",
              borderRadius: "12px",
              cursor: "pointer"
            }}
          >
            Registrarse
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Nombre completo
              </label>
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <User size={18} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="bg-transparent outline-none w-full text-sm"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Correo electrónico
            </label>
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Mail size={18} className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@correo.com"
                className="bg-transparent outline-none w-full text-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Contraseña
            </label>
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Lock size={18} className="text-gray-400 mr-2" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="bg-transparent outline-none w-full text-sm"
                required
              />
            </div>
          </div>

          {/* Confirmar contraseña solo en registro */}
          {!isLogin && (
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Confirmar contraseña
              </label>
              <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                <Lock size={18} className="text-gray-400 mr-2" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6B9080] hover:bg-[#5f8273] transition-all duration-200 text-white py-3 rounded-xl font-medium mt-2"
            style={{
              padding: "6px 10px",
              borderRadius: "12px",
              cursor: "pointer"
            }}
          >
            {loading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </button>

        </form>
      </div>
    </div>
  );
}