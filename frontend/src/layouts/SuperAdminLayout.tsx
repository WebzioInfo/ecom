import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  ShieldCheck,
  LogOut,
  Bell,
  Search,
  Server,
  Globe,
  Activity,
  CreditCard,
  Settings,
  MessageSquare,
  Key,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export function SuperAdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Platform Overview', path: '/super-admin', icon: LayoutDashboard },
    { label: 'Stores Manager', path: '/super-admin/stores', icon: Store },
    { label: 'Admins & Staff', path: '/super-admin/admins', icon: Users },
    { label: 'Subscription Plans', path: '/super-admin/plans', icon: CreditCard },
    { label: 'Support Inbox', path: '/super-admin/support', icon: MessageSquare },
    { label: 'Analytics', path: '/super-admin/analytics', icon: Activity },
    { label: 'System Health', path: '/super-admin/system', icon: Server },
    { label: 'Platform Settings', path: '/super-admin/settings', icon: Settings },
    { label: 'API & Developer', path: '/super-admin/developer', icon: Key },
    { label: 'Audit Logs', path: '/super-admin/audit-logs', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col justify-between backdrop-blur-md">
        <div>
          {/* BRANDING HEADER */}
          <div className="h-16 flex items-center px-5 border-b border-slate-800/80 justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white text-base">Webzio</span>
                <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Super Admin
                </span>
              </div>
            </div>
          </div>

          {/* GLOBAL CONTEXT */}
          <div className="p-3">
            <div className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-left">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-6 h-6 rounded bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    Platform Control
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    Global Network
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
                item.path === '/super-admin'
                  ? location.pathname === '/super-admin'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] text-emerald-400 capitalize truncate font-semibold">
                  SUPER ADMIN
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
                placeholder="Search global platform data..."
                className="pl-9 pr-4 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-72 transition"
              />
            </div>
          </div>

          {/* ENVIRONMENT & BADGES */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Platform Operations
            </div>
            <button className="relative p-2 text-slate-400 hover:text-white transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
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
