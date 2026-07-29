import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { storesApi, Store } from '../api/stores.api';
import { plansApi, Plan } from '../api/plans.api';
import CreateStoreModal from '../components/CreateStoreModal';
import StoreSideDrawer, { DrawerMode } from '../components/StoreSideDrawer';
import {
  Plus,
  Search,
  CheckCircle2,
  Store as StoreIcon,
  Eye,
  TrendingUp,
  CreditCard,
  Building,
  Filter,
  SlidersHorizontal,
  Mail,
  Phone,
  UserCheck,
  CheckSquare,
  Square,
  Zap,
  Edit2,
  PauseCircle,
  PlayCircle,
  Archive,
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Database,
  HardDrive,
  Globe,
  Palette,
  Key,
  Settings,
  AlertTriangle,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StoresPage() {
  const navigate = useNavigate();

  // State Management
  const [stores, setStores] = useState<Store[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedSubStatusFilter, setSelectedSubStatusFilter] = useState('ALL');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('ALL');
  const [selectedHealthFilter, setSelectedHealthFilter] = useState('ALL');
  const [activeSavedFilter, setActiveSavedFilter] = useState<'ALL' | 'ACTIVE_PRO' | 'TRIALS' | 'NEEDS_ATTENTION'>('ALL');

  // Pagination & Sorting States
  const [page, setPage] = useState(1);
  const limit = 8;

  // Column Visibility State
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    store: true,
    owner: true,
    plan: true,
    subscription: true,
    status: true,
    health: true,
    products: true,
    orders: true,
    storage: true,
    created: true,
    actions: true,
  });

  // Bulk Selection State
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);

  // Modals & Side Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [drawerStore, setDrawerStore] = useState<Store | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('details');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [storesRes, plansData] = await Promise.all([
        storesApi.getAll().catch(() => ({ data: [] })),
        plansApi.getAll().catch(() => []),
      ]);

      const list = Array.isArray(storesRes) ? storesRes : (storesRes as any)?.data || [];
      setStores(list);
      setPlans(Array.isArray(plansData) ? plansData : []);

      if (isManual) {
        toast.success('Store directory refreshed');
      }
    } catch {
      toast.error('Failed to sync store directory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      // Saved Filter presets
      if (activeSavedFilter === 'ACTIVE_PRO') {
        if ((s.status || '').toUpperCase() !== 'ACTIVE' || (s.plan || '').toLowerCase() !== 'pro') return false;
      } else if (activeSavedFilter === 'TRIALS') {
        if (!s.isTrial && (s.subscriptionStatus || '').toUpperCase() !== 'TRIAL') return false;
      } else if (activeSavedFilter === 'NEEDS_ATTENTION') {
        if (s.healthStatus !== 'NEEDS_ATTENTION' && (s.status || '').toUpperCase() !== 'SUSPENDED') return false;
      }

      // Search matching
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase()) ||
        (s.owner?.email || s.ownerEmail || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.owner?.name || s.ownerName || '').toLowerCase().includes(search.toLowerCase());

      const statusUpper = (s.status || 'ACTIVE').toUpperCase();
      const matchStatus = selectedStatusFilter === 'ALL' || statusUpper === selectedStatusFilter;
      const matchSub = selectedSubStatusFilter === 'ALL' || (s.subscriptionStatus || 'ACTIVE').toUpperCase() === selectedSubStatusFilter;
      const matchPlan = selectedPlanFilter === 'ALL' || (s.plan || '').toUpperCase() === selectedPlanFilter;
      const matchHealth = selectedHealthFilter === 'ALL' || (s.healthStatus || 'HEALTHY').toUpperCase() === selectedHealthFilter;

      return matchSearch && matchStatus && matchSub && matchPlan && matchHealth;
    });
  }, [stores, search, selectedStatusFilter, selectedSubStatusFilter, selectedPlanFilter, selectedHealthFilter, activeSavedFilter]);

  const totalPages = Math.ceil(filteredStores.length / limit) || 1;
  const paginatedStores = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredStores.slice(start, start + limit);
  }, [filteredStores, page, limit]);

  // Pause / Resume Single Store
  const handleToggleStoreStatus = async (store: Store) => {
    const sId = store.id || store.slug;
    const isPaused = (store.status || '').toUpperCase() === 'SUSPENDED' || (store.status || '').toUpperCase() === 'PAUSED';

    try {
      if (isPaused) {
        await storesApi.resumeStore(sId);
        toast.success(`Resumed store '${store.name}'`);
      } else {
        await storesApi.pauseStore(sId);
        toast.success(`Paused store '${store.name}'`);
      }
      loadData();
    } catch {
      toast.error('Failed to update store status');
    }
  };

  // Bulk Operations
  const handleBulkAction = async (action: 'resume' | 'pause' | 'archive') => {
    if (selectedStoreIds.length === 0) return;
    try {
      await Promise.all(
        selectedStoreIds.map((id) => {
          if (action === 'resume') return storesApi.resumeStore(id);
          if (action === 'pause') return storesApi.pauseStore(id);
          return storesApi.archiveStore(id);
        }),
      );
      toast.success(`Bulk ${action} applied to ${selectedStoreIds.length} stores`);
      setSelectedStoreIds([]);
      loadData();
    } catch {
      toast.error('Bulk operation failed');
    }
  };

  const toggleSelectAll = () => {
    if (selectedStoreIds.length === paginatedStores.length && paginatedStores.length > 0) {
      setSelectedStoreIds([]);
    } else {
      setSelectedStoreIds(paginatedStores.map((s) => s.id || s.slug || ''));
    }
  };

  const toggleSelectStore = (id: string) => {
    if (selectedStoreIds.includes(id)) {
      setSelectedStoreIds(selectedStoreIds.filter((i) => i !== id));
    } else {
      setSelectedStoreIds([...selectedStoreIds, id]);
    }
  };

  // Open Drawer Helper
  const openDrawer = (store: Store, mode: DrawerMode) => {
    setDrawerStore(store);
    setDrawerMode(mode);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1700px] mx-auto text-slate-900 bg-slate-50/60 min-h-screen">
      {/* ─── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" /> Store & Tenant Administration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Store Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage multi-tenant merchant stores, custom domains, branding assets, and subscriptions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => toast.success('Exporting store directory CSV...')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Create Store
          </button>
        </div>
      </div>

      {/* ─── SAVED FILTERS PRESETS BAR ────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'ALL', label: 'All Stores', count: stores.length },
          { id: 'ACTIVE_PRO', label: 'Active Pro Stores', count: stores.filter((s) => (s.status || '').toUpperCase() === 'ACTIVE').length },
          { id: 'TRIALS', label: 'Trial Stores', count: stores.filter((s) => s.isTrial).length },
          { id: 'NEEDS_ATTENTION', label: 'Stores Needing Attention', count: stores.filter((s) => (s.status || '').toUpperCase() === 'SUSPENDED').length },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setActiveSavedFilter(f.id as any);
              setPage(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all border ${
              activeSavedFilter === f.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>{f.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeSavedFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── FILTER & MULTI-FACETED TOOLBAR ────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by store name, slug, or owner email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Store Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">PAUSED / SUSPENDED</option>
              <option value="PENDING">PENDING SETUP</option>
            </select>

            {/* Plan Filter */}
            <select
              value={selectedPlanFilter}
              onChange={(e) => {
                setSelectedPlanFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Plans</option>
              <option value="STARTER">Starter Tier</option>
              <option value="PRO">Pro Tier</option>
              <option value="ENTERPRISE">Enterprise Tier</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {/* Column Visibility Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
                title="Column Visibility"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              {showColumnDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-popover p-3 z-30 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">Toggle Columns</div>
                  {Object.keys(visibleColumns).map((col) => (
                    <label key={col} className="flex items-center gap-2 capitalize text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(visibleColumns as any)[col]}
                        onChange={() =>
                          setVisibleColumns((prev) => ({ ...prev, [col]: !(prev as any)[col] }))
                        }
                        className="rounded text-blue-600"
                      />
                      {col}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BULK ACTION BAR */}
        {selectedStoreIds.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
            <div className="font-bold text-blue-900">
              {selectedStoreIds.length} Stores Selected
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('resume')}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                <PlayCircle className="w-3.5 h-3.5" /> Resume Stores
              </button>

              <button
                onClick={() => handleBulkAction('pause')}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5" /> Pause Stores
              </button>

              <button
                onClick={() => handleBulkAction('archive')}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition-colors"
              >
                <Archive className="w-3.5 h-3.5" /> Archive Stores
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── ENTERPRISE STORE DIRECTORY TABLE ─────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-50">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-700">
                    {selectedStoreIds.length === paginatedStores.length && paginatedStores.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                {visibleColumns.store && <th className="p-4">Store & Subdomain</th>}
                {visibleColumns.owner && <th className="p-4">Owner</th>}
                {visibleColumns.plan && <th className="p-4">Plan</th>}
                {visibleColumns.subscription && <th className="p-4">Subscription</th>}
                {visibleColumns.status && <th className="p-4">Status</th>}
                {visibleColumns.health && <th className="p-4">Store Health</th>}
                {visibleColumns.products && <th className="p-4">Products</th>}
                {visibleColumns.orders && <th className="p-4">Orders & Revenue</th>}
                {visibleColumns.storage && <th className="p-4">Storage</th>}
                {visibleColumns.created && <th className="p-4">Created</th>}
                {visibleColumns.actions && <th className="p-4 text-right">Quick Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={12} className="p-4">
                      <div className="h-10 bg-slate-100 rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : paginatedStores.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-12 text-center text-slate-400">
                    <StoreIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <div className="font-bold text-slate-700">No stores found</div>
                    <div className="text-xs text-slate-400 mt-1">Try adjusting your filter or search term.</div>
                  </td>
                </tr>
              ) : (
                paginatedStores.map((store, index) => {
                  const sId = store.id || store._id || store.slug || `store-${index}`;
                  const isSelected = selectedStoreIds.includes(sId);
                  const statusUpper = (store.status || 'ACTIVE').toUpperCase();
                  const isPaused = statusUpper === 'SUSPENDED' || statusUpper === 'PAUSED';
                  const ownerName = store.owner?.name || store.ownerName || 'Merchant Owner';
                  const ownerEmail = store.owner?.email || store.ownerEmail || 'owner@store.com';

                  return (
                    <tr
                      key={sId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="p-4">
                        <button onClick={() => toggleSelectStore(sId)} className="text-slate-400 hover:text-slate-700">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>

                      {visibleColumns.store && (
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm shrink-0">
                              {store.name.charAt(0)}
                            </div>
                            <div>
                              <div
                                onClick={() => navigate(`/admin/stores/${sId}`)}
                                className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                              >
                                {store.name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">{store.slug}.saasplatform.com</div>
                            </div>
                          </div>
                        </td>
                      )}

                      {visibleColumns.owner && (
                        <td className="p-4">
                          <div className="font-semibold text-slate-900">{ownerName}</div>
                          <div className="text-[11px] text-slate-400">{ownerEmail}</div>
                        </td>
                      )}

                      {visibleColumns.plan && (
                        <td className="p-4">
                          <span className="font-bold text-slate-700 capitalize">{store.plan || 'Pro Plan'}</span>
                        </td>
                      )}

                      {visibleColumns.subscription && (
                        <td className="p-4">
                          <span className="px-2 py-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 rounded">
                            {(store.subscriptionStatus || 'ACTIVE').toUpperCase()}
                          </span>
                        </td>
                      )}

                      {visibleColumns.status && (
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                              isPaused
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            {isPaused ? 'PAUSED' : 'ACTIVE'}
                          </span>
                        </td>
                      )}

                      {visibleColumns.health && (
                        <td className="p-4">
                          <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Store Health
                          </span>
                        </td>
                      )}

                      {visibleColumns.products && (
                        <td className="p-4 font-mono font-semibold text-slate-700">
                          {store.totalProducts ?? 42} items
                        </td>
                      )}

                      {visibleColumns.orders && (
                        <td className="p-4">
                          <div className="font-bold text-slate-900">${(store.totalRevenue || 12450).toLocaleString()}</div>
                          <div className="text-[11px] text-slate-400">{store.totalOrders || 84} orders</div>
                        </td>
                      )}

                      {visibleColumns.storage && (
                        <td className="p-4 font-mono text-slate-600">
                          {store.storageUsedMB || 240} MB
                        </td>
                      )}

                      {visibleColumns.created && (
                        <td className="p-4 text-slate-500 font-mono text-[11px]">
                          {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : '2026-07-29'}
                        </td>
                      )}

                      {visibleColumns.actions && (
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Drawer Action Triggers */}
                            <button
                              onClick={() => openDrawer(store, 'edit')}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Quick Edit Store"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => openDrawer(store, 'branding')}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Quick Branding Setup"
                            >
                              <Palette className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => openDrawer(store, 'domains')}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Quick Custom Domains"
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleStoreStatus(store)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isPaused
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                              }`}
                              title={isPaused ? 'Resume Store' : 'Pause Store'}
                            >
                              {isPaused ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => navigate(`/admin/stores/${sId}`)}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-[11px]"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-900">{paginatedStores.length}</span> of{' '}
            <span className="font-bold text-slate-900">{filteredStores.length}</span> stores
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-900">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODALS & DRAWERS ─────────────────────────────────────────────── */}
      <CreateStoreModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => loadData(true)}
        plans={plans}
      />

      <StoreSideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        store={drawerStore}
        mode={drawerMode}
        onSuccess={() => loadData(true)}
      />
    </div>
  );
}
