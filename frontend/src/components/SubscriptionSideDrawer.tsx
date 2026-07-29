import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Receipt,
  Clock,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Download,
  Shield,
  Layers,
  Zap,
  TrendingUp,
  DollarSign,
  User,
  Store as StoreIcon,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

export type SubDrawerMode = 'plan_edit' | 'invoice_view' | 'payment_history' | 'usage';

interface SubscriptionSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: SubDrawerMode;
  itemData: any;
  onSuccess?: () => void;
}

export default function SubscriptionSideDrawer({
  isOpen,
  onClose,
  mode: initialMode,
  itemData,
  onSuccess,
}: SubscriptionSideDrawerProps) {
  const [activeMode, setActiveMode] = useState<SubDrawerMode>(initialMode);
  const [submitting, setSubmitting] = useState(false);

  // Feature Flags toggles state for Plan Edit
  const [featureFlags, setFeatureFlags] = useState({
    inventory: true,
    coupons: true,
    reports: true,
    automation: true,
    api: true,
    domains: true,
    branding: true,
    exports: true,
    analytics: true,
  });

  if (!isOpen || !itemData) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const toggleFlag = (key: keyof typeof featureFlags) => {
    setFeatureFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs animate-fade-in flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200/80 text-slate-900">
        {/* DRAWER HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {itemData.storeName || itemData.name || itemData.invoiceNumber || 'Subscription Details'}
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                {itemData.slug ? `store: ${itemData.slug}` : itemData.code ? `code: ${itemData.code}` : `ID: ${itemData.id}`}
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

        {/* DRAWER NAVIGATION TABS */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200/60 overflow-x-auto text-xs font-semibold">
          {[
            { mode: 'plan_edit', label: 'Plan & Feature Flags', icon: Layers },
            { mode: 'invoice_view', label: 'Invoice Breakdown', icon: Receipt },
            { mode: 'payment_history', label: 'Payment History', icon: Clock },
            { mode: 'usage', label: 'Resource Usage', icon: Database },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => setActiveMode(item.mode as SubDrawerMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  active ? 'bg-white text-blue-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* DRAWER CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* MODE 1: PLAN EDIT & FEATURE FLAGS */}
          {activeMode === 'plan_edit' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-900 text-sm">{itemData.name || itemData.planName || 'Plan Profile'}</div>
                <div className="text-slate-500">{itemData.description || 'Enterprise SaaS plan tier features & limits.'}</div>
                <div className="text-blue-600 font-extrabold text-lg mt-1">
                  ${itemData.monthlyPrice || 49}/mo
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-slate-400">
                  Feature Flags & Module Permissions
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(featureFlags).map(([key, enabled]) => (
                    <div
                      key={key}
                      onClick={() => toggleFlag(key as any)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        enabled ? 'bg-blue-50/50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="font-bold capitalize">{key} Module</span>
                      <span className={`w-8 h-4 rounded-full transition-colors relative ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                        <span className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    toast.success('Plan feature flags updated');
                    onSuccess?.();
                    onClose();
                  }}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Feature Flags
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: INVOICE BREAKDOWN */}
          {activeMode === 'invoice_view' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">{itemData.invoiceNumber || 'INV-2026-0981'}</span>
                  <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 uppercase">
                    {itemData.status || 'PAID'}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">
                  ${(itemData.amount || 49).toFixed(2)} USD
                </div>
                <div className="text-slate-500">
                  Billed to: <strong>{itemData.storeName || itemData.name}</strong> on {itemData.billingDate || '2026-07-29'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Line Items</div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{itemData.planName || 'Pro Plan Tier'} Subscription</div>
                    <div className="text-slate-500 text-[11px]">Monthly recurring SaaS license</div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">${(itemData.amount || 49).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toast.success('Downloading official invoice PDF...')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>

                <button
                  onClick={() => {
                    toast.success('Receipt sent to store owner email');
                    onClose();
                  }}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Send Email Receipt
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: PAYMENT HISTORY */}
          {activeMode === 'payment_history' && (
            <div className="space-y-6 animate-fade-in">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Payment Audit Timeline</div>

              <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 pl-2">
                {[
                  { action: 'Payment Received', details: 'Automated Stripe charge $49.00 USD succeeded', time: 'Just Now' },
                  { action: 'Invoice Generated', details: 'Invoice #INV-2026-0981 created for renewal', time: '5 mins ago' },
                  { action: 'Subscription Renewed', details: 'Pro Plan tier renewed for next 30 days', time: '1 hour ago' },
                  { action: 'Grace Period Extended', details: 'System grace period extended +3 days', time: '3 days ago' },
                ].map((item, i) => (
                  <div key={i} className="relative pl-8 flex items-start justify-between gap-4">
                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900">{item.action}</div>
                      <div className="text-slate-500 mt-0.5">{item.details}</div>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px] shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 4: USAGE & QUOTAS */}
          {activeMode === 'usage' && (
            <div className="space-y-6 animate-fade-in">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Quota Utilization</div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Products Catalog</span>
                    <span className="font-mono">42 / 1000 Items</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full w-[4.2%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Database Storage</span>
                    <span className="font-mono">240 MB / 1024 MB</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-2 rounded-full w-[23.4%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Monthly API Calls</span>
                    <span className="font-mono">1,420 / 100,000</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-600 h-2 rounded-full w-[1.4%]" />
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
