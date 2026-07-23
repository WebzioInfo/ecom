import React, { useEffect, useState } from 'react';
import { customersApi, Customer } from '../api/customers.api';
import { useTenantStore } from '../store/useTenantStore';
import { Users, Search, Plus, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CustomersPage() {
  const { activeStore } = useTenantStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    if (!activeStore?._id) return;
    try {
      const res = await customersApi.getByStore(activeStore._id, { search });
      setCustomers(res.data);
    } catch (err) {
      toast.error('Failed to load customers');
    }
  };

  useEffect(() => {
    loadData();
  }, [search, activeStore]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Store Customer CRM</h1>
          <p className="text-xs text-slate-400">Customer Profiles & LTV for <span className="text-indigo-400">{activeStore?.name}</span></p>
        </div>
      </div>

      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-200"
          />
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3.5">Customer Name</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Total Orders</th>
              <th className="p-3.5">Lifetime Spend</th>
              <th className="p-3.5">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">No customer records in store CRM.</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c._id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-white">{c.firstName} {c.lastName}</td>
                  <td className="p-3.5 text-slate-400">{c.email}</td>
                  <td className="p-3.5">{c.totalOrders || 0}</td>
                  <td className="p-3.5 font-bold text-emerald-400">${c.totalSpent || 0}</td>
                  <td className="p-3.5 text-slate-500 text-[11px]">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
