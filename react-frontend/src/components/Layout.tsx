import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Layout() {
  const { isAuthenticated, logout, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
                  Storefront
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm font-medium text-slate-500">Welcome, {user?.name || 'User'}</span>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
