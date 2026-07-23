/* eslint-disable */
'use client';

import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call standard auth register
      await api.post('/auth/register', { name, email, password });
      alert('Registration successful! Please login.');
      window.location.href = '/login';
    } catch (err: unknown) {
      alert(`Registration failed: ${err.response?.data?.message || err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20 flex flex-col justify-center space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Customer Profile</h2>
        <p className="text-xs text-zinc-500">Register to track and manage isolated storefront orders</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name" 
              required 
              className="premium-input pl-11 w-full text-xs" 
            />
          </div>
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
            className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Submitting registration...' : 'Create Account'}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-zinc-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-500 hover:underline font-bold">
          Log in
        </Link>
      </p>
    </div>
  );
}
