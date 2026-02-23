import type { ReactNode } from "react";
import "../styles/commerces.css";
import { SideBar } from "../components/Sidebar";

type Props = {
    children: ReactNode;
};

export const MyCommerceLayout = ({ children }: Props) => {
    return (
        <div className="d-flex dashboard-container">
            <SideBar />

            <main className="flex-grow-1 p-4 content-area">
                {children}
            </main>
        </div>
    );
};