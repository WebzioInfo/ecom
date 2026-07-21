import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { productsApi } from '../api/products.api';
import { Product, CreateProductPayload } from '../types';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ImageUpload from './ImageUpload';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  stock: z.coerce.number().int().min(0, 'Stock must be non-negative'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category required'),
  brand: z.string().min(1, 'Brand required'),
  images: z.array(z.string()).optional().default([]),
  rating: z.coerce.number().min(0).max(5).optional().default(0),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  featured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

type ProductFormInputs = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
  const navigate = useNavigate();
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInputs>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title ?? '',
      description: product?.description ?? '',
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      sku: product?.sku ?? `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      category: product?.category ?? '',
      brand: product?.brand ?? '',
      images: product?.images ?? [],
      rating: product?.rating ?? 0,
      discount: product?.discount ?? 0,
      featured: product?.featured ?? false,
      isActive: product?.isActive ?? true,
    },
  });

  const imagesWatch = watch('images') || [];

  const onSubmit = async (data: ProductFormInputs) => {
    const payload: CreateProductPayload = {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      stock: Number(data.stock),
      sku: data.sku,
      category: data.category,
      brand: data.brand,
      images: data.images ?? [],
      rating: Number(data.rating),
      discount: Number(data.discount),
      featured: Boolean(data.featured),
      isActive: Boolean(data.isActive),
    };

    try {
      if (isEdit && product) {
        await productsApi.update(product._id, payload);
        toast.success('Product updated');
      } else {
        await productsApi.create(payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save product');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-sm text-xs text-slate-200">
      <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit' : 'Create'} Product</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block font-medium text-slate-300">Title</label>
          <input
            type="text"
            {...register('title')}
            className="mt-1 block w-full rounded bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-300">SKU</label>
          <input
            type="text"
            {...register('sku')}
            className="mt-1 block w-full rounded bg-slate-800 border-slate-700 text-indigo-400 font-mono"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-300">Brand</label>
          <input
            type="text"
            {...register('brand')}
            className="mt-1 block w-full rounded bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-300">Category</label>
          <input
            type="text"
            {...register('category')}
            className="mt-1 block w-full rounded bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-300">Price</label>
          <input
            type="number"
            step="0.01"
            {...register('price')}
            className="mt-1 block w-full rounded bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block font-medium text-slate-300">Stock</label>
          <input
            type="number"
            {...register('stock')}
            className="mt-1 block w-full rounded bg-slate-800 border-slate-700 text-white"
          />
        </div>
      </div>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
        >
          {isEdit ? 'Update' : 'Create'} Product
        </button>
      </div>
    </form>
  );
}
