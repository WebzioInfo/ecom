import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { cartApi } from '../api/cart.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCartStore } from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const { cart } = useCartStore();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.get,
  });

  const createOrderMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: (data) => {
      window.location.href = data.whatsappUrl;
    },
    onError: () => {
      toast.error('Unable to place order.');
    },
  });

  if (cartQuery.isLoading) {
    return <LoadingSpinner />;
  }

  const items = cart?.items || cartQuery.data?.items || [];
  const subtotal = items.reduce((sum, item) => sum + Number((item.product as any).price || 0) * item.quantity, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Checkout</h1>
        <div className="mt-8 grid gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Full name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Shipping address</label>
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              rows={4}
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Notes</label>
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={() => createOrderMutation.mutate({
              items: items.map((item) => ({
                productId: (item.product as any)._id || item.product,
                quantity: item.quantity,
                priceAtPurchase: (item.product as any).price || 0,
              })),
              customerName: name,
              shippingAddress: address,
              phone,
              paymentMethod: 'whatsapp',
              returnUrl: window.location.href,
            })}
            className="mt-6 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Place order via WhatsApp
          </button>
        </div>
      </section>

      <aside className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={(item.product as any)._id || item.product} className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-700">{(item.product as any).title}</span>
              <span className="text-sm font-semibold text-slate-900">${(((item.product as any).price || 0) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span>Shipping</span>
            <span>$5.00</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span>Tax</span>
            <span>$2.50</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-lg font-semibold text-slate-900">
            <span>Total</span>
            <span>${(subtotal + 7.5).toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
