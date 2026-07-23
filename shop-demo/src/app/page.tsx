/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Search, Heart, ShoppingBag, Eye, RefreshCw, Star } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  featured?: boolean;
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      // Storefront API uses the public catalog endpoint
      const res = await api.get('/storefront/v1/products');
      const items: Product[] = res.data.data || [];
      setProducts(items);

      // Extract unique categories
      const uniqCats = ['All', ...Array.from(new Set(items.map((i) => i.category)))];
      setCategories(uniqCats);
    } catch (err) {
      console.error('Failed to retrieve storefront catalog', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCatalog();
    
    // Load initial wishlist state
    try {
      const savedWish = JSON.parse(localStorage.getItem('shop_wishlist') || '[]');
      setWishlist(savedWish);
    } catch {}
  }, []);

  const toggleWishlist = (productId: string) => {
    let updated;
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    localStorage.setItem('shop_wishlist', JSON.stringify(updated));
  };

  const addToCart = (product: Product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('shop_cart') || '[]');
      const exists = cart.find((item: any) => item.id === product.id);
      if (exists) {
        exists.qty += 1;
      } else {
        cart.push({ ...product, qty: 1 });
      }
      localStorage.setItem('shop_cart', JSON.stringify(cart));
      alert(`${product.title} added to cart!`);
    } catch {
      alert('Failed to add product to cart.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      
      {/* Premium Hero section */}
      <section className="bg-zinc-900 text-white py-20 px-6 md:px-12 text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
          The New Standard of Hardware & Fashion.
        </h2>
        <p className="text-zinc-400 text-sm md:text-base max-w-md mx-auto">
          Explore production isolated storefront catalogs powered dynamically by Schema-based Multi-tenancy.
        </p>
        <div className="pt-2">
          <Link href="/cart" className="inline-block bg-white text-zinc-900 font-bold px-6 py-2.5 rounded-lg text-xs hover:bg-zinc-200 transition-colors uppercase">
            Shop Catalog
          </Link>
        </div>
      </section>

      {/* Catalog Search & Filtering */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Categories select row */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-250 border border-zinc-200 dark:border-zinc-800'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products or brands..."
              className="premium-input pl-10 w-full text-xs"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 text-zinc-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div key={p.id} className="premium-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
                
                {/* Header card details */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      {p.brand}
                    </span>
                    <button onClick={() => toggleWishlist(p.id)} className="text-zinc-400 hover:text-rose-500 transition-colors">
                      <Heart className={`w-4 h-4 ${wishlist.includes(p.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                  
                  <Link href={`/products/${p.id}`} className="block group">
                    <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors">
                      {p.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {p.description}
                  </p>
                </div>

                {/* Footer card action triggers */}
                <div className="pt-3 border-t border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
                  <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-50">
                    ${p.price}
                  </span>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/products/${p.id}`}
                      className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <button 
                      onClick={() => addToCart(p)}
                      disabled={p.stock <= 0}
                      className="flex items-center gap-1 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-3 py-1.5 rounded-lg text-[10px] font-bold disabled:opacity-50"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      {p.stock > 0 ? 'Buy' : 'Out'}
                    </button>
                  </div>
                </div>

              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-20 text-zinc-500 text-xs font-mono">
                No items match your active filter search parameters.
              </div>
            )}
          </div>
        )}

      </section>

    </div>
  );
}
