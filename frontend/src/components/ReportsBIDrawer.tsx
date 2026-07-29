import React from 'react';
import {
  X,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Store,
  ArrowUpRight,
  Layers,
  Database,
  Download,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

export type ReportDrawerMode = 'kpi' | 'revenue' | 'store' | 'subscription';

interface ReportsBIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ReportDrawerMode;
  itemData: any;
  onSuccess?: () => void;
}

export default function ReportsBIDrawer({
  isOpen,
  onClose,
  mode,
  itemData,
  onSuccess,
}: ReportsBIDrawerProps) {
  if (!isOpen || !itemData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs animate-fade-in flex justify-end text-slate-900">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200/80">
        {/* DRAWER HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {itemData.title || itemData.name || itemData.storeName || 'Executive Intelligence'}
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                {itemData.label ? itemData.label : 'Business Metric Deep-Dive'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DRAWER CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* MODE 1: KPI DETAILS */}
          {mode === 'kpi' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  {itemData.title || 'Metric Performance'}
                </div>
                <div className="text-3xl font-extrabold text-blue-600">
                  {itemData.value || '$4,900.00'}
                </div>
                <div className="text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> {itemData.trend || '+12.5%'} vs previous 30-day period
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Formula & Calculation Method</div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600 leading-relaxed">
                  {itemData.desc || 'Calculated as total active monthly recurring subscriptions multiplied by tier rates.'}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: REVENUE DETAILS */}
          {mode === 'revenue' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="text-emerald-900 font-bold text-sm">Revenue Contribution</div>
                <div className="text-3xl font-extrabold text-emerald-700">
                  ${(itemData.amount || 4900).toLocaleString()} USD
                </div>
                <div className="text-slate-600">Share of total MRR: {itemData.percentage || 35}%</div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Plan Performance</div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                  <div>Plan Tier: <strong>{itemData.planName || 'Pro Plan'}</strong></div>
                  <div>Subscribers: <strong>35 active stores</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: STORE ANALYTICS */}
          {mode === 'store' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-900 text-sm">{itemData.name || itemData.storeName}</div>
                <div className="text-slate-500 font-mono">{itemData.slug}.saasplatform.com</div>
                <div className="text-2xl font-extrabold text-blue-600 mt-1">
                  ${(itemData.revenue || 490).toLocaleString()} / mo
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Operational Leaders Metrics</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="text-slate-500">Storage Used</div>
                    <div className="font-bold text-slate-900 mt-0.5">{itemData.storageMB || 240} MB</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="text-slate-500">Monthly API Requests</div>
                    <div className="font-bold text-slate-900 mt-0.5">{itemData.apiRequests || 1420} req</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
