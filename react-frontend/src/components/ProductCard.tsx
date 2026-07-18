import { Link } from 'react-router-dom';
import { Product } from '../types';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-xl hover:border-indigo-200 transition"
    >
      <Link to={`/products/${product._id}`} className="block overflow-hidden rounded-3xl">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400x400'}
          alt={product.title}
          className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{product.brand}</span>
          <span>{product.category}</span>
        </div>
        <Link to={`/products/${product._id}`} className="block text-lg font-semibold text-slate-900 hover:text-indigo-600 transition">
          {product.title}
        </Link>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-slate-900">${product.price.toFixed(2)}</div>
            <div className="text-sm text-slate-500 line-through">${(product.price / (1 - product.discount / 100)).toFixed(2)}</div>
          </div>
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
