import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { RegisterPayload } from '../types';

export default function Register() {
  const navigate = useNavigate();
  const { registerMutation } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ name, email, password }, {
      onSuccess: () => {
        toast.success('Account created successfully. Please log in.');
        navigate('/login');
      },
      onError: () => {
        toast.error('Could not create account. Please try again.');
      },
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-[2rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold text-slate-900">Create your Commerce Pro account</h2>
          <p className="text-sm text-slate-500">Secure signup for customers and team members.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {registerMutation.isError && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
              Registration failed.
            </div>
          )}
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
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
            disabled={registerMutation.isPending}
            className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
