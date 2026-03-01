import type { ReactNode } from "react";
import Navbar from "../components/navbar/Navbar";
import "../features/clients/styles/vistaComercio.css";

type Props = {
    children: ReactNode;
};

export const VistaComercioLayout = ({ children }: Props) => {
    return (
        <div className="vista-comercio-container">
            <Navbar />
            <main>{children}</main>
        </div>
    );
};