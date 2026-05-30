import './App.css'
import './index.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastProvider } from './components/toast/ToastProvider'
import { ToastContainer } from './components/toast/ToastContainer'

/**
 * Infraestructura de errores
 */
import { setNavigate } from './lib/apiClient';
import { RequireAuth } from './components/auth/RequireAuth';
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
import ForgotPasswordPage from './features/clients/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/clients/pages/ResetPasswordPage';

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
import { AdminBannersPage } from './features/admin/pages/AdminBannersPage';
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
    <ToastProvider>
      <Router>
        <NavigationSetter />
        <ToastContainer />
        <Routes>
          <Route path="/test" element={<TestPage />} />

          <Route path="/login" element={<AuthPage />} />
          <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
          <Route path="/restablecer-contrasena/:token" element={<ResetPasswordPage />} />

          <Route path="/perfil" element={<RequireAuth><MyAccountPage /></RequireAuth>} />
          <Route path="/mi-perfil" element={<RequireAuth><EditClientProfile /></RequireAuth>} />
          <Route path="/cambiar-contrasena" element={<RequireAuth><ChangePassword /></RequireAuth>} />

          <Route path="/notificaciones" element={
            <RequireAuth>
              <VistaComercioLayout>
                <NotificationsPage />
              </VistaComercioLayout>
            </RequireAuth>
          } />

          <Route path='/direcciones' element={<RequireAuth><AddressesPage /></RequireAuth>} />

          <Route path="/comparar" element={<PriceComparisonPage />} />

          <Route path="/carrito/:cartId" element={<RequireAuth><CartPage /></RequireAuth>} />
          <Route path="/pedido-confirmado" element={<RequireAuth><PedidoConfirmadoPage /></RequireAuth>} />

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
          <Route path="/crear-comercio" element={<RequireAuth><CreateCommercePage /></RequireAuth>} />

          <Route path="/pedidos" element={<RequireAuth><ClientOrdersPage /></RequireAuth>} />
          <Route path="/pedidos/:orderId" element={<RequireAuth><ClientOrderDetailsPage /></RequireAuth>} />
          <Route path="/" element={<HomePage />} />
          <Route path="/quiero-ser-delivery" element={<RequireAuth><BecomeDeliveryPage /></RequireAuth>} />
          <Route path="/wishlist" element={
            <RequireAuth>
              <VistaComercioLayout><Wishlist /></VistaComercioLayout>
            </RequireAuth>
          } />
          <Route path="/carrito" element={
            <RequireAuth>
              <VistaComercioLayout>
                <OrdenesComprasPage />
              </VistaComercioLayout>
            </RequireAuth>
          }
          />
          <Route
            path="/confirmar-pedido/:cartId"
            element={
              <RequireAuth>
                <VistaComercioLayout>
                  <ConfirmarPedido />
                </VistaComercioLayout>
              </RequireAuth>
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
            <RequireAuth>
              <MyCommerceLayout><MyCommercePage /></MyCommerceLayout>
            </RequireAuth>
          } />
          <Route path="/comercio/perfil" element={
            <RequireAuth>
              <MyCommerceLayout><CommerceProfilePage /></MyCommerceLayout>
            </RequireAuth>
          } />
          <Route path="/comercio/editar" element={
            <RequireAuth>
              <MyCommerceLayout><EditCommercePage /></MyCommerceLayout>
            </RequireAuth>
          } />
          <Route path="/comercio/horarios" element={
            <MyCommerceLayout><StoreBusinessHoursPage /></MyCommerceLayout>
          } />
          <Route path="/comercio/pedidos" element={
            <RequireAuth>
              <MyCommerceLayout><CommerceOrdersPage /></MyCommerceLayout>
            </RequireAuth>
          } />
          <Route path="/comercio/deliveries/resenas" element={
            <RequireAuth>
              <MyCommerceLayout><CommerceDeliveryReviewsPage /></MyCommerceLayout>
            </RequireAuth>
          } />
          <Route path="/comercio/delivery" element={
            <RequireAuth>
              <MyCommerceLayout><CommerceDeliveriesPage /></MyCommerceLayout>
            </RequireAuth>
          } />
          <Route path="/comercio/delivery/agregar" element={
            <RequireAuth>
              <MyCommerceLayout><AddStoreDeliveryPage /></MyCommerceLayout>
            </RequireAuth>
          } />
          <Route path="/comercio/productos" element={
            <RequireAuth>
              <MyCommerceLayout><CommerceProductsPage /></MyCommerceLayout>
            </RequireAuth>
          } />
          <Route path="/comercio/productos/nuevo" element={
            <RequireAuth>
              <MyCommerceLayout><CreateProductPage /></MyCommerceLayout>
            </RequireAuth>
          } />
          <Route path="/comercio/productos/:id" element={
            <RequireAuth>
              <MyCommerceLayout><ProductDetailView /></MyCommerceLayout>
            </RequireAuth>
          } />
          <Route path="/comercio/productos/:id/editar" element={
            <RequireAuth>
              <MyCommerceLayout><EditProductPage /></MyCommerceLayout>
            </RequireAuth>
          } />
          <Route path="/comercio/claims" element={
            <RequireAuth>
              <MyCommerceLayout><CommerceClaims /></MyCommerceLayout>
            </RequireAuth>
          } />

          {/* ── Área de delivery (con sidebar) ───────────────────────────── */}
          <Route path="/delivery" element={
            <RequireAuth>
              <Navigate to="/delivery/perfil" replace />
            </RequireAuth>
          } />
          <Route path="/delivery/perfil" element={
            <RequireAuth>
              <DeliveryLayout><DeliveryProfilePage /></DeliveryLayout>
            </RequireAuth>
          } />
          <Route path="/delivery/perfil/editar" element={
            <RequireAuth>
              <DeliveryLayout><DeliveryEditProfilePage /></DeliveryLayout>
            </RequireAuth>
          } />
          <Route path="/delivery/order" element={
            <RequireAuth>
              <DeliveryLayout><DeliveryOrderScreen /></DeliveryLayout>
            </RequireAuth>
          } />
          <Route path="/delivery/pedidos" element={
            <RequireAuth>
              <DeliveryLayout><DeliveryOrdersPage /></DeliveryLayout>
            </RequireAuth>
          } />
          <Route path="/delivery/history" element={
            <RequireAuth>
              <DeliveryLayout><DeliveryHistoryPage /></DeliveryLayout>
            </RequireAuth>
          } />

          {/* ── Área de administración (con sidebar) ──────────────────────── */}
          <Route path="/admin" element={
            <RequireAuth>
              <Navigate to="/admin/dashboard" replace />
            </RequireAuth>
          } />
          <Route path="/admin/dashboard" element={
            <RequireAuth>
              <AdminLayout><AdminDashboardPage /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/productos" element={
            <RequireAuth>
              <AdminLayout><AdminProductsPage /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/banners" element={
            <RequireAuth>
              <AdminLayout><AdminBannersPage /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/resenas" element={
            <RequireAuth>
              <AdminLayout>
                <AdminModulePlaceholderPage
                  title="Moderación de Reseñas"
                  description="Gestioná reseñas reportadas por usuarios y mantené la calidad del contenido."
                />
              </AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/comercios" element={
            <RequireAuth>
              <AdminLayout>
                <AdminModulePlaceholderPage
                  title="Aprobación de Comercios"
                  description="Revisá solicitudes pendientes y aprobá comercios para operar en la plataforma."
                />
              </AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/usuarios" element={
            <RequireAuth>
              <AdminLayout><AdminUsersPage /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/comercios-pendientes" element={
            <RequireAuth>
              <AdminLayout><AdminPendingStoresPage /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/categorias" element={
            <RequireAuth>
              <AdminLayout><AdminCategoriesPage /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/categorias/:id" element={
            <RequireAuth>
              <AdminLayout><AdminCategoryDetailPage /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/claims" element={
            <RequireAuth>
              <AdminLayout><Reclamos /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/reviews" element={
            <RequireAuth>
              <AdminLayout><ReclamosPage /></AdminLayout>
            </RequireAuth>
          } />

          {/* ── Páginas de error ───────────────────────────────────────────── */}
          {isDev && <Route path="/test-errors" element={<TestErrorsPage />} />}
          <Route path="/error/403" element={<ForbiddenPage />} />
          <Route path="/error/500" element={<ServerErrorPage />} />
          <Route path="/error/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App