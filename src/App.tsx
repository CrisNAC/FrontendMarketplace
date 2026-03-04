import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

/**
 * Layouts
 */
import { MyCommerceLayout } from './layouts/MyCommerceLayout';
import { VistaComercioLayout } from './layouts/VistaComercioLayout';
import { CommentsLayout } from './layouts/CommentsLayout';

/**
 * Pages
 */
import { MyCommercePage } from './features/commerces/pages/MyCommercePage';
import MyAccountPage from "./features/clients/pages/MyAccountPage";
import { VistaComercioPage } from './features/clients/pages/VistaComercioPage'
import { ClientOrdersPage } from './features/clients/pages/ClientOrdersPage'
import { ClientOrderDetailsPage } from './features/clients/pages/ClientOrderDetailsPage'
import { HomePage } from './features/clients/pages/HomePage'
import { BusquedaPage } from './features/clients/pages/BusquedaPage'
import { CommentsPage } from './features/clients/pages/CommentsPage'
import { CreateCommercePage } from './features/clients/pages/CreateCommercePage'

import ComercioVerProducto from './features/commerces/pages/ComercioVerProducto';
import PriceComparisonPage from './features/clients/pages/PriceComparisonPage';
import DetalleProducto from './features/commerces/pages/DetalleProducto';
import CreateProductPage from './features/commerces/pages/CreateProductPage';

const HomePageRoutes = () => (
  <div className="p-10 text-center">
    <h1 className="text-3xl font-bold">Bienvenido al Marketplace</h1>
    <p className="mt-4">Navega a <a href="/comparar" className="text-blue-500 underline">Comparar Precios</a></p>
    <p className="mt-4">Navega a <a href="/perfil" className="text-blue-500 underline">Mi Perfil</a></p>
    <p className="mt-4">Navega a <a href="/producto-detalle" className="text-blue-500 underline">Detalle de Producto</a></p>
    <p className="mt-4">Navega a <a href="/comercio" className="text-blue-500 underline">Mi Comercio</a></p>
    <p className="mt-4">Navega a <a href="/perfil-comercio" className="text-blue-500 underline">Perfil comercio</a></p>
    <p className="mt-4">Navega a <a href="/comercio-producto" className="text-blue-500 underline">Ver Producto Comercio</a></p>
    <p className="mt-4">Navega a <a href="/comercio/productos/nuevo" className="text-blue-500 underline">Crear Producto Comercio</a></p>
    <p className="mt-4">Navega a <a href="/pedidos" className="text-blue-500 underline">Ver pedidos</a></p>
    <p className="mt-4">Navega a <a href="/homepage" className="text-blue-500 underline">Homepage</a></p>
    <p className="mt-4">Navega a <a href="/busqueda" className="text-blue-500 underline">Busqueda</a></p>
    <p className="mt-4">Navega a <a href="/comentarios" className="text-blue-500 underline">Comentarios</a></p>
    <p className="mt-4">Navega a <a href="/crear-comercio" className="text-blue-500 underline">Crear Comercio</a></p>

  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePageRoutes />} />
        
        <Route path="/perfil" element={<MyAccountPage />} />
        <Route path="/comparar" element={<PriceComparisonPage />} />
        <Route path="/producto-detalle" element={<DetalleProducto />} />
        <Route path="/perfil-comercio" element={
          <VistaComercioLayout>
            <VistaComercioPage />
          </VistaComercioLayout>
        } />
        <Route path="/crear-comercio" element={<CreateCommercePage />} />

        <Route
          path="/producto-detalle"
          element={
            <VistaComercioLayout>
              <DetalleProducto />
            </VistaComercioLayout>
          }
        />

        <Route
          path="/perfil-comercio"
          element={
            <VistaComercioLayout>
              <VistaComercioPage />
            </VistaComercioLayout>
          }
        />

        <Route path="/pedidos" element={<ClientOrdersPage />} />
        <Route path="/pedidos/:orderId" element={<ClientOrderDetailsPage />} />
        <Route path="/homepage" element={<HomePage />} />

        <Route
          path="/busqueda"
          element={
            <VistaComercioLayout>
              <BusquedaPage />
            </VistaComercioLayout>
          }
        />

        <Route
          path="/comentarios"
          element={
            <CommentsLayout>
              <CommentsPage />
            </CommentsLayout>
          }
        />

        <Route path="/comercio-producto" element={<ComercioVerProducto />} />

        <Route
          path="/comercio"
          element={
            <MyCommerceLayout>
              <MyCommercePage />
            </MyCommerceLayout>
          }
        />

        <Route
          path="/comercio/productos/nuevo"
          element={
            <MyCommerceLayout>
              <CreateProductPage />
            </MyCommerceLayout>
          }
        />
          
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
