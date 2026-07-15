import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts
import MainLayout from '../layouts/MainLayout'
import UnauthorizedPage from '../../features/common/pages/UnauthorizedPage'
import AuthLayout from '../layouts/AuthLayout'
import ErrorBoundary from '../ErrorBoundary'

// Páginas públicas
import LoginPage from '../../features/auth/pages/LoginPage'
import RegisterPage from '../../features/auth/pages/RegisterPage'
import NotFoundPage from '../../features/common/pages/NotFoundPage'

// Páginas principales (stubs para desarrollo)
import DashboardPage from '../../features/dashboard/pages/DashboardPage'
import UsersPage from '../../features/users/pages/UsersPage'
import FieldsPage from '../../features/fields/pages/FieldsPage'

import ProtectedRoute from './ProtectedRoute'

// Stub components
const ReservationsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Reservaciones</h1></div>
const NotificationsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Notificaciones</h1></div>
const ReportsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Reportes</h1></div>
const RestaurantPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Restaurantes</h1></div>
const InventoryPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Inventario</h1></div>
const TablesPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Mesas</h1></div>
const RestaurantMiniMenuPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Mini Menu</h1></div>
const RestaurantTablesPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Mesas Restaurante</h1></div>
const AllTablesPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Todas las Mesas</h1></div>
const InformationPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Información</h1></div>
const RecipesPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Recetas</h1></div>
const OrdersPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Órdenes</h1></div>
const DetallePedidosPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Detalle de Pedidos</h1></div>
const ReviewPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Reseñas</h1></div>
const CouponPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Cupones</h1></div>
const EventsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Eventos</h1></div>
const ProfilePage = () => <div className="p-8"><h1 className="text-2xl font-bold">Perfil</h1></div>
const MapaDeSedePage = () => <div className="p-8"><h1 className="text-2xl font-bold">Mapa de Sedes</h1></div>
const MenuPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Menús</h1></div>
const CustomerLobbyPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Customer Lobby</h1></div>

/**
 * Configuración de rutas
 */
const router = createBrowserRouter([
  // Ruta raíz redirige al login
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  // Rutas públicas
  {
    path: '/login',
    element: (
      <AuthLayout>
        <LoginPage />
      </AuthLayout>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthLayout>
        <RegisterPage />
      </AuthLayout>
    ),
  },
  // Rutas principales protegidas (ADMIN)
  {
    path: '/loby',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'fields',
        element: <FieldsPage />,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
    errorElement: <ErrorBoundary />,
  },
  // 404 fallback
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <ErrorBoundary />,
  },
])

export default router
