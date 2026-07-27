import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Warehouse,
  Users,
  Tag,
  BarChart3,
  Settings,
  UserCog,
  LogOut,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useTenantStore } from '../store/useTenantStore';
import { storesApi } from '../api/stores.api';

export function StoreAdminLayout() {
  const { user, logout } = useAuthStore();
  const { activeStore, setStores, setActiveStore } = useTenantStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const role = (user?.role || user?.roles?.[0] || '').toUpperCase();
    if (role === 'SUPER_ADMIN') {
      storesApi.getAll({ limit: 10 }).then((res) => {
        setStores(res.data as any);
        if (!activeStore && res.data.length > 0) {
          setActiveStore(res.data[0] as any);
        }
      }).catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const rawNavItems = [
    { label: 'Overview', path: '/store/dashboard', module: 'dashboard', icon: LayoutDashboard },
    { label: 'Products Catalog', path: '/store/products', module: 'products', icon: Package },
    { label: 'Categories Tree', path: '/store/categories', module: 'categories', icon: FolderTree },
    { label: 'Orders (OMS)', path: '/store/orders', module: 'orders', icon: ShoppingBag },
    { label: 'Inventory', path: '/store/inventory', module: 'inventory', icon: Warehouse },
    { label: 'Customers CRM', path: '/store/customers', module: 'customers', icon: Users },
    { label: 'Marketing & Coupons', path: '/store/marketing', module: 'marketing', icon: Tag },
    { label: 'Reports & Analytics', path: '/store/reports', module: 'reports', icon: BarChart3 },
    { label: 'Store Settings', path: '/store/settings', module: 'settings', icon: Settings },
    { label: 'Support', path: '/store/support', module: 'support', icon: MessageSquare },
    { label: 'Staff & Roles', path: '/store/staff', module: 'staff', icon: UserCog },
  ];

  // Dynamic Filtering based on role & user accessibleModules
  const defaultModules = ['dashboard', 'products', 'categories', 'orders', 'inventory', 'customers', 'marketing', 'reports', 'settings', 'support', 'staff'];
  const accessible = user?.accessibleModules || defaultModules;
  const navItems = rawNavItems.filter((item) => accessible.includes(item.module));

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* STORE ADMIN SIDEBAR */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col justify-between backdrop-blur-md select-none">
        <div>
          {/* BRANDING HEADER */}
          <div className="h-16 flex items-center px-5 border-b border-slate-800/80 justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white text-base">Commerce Pro</span>
                <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                  Tenant Portal
                </span>
              </div>
            </div>
          </div>

          {/* STORE CONTEXT DISPLAY */}
          <div className="p-3">
            <div className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-left">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-extrabold">
                  {activeStore ? activeStore.name[0].toUpperCase() : 'S'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {activeStore ? activeStore.name : 'Store Workspace'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate font-mono">
                    {activeStore ? activeStore.slug : 'electronics-hub'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/store/dashboard'
                  ? location.pathname === '/store' || location.pathname === '/store/dashboard'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* USER PROFILE & LOGOUT */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Store User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <span className="text-[9px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded uppercase">
              {user?.role || 'STORE_OWNER'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-rose-900/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
