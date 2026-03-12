import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './index.css'
import { Toaster } from "react-hot-toast";

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
import AuthPage from './features/clients/pages/AuthPage';

import ComercioVerProducto from './features/commerces/pages/ComercioVerProducto';
import PriceComparisonPage from './features/clients/pages/PriceComparisonPage';
import DetalleProducto from './features/commerces/pages/DetalleProducto';
import CreateProductPage from './features/commerces/pages/CreateProductPage';

/**
 * Página de prueba
 */
import SeleccionarId from './features/commerces/pages/SeleccionarId';

const HomePageRoutes = () => (

  <div className="p-10 text-center">

    <h1 className="text-3xl font-bold">
      Bienvenido al Marketplace
    </h1>

    <p className="mt-4">
      Navega a <Link to="/login" className="text-blue-500 underline">Login/Registro</Link>
    </p>

    <p className="mt-4">
      Navega a <Link to="/comparar" className="text-blue-500 underline">Comparar Precios</Link>
    </p>

    <p className="mt-4">
      Navega a <Link to="/perfil" className="text-blue-500 underline">Mi Perfil</Link>
    </p>

    <p className="mt-4">
      Navega a <Link to="/producto-detalle" className="text-blue-500 underline">Detalle de Producto</Link>
    </p>

    <p className="mt-4">
      Navega a <Link to="/comercio" className="text-blue-500 underline">Mi Comercio</Link>
    </p>

    <p className="mt-4">
      Navega a <Link to="/perfil-comercio" className="text-blue-500 underline">Perfil comercio</Link>
    </p>

    <p className="mt-4">
      Navega a <Link to="/test-producto" className="text-blue-500 underline">Ver Producto Comercio</Link>
    </p>

    <p className="mt-4">
      Navega a <Link to="/comercio/productos/nuevo" className="text-blue-500 underline">Crear Producto Comercio</Link>
    </p>

    <p className="mt-4">
      Navega a <Link to="/pedidos" className="text-blue-500 underline">Ver pedidos</Link>
    </p>

    <p className="mt-4">
      Navega a <Link to="/homepage" className="text-blue-500 underline">Homepage</Link>
    </p>

    <p className="mt-4">
      Navega a <Link to="/busqueda" className="text-blue-500 underline">Busqueda</Link>
    </p>

    <p className="mt-4">
      Navega a <Link to="/comentarios" className="text-blue-500 underline">Comentarios</Link>
    </p>

    <p className="mt-4">
      Navega a <Link to="/crear-comercio" className="text-blue-500 underline">Crear Comercio</Link>
    </p>

  </div>

);

function App() {

  return (

    <Router>

      <Toaster position="top-right"/>

      <Routes>

        <Route path="/" element={<HomePageRoutes />} />

        <Route path="/login" element={<AuthPage />} />

        <Route path="/perfil" element={<MyAccountPage />} />

        <Route path="/comparar" element={<PriceComparisonPage />} />

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

        <Route path="/crear-comercio" element={<CreateCommercePage />} />

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

        {/* Producto por ID */}
        <Route
          path="/comercio-producto/:id"
          element={<ComercioVerProducto />}
        />

        {/* Página test */}
        <Route
          path="/test-producto"
          element={<SeleccionarId />}
        />

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

export default App;