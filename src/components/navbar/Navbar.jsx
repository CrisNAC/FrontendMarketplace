import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShoppingCart, User, Search, X, ChevronDown, LogOut } from "lucide-react";
import { NotificationBellDropdown } from "../notifications/NotificationBellDropdown";
import axios from "axios";
import toast from "react-hot-toast";
import logo from "/src/assets/feather.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchCartsApi, getApiBase } from "../../lib/cartApi.js";

function sumServerCartQuantities(carts) {
  if (!Array.isArray(carts)) return 0;
  return carts.reduce((acc, cart) => {
    const items = cart?.items;
    if (!Array.isArray(items)) return acc;
    return (
      acc +
      items.reduce(
        (s, row) => s + Math.max(1, Number(row.quantity) || 1),
        0
      )
    );
  }, 0);
}

const PROFILE_LINKS = [
  { to: "/perfil", label: "Mi cuenta" },
  { to: "/pedidos", label: "Mis pedidos" },
  { to: "/wishlist", label: "Mi lista de deseos" },
  { to: "/direcciones", label: "Libreta de Direcciones" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef(null);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isOfferView = location.pathname === "/ofertas";
  const isSearchView = location.pathname === "/busqueda" || isOfferView;
  const urlSearch = isSearchView ? (searchParams.get("search") || "") : "";

  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const isLoggedIn = Boolean(sessionUser?.id_user);
  const isCustomer = sessionUser?.role === "CUSTOMER";

  const refreshCartAndSession = useCallback(async () => {
    const apiBase = getApiBase() || "http://localhost:3000";
    try {
      const res = await axios.get(`${apiBase}/api/session/user-session`, {
        withCredentials: true,
      });
      const user = res.data?.user ?? null;
      const uid = user?.id_user;
      setSessionUser(user ?? null);
      if (uid) {
        const carts = await fetchCartsApi(uid);
        setCartCount(sumServerCartQuantities(carts));
        return;
      }
    } catch {
      setSessionUser(null);
    }
    // Sin sesión: no mostrar cantidad en el ícono (el carrito local puede existir pero no se refleja en el navbar).
    setCartCount(0);
  }, []);

  useEffect(() => {
    if (isSearchView) {
      setSearch(urlSearch);
    } else {
      setSearch("");
    }
  }, [isSearchView, urlSearch]);

  useEffect(() => {
    refreshCartAndSession();
  }, [refreshCartAndSession]);

  useEffect(() => {
    const onCartUpdated = () => {
      refreshCartAndSession();
    };
    window.addEventListener("cartUpdated", onCartUpdated);
    return () => window.removeEventListener("cartUpdated", onCartUpdated);
  }, [refreshCartAndSession]);

  useEffect(() => {
    const onDeliveryRegistered = () => {
      refreshCartAndSession();
    };
    window.addEventListener("deliveryRegistered", onDeliveryRegistered);
    return () => window.removeEventListener("deliveryRegistered", onDeliveryRegistered);
  }, [refreshCartAndSession]);

  useEffect(() => {
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const submitSearch = () => {
    const term = search.trim();
    const basePath = isOfferView ? "/ofertas" : "/busqueda";
    if (!term) {
      navigate(basePath);
      return;
    }
    const params = new URLSearchParams({ search: term });
    navigate(`${basePath}?${params.toString()}`);
  };

  const goLogin = () => {
    setProfileOpen(false);
    navigate("/login");
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setProfileOpen(false);
    const apiBase = getApiBase() || "http://localhost:3000";
    try {
      await axios.delete(`${apiBase}/api/session`, { withCredentials: true });
      setSessionUser(null);
      setCartCount(0);
      setUnreadCount(0);
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Sesión cerrada");
      navigate("/");
    } catch {
      toast.error("No se pudo cerrar sesión. Intentá de nuevo.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="w-full border-b border-gray-200 shadow-sm font-sans">

      {/* Top Section */}
      <div className="bg-[#A4C3B2] flex items-center justify-between px-[30px] py-[10px]">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-[6px] !no-underline">
          <span>
            <img src={logo} alt="Logo" className="w-[30px] h-auto" />
          </span>
          <span className="font-medium text-[16px] text-white">
            Open Market
          </span>
        </Link>

        {/* Main links */}
        <nav className="flex gap-[20px] font-normal text-[14px]">
          <Link
            to="/"
            className="!no-underline !text-[#485B53] hover:!text-[#2e6b4f] transition-colors"
          >
            Inicio
          </Link>
          <Link
            to="/busqueda"
            className="!no-underline !text-[#485B53] hover:!text-[#2e6b4f] transition-colors"
          >
            Productos
          </Link>
          <Link
            to={isCustomer ? "/crear-comercio" : "/comercio"}
            className="!no-underline !text-[#485B53] hover:!text-[#2e6b4f] transition-colors"
          >
            Comercio
          </Link>
          <Link
            to="/ofertas"
            className="!no-underline !text-[#7f1d1d] font-semibold hover:!text-[#b91c1c] transition-colors"
          >
            Ofertas
          </Link>
          {isLoggedIn && isCustomer && (
            <Link
              to="/quiero-ser-delivery"
              className="!no-underline !text-[#1f4f3d] font-semibold hover:!text-[#2e6b4f] transition-colors"
            >
              Quiero ser delivery
            </Link>
          )}
        </nav>

        {/* Search */}
        <div className="flex items-center gap-[12px]">
          <div className="flex items-center bg-white rounded-full px-[12px] py-[4px] w-[600px] relative">
            <input
              type="text"
              placeholder="Buscar"
              className="flex-1 border-none outline-none text-[13px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSearch();
              }}
            />
            <X
              className="text-gray-500 cursor-pointer mr-[6px]"
              size={16}
              onClick={() => {
                setSearch("");
                if (isSearchView) {
                  navigate(isOfferView ? "/ofertas" : "/busqueda");
                }
              }}
            />
          </div>

          <button
            style={{
              padding: "6px 10px",
              borderRadius: "12px",
              backgroundColor: "#6B9080",
              border: "1px solid #658D7B",
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={submitSearch}
          >
            <Search size={16} />
          </button>
        </div>

        {/* Icons */}
        <div className="flex gap-[15px] items-center">
          {isLoggedIn && (
            <NotificationBellDropdown
              role={sessionUser?.role ?? "CUSTOMER"}
              iconSize={25}
              className="hover:bg-black/10 rounded-full"
            />
          )}
          <Link
            to="/carrito"
            className="relative flex items-center gap-0.5 rounded-full p-1.5 text-[#333] hover:bg-black/10 hover:text-[#2e6b4f] transition-colors"
            aria-label="Carrito de compras"
          >
            <ShoppingCart size={25} className="text-[#2f3e39] hover:text-[#2e6b4f] transition-colors" />
            {isLoggedIn && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold px-1 rounded-full">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              className="flex items-center gap-0.5 rounded-full p-1.5 text-[#333] hover:bg-black/10 hover:text-[#2e6b4f] transition-colors"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label="Menú de cuenta"
              onClick={() => setProfileOpen((o) => !o)}
            >
              <User size={25} />
              <ChevronDown
                size={16}
                className={`opacity-80 transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-[min(100vw-24px,260px)] rounded-xl border border-gray-200/80 bg-white py-1.5 shadow-lg z-[100]"
                role="menu"
              >
                {!isLoggedIn ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100"
                    onClick={goLogin}
                  >
                    Iniciar sesión
                  </button>
                ) : (
                  <div className="flex flex-col">
                    {PROFILE_LINKS.map(({ to, label }) => (
                      <Link
                        key={to}
                        to={to}
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 !no-underline"
                        onClick={() => setProfileOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1" role="separator" />
                    <button
                      type="button"
                      role="menuitem"
                      disabled={loggingOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60 text-left"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} aria-hidden />
                      {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-[#E5EAE9] flex justify-center gap-[20px] py-[8px] text-[13px] font-normal">
        <Link
          to="/categoria/tecnologia"
          className="!no-underline !text-[#474242] hover:!text-[#2e6b4f] transition-colors"
        >
          Tecnología
        </Link>
        <Link
          to="/categoria/moda"
          className="!no-underline !text-[#474242] hover:!text-[#2e6b4f] transition-colors"
        >
          Moda
        </Link>
        <Link
          to="/categoria/coleccionables"
          className="!no-underline !text-[#474242] hover:!text-[#2e6b4f] transition-colors"
        >
          Coleccionables y Arte
        </Link>
        <Link
          to="/categoria/hogar"
          className="!no-underline !text-[#474242] hover:!text-[#2e6b4f] transition-colors"
        >
          Hogar y Jardín
        </Link>
        <Link
          to="/categoria/salud"
          className="!no-underline !text-[#474242] hover:!text-[#2e6b4f] transition-colors"
        >
          Salud y Belleza
        </Link>
        <Link
          to="/categoria/entretenimiento"
          className="!no-underline !text-[#474242] hover:!text-[#2e6b4f] transition-colors"
        >
          Entretenimiento
        </Link>
        <Link
          to="/categoria/deportes"
          className="!no-underline !text-[#474242] hover:!text-[#2e6b4f] transition-colors"
        >
          Deportes
        </Link>
        <Link
          to="/categoria/industrial"
          className="!no-underline !text-[#474242] hover:!text-[#2e6b4f] transition-colors"
        >
          Equipo Industrial
        </Link>
        <Link
          to="/ofertas"
          className="!no-underline !text-[#952626] font-semibold hover:!text-[#b33a3a] transition-colors"
        >
          Ofertas
        </Link>
      </div>

    </header>
  );
};

export default Navbar;
