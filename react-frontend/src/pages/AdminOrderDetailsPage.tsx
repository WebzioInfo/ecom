import React, { useEffect, useState } from 'react';
import { ordersApi } from '../api/orders.api';
import { Order } from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Truck, Package, Clock, Printer, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<any>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await ordersApi.getById(id);
      setOrder(data);
      setStatus(data.status);
      setTrackingNumber(data.trackingNumber || '');
      setCarrier(data.carrier || '');
    } catch (err) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!id) return;
    try {
      await ordersApi.updateStatus(id, {
        status,
        trackingNumber,
        carrier,
      });
      toast.success('Order status updated');
      loadOrder();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading || !order) {
    return <div className="p-8 text-center text-slate-500 text-xs">Loading order timeline...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/orders')} className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white font-mono">{order.orderNumber || order._id}</h1>
            <p className="text-xs text-slate-400">Order Timeline & Fulfillment Details</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT: ORDER ITEMS & CUSTOMER */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Customer & Shipping Details</h3>
            <div className="text-xs text-slate-300 space-y-1">
              <p><span className="text-slate-500">Name:</span> {order.customerName}</p>
              <p><span className="text-slate-500">Email:</span> {order.customerEmail}</p>
              <p><span className="text-slate-500">Payment Method:</span> {order.paymentMethod || 'Credit Card'}</p>
            </div>
          </div>

          <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Purchased Items</h3>
            <div className="divide-y divide-slate-800 text-xs">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-200">{item.title || 'Product Item'}</p>
                    <p className="text-[10px] text-indigo-400 font-mono">SKU: {item.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">${item.priceAtPurchase} x {item.quantity}</p>
                    <p className="text-[11px] text-slate-400">${item.priceAtPurchase * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
              <span>Total Amount</span>
              <span className="text-emerald-400">${order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: TIMELINE & STATUS UPDATE */}
        <div className="space-y-6">
          <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Update Fulfillment Status</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                >
                  <option value="pending">Pending</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Carrier</label>
                <input
                  type="text"
                  placeholder="e.g. FedEx / DHL / Shiprocket"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tracking Number</label>
                <input
                  type="text"
                  placeholder="e.g. TRK984029384"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white rounded-lg flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Update Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
