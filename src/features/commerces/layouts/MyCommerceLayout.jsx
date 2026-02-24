
import "../styles/commerces.css";
import { Sidebar } from "../components/Sidebar";

export const MyCommerceLayout = ({ children }) => {
    return (
        <div className="d-flex dashboard-container">
            <Sidebar />

            <main className="flex-grow-1 p-4 content-area">
                {children}
            </main>
        </div>
    );
};