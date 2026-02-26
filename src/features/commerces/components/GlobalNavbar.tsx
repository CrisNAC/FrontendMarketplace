export const GlobalNavbar = () => {
    return (
        <nav style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "var(--primary)",
            paddingTop: "2px",
            paddingBottom: "2px",
            paddingLeft: "16px",
            paddingRight: "16px",
            minHeight: "60px",
            gap: "16px",
        }}>
            {/* Logo + Brand */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", marginRight: "16px", flexShrink: 0 }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "8px", backgroundColor: "var(--primary-dark)", flexShrink: 0 }} />
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "#ffffff", whiteSpace: "nowrap" }}>Open Market</span>
            </div>

            {/* Nav links */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "24px", marginRight: "16px", flexShrink: 0 }}>
                <span style={{ color: "#485b53", fontSize: "14px", cursor: "pointer" }}>Inicio</span>
                <span style={{ color: "#485b53", fontSize: "14px", cursor: "pointer" }}>Productos</span>
                <span style={{ color: "#485b53", fontSize: "14px", cursor: "pointer" }}>Comercio</span>
            </div>

            {/* Search bar */}
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", flex: 1 }}>
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#ffffff",
                    border: "1px solid #D9D9D9",
                    borderRadius: "9999px",
                    paddingTop: "15px",
                    paddingBottom: "15px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                }}>
                    <span style={{ color: "#1E1E1E", fontSize: "16px" }}>Buscar</span>
                    <span style={{ color: "#9ca3af", fontSize: "14px", cursor: "pointer" }}>✕</span>
                </div>
                <button style={{
                    backgroundColor: "var(--primary-dark)",
                    color: "#f5f5f5",
                    fontSize: "16px",
                    padding: "11px 16px",
                    borderRadius: "10px",
                    border: "1px solid #658D7B",
                    cursor: "pointer",
                    flexShrink: 0,
                }}>
                    Buscar
                </button>
            </div>

            {/* User avatar */}
            <div style={{ flexShrink: 0, marginLeft: "8px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--primary-light)" }} />
            </div>
        </nav>
    );
};