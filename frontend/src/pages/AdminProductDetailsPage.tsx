import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function AdminProductDetailsPage() {
  const { id } = useParams();

  const productQuery = useQuery({
    queryKey: ['adminProduct', id],
    queryFn: () => productsApi.getById(id || ''),
    enabled: !!id,
  });

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

  return (
    <div className="space-y-8 rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{product.title}</h1>
          <p className="text-sm text-slate-500">{product.brand} • {product.category}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <img src={product.images?.[0] || 'https://via.placeholder.com/700x400'} alt={product.title} className="w-full rounded-3xl object-cover" />
          <div className="rounded-3xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Description</h2>
            <p className="mt-3 text-sm text-slate-600">{product.description}</p>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div>
            <p className="text-sm text-slate-500">Price</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">${product.price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Stock</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{product.stock}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Rating</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{product.rating.toFixed(1)}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
