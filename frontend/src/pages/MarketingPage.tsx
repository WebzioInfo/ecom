import React, { useEffect, useState } from 'react';
import { marketingApi, Coupon } from '../api/marketing.api';
import { useTenantStore } from '../store/useTenantStore';
import { Tag, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MarketingPage() {
  const { activeStore } = useTenantStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [value, setValue] = useState(10);
  const [type, setType] = useState<'percentage' | 'fixed_amount'>('percentage');

  const loadData = async () => {
    if (!activeStore?._id) return;
    try {
      const data = await marketingApi.getCouponsByStore(activeStore._id);
      setCoupons(data);
    } catch (err) {
      toast.error('Failed to load coupons');
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStore]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await marketingApi.createCoupon({
        storeId: activeStore?._id || '',
        code,
        type,
        value: Number(value),
      });
      toast.success('Coupon created');
      setShowModal(false);
      setCode('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await marketingApi.deleteCoupon(id);
      toast.success('Coupon deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Marketing & Coupons</h1>
          <p className="text-xs text-slate-400">Discount Rules & Campaign Coupons for <span className="text-indigo-400">{activeStore?.name}</span></p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c._id} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex justify-between items-center">
            <div>
              <span className="font-mono text-sm font-bold text-indigo-400">{c.code}</span>
              <p className="text-xs text-slate-400 mt-1">
                {c.type === 'percentage' ? `${c.value}% OFF` : `$${c.value} OFF`}
              </p>
            </div>
            <button onClick={() => handleDelete(c._id)} className="p-1.5 text-slate-500 hover:text-rose-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 text-xs">
            <h2 className="text-base font-bold text-white">Create New Coupon</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="SUMMER20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg font-mono text-indigo-400 uppercase"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Discount Type</label>
                <select value={type} onChange={(e: any) => setType(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200">
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="fixed_amount">Fixed Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Value</label>
                <input
                  type="number"
                  required
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
