import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingBag,
  Warehouse,
  Users,
  Tag,
  Key,
  ShieldCheck,
  UserCog,
  LogOut,
  MessageSquare,
  Settings,
  ChevronDown,
  Globe,
  Bell,
  Search,
  Plus,
  Server,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useTenantStore, StoreItem } from '../store/useTenantStore';
import { storesApi } from '../api/stores.api';

export function StoreAdminLayout() {
  const { user, logout } = useAuthStore();
  const { activeStore, stores, setActiveStore, setStores, environment, setEnvironment } = useTenantStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Load available stores for store switcher
    storesApi.getAll({ limit: 100 }).then((res) => {
      setStores(res.data as any);
      if (!activeStore && res.data.length > 0) {
        setActiveStore(res.data[0] as any);
      }
    }).catch(() => {});
  }, []);

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products Catalog', path: '/admin/products', icon: Package },
    { label: 'Orders (OMS)', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Inventory', path: '/admin/inventory', icon: Warehouse },
    { label: 'Customers CRM', path: '/admin/customers', icon: Users },
    { label: 'Marketing & Coupons', path: '/admin/marketing', icon: Tag },
    { label: 'Support', path: '/admin/support', icon: MessageSquare },
    { label: 'Staff & Roles', path: '/admin/staff', icon: UserCog },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col justify-between backdrop-blur-md">
        <div>
          {/* BRANDING HEADER */}
          <div className="h-16 flex items-center px-5 border-b border-slate-800/80 justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white text-base">Webzio</span>
                <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Ecom OS
                </span>
              </div>
            </div>
          </div>

          {/* STORE CONTEXT */}
          <div className="p-3">
            <div className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-left">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-6 h-6 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-bold">
                  {activeStore ? activeStore.name[0].toUpperCase() : 'S'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {activeStore ? activeStore.name : 'Select Store'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {activeStore ? activeStore.slug : 'No active tenant'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* USER PROFILE & LOGOUT */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize truncate">
                  {user?.roles?.[0]?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR */}
        <header className="h-16 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between px-6 backdrop-blur-md">
          {/* SEARCH & QUICK ACTION */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search products, orders, stores (Cmd + K)..."
                className="pl-9 pr-4 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-72 transition"
              />
            </div>
          </div>

          {/* ENVIRONMENT & BADGES */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Cluster
            </div>

            <button
              onClick={() => navigate('/admin/products/new')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              New Product
            </button>
          </div>
        </header>

        {/* DYNAMIC PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
