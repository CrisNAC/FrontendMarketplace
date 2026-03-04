import { ShoppingCart, User, Search, X } from "lucide-react";
import logo from "/src/assets/feather.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="w-full border-b border-gray-200 shadow-sm font-sans">

      {/* Top Section */}
      <div className="bg-[#A4C3B2] flex items-center justify-between px-[30px] py-[10px]">

        {/* Logo */}
        <Link to="/homepage" className="flex items-center gap-[6px] !no-underline">
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
            to="/homepage"
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
            to="/comercio" 
            className="!no-underline !text-[#485B53] hover:!text-[#2e6b4f] transition-colors"
          >
            Comercio
          </Link>
        </nav>

        {/* Search */}
        <div className="flex items-center gap-[12px]">
          <div className="flex items-center bg-white rounded-full px-[12px] py-[4px] w-[600px] relative">
            <input
              type="text"
              placeholder="Buscar"
              className="flex-1 border-none outline-none text-[13px]"
            />
            <X className="text-gray-500 cursor-pointer mr-[6px]" size={16} />
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
          >
            <Search size={16} />
          </button>
        </div>

        {/* Icons */}
        <div className="flex gap-[15px] items-center">
          <Link 
            to="/perfil" 
            className="!text-[#333] hover:!text-[#2e6b4f] transition-colors !no-underline"
          >
            <User size={25} />
          </Link>
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
          Ofertas!!
        </Link>
      </div>

    </header>
  );
};

export default Navbar;