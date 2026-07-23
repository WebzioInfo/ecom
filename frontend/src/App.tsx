import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { StoreAdminLayout } from './layouts/StoreAdminLayout';
import { ProtectedRoute } from './hooks/useProtectedRoute';
import { useAuthStore } from './store/useAuthStore';

// Auth Pages
import Login from './pages/Login';

// Main Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminProductCreatePage from './pages/AdminProductCreatePage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminOrderDetailsPage from './pages/AdminOrderDetailsPage';
import InventoryPage from './pages/InventoryPage';
import CustomersPage from './pages/CustomersPage';
import MarketingPage from './pages/MarketingPage';
import SupportPage from './pages/SupportPage';
import StaffPage from './pages/StaffPage';
import NotFoundPage from './pages/NotFoundPage';

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
