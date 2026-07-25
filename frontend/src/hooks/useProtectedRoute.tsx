import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isInitializing, user } = useAuthStore();

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

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || user.roles?.[0] || '').toUpperCase();
    const userRolesUpper = (user.roles || []).map((r) => r.toUpperCase());
    userRolesUpper.push(userRole);

    const hasRole = allowedRoles.some((role) => userRolesUpper.includes(role.toUpperCase()));

    if (!hasRole) {
      if (userRole === 'SUPER_ADMIN' || userRolesUpper.includes('SUPER_ADMIN')) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      return <Navigate to="/store/dashboard" replace />;
    }
  }

  return children;
};
