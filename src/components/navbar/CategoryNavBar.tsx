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

export const CategoryNavBar = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "24px",
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingTop: "7px",
            paddingBottom: "7px",
            backgroundColor: "#D0D6D6",
            overflowX: "auto",
            whiteSpace: "nowrap",
        }}>
            {CATEGORIES.map((cat) => (
                <span
                    key={cat}
                    style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#464141",
                        cursor: "pointer",
                        flexShrink: 0,
                    }}
                >
                    {cat}
                </span>
            ))}
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#944343", cursor: "pointer", flexShrink: 0 }}>
                Ofertas!!
            </span>
        </div>
    );
};