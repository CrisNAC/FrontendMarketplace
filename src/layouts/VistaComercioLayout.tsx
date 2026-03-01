import type { ReactNode } from "react";
import { GlobalNavbar } from "../components/navbar/GlobalNavbar";
import { CategoryNavBar } from "../components/navbar/CategoryNavBar";
import "../features/clients/styles/vistaComercio.css";

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