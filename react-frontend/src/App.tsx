import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { StoreAdminLayout } from './layouts/StoreAdminLayout';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';
import { ProtectedRoute } from './hooks/useProtectedRoute';
import SuperAdminProtectedRoute from './hooks/useSuperAdminProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage';
import StoresPage from './pages/StoresPage';
import StoreDetailsPage from './pages/StoreDetailsPage';
import AdminsManager from './pages/AdminsManager';
import PlansListPage from './pages/plans/PlansListPage';
import PlanCreateEditPage from './pages/plans/PlanCreateEditPage';
import SystemHealth from './pages/SystemHealth';
import PlatformSettings from './pages/PlatformSettings';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminProductCreatePage from './pages/AdminProductCreatePage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminOrderDetailsPage from './pages/AdminOrderDetailsPage';
import InventoryPage from './pages/InventoryPage';
import CustomersPage from './pages/CustomersPage';
import MarketingPage from './pages/MarketingPage';
import DeveloperPortalPage from './pages/DeveloperPortalPage';
import AuditLogsPage from './pages/AuditLogsPage';
import StaffPage from './pages/StaffPage';
import NotFoundPage from './pages/NotFoundPage';
import SupportPage from './pages/SupportPage';
import SuperAdminSupportPage from './pages/SuperAdminSupportPage';
import SuperAdminAdminsPage from './pages/SuperAdminAdminsPage';

export default function App() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />

      {/* SUPER ADMIN PORTAL (Platform Global Operations) */}
      <Route
        path="/super-admin"
        element={
          <SuperAdminProtectedRoute />
        }
      >
        <Route element={<SuperAdminLayout />}>
          <Route index element={<SuperAdminDashboardPage />} />
          <Route path="dashboard" element={<SuperAdminDashboardPage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="stores/:id" element={<StoreDetailsPage />} />
          <Route path="admins" element={<SuperAdminAdminsPage />} />
          <Route path="plans" element={<PlansListPage />} />
          <Route path="plans/create" element={<PlanCreateEditPage />} />
          <Route path="plans/:id/edit" element={<PlanCreateEditPage />} />
          <Route path="support" element={<SuperAdminSupportPage />} />
          <Route path="analytics" element={<div>Platform Analytics (WIP)</div>} />
          <Route path="system" element={<SystemHealth />} />
          <Route path="settings" element={<PlatformSettings />} />
          <Route path="developer" element={<DeveloperPortalPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Route>

      {/* STORE ADMIN PORTAL (Tenant Operations) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <StoreAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductCreatePage />} />
        <Route path="products/:id/edit" element={<AdminProductCreatePage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="staff" element={<StaffPage />} />
      </Route>

      {/* DEFAULT ROUTE REDIRECTS TO LOGIN OR ROLE-BASED DASHBOARD IN PROTECTED ROUTE */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
