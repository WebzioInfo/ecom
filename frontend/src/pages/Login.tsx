import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { LoginPayload } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const { loginMutation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeSlug, setStoreSlug] = useState('');

  // Check if we already have a subdomain determining the store slug
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  const hasSubdomain = parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'app' && parts[0] !== 'admin';

  const onSuccess = (data: any) => {
    toast.success('Welcome back!');
    const userRole = (data.user?.role || data.user?.roles?.[0] || '').toUpperCase();
    if (data.user?.isSuperAdmin || userRole === 'SUPER_ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/store/dashboard');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password, storeSlug: storeSlug || undefined }, {
      onSuccess,
      onError: (err: any) => {
        const msg = err.response?.data?.message;
        toast.error(Array.isArray(msg) ? msg.join(', ') : (msg || 'Invalid credentials'));
      }
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-[2rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold text-slate-900">Sign in to Commerce Pro</h2>
          <p className="text-sm text-slate-500">Secure access for shoppers and store managers.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {loginMutation.isError && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
              {(() => {
                const err: any = loginMutation.error;
                const msg = err?.response?.data?.message;
                if (Array.isArray(msg)) return msg.join(', ');
                return msg || 'Invalid credentials.';
              })()}
            </div>
          )}
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            {!hasSubdomain && (
              <div>
                <label htmlFor="storeSlug" className="block text-sm font-medium text-slate-700">
                  Workspace Slug <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="storeSlug"
                  type="text"
                  value={storeSlug}
                  onChange={(event) => setStoreSlug(event.target.value)}
                  placeholder="e.g. acme-corp"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500">
          New user?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Create an account
          </Link>
        </p>
        <div className="mt-4 border-t border-slate-100 pt-4 text-center">
          <Link to="/super-admin/login" className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
            Access Super Admin Portal &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
