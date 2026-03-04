import { Link } from "react-router-dom";

export const SidebarClientProfile = () => {
    return (
        <div className="w-full bg-[#c0cec2] p-2 rounded-md">
            <ul className="text-[17px] ps-1">
                <li><a href="/perfil" className="block px-2 py-2 rounded hover:bg-[#9aa89c] !text-[#2d4030] font-medium !no-underline">Mi cuenta</a></li>
                <li><a href="/pedidos" className="block px-2  py-2 rounded hover:bg-[#9aa89c] !text-[#2d4030] font-medium !no-underline">Mis pedidos</a></li>
                <li><a href="" className="block px-2 py-2 rounded hover:bg-[#9aa89c] !text-[#2d4030] font-medium !no-underline">Mi lista de favoritos</a></li>
                <li><a href="" className="block px-2 py-2 rounded hover:bg-[#9aa89c] !text-[#2d4030] font-medium !no-underline">Libreta de direcciones</a></li>
            </ul>
        </div>
    );
};
