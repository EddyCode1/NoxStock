import { createBrowserRouter, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import UnauthorizedPage from '../../features/common/pages/UnauthorizedPage';
import AuthLayout from '../layouts/AuthLayout';
import ErrorBoundary from '../ErrorBoundary';
import ProtectedRoute from './ProtectedRoute';

import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
import NotFoundPage from '../../features/common/pages/NotFoundPage';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import { ProductsPage, ProductFormPage, MovementsPage, SuppliersPage, PurchaseOrdersPage, CustomersPage, SalesPage } from '../../features/inventory';
import { WarehousesPage, WarehouseMapPage } from '../../features/warehouses';
import { ReportsPage, AlertsPage, InventoryInsightsPage } from '../../features/reports';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
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
  {
    path: '/loby',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'inventory', element: <ProductsPage /> },
      { path: 'inventory/new', element: <ProductFormPage /> },
      { path: 'inventory/:id/edit', element: <ProductFormPage /> },
      { path: 'inventory/movements', element: <MovementsPage /> },
      { path: 'inventory/suppliers', element: <SuppliersPage /> },
      { path: 'inventory/purchase-orders', element: <PurchaseOrdersPage /> },
      { path: 'inventory/customers', element: <CustomersPage /> },
      { path: 'inventory/sales', element: <SalesPage /> },
      { path: 'inventory/warehouses', element: <WarehousesPage /> },
      { path: 'inventory/warehouses/map', element: <WarehouseMapPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'reports/insights', element: <InventoryInsightsPage /> },
      { path: 'alerts', element: <AlertsPage /> },
    ],
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <ErrorBoundary />,
  },
]);

export default router;
