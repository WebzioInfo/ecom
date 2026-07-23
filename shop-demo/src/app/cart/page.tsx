/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ShoppingCart, Trash, CreditCard, Gift, CheckCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  id: string;
  title: string;
  sku: string;
  price: number;
  qty: number;
  brand: string;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<unknown | null>(null);

  const loadCart = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('shop_cart') || '[]');
      setCart(saved);
    } catch {}
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQty = (id: string, delta: number) => {
    const updated = cart.map((item) => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return { ...item, qty: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    setCart(updated);
    localStorage.setItem('shop_cart', JSON.stringify(updated));
  };

  const removeItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem('shop_cart', JSON.stringify(updated));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    try {
      // Validate coupon code against storefront public endpoint
      const res = await api.post('/marketing/coupons/validate', { code: couponCode });
      setDiscountPercent(res.data.value || 10);
      alert('Coupon code applied successfully!');
    } catch (err: unknown) {
      alert(`Invalid Coupon Code: ${err.response?.data?.message || err.message}`);
    }
    setCouponLoading(false);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    const data = new FormData(e.target as HTMLFormElement);

    try {
      // Submit storefront order placement
      const res = await api.post('/orders', {
        customerName: data.get('name'),
        customerEmail: data.get('email'),
        shippingAddress: data.get('address'),
        couponCode: couponCode || undefined,
        items: cart.map((item) => ({
          sku: item.sku || `SKU_${item.id.substring(0, 5)}`,
          quantity: item.qty,
        })),
      });

      setOrderReceipt(res.data);
      setCart([]);
      localStorage.setItem('shop_cart', JSON.stringify([]));
    } catch (err: unknown) {
      alert(`Checkout failed: ${err.response?.data?.message || err.message}`);
    }
    setCheckoutLoading(false);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal - discountAmount;

  if (orderReceipt) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center space-y-6 animate-fade-in">
        <div className="flex justify-center text-emerald-500">
          <CheckCircle className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Order Placed Successfully!</h2>
        <p className="text-zinc-500 text-sm">
          Thank you for your purchase. Your order registry record has been persisted isolated inside the schema.
        </p>

        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-left font-mono text-xs space-y-2">
          <div><span className="text-zinc-400">Order ID:</span> <span className="text-zinc-800 dark:text-zinc-200 font-bold">{orderReceipt.id}</span></div>
          <div><span className="text-zinc-400">Customer:</span> {orderReceipt.customerName}</div>
          <div><span className="text-zinc-400">Recipient Email:</span> {orderReceipt.customerEmail}</div>
          <div><span className="text-zinc-400">Shipping:</span> {orderReceipt.shippingAddress}</div>
          <div className="border-t border-zinc-250 dark:border-zinc-850 pt-2 mt-2 flex justify-between font-bold">
            <span className="text-zinc-400">Total Charge:</span>
            <span className="text-indigo-500">${orderReceipt.total}</span>
          </div>
        </div>

        <div className="pt-4">
          <Link href="/" className="inline-block bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold px-6 py-2.5 rounded-lg text-xs uppercase">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="premium-card rounded-2xl p-5 flex justify-between items-center text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-bold font-mono">{item.brand}</span>
                <Link href={`/products/${item.id}`} className="block font-bold text-zinc-800 dark:text-zinc-200 hover:underline">
                  {item.title}
                </Link>
                <span className="text-zinc-500 font-mono">${item.price} each</span>
              </div>

              <div className="flex items-center gap-6">
                {/* Quantity triggers */}
                <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900">
                  <button onClick={() => updateQty(item.id, -1)} className="px-2.5 py-1 text-zinc-500 hover:text-zinc-700">-</button>
                  <span className="px-3 font-bold font-mono text-zinc-800 dark:text-zinc-200">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="px-2.5 py-1 text-zinc-500 hover:text-zinc-700">+</button>
                </div>

                <span className="font-mono font-bold text-zinc-850 dark:text-zinc-200">${(item.price * item.qty).toFixed(2)}</span>

                <button onClick={() => removeItem(item.id)} className="text-rose-500 hover:text-rose-400 p-1">
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="text-center py-20 bg-zinc-100 dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800">
              <ShoppingCart className="w-12 h-12 text-zinc-400 opacity-40 mx-auto mb-4" />
              <p className="text-zinc-500 text-sm font-semibold">Your shopping cart is empty</p>
              <Link href="/" className="text-indigo-500 text-xs hover:underline mt-2 inline-block">
                Browse catalog listings
              </Link>
            </div>
          )}
        </div>

        {/* Pricing calculations and checkout details */}
        {cart.length > 0 && (
          <div className="space-y-6">
            
            <div className="glass-panel p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="font-bold text-base border-b border-zinc-200 dark:border-zinc-800 pb-3">Checkout Receipt</h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-550 dark:text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">${subtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-500 font-mono">
                    <span>Promo Applied:</span>
                    <span>-${discountAmount.toFixed(2)} (-{discountPercent}%)</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-zinc-200 dark:border-zinc-800 pt-3 text-sm">
                  <span>Grand Total:</span>
                  <span className="font-mono text-indigo-500 text-base">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon validator */}
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="PROMO CODE"
                  className="premium-input font-mono uppercase text-xs flex-grow"
                />
                <button 
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold rounded-lg disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Customer checkout details form */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h3 className="font-bold text-base border-b border-zinc-200 dark:border-zinc-800 pb-3">Billing & Shipping</h3>
              <form onSubmit={handleCheckout} className="space-y-3">
                <input name="name" placeholder="Full Name" required className="premium-input w-full text-xs" />
                <input name="email" type="email" placeholder="Email Address" required className="premium-input w-full text-xs" />
                <input name="address" placeholder="Shipping Address" required className="premium-input w-full text-xs" />
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/10"
                >
                  <CreditCard className="w-4 h-4" />
                  {checkoutLoading ? 'Processing transaction...' : 'Submit Order'}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
