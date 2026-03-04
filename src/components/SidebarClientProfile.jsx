import { Link, useLocation } from "react-router-dom";

const links = [
    { to: "/perfil", label: "Mi cuenta" },
    { to: "/pedidos", label: "Mis pedidos" },
    { to: "/favoritos", label: "Mi lista de favoritos" },
    { to: "/direcciones", label: "Libreta de direcciones" },
];

export const SidebarClientProfile = () => {
    const { pathname } = useLocation();

    return (
        <div className="w-full bg-[#c0cec2] p-2 rounded-md">
            <ul className="text-[17px] ps-1">
                {links.map(({ to, label }) => {
                    const isActive = pathname === to;
                    return (
                        <li key={to}>
                            <Link
                                to={to}
                                className={`block px-2 py-2 rounded hover:bg-[#9aa89c] !text-[#2d4030] !no-underline ${isActive ? "font-bold bg-[#9aa89c]" : "font-medium"}`}
                            >
                                {label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
