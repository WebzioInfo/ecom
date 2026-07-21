import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ProductForm from '../components/ProductForm';

export default function AdminProductEditPage() {
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
    <div className="space-y-6 p-8">
      <ProductForm product={product} />
    </div>
  );
}
