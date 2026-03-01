import { ShoppingCart, User, Search, X } from "lucide-react";
import logo from "/src/assets/feather.png";

const Navbar = () => {
  return (
    <header className="w-full border-b border-gray-200 shadow-sm font-sans">

      {/* Top Section */}
      <div className="bg-[#A4C3B2] flex items-center justify-between px-[30px] py-[10px]">

        {/* Logo */}
        <div className="flex items-center gap-[6px]">
          <span>
            <img src={logo} alt="Logo" className="w-[30px] h-auto" />
          </span>
          <span className="font-medium text-[16px] text-white">
            Open Market
          </span>
        </div>

        {/* Main links */}
        <nav className="flex gap-[20px] font-normal text-[14px]">
          <a href="#" className="no-underline text-[#485B53] hover:text-[#2e6b4f] transition-colors">
            Inicio
          </a>
          <a href="#" className="no-underline text-[#485B53] hover:text-[#2e6b4f] transition-colors">
            Productos
          </a>
          <a href="#" className="no-underline text-[#485B53] hover:text-[#2e6b4f] transition-colors">
            Comercio
          </a>
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

          <button className="bg-[#6B9080] rounded-md px-[8px] py-[4px] text-white flex items-center justify-center">
            <Search size={16} />
          </button>
        </div>

        {/* Icons */}
        <div className="flex gap-[15px] text-[#333] cursor-pointer">
          <User size={25} />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-[#E5EAE9] flex justify-center gap-[20px] py-[8px] text-[13px] font-normal text-[#474242]">
        <span className="hover:text-[#2e6b4f] transition-colors cursor-pointer">Tecnología</span>
        <span className="hover:text-[#2e6b4f] transition-colors cursor-pointer">Moda</span>
        <span className="hover:text-[#2e6b4f] transition-colors cursor-pointer">Coleccionables y Arte</span>
        <span className="hover:text-[#2e6b4f] transition-colors cursor-pointer">Hogar y Jardín</span>
        <span className="hover:text-[#2e6b4f] transition-colors cursor-pointer">Salud y Belleza</span>
        <span className="hover:text-[#2e6b4f] transition-colors cursor-pointer">Entretenimiento</span>
        <span className="hover:text-[#2e6b4f] transition-colors cursor-pointer">Deportes</span>
        <span className="hover:text-[#2e6b4f] transition-colors cursor-pointer">Equipo Industrial</span>
        <span className="text-[#952626] font-semibold cursor-pointer">
          Ofertas!!
        </span>
      </div>

    </header>
  );
};

export default Navbar;