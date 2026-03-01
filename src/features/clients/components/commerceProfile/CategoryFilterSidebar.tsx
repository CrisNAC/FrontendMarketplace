import { useState } from "react";
import "../../styles/vistaComercio.css";

const FILTER_CATEGORIES = [
    "Tecnologia",
    "Moda",
    "Coleccionables y Arte",
    "Hogar y Jardin",
    "Salud y Belleza",
    "Entretenimiento",
    "Deportes",
    "Equipo Industrial",
];

export const CategoryFilterSidebar = () => {
    const [expanded, setExpanded] = useState<string | null>(null);

    const toggle = (cat: string) => {
        setExpanded((prev) => (prev === cat ? null : cat));
    };

    return (
        <div className="category-filter-sidebar rounded-4 p-4">
            <p className="fw-bold mb-1">Filtrar por</p>
            <p className="fw-bold mb-3">Categorias</p>

            <ul className="list-unstyled mb-0">
                {FILTER_CATEGORIES.map((cat) => (
                    <li
                        key={cat}
                        className="filter-category-item d-flex align-items-center gap-2 mb-2 cursor-pointer"
                        onClick={() => toggle(cat)}
                    >
                        <span className="filter-chevron">
                            {expanded === cat ? "▾" : "›"}
                        </span>
                        <span className="small fw-semibold">{cat}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};