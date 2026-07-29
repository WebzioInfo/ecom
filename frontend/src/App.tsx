import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { StoreAdminLayout } from './layouts/StoreAdminLayout';
import { SuperAdminLayout } from './layouts/SuperAdminLayout';
import { ProtectedRoute } from './hooks/useProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy loaded pages for performance (Code Splitting)
const Login = lazy(() => import('./pages/Login'));

// Super Admin Pages
const SuperAdminDashboardPage = lazy(() => import('./pages/SuperAdminDashboardPage'));
const StoresPage = lazy(() => import('./pages/StoresPage'));
const StoreDetailsPage = lazy(() => import('./pages/StoreDetailsPage'));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const PlansListPage = lazy(() => import('./pages/plans/PlansListPage'));
const PlanCreateEditPage = lazy(() => import('./pages/plans/PlanCreateEditPage'));
const SystemHealth = lazy(() => import('./pages/SystemHealth'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage'));
const SuperAdminReportsPage = lazy(() => import('./pages/SuperAdminReportsPage'));
const DeveloperPortalPage = lazy(() => import('./pages/DeveloperPortalPage'));
const AdminsManager = lazy(() => import('./pages/AdminsManager'));
const PlatformSettings = lazy(() => import('./pages/PlatformSettings'));

// Store Admin & Staff Pages
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/AdminCategoriesPage'));
const AdminProductCreatePage = lazy(() => import('./pages/AdminProductCreatePage'));
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'));
const AdminOrderDetailsPage = lazy(() => import('./pages/AdminOrderDetailsPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const MarketingPage = lazy(() => import('./pages/MarketingPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const StaffPage = lazy(() => import('./pages/StaffPage'));

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function SmartRoleRedirect() {
  const { user, isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-400">
        <div className="w-8 h-8 border-2 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || user.roles?.[0] || '').toUpperCase();
  if (role === 'SUPER_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/store/dashboard" replace />;
}

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
    <ErrorBoundary>
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50 text-blue-600 font-sans">Loading Enterprise SaaS Platform...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* ─── SUPER ADMIN PLATFORM PORTAL ────────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="stores" element={<StoresPage />} />
            <Route path="stores/:id" element={<StoreDetailsPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="plans" element={<PlansListPage />} />
            <Route path="plans/new" element={<PlanCreateEditPage />} />
            <Route path="plans/:id/edit" element={<PlanCreateEditPage />} />
            <Route path="reports" element={<SuperAdminReportsPage />} />
            <Route path="operations" element={<SystemHealth />} />
            <Route path="monitoring" element={<SystemHealth />} />
            <Route path="automation" element={<SystemHealth />} />
            <Route path="system" element={<SystemHealth />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="developer" element={<DeveloperPortalPage />} />
            <Route path="users" element={<AdminsManager />} />
            <Route path="roles" element={<AdminsManager />} />
            <Route path="security" element={<AdminsManager />} />
            <Route path="settings" element={<PlatformSettings />} />
          </Route>

          {/* ─── STORE TENANT PORTAL ────────────────────────────────────────────── */}
          <Route
            path="/store"
            element={
              <ProtectedRoute allowedRoles={['STORE_OWNER', 'STORE_MANAGER', 'STORE_EMPLOYEE', 'ADMIN']}>
                <StoreAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductCreatePage />} />
            <Route path="products/:id/edit" element={<AdminProductCreatePage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="marketing" element={<MarketingPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<PlatformSettings />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="staff" element={<StaffPage />} />
          </Route>

          <Route path="/super-admin/login" element={<Navigate to="/login" replace />} />

          {/* DEFAULT REDIRECT */}
          <Route path="/" element={<SmartRoleRedirect />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
