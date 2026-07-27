import React, { useEffect, useState } from 'react';
import { inventoryApi } from '../api/inventory.api';
import { useTenantStore } from '../store/useTenantStore';
import { Warehouse as WarehouseIcon, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight, History, PackageCheck, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function InventoryPage() {
  const { activeStore } = useTenantStore();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & State
  const [showWhModal, setShowWhModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');

  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Stock Audit');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, movRes] = await Promise.all([
        inventoryApi.getStockSummary(),
        inventoryApi.getMovements(),
      ]);
      setSummary(sumRes);
      setMovements(movRes || []);
      const storeObj = activeStore as any;
      if (storeObj?._id || storeObj?.id) {
        const whRes = await inventoryApi.getWarehousesByStore(storeObj._id || storeObj.id);
        setWarehouses(whRes || []);
      }
    } catch {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStore]);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    const storeObj = activeStore as any;
    try {
      await inventoryApi.createWarehouse({
        storeId: storeObj?._id || storeObj?.id || 'store-1',
        name: whName,
        code: whCode.toUpperCase(),
      });
      toast.success('Warehouse created successfully');
      setShowWhModal(false);
      setWhName('');
      setWhCode('');
      loadData();
    } catch {
      toast.error('Failed to create warehouse');
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !adjustDelta) return toast.error('Product and adjustment quantity required');

    try {
      await inventoryApi.adjustStock({
        productId: selectedProductId,
        quantityDelta: Number(adjustDelta),
        reason: adjustReason,
      });
      toast.success('Stock adjusted successfully');
      setShowAdjustModal(false);
      setAdjustDelta(0);
      loadData();
    } catch {
      toast.error('Failed to adjust stock');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <WarehouseIcon className="w-6 h-6 text-indigo-400" /> Multi-Warehouse & Stock Matrix
          </h1>
          <p className="text-sm text-slate-400">Manage warehouses, stock adjustments, and inventory movement logs for <span className="text-indigo-400 font-semibold">{activeStore?.name}</span>.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
          >
            Adjust Stock Level
          </button>
          <button
            onClick={() => setShowWhModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Warehouse
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <span className="text-xs font-semibold text-slate-400">Total Stock Units</span>
          <p className="text-2xl font-extrabold text-white">{summary?.totalItems || 0}</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            <PackageCheck className="w-3.5 h-3.5" /> Across {summary?.products?.length || 0} Products
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-amber-900/40 bg-amber-950/20 space-y-2">
          <span className="text-xs font-semibold text-amber-400">Low Stock Warnings</span>
          <p className="text-2xl font-extrabold text-amber-300">{summary?.lowStockCount || 0}</p>
          <span className="text-[10px] text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Below threshold limit
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-rose-900/40 bg-rose-950/20 space-y-2">
          <span className="text-xs font-semibold text-rose-400">Out of Stock Items</span>
          <p className="text-2xl font-extrabold text-rose-300">{summary?.outOfStockCount || 0}</p>
          <span className="text-[10px] text-rose-400">Requires urgent replenishment</span>
        </div>
      </div>

      {/* STOCK MATRIX TABLE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" /> Inventory Stock Levels
          </h3>
        </div>
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Stock Level</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">Loading stock matrix...</td>
              </tr>
            ) : (summary?.products || []).map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 font-bold text-white">{p.title}</td>
                <td className="p-4 font-mono text-slate-400">{p.sku || 'N/A'}</td>
                <td className="p-4 text-slate-400">{p.category}</td>
                <td className="p-4 font-extrabold text-white text-sm">{p.stock} units</td>
                <td className="p-4">
                  {p.stock <= 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Out of Stock</span>
                  ) : p.stock <= (p.minStock || 5) ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Low Stock</span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">In Stock</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* STOCK MOVEMENTS LOG */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" /> Stock Movement Audit History
        </h3>
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">Type</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Created By</th>
              <th className="p-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {movements.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-slate-500">No stock movements recorded yet.</td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold">
                    {m.type === 'IN' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400"><ArrowUpRight className="w-3.5 h-3.5" /> Stock In</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400"><ArrowDownRight className="w-3.5 h-3.5" /> Stock Out</span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-white">{m.quantity} units</td>
                  <td className="p-3 text-slate-400">{m.reason}</td>
                  <td className="p-3 text-slate-400">{m.createdBy || 'System'}</td>
                  <td className="p-3 text-slate-500 font-mono text-[11px]">{new Date(m.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADJUST STOCK MODAL */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Adjust Stock Level</h2>
            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Product --</option>
                  {(summary?.products || []).map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (Current: {p.stock} units)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Quantity Adjustment (+ or -) *</label>
                <input
                  type="number"
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  placeholder="e.g. +50 or -10"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason for Adjustment</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Damaged inventory, Stock count correction"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
                >
                  Apply Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE WAREHOUSE MODAL */}
      {showWhModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <WarehouseIcon className="w-5 h-5 text-indigo-400" /> Create Warehouse
            </h2>
            <form onSubmit={handleCreateWarehouse} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  placeholder="e.g. West Coast Fulfillment Center"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Warehouse Code *</label>
                <input
                  type="text"
                  value={whCode}
                  onChange={(e) => setWhCode(e.target.value)}
                  placeholder="WH-SF-01"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWhModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
