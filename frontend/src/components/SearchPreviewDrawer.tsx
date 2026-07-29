import React from 'react';
import { X, Search, ExternalLink, Star, Shield, Store, CreditCard, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SearchResultItem } from '../api/global-search-productivity.api';

interface SearchPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: SearchResultItem | null;
}

export default function SearchPreviewDrawer({
  isOpen,
  onClose,
  item,
}: SearchPreviewDrawerProps) {
  const navigate = useNavigate();
  if (!isOpen || !item) return null;

  const handleNavigate = () => {
    navigate(item.url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs animate-fade-in flex justify-end text-slate-900">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200/80">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{item.title}</h2>
              <span className="text-xs text-blue-600 font-bold uppercase">{item.category}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="font-bold text-slate-900 text-sm">{item.title}</div>
            <div className="text-slate-500">{item.subtitle || 'System Entity'}</div>
            <div className="text-slate-400 font-mono text-[11px]">URL: {item.url}</div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={handleNavigate}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
          >
            Open Page <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
