import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function SuperAdminProtectedRoute() {
  const { user, isAuthenticated, isInitializing } = useAuthStore();
  const location = useLocation();

  if (isInitializing) {
    return <div>Loading...</div>; // Or a proper spinner
  }

  if (!isAuthenticated || !user || !user.isSuperAdmin) {
    return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
