import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../api/cart.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'react-hot-toast';
import { CartState } from '../types';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, setCart } = useCartStore();

  const cartQuery = useQuery<CartState>({
    queryKey: ['cart'],
    queryFn: cartApi.get,
  });

  const updateMutation = useMutation({
    mutationFn: cartApi.update,
    onSuccess: (data) => {
      setCart(data);
      toast.success('Cart updated');
    },
  });

  const removeMutation = useMutation({
    mutationFn: cartApi.remove,
    onSuccess: (data) => {
      setCart(data);
      toast.success('Item removed');
    },
  });

  useEffect(() => {
    if (cartQuery.data) {
      setCart(cartQuery.data);
    }
  }, [cartQuery.data, setCart]);

  if (cartQuery.isPending) {
    return <LoadingSpinner />;
  }

  if (cartQuery.isError) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">Could not load cart.</div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">
        Your cart is empty.
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => sum + Number((item.product as any).price || 0) * item.quantity, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Shopping cart</h1>
        {cart.items.map((item) => (
          <div key={(item.product as any)._id || item.product} className="grid gap-4 rounded-3xl border border-slate-200 p-5 sm:grid-cols-[1fr_0.35fr]">
            <div className="flex items-center gap-4">
              <img
                src={(item.product as any).images?.[0] || 'https://via.placeholder.com/120'}
                alt={(item.product as any).title || 'Product'}
                className="h-24 w-24 rounded-3xl object-cover"
              />
              <div>
                <p className="text-lg font-semibold text-slate-900">{(item.product as any).title}</p>
                <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                <button
                  onClick={() => removeMutation.mutate((item.product as any)._id || item.product)}
                  className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="space-y-3 text-right">
              <p className="text-lg font-semibold text-slate-900">${((item.product as any).price || 0 * item.quantity).toFixed(2)}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  onClick={() => updateMutation.mutate({ productId: (item.product as any)._id || item.product, quantity: item.quantity + 1 })}
                >
                  +
                </button>
                <button
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  onClick={() => updateMutation.mutate({ productId: (item.product as any)._id || item.product, quantity: Math.max(1, item.quantity - 1) })}
                >
                  -
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <aside className="space-y-6 rounded-3xl bg-white p-8 shadow-sm">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Items</span>
            <span>{cart.items.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          Continue to checkout
        </button>
      </aside>
    </div>
  );
}
