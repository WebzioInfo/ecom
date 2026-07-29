import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';
import CommandPaletteModal from '../CommandPaletteModal';
import CreateStoreModal from '../CreateStoreModal';
import { plansApi } from '../../api/plans.api';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreateStoreModalOpen, setIsCreateStoreModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    plansApi.getAll().then((data) => setPlans(data)).catch(() => []);
  }, []);

  // Global Hotkey Listener (Cmd+K / Ctrl+K & G navigation shortcuts)
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Ignore single hotkeys if typing inside input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const now = Date.now();
      const currentKey = e.key.toLowerCase();

      // Sequential 'G' Shortcuts (Linear style: G D, G S, G U, G B, G R, G O)
      if (lastKey === 'g' && now - lastKeyTime < 1000) {
        if (currentKey === 'd') {
          e.preventDefault();
          navigate('/admin/dashboard');
        } else if (currentKey === 's') {
          e.preventDefault();
          navigate('/admin/stores');
        } else if (currentKey === 'u') {
          e.preventDefault();
          navigate('/admin/users');
        } else if (currentKey === 'b') {
          e.preventDefault();
          navigate('/admin/billing');
        } else if (currentKey === 'r') {
          e.preventDefault();
          navigate('/admin/reports');
        } else if (currentKey === 'o') {
          e.preventDefault();
          navigate('/admin/operations');
        }
      }

      lastKey = currentKey;
      lastKeyTime = now;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50/60 flex text-slate-900 font-sans">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Header
          onOpenCreateStoreModal={() => setIsCreateStoreModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>

      {/* Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenCreateStoreModal={() => setIsCreateStoreModalOpen(true)}
      />

      {/* Global Provision Store Modal */}
      <CreateStoreModal
        isOpen={isCreateStoreModalOpen}
        onClose={() => setIsCreateStoreModalOpen(false)}
        onSuccess={() => {
          setIsCreateStoreModalOpen(false);
          window.location.reload();
        }}
        plans={plans}
      />
    </div>
  );
};
