export const StatCard = ({ title, value, icon: Icon, iconColor = "var(--primary-dark)" }) => {
    return (
        <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "16px 20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        }}>
            <div>
                <p style={{ color: "#6b7280", fontSize: "13px", margin: "0 0 4px 0" }}>{title}</p>
                <h4 style={{ fontWeight: "bold", fontSize: "28px", margin: 0 }}>{value}</h4>
            </div>
            {Icon && (
                <div style={{
                    width: "44px", height: "44px", borderRadius: "50%",
                    backgroundColor: "var(--background-soft)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon size={22} color={iconColor} />
                </div>
            )}
        </div>
    );
};