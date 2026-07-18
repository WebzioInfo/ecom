import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SectionHeader } from '../components/SectionHeader';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function LandingPage() {
  const featuredQuery = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: productsApi.getFeatured,
  });

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-indigo-950 px-6 py-20 text-white shadow-2xl sm:px-10 md:px-16">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.35),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.35),_transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-8">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Premium storefront</p>
              <h1 className="text-5xl font-semibold leading-tight sm:text-6xl">
                The modern commerce experience for every product, customer, and brand.
              </h1>
              <p className="max-w-2xl text-lg text-slate-200/90">
                Build trust with shoppers through premium design, fast search, smart recommendations,
                and a checkout flow built for conversion.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Shop now
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Seller login
                </Link>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
              <div className="grid gap-4">
                <div className="rounded-3xl bg-slate-950/90 p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.35em] text-sky-300">Hot deal</p>
                  <h2 className="mt-4 text-3xl font-semibold">Flash sale on select styles</h2>
                  <p className="mt-2 text-sm text-slate-300">Save up to 40% when you checkout in the next 24 hours.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white p-5 text-slate-950 shadow-xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Fast shipping</p>
                    <p className="mt-3 text-sm text-slate-600">Delivered across the country in under 48 hours.</p>
                  </div>
                  <div className="rounded-3xl bg-white p-5 text-slate-950 shadow-xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Secure checkout</p>
                    <p className="mt-3 text-sm text-slate-600">Checkout through WhatsApp order flow with order review.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Featured products"
          subtitle="Handpicked items for shoppers who want modern, premium products."
        />

        {featuredQuery.isLoading ? (
          <LoadingSpinner />
        ) : featuredQuery.isError ? (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">Unable to load products.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredQuery.data?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
