import { Link } from "react-router-dom";

export const SidebarClientProfile = () => {
    return (
        <div className="w-full bg-[#c0cec2] p-2 rounded-md">
            <ul className="text-[17px] ps-1">
                <li>
                    <Link
                        to="/perfil"
                        className="block px-2 py-2 rounded hover:bg-[#9aa89c] !text-[#2d4030] font-medium !no-underline"
                    >
                        Mi cuenta
                    </Link>
                </li>
                <li>
                    <Link
                        to="/pedidos"
                        className="block px-2 py-2 rounded hover:bg-[#9aa89c] !text-[#2d4030] font-medium !no-underline"
                    >
                        Mis pedidos
                    </Link>
                </li>
                <li>
                    <Link
                        to="/perfil?tab=favoritos"
                        className="block px-2 py-2 rounded hover:bg-[#9aa89c] !text-[#2d4030] font-medium !no-underline"
                    >
                        Mi lista de favoritos
                    </Link>
                </li>
                <li>
                    <Link
                        to="/perfil?tab=direcciones"
                        className="block px-2 py-2 rounded hover:bg-[#9aa89c] !text-[#2d4030] font-medium !no-underline"
                    >
                        Libreta de direcciones
                    </Link>
                </li>
            </ul>
        </div>
    );
};
