import type { ReactNode } from "react";
import { GlobalNavbar } from "../components/GlobalNavbar";
import { CategoryNavBar } from "../components/CategoryNavbar";
import "../styles/vistaComercio.css";

type Props = {
    children: ReactNode;
};

export const VistaComercioLayout = ({ children }: Props) => {
    return (
        <div className="vista-comercio-container">
            <GlobalNavbar />
            <CategoryNavBar />
            <main>{children}</main>
        </div>
    );
};