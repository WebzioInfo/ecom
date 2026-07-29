import { useAuthStore } from '../store/useAuthStore';

export function usePermissions() {
  const { user } = useAuthStore();

  const hasPermission = (requiredPermission: string): boolean => {
    if (!user) return false;
    
    // Super Admin has all access
    if (user.role === 'SUPER_ADMIN' || user.isSuperAdmin) return true;

    const userPermissions = (user.permissions || []).map((p: string) => p.replace(/:/g, '.'));
    const normalizedReq = requiredPermission.replace(/:/g, '.');
    
    // Wildcard bypass
    if (userPermissions.includes('*')) return true;

    // Direct match
    if (userPermissions.includes(normalizedReq)) return true;

    // Prefix match (e.g. products.* covers products.create)
    const [moduleName] = normalizedReq.split('.');
    if (userPermissions.includes(`${moduleName}.*`)) {
      return true;
    }

    return false;
  };

  const can = (action: string, subject: string): boolean => {
    return hasPermission(`${subject}.${action}`);
  };

  return { hasPermission, can, permissions: user?.permissions || [] };
}
