import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSuperAdminAuthStore } from '../store/useSuperAdminAuthStore';

export default function SuperAdminProtectedRoute() {
  const { user, accessToken } = useSuperAdminAuthStore();
  const location = useLocation();

  if (!accessToken || !user || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
