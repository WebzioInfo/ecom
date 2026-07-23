import React, { useEffect, useState } from 'react';
import { productsApi } from '../api/products.api';
import { Product } from '../types';
import { useTenantStore } from '../store/useTenantStore';
import { Plus, Search, Package, Trash2, Edit3, Tag, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function AdminProductsPage() {
  const { activeStore } = useTenantStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({ search, limit: 50 });
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search, activeStore]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.remove(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Product Catalog</h1>
          <p className="text-xs text-slate-400">Manage SKUs, Multi-Variants, Inventory & Media for <span className="text-indigo-400">{activeStore?.name}</span></p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3.5">Product Info</th>
              <th className="p-3.5">SKU</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Price</th>
              <th className="p-3.5">Stock</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500">
                  No products found for this store. Click "Add Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">{p.title}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-xs">{p.description}</p>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-indigo-400">{p.sku || 'N/A'}</td>
                  <td className="p-3.5 text-slate-400">{p.category}</td>
                  <td className="p-3.5 font-bold text-emerald-400">${p.price}</td>
                  <td className="p-3.5">
                    <span className={`font-semibold ${p.stock < 10 ? 'text-rose-400' : 'text-slate-300'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${p.isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                      {p.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => navigate(`/admin/products/${p._id}/edit`)}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="p-1.5 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
