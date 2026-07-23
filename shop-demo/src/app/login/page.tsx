/* eslint-disable */
'use client';

import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { LogIn, Key, Mail, Lock } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('manager@electronics.com');
  const [password, setPassword] = useState('SecurePass123!');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call standard auth login
      const res = await api.post('/auth/login', { email, password });
      
      // Save context
      localStorage.setItem('shop_token', res.data.access_token);
      localStorage.setItem('shop_user', JSON.stringify(res.data.user || { email, role: 'MEMBER' }));
      
      alert('Logged in successfully!');
      router.push('/account');
    } catch (err: any) {
      alert(`Login failed: ${err.response?.data?.message || err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20 flex flex-col justify-center space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Access Your Account</h2>
        <p className="text-xs text-zinc-500">Sign in to manage your isolated profile and orders</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4">
        
        {/* Predefined credentials helper */}
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-[11px] text-zinc-500 space-y-1">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">Quick Test Credentials:</span>
          <div>Electronics Hub Manager: <code className="text-indigo-500">manager@electronics.com</code> / <code className="text-indigo-500">SecurePass123!</code></div>
          <div>Urban Apparel Manager: <code className="text-indigo-500">manager@apparel.com</code> / <code className="text-indigo-500">SecurePass123!</code></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address" 
              required 
              className="premium-input pl-11 w-full text-xs" 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              required 
              className="premium-input pl-11 w-full text-xs" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-zinc-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-500 hover:underline font-bold">
          Register now
        </Link>
      </p>
    </div>
  );
}
