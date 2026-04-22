export const AdminModulePlaceholderPage = ({ title, description }) => {
  return (
    <div style={{ maxWidth: "1100px" }}>
      <div
        style={{
          backgroundColor: "var(--background-white)",
          borderRadius: "14px",
          padding: "24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: "0 0 8px 0" }}>{title}</h1>
        <p style={{ margin: "0 0 14px 0", color: "#6b7280", fontSize: "14px" }}>{description}</p>
        <p style={{ margin: 0, fontSize: "13px", color: "#4b5563" }}>
          Este modulo esta listo para recibir la implementacion funcional del equipo.
        </p>
      </div>
    </div>
  );
};
