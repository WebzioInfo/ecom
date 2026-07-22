import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function AdminLayout() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/admin" className="text-xl font-semibold text-slate-900">
            Admin Hub
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/admin/products" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
              Products
            </Link>
            <Link to="/admin/orders" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
              Orders
            </Link>
            <button
              onClick={logout}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
