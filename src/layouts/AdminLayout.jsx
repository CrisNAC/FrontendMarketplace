import { useState } from "react";
import { SidebarAdmin } from "../components/SidebarAdmin";

export const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div style={{ display: "flex", flexDirection: "row", backgroundColor: "var(--background-soft)", minHeight: "100vh" }}>
            <div style={{ position: "sticky", top: 0, height: "100vh", flexShrink: 0, overflow: "hidden" }}>
                <SidebarAdmin
                    collapsed={collapsed}
                    onToggle={() => setCollapsed((p) => !p)}
                />
            </div>
            <main style={{ flex: 1, padding: "24px", backgroundColor: "var(--background-soft)", minHeight: "100vh", overflow: "auto" }}>
                {children}
            </main>
        </div>
    );
};
