//src/layouts/DeliveryLayout.jsx
import { useState } from "react";
import { SidebarDelivery } from "../components/SidebarDelivery";

export const DeliveryLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div style={{ display: "flex", flexDirection: "row", backgroundColor: "var(--background-soft)", minHeight: "100vh" }}>
            <SidebarDelivery
                collapsed={collapsed}
                onToggle={() => setCollapsed((p) => !p)}
            />
            <main style={{ flex: 1, padding: "24px", backgroundColor: "var(--background-soft)", minHeight: "100vh", overflow: "auto" }}>
                {children}
            </main>
        </div>
    );
};
