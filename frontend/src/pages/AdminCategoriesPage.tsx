import React, { useState, useEffect } from 'react';
import { productsApi } from '../api/products.api';
import { uploadFile } from '../api/uploads.api';
import { useTenantStore } from '../store/useTenantStore';
import {
  Plus,
  FolderTree,
  Edit3,
  Trash2,
  ChevronRight,
  Layers,
  Tag,
  Search,
  RefreshCw,
  Sparkles,
  Package,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  SlidersHorizontal,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const { activeStore } = useTenantStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [tree, setTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DELETED'>('ALL');

  // Modal Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [image, setImage] = useState('');
  const [banner, setBanner] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const flatRes = await productsApi.getCategories();
      const treeRes = await productsApi.getCategoriesTree();
      setCategories(Array.isArray(flatRes) ? flatRes : []);
      setTree(Array.isArray(treeRes) ? treeRes : []);
    } catch {
      toast.error('Failed to load category catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setParentId('');
    setImage('');
    setBanner('');
    setSeoTitle('');
    setSeoDescription('');
    setSortOrder(0);
    setFeatured(false);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setDescription(cat.description || '');
    setParentId(cat.parentId || '');
    setImage(cat.image || '');
    setBanner(cat.banner || '');
    setSeoTitle(cat.seoTitle || '');
    setSeoDescription(cat.seoDescription || '');
    setSortOrder(cat.sortOrder || 0);
    setFeatured(Boolean(cat.featured));
    setIsActive(cat.isActive !== false);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Category name is required');

    setSubmitting(true);
    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description,
      parentId: parentId || null,
      image,
      banner,
      seoTitle,
      seoDescription,
      sortOrder: Number(sortOrder),
      featured,
      isActive,
    };

    try {
      if (editingId) {
        await productsApi.updateCategory(editingId, payload);
        toast.success('Category updated successfully');
      } else {
        await productsApi.createCategory(payload);
        toast.success('Category created successfully');
      }
      fetchCategories();

      if (addAnother && !editingId) {
        setName('');
        setSlug('');
        setDescription('');
        setParentId('');
        setImage('');
        setBanner('');
        setSeoTitle('');
        setSeoDescription('');
        setSortOrder(0);
        setFeatured(false);
      } else {
        setShowModal(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to soft-delete this category?')) return;
    try {
      await productsApi.deleteCategory(id);
      toast.success('Category soft-deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await productsApi.restoreCategory(id);
      toast.success('Category restored');
      fetchCategories();
    } catch {
      toast.error('Failed to restore category');
    }
  };

  // Filter Categories
  const filteredCategories = categories.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
                          c.slug?.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'ACTIVE') return matchesSearch && !c.isDeleted && c.isActive;
    if (statusFilter === 'DELETED') return matchesSearch && c.isDeleted;
    return matchesSearch;
  });

  const parentMap = new Map<string, string>();
  categories.forEach((c) => parentMap.set(c.id, c.name));

  const totalCategories = categories.filter(c => !c.isDeleted).length;
  const rootCategories = categories.filter(c => !c.parentId && !c.isDeleted).length;
  const subCategories = totalCategories - rootCategories;
  const activeCount = categories.filter(c => c.isActive && !c.isDeleted).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-indigo-400" /> Category Management
          </h1>
          <p className="text-xs text-slate-400">
            Build hierarchical catalog taxonomy, parent-child groups & SEO metadata for <span className="text-indigo-400 font-semibold">{activeStore?.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Taxonomy"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Categories</p>
            <p className="text-xl font-bold text-white">{totalCategories}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Root Categories</p>
            <p className="text-xl font-bold text-white">{rootCategories}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Sub-Categories</p>
            <p className="text-xl font-bold text-white">{subCategories}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Active Live</p>
            <p className="text-xl font-bold text-emerald-400">{activeCount}</p>
          </div>
        </div>
      </div>

      {/* FILTER & CONTROL BAR */}
      <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DELETED">Soft-Deleted</option>
          </select>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${viewMode === 'tree' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Tree Hierarchy
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl p-4 space-y-4">
          <div className="h-10 bg-slate-800/50 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-slate-800/30 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-slate-800/30 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-slate-800/30 rounded-xl animate-pulse"></div>
          <div className="h-12 bg-slate-800/30 rounded-xl animate-pulse"></div>
        </div>
      ) : viewMode === 'tree' ? (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <FolderTree className="w-4 h-4 text-indigo-400" /> Interactive Category Hierarchy Tree
          </h3>
          {tree.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No categories created yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {tree.map((node) => (
                <TreeNode key={node.id} node={node} onEdit={openEditModal} onDelete={handleDelete} onRestore={handleRestore} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Category</th>
                <th className="p-4">Parent Category</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Products</th>
                <th className="p-4">Sort</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No matching categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => (
                  <tr key={c.id} className={`hover:bg-slate-800/40 transition ${c.isDeleted ? 'opacity-60 bg-rose-500/5' : ''}`}>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-700">
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <Tag className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs flex items-center gap-1.5">
                          {c.name}
                          {c.featured && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                              Featured
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate max-w-xs">{c.description || 'No description'}</p>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-400">
                      {c.parentId && parentMap.has(c.parentId) ? (
                        <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                          {parentMap.get(c.parentId)}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Root Category</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-indigo-400">{c.slug}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 font-bold text-indigo-400 text-xs">
                        {c.productCount || 0} Products
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{c.sortOrder || 0}</td>
                    <td className="p-4">
                      {c.isDeleted ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border bg-rose-500/10 border-rose-500/30 text-rose-400">
                          Deleted
                        </span>
                      ) : c.isActive ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border bg-amber-500/10 border-amber-500/30 text-amber-400">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition"
                        title="Edit Category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {c.isDeleted ? (
                        <button
                          onClick={() => handleRestore(c.id)}
                          className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition"
                          title="Restore Category"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
                          title="Soft Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden space-y-4">
            {/* MODAL HEADER */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-400" />
                  {editingId ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-xs text-slate-400">Define taxonomy parameters & SEO tags</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={(e) => handleSave(e, false)} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Mens Footwear"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Slug (Auto Generated)</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-indigo-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Parent Category</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- None (Top Level Root) --</option>
                    {categories
                      .filter((c) => c.id !== editingId && !c.isDeleted)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Category overview & listing details..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cover Image (Upload)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await uploadFile(file);
                          setImage(url);
                        } catch (error) {
                          console.error('Image upload failed', error);
                          // Show toast error if needed
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
                  />
                  {image && <img src={image} alt="Preview" className="mt-2 h-12 w-12 object-cover rounded-xl border border-slate-700" />}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Banner Image (Upload)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await uploadFile(file);
                          setBanner(url);
                        } catch (error) {
                          console.error('Banner upload failed', error);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
                  />
                  {banner && <img src={banner} alt="Banner Preview" className="mt-2 h-12 w-24 object-cover rounded-xl border border-slate-700" />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Category Meta Title"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SEO Description</label>
                  <input
                    type="text"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Category Meta Description"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 border-t border-slate-800 pt-3">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <span>Active (Visible on Storefront)</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <span>Featured Category</span>
                </label>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                {!editingId && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={(e) => handleSave(e, true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 font-semibold hover:bg-slate-700 transition"
                  >
                    Save & Add Another
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Tree Node Helper
function TreeNode({ node, onEdit, onDelete, onRestore }: any) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="pl-3 border-l border-slate-800 space-y-2">
      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button onClick={() => setOpen(!open)} className="text-slate-400 hover:text-white">
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-90' : ''}`} />
            </button>
          ) : (
            <span className="w-3.5 h-3.5" />
          )}
          <Tag className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold text-white text-xs">{node.name}</span>
          <span className="font-mono text-[10px] text-slate-500">({node.slug})</span>
          <span className="px-2 py-0.5 rounded text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
            {node.productCount || 0} Products
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(node)} className="p-1 rounded text-slate-400 hover:text-indigo-400">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {node.isDeleted ? (
            <button onClick={() => onRestore(node.id)} className="p-1 rounded text-slate-400 hover:text-emerald-400">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={() => onDelete(node.id)} className="p-1 rounded text-slate-400 hover:text-rose-400">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {hasChildren && open && (
        <div className="space-y-2 pl-4">
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />
          ))}
        </div>
      )}
    </div>
  );
}
