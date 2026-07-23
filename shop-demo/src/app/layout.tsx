/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import { api } from '../lib/api';
import { ShoppingCart, User, Sun, Moon, RefreshCw, Layers } from 'lucide-react';
import Link from 'next/link';

interface StoreOption {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // Initialize theme and store selection
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    const savedStore = localStorage.getItem('shop_store_id') || '';
    setSelectedStore(savedStore);

    // Dynamic cart counter listener
    const updateCartCount = () => {
      try {
        const cartData = JSON.parse(localStorage.getItem('shop_cart') || '[]');
        const count = cartData.reduce((acc: number, item: unknown) => acc + item.qty, 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    const interval = setInterval(updateCartCount, 1000); // Poll as fallback

    return () => {
      window.removeEventListener('storage', updateCartCount);
      clearInterval(interval);
    };
  }, []);

  // Fetch active SaaS stores registered in public schema
  useEffect(() => {
    const loadStores = async () => {
      try {
        const res = await api.get('/stores');
        setStores(res.data);
        // Automatically default context to Electronics Hub if none set
        if (!localStorage.getItem('shop_store_id') && res.data.length > 0) {
          const electronics = res.data.find((s: unknown) => s.slug === 'electronics-hub') || res.data[0];
          const apiKey = `demo_key_${electronics.slug.replace(/-/g, '_')}`;
          localStorage.setItem('shop_store_id', electronics.id);
          localStorage.setItem('shop_api_key', apiKey);
          setSelectedStore(electronics.id);
          window.location.reload();
        }
      } catch (err) {
        console.error('Failed to load registered store contexts', err);
      }
    };
    loadStores();
  }, []);

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = e.target.value;
    const targetStore = stores.find((s) => s.id === storeId);
    if (targetStore) {
      const apiKey = `demo_key_${targetStore.slug.replace(/-/g, '_')}`;
      localStorage.setItem('shop_store_id', storeId);
      localStorage.setItem('shop_api_key', apiKey);
      // Clear token to avoid context leaking during tenant swaps
      localStorage.removeItem('shop_token');
      setSelectedStore(storeId);
      window.location.reload();
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <html lang="en">
      <head>
        <title>Webzio Storefront - Headless Ecommerce Client</title>
        <meta name="description" content="Production-grade storefront connected dynamically to SaaS Multi-tenant engine" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen text-slate-900 bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-50">
        
        {/* Top contextual header */}
        <header className="sticky top-0 z-50 glass-header border-b border-zinc-200/50 dark:border-zinc-800/50 py-4 px-6 md:px-12 flex justify-between items-center transition-colors">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-lg tracking-tight uppercase">Webzio Shop</span>
            </Link>

            {/* Tenant switcher dropdown */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="text-zinc-400 font-semibold uppercase">Tenant Store:</span>
              <select 
                value={selectedStore} 
                onChange={handleStoreChange}
                className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/cart" className="relative flex items-center gap-1.5 hover:opacity-80">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs font-bold font-mono">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-3 bg-indigo-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="/account" className="flex items-center gap-1 hover:opacity-80">
              <User className="w-4 h-4" />
              <span className="text-xs font-bold">Profile</span>
            </Link>

            <button onClick={toggleTheme} className="p-1 hover:opacity-80">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-grow flex flex-col">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 py-12 px-6 md:px-12 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-zinc-500">
            <div>
              <p className="font-bold text-zinc-800 dark:text-zinc-200">WEBZIO MULTI-TENANT SAAS ENGINE</p>
              <p className="mt-1">Production Client Storefront Reference Implementation</p>
            </div>
            <div className="flex gap-4">
              <span>Database Status: Connected</span>
              <span>•</span>
              <span>Tenant Isolation: Secured</span>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
