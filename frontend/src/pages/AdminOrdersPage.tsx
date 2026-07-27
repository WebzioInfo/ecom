import React, { useEffect, useState } from 'react';
import { ordersApi } from '../api/orders.api';
import { Order } from '../types';
import { useTenantStore } from '../store/useTenantStore';
import { ShoppingBag, Search, Eye, Filter, Clock, CheckCircle2, Truck, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function AdminOrdersPage() {
  const { activeStore } = useTenantStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getAll({ status, search, limit: 50 });
      setOrders(res.data || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [status, search, activeStore]);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">Pending</span>;
      case 'packed':
        return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400">Packed</span>;
      case 'shipped':
        return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">Shipped</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Delivered</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 border border-slate-700 text-slate-400">{st}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Order Management System (OMS)</h1>
          <p className="text-xs text-slate-400">Fulfill, Track & Manage Headless Client Orders for <span className="text-indigo-400">{activeStore?.name}</span></p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by order number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="pending">Pending</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3.5">Order Number</th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Items</th>
              <th className="p-3.5">Total Amount</th>
              <th className="p-3.5">Fulfillment Status</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500">
                  No orders found for this store.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono font-bold text-indigo-400">{ord.orderNumber || ord._id.slice(-6)}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-200">{ord.customerName}</p>
                    <p className="text-[10px] text-slate-500">{ord.customerEmail}</p>
                  </td>
                  <td className="p-3.5 font-medium">{ord.items?.length || 0} items</td>
                  <td className="p-3.5 font-bold text-emerald-400">${ord.totalAmount}</td>
                  <td className="p-3.5">{getStatusBadge(ord.status)}</td>
                  <td className="p-3.5 text-slate-500 text-[11px]">{new Date(ord.createdAt).toLocaleDateString()}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => navigate(`/store/orders/${(ord as any).id || (ord as any)._id}`)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition"
                      title="View Timeline & Process Order"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
