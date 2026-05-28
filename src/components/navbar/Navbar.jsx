// src/components/navbar/Navbar.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ShoppingCart, User, Search, X, ChevronDown, LogOut, Menu,
} from "lucide-react";
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
    return acc + items.reduce((s, row) => s + Math.max(1, Number(row.quantity) || 1), 0);
  }, 0);
}

const PROFILE_LINKS = [
  { to: "/perfil",      label: "Mi cuenta" },
  { to: "/pedidos",     label: "Mis pedidos" },
  { to: "/wishlist",    label: "Mi lista de deseos" },
  { to: "/direcciones", label: "Libreta de Direcciones" },
];

const NAV_LINKS_BASE = [
  { to: "/",        label: "Inicio" },
  { to: "/busqueda", label: "Productos" },
  { to: "/ofertas",  label: "Ofertas", highlight: "red" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef(null);
  const mobileMenuRef  = useRef(null);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isOfferView   = location.pathname === "/ofertas";
  const isSearchView  = location.pathname === "/busqueda" || isOfferView;
  const urlSearch     = isSearchView ? (searchParams.get("search") || "") : "";

  const [search, setSearch]         = useState("");
  const [cartCount, setCartCount]   = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState(undefined);
  const [loggingOut, setLoggingOut] = useState(false);

  const isLoggedIn = Boolean(sessionUser?.id_user);
  const isCustomer = sessionUser?.role === "CUSTOMER";

  const refreshCartAndSession = useCallback(async () => {
    const apiBase = getApiBase() || "http://localhost:3000";
    try {
      const res = await axios.get(`${apiBase}/api/session/user-session`, { withCredentials: true });
      const user = res.data?.user ?? null;
      const uid  = user?.id_user;
      setSessionUser(user ?? null);
      if (uid) {
        const carts = await fetchCartsApi(uid);
        setCartCount(sumServerCartQuantities(carts));
        return;
      }
    } catch {
      setSessionUser(null);
    }
    setCartCount(0);
  }, []);

  useEffect(() => {
    if (isSearchView) setSearch(urlSearch);
    else setSearch("");
  }, [isSearchView, urlSearch]);

  useEffect(() => { refreshCartAndSession(); }, [refreshCartAndSession]);

  useEffect(() => {
    const handler = () => refreshCartAndSession();
    window.addEventListener("cartUpdated", handler);
    window.addEventListener("deliveryRegistered", handler);
    return () => {
      window.removeEventListener("cartUpdated", handler);
      window.removeEventListener("deliveryRegistered", handler);
    };
  }, [refreshCartAndSession]);

  // Close dropdowns on route change
  useEffect(() => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const onPointerDown = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onPointerDown = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [mobileMenuOpen]);

  const submitSearch = () => {
    const term     = search.trim();
    const basePath = isOfferView ? "/ofertas" : "/busqueda";
    if (!term) { navigate(basePath); return; }
    navigate(`${basePath}?${new URLSearchParams({ search: term }).toString()}`);
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
      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Sesión cerrada");
      navigate("/");
    } catch {
      toast.error("No se pudo cerrar sesión. Intentá de nuevo.");
    } finally {
      setLoggingOut(false);
    }
  };

  // Dynamic nav links (depend on session)
  const navLinks = useMemo(() => {
    const links = [...NAV_LINKS_BASE];
    if (isLoggedIn) {
      links.splice(2, 0, {
        to: isCustomer ? "/crear-comercio" : "/comercio",
        label: isCustomer ? "Crear Comercio" : "Comercio",
      });
    }
    if (isLoggedIn && isCustomer) {
      links.push({ to: "/quiero-ser-delivery", label: "Quiero ser delivery", highlight: "green" });
    }
    return links;
  }, [isLoggedIn, isCustomer]);

  return (
    <header className="w-full border-b border-gray-200 shadow-sm font-sans">

      {/* ── Top bar ── */}
      <div className="bg-[#A4C3B2]">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-[30px] py-[10px] gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-[6px] !no-underline flex-shrink-0">
            <img src={logo} alt="Logo" className="w-[28px] sm:w-[30px] h-auto" />
            <span className="font-medium text-[15px] sm:text-[16px] text-white">Open Market</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex gap-[20px] font-normal text-[14px]">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`!no-underline transition-colors ${
                  link.highlight === "red"
                    ? "!text-[#7f1d1d] font-semibold hover:!text-[#b91c1c]"
                    : link.highlight === "green"
                    ? "!text-[#1f4f3d] font-semibold hover:!text-[#2e6b4f]"
                    : "!text-[#485B53] hover:!text-[#2e6b4f]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop search */}
          <div className="hidden lg:flex items-center gap-[12px] flex-1 max-w-[600px]">
            <div className="flex items-center bg-white rounded-full px-[12px] py-[4px] w-full relative">
              <input
                type="text"
                placeholder="Buscar"
                className="flex-1 border-none outline-none text-[13px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
              />
              <X
                className="text-gray-500 cursor-pointer mr-[6px]"
                size={16}
                onClick={() => {
                  setSearch("");
                  if (isSearchView) navigate(isOfferView ? "/ofertas" : "/busqueda");
                }}
              />
            </div>
            <button
              type="button"
              style={{ padding: "6px 10px", borderRadius: "12px", backgroundColor: "#6B9080", border: "1px solid #658D7B", color: "#fff", cursor: "pointer" }}
              onClick={submitSearch}
            >
              <Search size={16} />
            </button>
          </div>

          {/* Icons (always visible) */}
          <div className="flex gap-2 sm:gap-[15px] items-center flex-shrink-0">
            {isLoggedIn && (
              <NotificationBellDropdown
                role={sessionUser?.role ?? "CUSTOMER"}
                iconSize={22}
                className="hover:bg-black/10 rounded-full"
              />
            )}

            <Link
              to="/carrito"
              className="relative flex items-center rounded-full p-1.5 text-[#333] hover:bg-black/10 hover:text-[#2e6b4f] transition-colors"
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={22} className="text-[#2f3e39] hover:text-[#2e6b4f] transition-colors" />
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
                <User size={22} />
                <ChevronDown size={14} className={`opacity-80 transition-transform hidden sm:block ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-[min(100vw-24px,260px)] rounded-xl border border-gray-200/80 bg-white py-1.5 shadow-lg z-[100]"
                  role="menu"
                >
                  {!isLoggedIn ? (
                    <button type="button" role="menuitem"
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100"
                      onClick={goLogin}>
                      Iniciar sesión
                    </button>
                  ) : (
                    <div className="flex flex-col">
                      {PROFILE_LINKS.map(({ to, label }) => (
                        <Link key={to} to={to} role="menuitem"
                          className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 !no-underline"
                          onClick={() => setProfileOpen(false)}>
                          {label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1" role="separator" />
                      <button type="button" role="menuitem" disabled={loggingOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60 text-left"
                        onClick={handleLogout}>
                        <LogOut size={16} aria-hidden />
                        {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger — mobile/tablet only */}
            <button
              type="button"
              className="lg:hidden flex items-center justify-center p-1.5 rounded-full hover:bg-black/10 text-white transition-colors"
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="lg:hidden px-4 pb-3 flex gap-2">
          <div className="flex items-center bg-white rounded-full px-3 py-[5px] flex-1">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="flex-1 border-none outline-none text-[13px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
            />
            {search && (
              <X className="text-gray-400 cursor-pointer" size={15}
                onClick={() => {
                  setSearch("");
                  if (isSearchView) navigate(isOfferView ? "/ofertas" : "/busqueda");
                }}
              />
            )}
          </div>
          <button
            type="button"
            style={{ padding: "6px 12px", borderRadius: "999px", backgroundColor: "#6B9080", border: "none", color: "#fff", cursor: "pointer", flexShrink: 0 }}
            onClick={submitSearch}
          >
            <Search size={15} />
          </button>
        </div>
      </div>

      {/* ── Mobile menu (nav links) ── */}
      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className="lg:hidden bg-[#8FAF9F] border-t border-[#7a9d8d] px-4 py-3 flex flex-col gap-1 z-50">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`!no-underline block px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                link.highlight === "red"
                  ? "!text-[#7f1d1d] font-semibold hover:bg-black/10"
                  : link.highlight === "green"
                  ? "!text-[#1f3d2e] font-semibold hover:bg-black/10"
                  : "!text-white hover:bg-black/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
      
    </header>
  );
};

export default Navbar;