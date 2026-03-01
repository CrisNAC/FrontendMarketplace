const CATEGORIES = [
    "Tecnologia",
    "Moda",
    "Coleccionables y Arte",
    "Hogar y Jardin",
    "Salud y Belleza",
    "Entretenimiento",
    "Deportes",
    "Equipo Industrial",
];

export const CategoriesBar = () => {
    return (
        <div className="bg-[#d1d5db] px-6 py-2 flex gap-6 text-sm overflow-x-auto whitespace-nowrap">
            {CATEGORIES.map((category) => (
                <span key={category} className="cursor-pointer hover:text-gray-600">
                    {category}
                </span>
            ))}
            <span className="text-red-700 font-bold cursor-pointer">Ofertas!!</span>
        </div>
    );
};
