import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function CustomerLayout() {
  const { isAuthenticated, logout, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
            Commerce Pro
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/products" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
              Shop
            </Link>
            <Link to="/wishlist" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
              Wishlist
            </Link>
            <Link to="/cart" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
              Cart
            </Link>
            {isAuthenticated && user?.roles.includes('admin') && (
              <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                Admin
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-sm text-slate-500">Hi, {user?.name || 'Customer'}</span>
                <button
                  onClick={logout}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
