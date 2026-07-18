import { Link } from 'react-router-dom';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Admin dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">Manage products, review orders, and track store performance.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Link
          to="products"
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-0.5"
        >
          <h2 className="text-xl font-semibold text-slate-900">Products</h2>
          <p className="mt-2 text-sm text-slate-500">Create, edit, and publish catalog items.</p>
        </Link>
        <Link
          to="orders"
          className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-0.5"
        >
          <h2 className="text-xl font-semibold text-slate-900">Orders</h2>
          <p className="mt-2 text-sm text-slate-500">Review orders, set fulfillment status, and manage shipping.</p>
        </Link>
      </div>
    </div>
  );
}
