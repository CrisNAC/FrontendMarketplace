import type { ReactNode } from "react";
import Navbar from "../components/navbar/Navbar";

type Props = {
    children: ReactNode;
};

export const VistaComercioLayout = ({ children }: Props) => {
    return (
        <div className="vista-comercio-container">
            <div className="sticky top-0 z-50">
                <Navbar />
            </div>
            <main>{children}</main>
        </div>
    );
};