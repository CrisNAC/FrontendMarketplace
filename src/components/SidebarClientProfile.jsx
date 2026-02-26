export const SidebarClientProfile = () => {
     return (
        <div className="w-full bg-sidebarProfileClient p-2 rounded-md">
            <ul className="text-[17px] ps-1">
                <li><a href="" className="block px-2 py-2 rounded hover:bg-sidebarProfileClientHover !text-sidebarProfileClientText font-medium !no-underline">Mi cuenta</a></li>
                <li><a href="" className="block px-2  py-2 rounded hover:bg-sidebarProfileClientHover !text-sidebarProfileClientText font-medium !no-underline">Mis pedidos</a></li>
                <li><a href="" className="block px-2 py-2 rounded hover:bg-sidebarProfileClientHover !text-sidebarProfileClientText font-medium !no-underline">Mi lista de favoritos</a></li>
                <li><a href="" className="block px-2 py-2 rounded hover:bg-sidebarProfileClientHover !text-sidebarProfileClientText font-medium !no-underline">Libreta de direcciones</a></li>
            </ul>
        </div>
    );
}