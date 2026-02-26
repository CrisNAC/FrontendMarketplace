
import { SidebarMyCommerce } from "../components/SidebarMyCommerce";

const styles = {
    container: {
        backgroundColor: 'var(--background-soft)',
        minHeight: '100vh'
    },

    contentArea: {
        backgroundColor: 'var(--background-soft)',
        minHeight: '100vh'
    }
}

export const MyCommerceLayout = ({ children }) => {
    return (
        <div className="d-flex" style={styles.container}>
            <SidebarMyCommerce />

            <main className="flex-grow-1 p-4" style={styles.contentArea}>
                {children}
            </main>
        </div>
    );
};