import { useState } from "react";

const FILTER_CATEGORIES = [
    "Tecnología",
    "Moda",
    "Coleccionables y Arte",
    "Hogar y Jardín",
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
        <div style={{
            backgroundColor: "rgba(247, 200, 200, 0.28)",
            borderRadius: "16px",
            padding: "16px",
            minWidth: "200px",
            maxWidth: "200px",
            alignSelf: "flex-start",
        }}>
            <p style={{ fontWeight: "bold", marginBottom: "4px" }}>Filtrar por</p>
            <p style={{ fontWeight: "bold", marginBottom: "12px" }}>Categorias</p>

            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {FILTER_CATEGORIES.map((cat) => (
                    <li
                        key={cat}
                        onClick={() => toggle(cat)}
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                            cursor: "pointer",
                        }}
                    >
                        <span style={{ color: "var(--primary-dark)", fontSize: "16px", width: "16px", flexShrink: 0 }}>
                            {expanded === cat ? "▾" : "›"}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: "600" }}>{cat}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};