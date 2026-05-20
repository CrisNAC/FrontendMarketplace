import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import { AdminLayout } from './layouts/AdminLayout';
import { MyCommerceLayout } from './layouts/MyCommerceLayout';
import { VistaComercioLayout } from './layouts/VistaComercioLayout';
import { CommentsLayout } from './layouts/CommentsLayout';
import { DeliveryLayout } from './layouts/DeliveryLayout';

/**
 * Pages
 */
import { MyCommercePage } from './features/commerces/pages/MyCommercePage';
import MyAccountPage from "./features/clients/pages/MyAccountPage";
import { VistaComercioPage } from './features/clients/pages/VistaComercioPage'
import { ClientOrdersPage } from './features/clients/pages/ClientOrdersPage'
import { ClientOrderDetailsPage } from './features/clients/pages/ClientOrderDetailsPage'
import { HomePage } from './features/clients/pages/HomePage'
import { BecomeDeliveryPage } from './features/clients/pages/BecomeDeliveryPage'
import { BusquedaPage } from './features/clients/pages/BusquedaPage'
import { CommentsPage } from './features/clients/pages/CommentsPage'
import { CreateCommercePage } from './features/clients/pages/CreateCommercePage'
import { CommerceProfilePage } from './features/commerces/pages/CommerceProfilePage';
import { CommerceProductsPage } from './features/commerces/pages/CommerceProductsPage'
import { CommerceOrdersPage } from './features/commerces/pages/CommerceOrdersPage'
import { CommerceDeliveryReviewsPage } from './features/commerces/pages/CommerceDeliveryReviewsPage'
import { CommerceDeliveriesPage } from './features/commerces/pages/CommerceDeliveriesPage'
import { AddStoreDeliveryPage } from './features/commerces/pages/AddStoreDeliveryPage'
import { EditCommercePage } from './features/commerces/pages/EditCommercePage'
import { StoreBusinessHoursPage } from './features/commerces/pages/StoreBusinessHoursPage'
import AuthPage from './features/clients/pages/AuthPage';

import ProductDetailView from './features/commerces/pages/ProductDetailView';
import PriceComparisonPage from './features/clients/pages/PriceComparisonPage';
import DetalleProducto from './features/clients/pages/DetalleProducto';
import CreateProductPage from './features/commerces/pages/CreateProductPage';

import { EditClientProfile } from './features/clients/pages/EditUserProfile';
import AddressesPage from './features/clients/components/addresses/AddressesPage';
import ChangePassword from './features/clients/pages/ChangePassword';

import EditProductPage from './features/commerces/pages/EditProductPage';
import { AdminUsersPage } from './features/admin/pages/AdminUsersPage';
import { AdminPendingStoresPage } from './features/admin/pages/AdminPendingStoresPage';
import { AdminCategoriesPage } from './features/admin/pages/AdminCategoriesPage';
import { AdminCategoryDetailPage } from './features/admin/pages/AdminCategoryDetailPage';
import { AdminDashboardPage } from './features/admin/pages/AdminDashboardPage';
import { AdminModulePlaceholderPage } from './features/admin/pages/AdminModulePlaceholderPage';
import { AdminProductsPage } from './features/admin/pages/AdminProductsPage';
import ReclamosPage from './features/admin/pages/ReclamosPage';
import Reclamos from './features/admin/pages/Reclamos';
import CommerceClaims from './features/commerces/pages/CommerceClaims';
import DeliveryProfilePage from './features/delivery/pages/DeliveryProfilePage';
import { DeliveryEditProfilePage } from './features/delivery/pages/DeliveryEditProfilePage';
import DeliveryOrdersPage from './features/delivery/pages/DeliveryOrdersPage';

import Wishlist from "./features/clients/pages/Wishlist";

import { CartPage } from "./features/clients/pages/CartPage";
import OrdenesComprasPage from "./features/clients/pages/OrdenesComprasPage";
import ConfirmarPedido from './features/clients/pages/ConfirmarPedido';
import PedidoConfirmadoPage from './features/clients/pages/PedidoConfirmadoPage';
import DeliveryOrderScreen from "./features/delivery/pages/DeliveryOrderScreen";
import DeliveryHistoryPage from './features/delivery/pages/DeliveryHistoryPage';
import NotificationsPage from './features/clients/pages/NotificationsPage';
import TestPage from './features/clients/pages/TestPage';

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

function App() {
  return (
    <Router>
      <NavigationSetter />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/test" element={<TestPage />} />

        <Route path="/login" element={<AuthPage />} />

        <Route path="/perfil" element={<MyAccountPage />} />
        <Route path="/mi-perfil" element={<EditClientProfile />} />
        <Route path="/cambiar-contrasena" element={<ChangePassword />} />

        <Route path="/notificaciones" element={
          <VistaComercioLayout>
            <NotificationsPage />
          </VistaComercioLayout>
        } />

        <Route path='/direcciones' element={<AddressesPage />} />

        <Route path="/comparar" element={<PriceComparisonPage />} />

        <Route path="/carrito/:cartId" element={<CartPage />} />
        <Route path="/pedido-confirmado" element={<PedidoConfirmadoPage />} />

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
        <Route path="/" element={<HomePage />} />
        <Route path="/quiero-ser-delivery" element={<BecomeDeliveryPage />} />
        <Route path="/wishlist" element={<VistaComercioLayout><Wishlist /></VistaComercioLayout>} />
        <Route path="/carrito" element={
          <VistaComercioLayout>
            <OrdenesComprasPage />
          </VistaComercioLayout>
        }
        />
        <Route
          path="/confirmar-pedido/:cartId"
          element={
            <VistaComercioLayout>
              <ConfirmarPedido />
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
          path="/ofertas"
          element={
            <VistaComercioLayout>
              <BusquedaPage query="Ofertas" />
            </VistaComercioLayout>
          }
        />

        <Route
          path="/comentarios/:id"
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
        <Route path="/comercio/horarios" element={
          <MyCommerceLayout><StoreBusinessHoursPage /></MyCommerceLayout>
        } />
        <Route path="/comercio/pedidos" element={
          <MyCommerceLayout><CommerceOrdersPage /></MyCommerceLayout>
        } />
        <Route path="/comercio/deliveries/resenas" element={
          <MyCommerceLayout><CommerceDeliveryReviewsPage /></MyCommerceLayout>
        } />
        <Route path="/comercio/delivery" element={
          <MyCommerceLayout><CommerceDeliveriesPage /></MyCommerceLayout>
        } />
        <Route path="/comercio/delivery/agregar" element={
          <MyCommerceLayout><AddStoreDeliveryPage /></MyCommerceLayout>
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
        <Route path="/comercio/claims" element={
          <MyCommerceLayout><CommerceClaims /></MyCommerceLayout>
        } />

        {/* ── Área de delivery (con sidebar) ───────────────────────────── */}
        <Route path="/delivery" element={<Navigate to="/delivery/perfil" replace />} />
        <Route path="/delivery/perfil" element={
          <DeliveryLayout><DeliveryProfilePage /></DeliveryLayout>
        } />
        <Route path="/delivery/perfil/editar" element={
          <DeliveryLayout><DeliveryEditProfilePage /></DeliveryLayout>
        } />
        <Route path="/delivery/order" element={
          <DeliveryLayout><DeliveryOrderScreen /></DeliveryLayout>
        } />
        <Route path="/delivery/pedidos" element={
          <DeliveryLayout><DeliveryOrdersPage /></DeliveryLayout>
        } />
        <Route path="/delivery/history" element={
          <DeliveryLayout><DeliveryHistoryPage /></DeliveryLayout>
        } />

        {/* ── Área de administración (con sidebar) ──────────────────────── */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={
          <AdminLayout><AdminDashboardPage /></AdminLayout>
        } />
        <Route path="/admin/productos" element={
          <AdminLayout><AdminProductsPage /></AdminLayout>
        } />
        <Route path="/admin/resenas" element={
          <AdminLayout>
            <AdminModulePlaceholderPage
              title="Moderación de Reseñas"
              description="Gestioná reseñas reportadas por usuarios y mantené la calidad del contenido."
            />
          </AdminLayout>
        } />
        <Route path="/admin/comercios" element={
          <AdminLayout>
            <AdminModulePlaceholderPage
              title="Aprobación de Comercios"
              description="Revisá solicitudes pendientes y aprobá comercios para operar en la plataforma."
            />
          </AdminLayout>
        } />
        <Route path="/admin/usuarios" element={
          <AdminLayout><AdminUsersPage /></AdminLayout>
        } />
        <Route path="/admin/comercios-pendientes" element={
          <AdminLayout><AdminPendingStoresPage /></AdminLayout>
        } />
        <Route path="/admin/categorias" element={
          <AdminLayout><AdminCategoriesPage /></AdminLayout>
        } />
        <Route path="/admin/categorias/:id" element={
          <AdminLayout><AdminCategoryDetailPage /></AdminLayout>
        } />
        <Route path="/admin/claims" element={
          <AdminLayout><Reclamos /></AdminLayout>
        } />
        <Route path="/admin/reviews" element={
          <AdminLayout><ReclamosPage /></AdminLayout>
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