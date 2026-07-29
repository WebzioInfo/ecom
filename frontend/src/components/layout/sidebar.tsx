import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Receipt,
  BarChart3,
  Activity,
  Cpu,
  Bell,
  Users,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Layers,
  FileText,
  Code,
  MessageSquare,
} from 'lucide-react';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const navigationItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Stores', path: '/admin/stores', icon: Store },
  { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
  { name: 'Billing', path: '/admin/billing', icon: Receipt },
  { name: 'Plans', path: '/admin/plans', icon: Layers },
  { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { name: 'Monitoring', path: '/admin/operations', icon: Activity },
  { name: 'Automation', path: '/admin/automation', icon: Cpu },
  { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
  { name: 'Users & IAM', path: '/admin/users', icon: Users },
  { name: 'Roles & Access', path: '/admin/roles', icon: ShieldCheck },
  { name: 'Developer Center', path: '/admin/developer', icon: Code },
  { name: 'Support Tickets', path: '/admin/support', icon: MessageSquare },
  { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-200 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo & Title */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs font-bold text-lg">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap overflow-hidden">
              <span className="font-bold text-slate-900 tracking-tight text-base leading-none">
                Commerce SaaS
              </span>
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mt-1">
                Super Admin
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3.5 px-3.5 py-2 rounded-xl font-medium text-sm transition-all duration-150 relative ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />

              {!isCollapsed && (
                <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile Snippet */}
      <div className="p-3 border-t border-slate-100">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200/60 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
            SA
          </div>
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap overflow-hidden">
              <span className="text-xs font-bold text-slate-900 leading-tight truncate">
                Super Admin
              </span>
              <span className="text-[11px] text-slate-500 truncate">admin@saas.com</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
