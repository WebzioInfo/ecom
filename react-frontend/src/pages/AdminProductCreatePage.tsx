import React, { useState } from 'react';
import { productsApi } from '../api/products.api';
import { useTenantStore } from '../store/useTenantStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminProductCreatePage() {
  const { activeStore } = useTenantStore();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(100);
  const [sku, setSku] = useState(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
  const [category, setCategory] = useState('Electronics');
  const [brand, setBrand] = useState('Generic');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productsApi.create({
        storeId: activeStore?._id,
        title,
        description,
        price: Number(price),
        stock: Number(stock),
        sku,
        category,
        brand,
        images: imageUrl ? [imageUrl] : [],
        isActive: true,
      });
      toast.success('Product created successfully');
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/products')} className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Add New Product</h1>
          <p className="text-xs text-slate-400">Add a simple or variant product to <span className="text-indigo-400">{activeStore?.name}</span> catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Product Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Wireless Noise-Canceling Headphones"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
          <textarea
            rows={3}
            required
            placeholder="High-fidelity audio headphones with active noise cancellation..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Stock Quantity</label>
            <input
              type="number"
              required
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">SKU</label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-indigo-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
            <input
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Brand</label>
            <input
              type="text"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Main Image URL</label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}
