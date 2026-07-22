import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function AdminOrdersPage() {
  const ordersQuery = useQuery({
    queryKey: ['adminOrders'],
    queryFn: ordersApi.list,
  });

  if (ordersQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (ordersQuery.isError) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">Unable to load orders.</div>
    );
  }

  const orders = ordersQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Order management</h1>
        <p className="mt-2 text-sm text-slate-500">Review all customer orders and monitor fulfillment status.</p>
      </div>
      <div className="grid gap-6">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/admin/orders/${order._id}`}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">Order #{order._id.slice(-6).toUpperCase()}</p>
                <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{order.status}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>Items</span>
              <span>{order.items.length}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
