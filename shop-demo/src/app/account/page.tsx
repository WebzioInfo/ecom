/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useRouter } from 'next/navigation';
import { User, LogOut, Heart, FileText, Settings, Key, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  total: number;
  status: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  brand: string;
}

export default function Account() {
  const router = useRouter();
  const [user, setUser] = useState<unknown | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAccountData = async () => {
    const token = localStorage.getItem('shop_token');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // Parse local user context
      const userData = JSON.parse(localStorage.getItem('shop_user') || '{}');
      setUser(userData);

      // Fetch customer orders in current schema
      const ordersRes = await api.get('/orders');
      setOrders(ordersRes.data || []);

      // Filter catalog products matching saved wishlist ids
      const savedWish = JSON.parse(localStorage.getItem('shop_wishlist') || '[]');
      if (savedWish.length > 0) {
        const prodRes = await api.get('/storefront/v1/products');
        const list: Product[] = prodRes.data.data || [];
        setWishlistProducts(list.filter((p) => savedWish.includes(p.id)));
      }
    } catch (err) {
      console.error('Failed to load user account stats', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAccountData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('shop_token');
    localStorage.removeItem('shop_user');
    alert('Logged out successfully!');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <RefreshCw className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-10 animate-fade-in">
      
      {/* Profile summary header */}
      <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{user.name || 'Account User'}</h2>
            <span className="text-xs text-zinc-400 font-mono">{user.email}</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 border border-rose-900/35 hover:bg-rose-950/20 text-rose-500 rounded-xl text-xs font-bold"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Orders History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Your Order History
          </h3>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {orders.map((o) => (
              <div key={o.id} className="premium-card rounded-2xl p-5 text-xs flex justify-between items-start">
                <div className="space-y-1">
                  <span className="font-mono font-bold text-zinc-850 dark:text-zinc-100 block">Order ID: {o.id}</span>
                  <p className="text-zinc-550 dark:text-zinc-400">Shipped to: {o.shippingAddress}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-50 text-sm block">${o.total}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 bg-emerald-950 text-emerald-400 font-bold font-mono rounded mt-1 inline-block">
                    {o.status || 'PAID'}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-zinc-500 py-10 text-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                You have not placed unknown orders yet.
              </p>
            )}
          </div>
        </div>

        {/* Wishlisted items summary */}
        <div className="space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            Your Wishlist
          </h3>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {wishlistProducts.map((p) => (
              <div key={p.id} className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase font-mono font-bold">{p.brand}</span>
                  <Link href={`/products/${p.id}`} className="font-semibold block text-zinc-800 dark:text-zinc-200 hover:underline">
                    {p.title}
                  </Link>
                </div>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">${p.price}</span>
              </div>
            ))}
            {wishlistProducts.length === 0 && (
              <p className="text-zinc-550 text-center py-8 bg-zinc-100 dark:bg-zinc-900 rounded-2xl text-xs">Wishlist is empty.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
