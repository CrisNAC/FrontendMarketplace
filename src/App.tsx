import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import { Toaster } from "react-hot-toast";

import './index.css'

/**
 * Infraestructura de errores
 */
import { setNavigate } from './lib/apiClient';
import { NotFoundPage } from './pages/errors/NotFoundPage';
import { ForbiddenPage } from './pages/errors/ForbiddenPage';
import { ServerErrorPage } from './pages/errors/ServerErrorPage';
import { TestErrorsPage } from './pages/errors/TestErrorsPage'; // solo para desarrollo

const isDev = import.meta.env.DEV;

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
import { CommerceProfilePage } from './features/commerces/pages/CommerceProfilePage';
import { CommerceProductsPage } from './features/commerces/pages/CommerceProductsPage'
import { EditCommercePage } from './features/commerces/pages/EditCommercePage'
import AuthPage from './features/clients/pages/AuthPage';

import ProductDetailView from './features/commerces/pages/ProductDetailView';
import PriceComparisonPage from './features/clients/pages/PriceComparisonPage';
import DetalleProducto from './features/clients/pages/DetalleProducto';
import CreateProductPage from './features/commerces/pages/CreateProductPage';

import { EditClientProfile } from './features/clients/pages/EditClientProfile';
import AddressesPage from './features/clients/components/addresses/AddressesPage';

import EditProductPage from './features/commerces/pages/EditProductPage';
import Wishlist from "./features/clients/pages/Wishlist"

/**
 * Inyecta el navigate de React Router en el apiClient centralizado.
 * Permite que el interceptor de Axios redirija sin recargar la página.
 * No renderiza nada — es solo infraestructura.
 */
const NavigationSetter = () => {
  const navigate = useNavigate();
  useEffect(() => { setNavigate(navigate); }, [navigate]);
  return null;
};

const HomePageRoutes = () => (
  <div className="p-10 text-center">
    <h1 className="text-3xl font-bold">Bienvenido al Marketplace</h1>
    <p className="mt-4">Navega a <a href="/login" className="text-blue-500 underline">Login/Registro</a></p>
    <p className="mt-4">Navega a <a href="/comparar" className="text-blue-500 underline">Comparar Precios</a></p>
    <p className="mt-4">Navega a <a href="/perfil" className="text-blue-500 underline">Mi Perfil</a></p>
    <p className="mt-4">Navega a <a href="/producto-detalle/:id" className="text-blue-500 underline">Detalle de Producto</a></p>
    <p className="mt-4">Navega a <a href="/comercio" className="text-blue-500 underline">Mi Comercio (Dashboard)</a></p>
    <p className="mt-4">Navega a <a href="/perfil-comercio" className="text-blue-500 underline">Perfil comercio</a></p>
    <p className="mt-4">Navega a <a href="/comercio/productos/1" className="text-blue-500 underline">Ver Producto Comercio (ID 1)</a></p>
    <p className="mt-4">Navega a <a href="/comercio/productos/nuevo" className="text-blue-500 underline">Crear Producto Comercio</a></p>
    <p className="mt-4">Navega a <a href="/pedidos" className="text-blue-500 underline">Ver pedidos</a></p>
    <p className="mt-4">Navega a <a href="/homepage" className="text-blue-500 underline">Homepage</a></p>
    <p className="mt-4">Navega a <a href="/busqueda" className="text-blue-500 underline">Busqueda</a></p>
    <p className="mt-4">Navega a <a href="/comentarios" className="text-blue-500 underline">Comentarios</a></p>
    <p className="mt-4">Navega a <a href="/crear-comercio" className="text-blue-500 underline">Crear Comercio</a></p>
    <p className="mt-4">Navega a <a href="/mi-perfil" className="text-blue-500 underline">Editar Perfil</a></p>
  </div>
);

function App() {
  return (
    <Router>
      <NavigationSetter />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<HomePageRoutes />} />

        <Route path="/login" element={<AuthPage />} />

        <Route path="/perfil" element={<MyAccountPage />} />
        <Route path="/mi-perfil" element={<EditClientProfile />} />

        <Route path='/direcciones' element={<AddressesPage />} />

        <Route path="/comparar" element={<PriceComparisonPage />} />
        
        <Route
          path="/producto-detalle/:id"
          element={
            <VistaComercioLayout>
              <DetalleProducto />
            </VistaComercioLayout>
          }
        />
        <Route path="/perfil-comercio" element={
          <VistaComercioLayout>
            <VistaComercioPage />
          </VistaComercioLayout>
        } />
        <Route path="/crear-comercio" element={<CreateCommercePage />} />

        <Route path="/pedidos" element={<ClientOrdersPage />} />
        <Route path="/pedidos/:orderId" element={<ClientOrderDetailsPage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/wishlist" element={<VistaComercioLayout><Wishlist/></VistaComercioLayout>}/>
        <Route
          path="/busqueda"
          element={
            <VistaComercioLayout>
              <BusquedaPage />
            </VistaComercioLayout>
          }
        />

        <Route
          path="/comentarios/:id" //ruta de comentarios con id del producto
          element={
            <CommentsLayout>
              <CommentsPage />
            </CommentsLayout>
          }
        />

        {/* ── Área del comercio (con sidebar) ───────────────────────────── */}
        <Route path="/comercio" element={
          <MyCommerceLayout><MyCommercePage /></MyCommerceLayout>
        } />
        <Route path="/comercio/perfil" element={
          <MyCommerceLayout><CommerceProfilePage /></MyCommerceLayout>
        } />
        <Route path="/comercio/editar" element={
          <MyCommerceLayout><EditCommercePage /></MyCommerceLayout>
        } />

        <Route path="/comercio/productos" element={
          <MyCommerceLayout><CommerceProductsPage /></MyCommerceLayout>
        } />
        <Route path="/comercio/productos/nuevo" element={
          <MyCommerceLayout><CreateProductPage /></MyCommerceLayout>
        } />
        <Route path="/comercio/productos/:id" element={
          <MyCommerceLayout><ProductDetailView /></MyCommerceLayout>
        } />
        <Route path="/comercio/productos/:id/editar" element={
          <MyCommerceLayout><EditProductPage /></MyCommerceLayout>
        } />

        {/* ── Páginas de error ───────────────────────────────────────────── */}
        {isDev && <Route path="/test-errors" element={<TestErrorsPage />} />}
        <Route path="/error/403" element={<ForbiddenPage />} />
        <Route path="/error/500" element={<ServerErrorPage />} />
        <Route path="/error/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App