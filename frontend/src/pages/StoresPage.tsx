import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storesApi, Store } from '../api/stores.api';
import { plansApi, Plan, getPlanId } from '../api/plans.api';
import CreateStoreModal from '../components/CreateStoreModal';
import EditStoreModal from '../components/EditStoreModal';
import { useAuthStore } from '../store/useAuthStore';
import {
  Plus,
  Search,
  CheckCircle,
  Store as StoreIcon,
  ShieldAlert,
  Eye,
  TrendingUp,
  CreditCard,
  Building,
  Calendar,
  Filter,
  MoreVertical,
  Activity,
  Phone,
  Mail,
  UserCheck,
  CheckSquare,
  Square,
  Zap,
  Edit2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StoresPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination States
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Bulk Selection State
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStoreId, setEditStoreId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [storesRes, plansData] = await Promise.all([
        storesApi.getAll({
          search,
          status: selectedStatus,
          page,
          limit: 20,
        }),
        plansApi.getAll(),
      ]);
      setStores(storesRes.data || []);
      setTotalPages(storesRes.totalPages || 1);
      setTotalCount(storesRes.total || 0);
      setPlans(plansData || []);
      const firstPlanId = getPlanId(plansData[0]);
      if (plansData.length > 0 && !selectedPlanId && firstPlanId) setSelectedPlanId(firstPlanId);
    } catch (err: any) {
      toast.error('Failed to load store ecosystem data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedStatus, selectedPlanFilter, page]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await storesApi.create({
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        subscription: { planId: selectedPlanId, status: 'TRIAL' },
        ownerId: user?.id || '',
      });
      toast.success('Tenant store provisioned successfully!');
      setShowModal(false);
      setName('');
      setSlug('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create store');
    }
  };

  const handleToggleStatus = async (store: Store) => {
    const sId = store.id || store._id;
    if (!sId) return;
    try {
      if (store.status === 'active' || store.status === 'ACTIVE') {
        if (!confirm(`Suspend tenant store '${store.name}'?`)) return;
        await storesApi.suspend(sId);
        toast.success('Store suspended');
      } else {
        await storesApi.activate(sId);
        toast.success('Store activated');
      }
      loadData();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const handleBulkAction = async (action: 'activate' | 'suspend') => {
    if (selectedStoreIds.length === 0) return;
    try {
      await Promise.all(
        selectedStoreIds.map((id) =>
          action === 'activate' ? storesApi.activate(id) : storesApi.suspend(id),
        ),
      );
      toast.success(`Bulk ${action} applied to ${selectedStoreIds.length} stores`);
      setSelectedStoreIds([]);
      loadData();
    } catch {
      toast.error('Bulk operation failed');
    }
  };

  const toggleSelectAll = () => {
    if (selectedStoreIds.length === stores.length) {
      setSelectedStoreIds([]);
    } else {
      setSelectedStoreIds(stores.map((s) => s.id || s._id || ''));
    }
  };

  const toggleSelectStore = (id: string) => {
    if (selectedStoreIds.includes(id)) {
      setSelectedStoreIds(selectedStoreIds.filter((i) => i !== id));
    } else {
      setSelectedStoreIds([...selectedStoreIds, id]);
    }
  };

  // Metrics summary
  const activeCount = stores.filter((s) => s.status === 'active' || s.status === 'ACTIVE').length;
  const totalRevenueSum = stores.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* TITLE & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" /> Enterprise SaaS Control Center
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Tenant Management Center
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Monitor multi-tenant metrics, manage subscriptions, and inspect store profiles.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Provision New Store
        </button>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>TOTAL TENANTS</span>
            <Building className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{totalCount}</div>
          <div className="text-[11px] text-emerald-400 mt-1">{activeCount} active store schemas</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>PLATFORM MRR</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">${(totalRevenueSum * 0.3).toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Monthly Recurring Revenue</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>CUMULATIVE REVENUE</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">${totalRevenueSum.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">Gross tenant merchandise value</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>ECOSYSTEM HEALTH</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">99.98%</div>
          <div className="text-[11px] text-slate-400 mt-1">PostgreSQL Tenant Isolation</div>
        </div>
      </div>

      {/* FILTER & TOOLBAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
          {/* SEARCH */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search stores by name, slug, owner..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* STATUS FILTER */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {/* BULK ACTIONS */}
        {selectedStoreIds.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-indigo-400">{selectedStoreIds.length} Selected</span>
            <button
              onClick={() => handleBulkAction('activate')}
              className="text-xs font-bold text-emerald-400 hover:underline px-2 py-1"
            >
              Bulk Activate
            </button>
            <button
              onClick={() => handleBulkAction('suspend')}
              className="text-xs font-bold text-rose-400 hover:underline px-2 py-1"
            >
              Bulk Suspend
            </button>
          </div>
        )}
      </div>

      {/* STORES ENTERPRISE TABLE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-500 hover:text-white">
                    {selectedStoreIds.length === stores.length && stores.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4">Store & Slug</th>
                <th className="p-4">Owner Contact</th>
                <th className="p-4">Plan & Expiry</th>
                <th className="p-4">Financials & Orders</th>
                <th className="p-4">Status & Health</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading tenant ecosystem stores...
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No stores found matching your criteria.
                  </td>
                </tr>
              ) : (
                stores.map((store) => {
                  const sId = store.id || store._id || '';
                  const isSelected = selectedStoreIds.includes(sId);
                  const isActive = store.status === 'active' || store.status === 'ACTIVE';

                  return (
                    <tr
                      key={sId}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <button
                          onClick={() => toggleSelectStore(sId)}
                          className="text-slate-500 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* STORE NAME & LOGO */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                            {store.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{store.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{store.slug}</div>
                          </div>
                        </div>
                      </td>

                      {/* OWNER DETAILS */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">{store.ownerName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" /> {store.ownerEmail}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" /> {store.phone}
                        </div>
                      </td>

                      {/* PLAN & EXPIRY */}
                      <td className="p-4">
                        <div className="font-bold text-indigo-400">{store.plan}</div>
                        <div className="text-[10px] text-slate-400">
                          {store.daysRemaining} days remaining ({store.billingCycle})
                        </div>
                        {store.isTrial && (
                          <span className="text-[9px] font-extrabold bg-purple-950 text-purple-400 border border-purple-800 px-1.5 py-0.5 rounded uppercase">
                            Trial Period
                          </span>
                        )}
                      </td>

                      {/* FINANCIALS & ORDERS */}
                      <td className="p-4">
                        <div className="font-bold text-emerald-400">
                          ${(store.totalRevenue || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {store.totalOrders} Orders &bull; {store.totalProducts} Products
                        </div>
                      </td>

                      {/* STATUS & HEALTH */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                              isActive
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border-rose-800'
                            }`}
                          >
                            {isActive ? 'ACTIVE' : 'SUSPENDED'}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              store.healthStatus === 'HEALTHY'
                                ? 'bg-emerald-500 animate-pulse'
                                : store.healthStatus === 'NEEDS_ATTENTION'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            title={`Health Status: ${store.healthStatus}`}
                          />
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditStoreId(sId);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                            title="Edit Store Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/stores/${sId}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                            title="Open Tenant Management Center"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(store)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isActive
                                ? 'bg-rose-950/40 text-rose-400 border-rose-900/40 hover:bg-rose-900'
                                : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900'
                            }`}
                            title={isActive ? 'Suspend Store' : 'Activate Store'}
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalCount} total stores)
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors text-slate-200"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-colors text-slate-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CREATE STORE WIZARD MODAL */}
      <CreateStoreModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadData}
        plans={plans}
      />

      {/* EDIT STORE MODAL */}
      <EditStoreModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={loadData}
        storeId={editStoreId}
        plans={plans}
      />
    </div>
  );
}
