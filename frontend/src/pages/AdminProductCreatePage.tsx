import React, { useState, useEffect } from 'react';
import { productsApi } from '../api/products.api';
import { useTenantStore } from '../store/useTenantStore';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Package, Sparkles, Layers, Tag, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminProductCreatePage() {
  const { activeStore } = useTenantStore();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  // Core Details
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');

  // Pricing & Inventory
  const [price, setPrice] = useState(0);
  const [offerPrice, setOfferPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [stock, setStock] = useState(50);
  const [minStock, setMinStock] = useState(5);

  // Specifications & Tax
  const [weight, setWeight] = useState(0.5);
  const [length, setLength] = useState(10);
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(5);
  const [tax, setTax] = useState(18);

  // Media & SEO
  const [mainImage, setMainImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string>('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [tags, setTags] = useState('electronics, pro');

  // Status & Settings
  const [status, setStatus] = useState('PUBLISHED');
  const [featured, setFeatured] = useState(false);

  // Categories list
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCategories = async () => {
    try {
      const res = await productsApi.getCategoriesDropdown();
      setCategoriesList(res || []);
    } catch {
      productsApi.getCategories()
        .then((res) => setCategoriesList(res.flat || []))
        .catch(() => {});
    }
  };

  useEffect(() => {
    refreshCategories();

    if (isEdit && id) {
      setLoading(true);
      productsApi.getById(id)
        .then((p: any) => {
          setTitle(p.title || '');
          setSku(p.sku || '');
          setBarcode(p.barcode || '');
          setCategory(p.category || '');
          setBrand(p.brand || '');
          setDescription(p.description || '');
          setShortDescription(p.shortDescription || '');
          setPrice(p.price || 0);
          setOfferPrice(p.offerPrice || 0);
          setCostPrice(p.costPrice || 0);
          setStock(p.stock || 0);
          setMinStock(p.minStock || 5);
          setWeight(p.weight || 0);
          if (p.dimensions) {
            setLength(p.dimensions.length || 0);
            setWidth(p.dimensions.width || 0);
            setHeight(p.dimensions.height || 0);
          }
          setTax(p.tax || 0);
          setMainImage(p.images?.[0] || '');
          setGalleryImages(p.images?.slice(1).join(', ') || '');
          setSeoTitle(p.seoTitle || '');
          setSeoDescription(p.seoDescription || '');
          setTags(p.tags?.join(', ') || '');
          setStatus(p.status || (p.isActive ? 'PUBLISHED' : 'DRAFT'));
          setFeatured(Boolean(p.featured));
        })
        .catch(() => toast.error('Failed to load product details'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (targetStatus?: string) => {
    if (!title.trim()) return toast.error('Product Title is required');
    if (!description.trim()) return toast.error('Description is required');

    const selectedStatus = targetStatus || status;
    const imagesList = mainImage ? [mainImage, ...galleryImages.split(',').map(s => s.trim()).filter(Boolean)] : [];

    const payload = {
      title,
      sku,
      barcode,
      category: category || 'General',
      brand: brand || 'Generic',
      description,
      shortDescription,
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      stock: Number(stock),
      minStock: Number(minStock),
      weight: Number(weight),
      dimensions: { length: Number(length), width: Number(width), height: Number(height) },
      tax: Number(tax),
      images: imagesList,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || shortDescription || description.slice(0, 150),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status: selectedStatus,
      featured,
      isActive: selectedStatus === 'PUBLISHED',
    };

    try {
      if (isEdit && id) {
        await productsApi.update(id, payload);
        toast.success('Product updated successfully');
      } else {
        await productsApi.create(payload);
        toast.success('Product created successfully');
      }
      navigate('/store/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading product editor...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/store/products')}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-400" /> {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-slate-400">
              Manage product details, pricing, inventory matrix, and SEO for <span className="text-indigo-400 font-semibold">{activeStore?.name}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('PUBLISHED')}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Save className="w-4 h-4" /> {isEdit ? 'Update & Publish' : 'Publish Product'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN FORM CONTENT (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          {/* GENERAL INFO */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" /> General Information
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose Category --</option>
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                  <option value="Electronics">Electronics</option>
                  <option value="Laptops">Laptops & Computers</option>
                  <option value="Apparel">Apparel & Fashion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Sony, Apple"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Short Summary</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief one-line summary for listing cards..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Product Description *</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed specifications, features, warranty terms..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* PRICING & INVENTORY */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Pricing & Inventory Matrix
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Regular Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-bold text-emerald-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sale / Offer Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">SKU Code</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-indigo-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Barcode / EAN</label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="890123456..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Stock *</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Min Alert Stock</label>
                <input
                  type="number"
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-amber-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* MEDIA & IMAGES */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Product Media & Gallery</h3>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Main Cover Image URL</label>
              <input
                type="text"
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Gallery Image URLs (Comma separated)</label>
              <textarea
                rows={2}
                value={galleryImages}
                onChange={(e) => setGalleryImages(e.target.value)}
                placeholder="https://img1.com, https://img2.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* SIDEBAR PARAMETERS (1 COL) */}
        <div className="space-y-6">
          {/* PUBLICATION STATUS */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Status & Visibility</h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Publishing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-indigo-400 focus:border-indigo-500 focus:outline-none"
              >
                <option value="PUBLISHED">Published (Live)</option>
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-300">Featured Product</span>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* SHIPPING & TAX */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 shadow-xl text-xs">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Shipping & Tax Rates</h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Tax / GST (%)</label>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="text-slate-400 block mb-1">L (cm)</label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">W (cm)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">H (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-white"
                />
              </div>
            </div>
          </div>

          {/* SEO & METADATA */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Search Engine Optimization</h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Meta Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="SEO page title..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tags (Comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-indigo-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
