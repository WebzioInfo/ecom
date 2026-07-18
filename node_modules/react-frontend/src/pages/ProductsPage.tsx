import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { ProductCard } from '../components/ProductCard';
import { SectionHeader } from '../components/SectionHeader';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ListProductsParams, Product } from '../types';

const sortOptions = [
  { value: 'priceAsc', label: 'Price low to high' },
  { value: 'priceDesc', label: 'Price high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
];

export default function ProductsPage() {
  const [query, setQuery] = useState<ListProductsParams>({ page: 1, limit: 12 });
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [sortBy, setSortBy] = useState('priceAsc');
  const [inStock, setInStock] = useState(true);

  const filtersQuery = useQuery({
    queryKey: ['productFilters'],
    queryFn: productsApi.getFilters,
  });

  const productsQuery = useQuery<{
    data: Product[];
    meta: { total: number; page: number; limit: number; pages: number };
  }>({
    queryKey: ['productList', query, filterCategory, filterBrand, sortBy, search, inStock],
    queryFn: () => productsApi.list({
      ...query,
      search: search || undefined,
      category: filterCategory || undefined,
      brand: filterBrand || undefined,
      sortBy,
      inStock,
    }),
  });

  useEffect(() => {
    setQuery((current) => ({ ...current, page: 1 }));
  }, [filterCategory, filterBrand, search, sortBy, inStock]);

  const products = productsQuery.data?.data || [];

  const totalPages = productsQuery.data?.meta.pages || 1;

  return (
    <div className="space-y-12">
      <SectionHeader title="Shop products" subtitle="Discover premium items, filter by brand, category, price, and rating." />

      <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">Search</h3>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-600">Category</label>
              <select
                value={filterCategory}
                onChange={(event) => setFilterCategory(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">All categories</option>
                {filtersQuery.data?.categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-600">Brand</label>
              <select
                value={filterBrand}
                onChange={(event) => setFilterBrand(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">All brands</option>
                {filtersQuery.data?.brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-600">Sort by</label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <label className="inline-flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(event) => setInStock(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              In stock only
            </label>
          </div>
        </aside>

        <section className="space-y-6">
          {productsQuery.isLoading ? (
            <LoadingSpinner />
          ) : productsQuery.isError ? (
            <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">Unable to load products.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product: Product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">
              Showing {products.length} of {productsQuery.data?.meta.total || 0} products
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={query.page === 1}
                onClick={() => setQuery((current) => ({ ...current, page: Math.max(1, (current.page || 1) - 1) }))}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-slate-600">Page {query.page} of {totalPages}</span>
              <button
                disabled={query.page === totalPages}
                onClick={() => setQuery((current) => ({ ...current, page: Math.min(totalPages, (current.page || 1) + 1) }))}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
