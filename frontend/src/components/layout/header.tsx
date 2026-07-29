import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, ChevronRight, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuthStore } from '../../store/useAuthStore';

export interface HeaderProps {
  onOpenCreateStoreModal?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateStoreModal,
  onOpenCommandPalette,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Generate breadcrumbs from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: 'Admin', path: '/admin/dashboard' },
    ...pathSegments.map((segment, index) => {
      const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
      const formattedName = segment.charAt(0).toUpperCase() + segment.slice(1);
      return { name: formattedName, path: url };
    }),
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 font-medium">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.path}>
            {idx > 0 && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
            <Link
              to={crumb.path}
              className={`hover:text-slate-900 transition-colors ${
                idx === breadcrumbs.length - 1 ? 'font-semibold text-slate-900' : ''
              }`}
            >
              {crumb.name}
            </Link>
          </React.Fragment>
        ))}
      </nav>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Input Button */}
        <button
          onClick={onOpenCommandPalette}
          className="relative hidden md:flex items-center text-left hover:opacity-90 transition-all cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            readOnly
            placeholder="Search stores, orders, subscriptions... (⌘K)"
            className="w-64 lg:w-80 text-xs bg-slate-100/80 text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200/60 py-2 pl-9 pr-12 cursor-pointer"
          />
          <kbd className="absolute right-3 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded px-1.5 py-0.5 pointer-events-none">
            ⌘K
          </kbd>
        </button>

        {/* Quick Action Button */}
        {onOpenCreateStoreModal && (
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onOpenCreateStoreModal}>
            Create Store
          </Button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative text-slate-600 hover:bg-slate-100"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
          </Button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200/80 shadow-popover p-4 z-50 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-sm text-slate-900">Notifications</span>
                <Badge variant="info">3 New</Badge>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-900 block">New Store Provisioned</span>
                  <span className="text-slate-500">Store 'Nike Demo' created successfully.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="font-semibold text-amber-900 block font-medium">Trial Expiring Soon</span>
                  <span className="text-amber-700">Store 'Adidas Demo' trial ends in 2 days.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              SA
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200/80 shadow-popover p-2 z-50 flex flex-col gap-1 text-sm">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 block text-sm">Super Admin</span>
                <span className="text-xs text-slate-500">admin@saas.com</span>
              </div>
              <button
                onClick={() => {
                  navigate('/admin/users');
                  setIsProfileOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-medium w-full text-left"
              >
                <User className="w-4 h-4 text-slate-400" /> Account Profile
              </button>
              <button
                onClick={() => {
                  navigate('/admin/settings');
                  setIsProfileOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-medium w-full text-left"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Platform Settings
              </button>
              <button
                onClick={() => {
                  navigate('/admin/support');
                  setIsProfileOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-medium w-full text-left"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" /> Documentation & Support
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold w-full text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
