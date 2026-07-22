import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function AdminOrderDetailsPage() {
  const { id } = useParams();

  const orderQuery = useQuery({
    queryKey: ['adminOrder', id],
    queryFn: () => ordersApi.getById(id || ''),
    enabled: !!id,
  });

  if (orderQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">
        Order not found.
      </div>
    );
  }

  const order = orderQuery.data;

  return (
    <div className="space-y-8 rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p className="text-sm text-slate-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{order.status}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={(item.product as any)._id || item.product} className="rounded-3xl border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{(item.product as any).title || 'Product'}</p>
                  <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-slate-900">${item.priceAtPurchase.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>{order.items.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment</span>
              <span>WhatsApp</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
