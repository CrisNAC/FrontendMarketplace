
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

/**
 * Importación de componentes y páginas
 */
import { MyCommerceLayout } from './layouts/MyCommerceLayout'
import { MyCommercePage } from './pages/MyCommercePage'
import MyAccountPage from "./pages/MyAccountPage";
import PriceComparisonPage from './pages/PriceComparisonPage';
import DetalleProducto from './pages/DetalleProducto';

// Creamos una página de inicio rápida para probar
const HomePage = () => (
  <div className="p-10 text-center">
    <h1 className="text-3xl font-bold">Bienvenido al Marketplace</h1>
    <p className="mt-4">Navega a <a href="/comparar" className="text-blue-500 underline">Comparar Precios</a></p>
    <p className="mt-4">Navega a <a href="/perfil" className="text-blue-500 underline">Mi Perfil</a></p>
    <p className="mt-4">Navega a <a href="/producto-detalle" className="text-blue-500 underline">Detalle de Producto</a></p>
    <p className="mt-4">Navega a <a href="/comercio" className="text-blue-500 underline">Mi Comercio</a></p>
  </div>
);

/**
 * 
 * @returns 
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta de inicio */}
        <Route path="/" element={<HomePage />} />

        {/* CLIENTES */}
        <Route path="/perfil" element={<MyAccountPage />} />
        <Route path="/comparar" element={<PriceComparisonPage />} />
        <Route path="/producto-detalle" element={<DetalleProducto />} />

        {/* COMERCIOS */}
        <Route path="/comercio" element={
          <MyCommerceLayout>
            <MyCommercePage />
          </MyCommerceLayout>
        } />

        {/* Ruta 404 - Si escriben cualquier cosa, los manda al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
