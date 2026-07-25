import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  ShieldCheck,
  LayoutDashboard,
  Store,
  Layers,
  MessageSquare,
  Activity,
  FileText,
  Key,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

export function SuperAdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Platform Overview', icon: LayoutDashboard },
    { to: '/admin/stores', label: 'Stores Management', icon: Store },
    { to: '/admin/plans', label: 'SaaS Plans', icon: Layers },
    { to: '/admin/support', label: 'Global Support', icon: MessageSquare },
    { to: '/admin/system', label: 'System Health', icon: Activity },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
    { to: '/admin/developer', label: 'Developer Portal', icon: Key },
    { to: '/admin/users', label: 'Platform Admins', icon: Users },
    { to: '/admin/settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* SUPER ADMIN SIDEBAR */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800/80 flex flex-col justify-between p-4 select-none">
        <div className="space-y-6">
          {/* LOGO / PLATFORM HEADER */}
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-wide">Webzio SaaS</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Super Admin Portal</div>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* USER PROFILE & LOGOUT */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Platform Admin'}</div>
              <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
            </div>
            <span className="text-[9px] font-extrabold bg-indigo-950 text-indigo-400 border border-indigo-800/50 px-2 py-0.5 rounded uppercase">
              SUPER
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

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
