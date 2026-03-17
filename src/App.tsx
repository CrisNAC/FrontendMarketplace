import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from "react-hot-toast";

import './index.css'

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
import DetalleProducto from './features/commerces/pages/DetalleProducto';
import CreateProductPage from './features/commerces/pages/CreateProductPage';

import { EditClientProfile } from './features/clients/pages/EditClientProfile';

import EditProductPage from './features/commerces/pages/EditProductPage';
import Wishlist from "./features/clients/pages/Wishlist"

const HomePageRoutes = () => (
  <div className="p-10 text-center">

    <h1 className="text-3xl font-bold">
      Bienvenido al Marketplace
    </h1>

    <p className="mt-4">
      <a href="/comercio/productos/1"
      className="text-blue-500 underline">

        Probar Product Detail (ID 1)

      </a>
    </p>

  </div>
);

function App() {

  return (

    <Router>

      <Toaster position="top-right"/>

      <Routes>

        <Route 
        path="/" 
        element={<HomePageRoutes />} 
        />

        <Route 
        path="/login" 
        element={<AuthPage />} 
        />

        <Route 
        path="/perfil" 
        element={<MyAccountPage />} 
        />

        <Route 
        path="/mi-perfil" 
        element={<EditClientProfile />} 
        />

        <Route 
        path="/comparar" 
        element={<PriceComparisonPage />} 
        />

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

        <Route 
        path="/crear-comercio" 
        element={<CreateCommercePage />} 
        />

        <Route 
        path="/pedidos" 
        element={<ClientOrdersPage />} 
        />

        <Route 
        path="/pedidos/:orderId" 
        element={<ClientOrderDetailsPage />} 
        />

        <Route 
        path="/homepage" 
        element={<HomePage />} 
        />

        <Route 
        path="/wishlist" 
        element={
          <VistaComercioLayout>
            <Wishlist/>
          </VistaComercioLayout>
        }
        />

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

        {/* AREA COMERCIO */}

        <Route 
        path="/comercio" 
        element={
          <MyCommerceLayout>
            <MyCommercePage />
          </MyCommerceLayout>
        } 
        />

        <Route 
        path="/comercio/perfil" 
        element={
          <MyCommerceLayout>
            <CommerceProfilePage />
          </MyCommerceLayout>
        } 
        />

        <Route 
        path="/comercio/editar" 
        element={
          <MyCommerceLayout>
            <EditCommercePage />
          </MyCommerceLayout>
        } 
        />

        <Route 
        path="/comercio/productos" 
        element={
          <MyCommerceLayout>
            <CommerceProductsPage />
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

        {/* PRODUCT DETAIL */}

        <Route 
        path="/comercio/productos/:id" 
        element={
          <MyCommerceLayout>
            <ProductDetailView />
          </MyCommerceLayout>
        } 
        />

        {/* RUTA TEST OPCIONAL */}

        <Route 
        path="/comercio/productos/test" 
        element={
          <MyCommerceLayout>
            <ProductDetailView />
          </MyCommerceLayout>
        } 
        />

        <Route 
        path="/comercio/productos/:id/editar" 
        element={
          <MyCommerceLayout>
            <EditProductPage />
          </MyCommerceLayout>
        } 
        />

        <Route 
        path="*" 
        element={<Navigate to="/"/>} 
        />

      </Routes>

    </Router>

  )

}

export default App