import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { cartApi } from '../api/cart.api';
import { usersApi } from '../api/users.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id || ''),
    enabled: !!id,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => usersApi.addToWishlist(id || ''),
    onSuccess: () => {
      toast.success('Saved to wishlist');
    },
    onError: () => {
      toast.error('Unable to save to wishlist');
    },
  });

  const handleAddToCart = async () => {
    if (!id) return;
    try {
      await cartApi.add({ productId: id, quantity });
      toast.success('Added to cart');
      navigate('/cart');
    } catch (error) {
      toast.error('Unable to add product to cart');
    }
  };

  if (productQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">
        Product not found.
      </div>
    );
  }

  const product = productQuery.data;
  const discountedPrice = product.price.toFixed(2);
  const mrpPrice = (product.price / (1 - product.discount / 100)).toFixed(2);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-8 rounded-3xl bg-white p-8 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
            <img src={product.images?.[0] || 'https://via.placeholder.com/700x700'} alt={product.title} className="h-full w-full object-cover" />
          </div>
          <div className="rounded-3xl border border-slate-200 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">{product.brand}</p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-900">{product.title}</h1>
            <p className="mt-4 text-sm text-slate-500">{product.category}</p>
            <div className="mt-6 flex items-center gap-4">
              <span className="text-3xl font-bold text-slate-900">${discountedPrice}</span>
              <span className="text-sm text-slate-500 line-through">${mrpPrice}</span>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                <p>Rating: {product.rating.toFixed(1)} / 5</p>
                <p>{product.stock > 0 ? 'In stock' : 'Out of stock'}</p>
              </div>
              <p className="text-sm text-slate-600">{product.description}</p>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="w-24 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  onClick={handleAddToCart}
                  className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => addToWishlistMutation.mutate()}
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
                >
                  Save to wishlist
                </button>
                <button
                  onClick={() => toast('Buy now flow not supported yet')}
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Product details</h2>
          <p className="mt-4 text-sm text-slate-600">This premium listing includes the brand, category, stock, rating, and rich product text for shoppers to engage with.</p>
        </div>
      </section>

      <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Unit price</span>
            <span>${discountedPrice}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Quantity</span>
            <span>{quantity}</span>
          </div>
          <div className="border-t border-slate-200 pt-4 text-lg font-semibold text-slate-900 flex items-center justify-between">
            <span>Total</span>
            <span>${(product.price * quantity).toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
