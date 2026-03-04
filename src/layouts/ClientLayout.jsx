
import Navbar from "../components/Navbar";

const ClientLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar  */}
      <Navbar />

      {/* Contenido */}
      <main className="flex-1 bg-white px-6 py-4">
        {children}
      </main>

    </div>
  );
};

export default ClientLayout;
