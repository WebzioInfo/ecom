import React from 'react';
import {
  X,
  Settings,
  Webhook,
  Key,
  Mail,
  Terminal,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export type SettingsDrawerMode = 'webhook' | 'api_key' | 'smtp_test' | 'diagnostics';

interface SettingsDeveloperDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: SettingsDrawerMode;
  itemData: any;
  onSuccess?: () => void;
}

export default function SettingsDeveloperDrawer({
  isOpen,
  onClose,
  mode,
  itemData,
  onSuccess,
}: SettingsDeveloperDrawerProps) {
  if (!isOpen || !itemData) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs animate-fade-in flex justify-end text-slate-900">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200/80">
        {/* DRAWER HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {itemData.url || itemData.name || itemData.title || 'Platform Configuration'}
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                {itemData.id ? `ID: ${itemData.id}` : 'Developer Inspection'}
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
          {/* MODE 1: WEBHOOK DETAILS */}
          {mode === 'webhook' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Endpoint Target</span>
                  <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                    {itemData.status || 'ACTIVE'}
                  </span>
                </div>
                <div className="text-slate-600 font-mono text-[11px] break-all">{itemData.url}</div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Signing Secret</div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 font-mono flex items-center justify-between">
                  <span className="text-slate-700 font-bold">{itemData.secretKey || 'whsec_live_981a2f...'}</span>
                  <button
                    onClick={() => handleCopy(itemData.secretKey || 'whsec_live_981a2f', 'Webhook Secret')}
                    className="p-1 text-slate-400 hover:text-slate-900"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: API KEY DETAILS */}
          {mode === 'api_key' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Platform Secret Key</div>
                <div className="text-slate-500 font-mono text-[11px]">{itemData.platformApiKey || 'wbx_live_pk_9821...'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
