import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isInitializing, user } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-indigo-400">
        <div className="w-8 h-8 border-2 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = (user?.roles || []).map((r) => r.toLowerCase());
    
    // Check if user has ANY of the required roles
    const hasRole = requiredRoles.some((role) => userRoles.includes(role.toLowerCase()));
    
    if (!hasRole) {
      // Redirect based on what they are
      if (userRoles.includes('super_admin') || userRoles.includes('admin')) {
        return <Navigate to="/super-admin" replace />;
      }
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
};
