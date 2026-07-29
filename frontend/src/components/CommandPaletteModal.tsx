import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  UserPlus,
  FileBarChart2,
  Sliders,
  Key,
  Shield,
  Activity,
  Zap,
  Globe,
  Store,
  CreditCard,
  Layers,
  FileText,
  Terminal,
  Star,
  CornerDownLeft,
  X,
  Keyboard,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  globalSearchProductivityApi,
  SearchResultItem,
  FavoriteItem,
} from '../api/global-search-productivity.api';
import SearchPreviewDrawer from './SearchPreviewDrawer';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateStoreModal?: () => void;
}

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onOpenCreateStoreModal,
}: CommandPaletteModalProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Drawer Preview
  const [previewItem, setPreviewItem] = useState<SearchResultItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Shortcuts Overlay
  const [showShortcutsOverlay, setShowShortcutsOverlay] = useState(false);

  // Static Quick Actions
  const quickActions = useMemo(
    () => [
      {
        id: 'qa-create-store',
        title: 'Create Store',
        subtitle: 'Provision a new isolated merchant store schema',
        category: 'ACTIONS',
        icon: Store,
        action: () => {
          onClose();
          onOpenCreateStoreModal?.();
        },
      },
      {
        id: 'qa-invite-user',
        title: 'Invite Admin User',
        subtitle: 'Send administrator access invitation',
        category: 'ACTIONS',
        icon: UserPlus,
        action: () => {
          onClose();
          navigate('/admin/users');
        },
      },
      {
        id: 'qa-gen-report',
        title: 'Generate BI Report',
        subtitle: 'Export executive revenue & store metrics',
        category: 'ACTIONS',
        icon: FileBarChart2,
        action: () => {
          onClose();
          navigate('/admin/reports');
        },
      },
      {
        id: 'qa-create-plan',
        title: 'Create Pricing Plan',
        subtitle: 'Configure subscription tier features and prices',
        category: 'ACTIONS',
        icon: Layers,
        action: () => {
          onClose();
          navigate('/admin/plans/new');
        },
      },
    ],
    [navigate, onClose, onOpenCreateStoreModal],
  );

  // Static Navigation Items
  const navigationItems = useMemo(
    () => [
      { id: 'nav-dashboard', title: 'Platform Dashboard', category: 'NAVIGATION', url: '/admin/dashboard', icon: Zap },
      { id: 'nav-stores', title: 'Stores Directory', category: 'NAVIGATION', url: '/admin/stores', icon: Store },
      { id: 'nav-subscriptions', title: 'Subscriptions', category: 'NAVIGATION', url: '/admin/subscriptions', icon: Layers },
      { id: 'nav-billing', title: 'Billing & Invoices', category: 'NAVIGATION', url: '/admin/billing', icon: CreditCard },
      { id: 'nav-plans', title: 'Pricing Plans', category: 'NAVIGATION', url: '/admin/plans', icon: Sliders },
      { id: 'nav-reports', title: 'Reports & BI Center', category: 'NAVIGATION', url: '/admin/reports', icon: FileBarChart2 },
      { id: 'nav-operations', title: 'Platform Operations', category: 'NAVIGATION', url: '/admin/operations', icon: Activity },
      { id: 'nav-users', title: 'IAM Users & Security', category: 'NAVIGATION', url: '/admin/users', icon: Shield },
      { id: 'nav-settings', title: 'Platform Settings', category: 'NAVIGATION', url: '/admin/settings', icon: Sliders },
      { id: 'nav-developer', title: 'Developer Center', category: 'NAVIGATION', url: '/admin/developer', icon: Terminal },
    ],
    [],
  );

  // Load Favorites
  useEffect(() => {
    if (isOpen) {
      globalSearchProductivityApi.getFavorites().then(setFavorites).catch(() => []);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSearchResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced Search Query Execution
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await globalSearchProductivityApi.searchGlobal(query);
      setSearchResults(
        results.length
          ? results
          : [
              {
                id: 'sr-1',
                title: `Search store: "${query}"`,
                subtitle: 'Filter stores matching name or domain',
                category: 'STORES',
                url: `/admin/stores?search=${encodeURIComponent(query)}`,
              },
              {
                id: 'sr-2',
                title: `Search user: "${query}"`,
                subtitle: 'Find admin account by email',
                category: 'USERS',
                url: `/admin/users?search=${encodeURIComponent(query)}`,
              },
            ],
      );
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Combined Flattened List for Keyboard Navigation
  const flattenedList = useMemo(() => {
    if (query.trim()) {
      return searchResults.map((item) => ({
        ...item,
        isAction: false,
        onExecute: () => {
          navigate(item.url);
          onClose();
        },
      }));
    }

    const actionsList = quickActions.map((qa) => ({
      id: qa.id,
      title: qa.title,
      subtitle: qa.subtitle,
      category: qa.category,
      icon: qa.icon,
      isAction: true,
      onExecute: qa.action,
    }));

    const navList = navigationItems.map((nav) => ({
      id: nav.id,
      title: nav.title,
      subtitle: nav.url,
      category: nav.category,
      icon: nav.icon,
      isAction: false,
      onExecute: () => {
        navigate(nav.url);
        onClose();
      },
    }));

    return [...actionsList, ...navList];
  }, [query, searchResults, quickActions, navigationItems, navigate, onClose]);

  // Handle Keyboard Controls inside Palette Modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (flattenedList.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flattenedList.length) % (flattenedList.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flattenedList[selectedIndex]) {
          flattenedList[selectedIndex].onExecute();
        }
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '?') {
        setShowShortcutsOverlay(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flattenedList, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in text-slate-900">
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* INPUT BAR */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search stores, users, billing, reports... (Press ? for shortcuts)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none text-sm text-slate-900 font-semibold focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
          />
          <button
            onClick={() => setShowShortcutsOverlay(true)}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold"
          >
            ? Shortcuts
          </button>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LIST CONTAINER */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {flattenedList.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No command results matching "{query}"</div>
          ) : (
            <div className="space-y-1">
              {flattenedList.map((item, idx) => {
                const active = idx === selectedIndex;
                const IconComponent = (item as any).icon || Zap;
                return (
                  <div
                    key={item.id}
                    onClick={() => item.onExecute()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                      active ? 'bg-blue-600 text-white shadow-xs' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div>
                        <div className="font-bold text-sm">{item.title}</div>
                        <div className={`text-[11px] ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.category}
                      </span>
                      {active && <CornerDownLeft className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER SHORTCUT HINTS */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 text-[11px] text-slate-500 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold">↑↓</kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold">↵</kbd>{' '}
              Execute
            </span>
            <span>
              <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold">esc</kbd>{' '}
              Close
            </span>
          </div>

          <span className="font-semibold text-blue-600">Linear / Raycast Engine</span>
        </div>
      </div>

      {/* SHORTCUTS OVERLAY MODAL */}
      {showShortcutsOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-slate-900 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-blue-600" /> Platform Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowShortcutsOverlay(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span>Cmd + K / Ctrl + K</span>
                <span className="font-sans font-bold text-slate-700">Global Command Palette</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span>G D</span>
                <span className="font-sans font-bold text-slate-700">Go to Dashboard</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span>G S</span>
                <span className="font-sans font-bold text-slate-700">Go to Stores</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span>G U</span>
                <span className="font-sans font-bold text-slate-700">Go to Users & Security</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span>G B</span>
                <span className="font-sans font-bold text-slate-700">Go to Billing & Invoices</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span>G R</span>
                <span className="font-sans font-bold text-slate-700">Go to BI Reports</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span>G O</span>
                <span className="font-sans font-bold text-slate-700">Go to Operations</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH PREVIEW DRAWER */}
      <SearchPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        item={previewItem}
      />
    </div>
  );
}
