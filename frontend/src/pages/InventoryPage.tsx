import React, { useEffect, useState } from 'react';
import { inventoryApi, Warehouse } from '../api/inventory.api';
import { useTenantStore } from '../store/useTenantStore';
import { Warehouse as WarehouseIcon, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function InventoryPage() {
  const { activeStore } = useTenantStore();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const loadData = async () => {
    if (!activeStore?._id) return;
    try {
      const data = await inventoryApi.getWarehousesByStore(activeStore._id);
      setWarehouses(data);
    } catch (err) {
      toast.error('Failed to load warehouses');
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStore]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.createWarehouse({
        storeId: activeStore?._id || '',
        name,
        code: code.toUpperCase(),
      });
      toast.success('Warehouse created');
      setShowModal(false);
      setName('');
      setCode('');
      loadData();
    } catch (err) {
      toast.error('Failed to create warehouse');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Multi-Warehouse Inventory</h1>
          <p className="text-xs text-slate-400">Stock Matrix & Warehouses for <span className="text-indigo-400">{activeStore?.name}</span></p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <div key={wh._id} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <WarehouseIcon className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">{wh.name}</h3>
                  <p className="text-[10px] font-mono text-indigo-400">{wh.code}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Active</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-base font-bold text-white">Create New Warehouse</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Warehouse Name</label>
                <input
                  type="text"
                  required
                  placeholder="Main Fulfillment Center"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Warehouse Code</label>
                <input
                  type="text"
                  required
                  placeholder="WH-NY-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-indigo-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold">Save Warehouse</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
