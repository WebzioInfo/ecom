import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function AdminProductsPage() {
  const productsQuery = useQuery({
    queryKey: ['adminProducts'],
    queryFn: () => productsApi.list({ limit: 50 }),
  });

  if (productsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (productsQuery.isError) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">Unable to load products.</div>
    );
  }

  const products = productsQuery.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Product catalog</h1>
        <p className="mt-2 text-sm text-slate-500">Edit and manage product listings from a single view.</p>
      </div>
      <div className="grid gap-6">
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/admin/products/${product._id}`}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">{product.title}</p>
                <p className="text-sm text-slate-500">{product.brand} · {product.category}</p>
              </div>
              <span className="text-sm font-semibold text-indigo-600">${product.price.toFixed(2)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
