import { User, X } from "lucide-react";

export const MarketplaceNavbar = () => {
    return (
        <header className="bg-[#a5c7b7] px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold italic">OM</span>
                    </div>
                    <span className="text-white font-bold text-xl">Open Market</span>
                </div>
                <nav className="hidden md:flex gap-6 text-white/90 text-sm font-medium">
                    <a href="#" className="no-underline text-white/90 visited:text-white/90 hover:text-white">
                        Inicio
                    </a>
                    <a href="#" className="no-underline text-white/90 visited:text-white/90 hover:text-white">
                        Productos
                    </a>
                    <a href="#" className="no-underline text-white/90 visited:text-white/90 hover:text-white">
                        Comercio
                    </a>
                </nav>
            </div>

            <div className="flex-1 max-w-2xl relative flex items-center">
                <input
                    type="text"
                    placeholder="Buscar"
                    className="w-full py-2 px-4 rounded-full text-sm outline-none"
                />
                <X className="absolute right-24 text-gray-400 w-4 h-4 cursor-pointer" />
                <button className="absolute right-0 bg-[#7ba893] text-white px-6 py-2 rounded-full text-sm font-medium">
                    Buscar
                </button>
            </div>

            <div className="bg-white/30 p-2 rounded-full">
                <User className="text-white w-6 h-6" />
            </div>
        </header>
    );
};
