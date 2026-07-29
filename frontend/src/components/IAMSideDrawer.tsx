import React from 'react';
import {
  X,
  User,
  Shield,
  Key,
  Laptop,
  Users,
  Lock,
  Unlock,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export type IAMDrawerMode = 'user' | 'role' | 'session' | 'team';

interface IAMSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: IAMDrawerMode;
  itemData: any;
  onSuccess?: () => void;
}

export default function IAMSideDrawer({
  isOpen,
  onClose,
  mode,
  itemData,
  onSuccess,
}: IAMSideDrawerProps) {
  if (!isOpen || !itemData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs animate-fade-in flex justify-end text-slate-900">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200/80">
        {/* DRAWER HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {itemData.name || itemData.title || itemData.userName || 'Identity Inspection'}
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                {itemData.email ? itemData.email : itemData.code ? `code: ${itemData.code}` : `ID: ${itemData.id}`}
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
          {/* MODE 1: USER DETAILS */}
          {mode === 'user' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{itemData.name}</span>
                  <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                    {itemData.status || 'ACTIVE'}
                  </span>
                </div>
                <div className="text-slate-500 font-mono">{itemData.email}</div>
                <div className="flex items-center gap-3 pt-2 text-slate-600">
                  <span>Role: <strong>{itemData.role || 'Super Admin'}</strong></span>
                  <span>Team: <strong>{itemData.teamName || 'Engineering'}</strong></span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900 border-b border-slate-100 pb-2">Security Status</div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <span>Multi-Factor Authentication (MFA)</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    itemData.mfaEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {itemData.mfaEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    toast.success('Password reset link dispatched to user email');
                    onClose();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Reset Password
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: ROLE DETAILS */}
          {mode === 'role' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-900 text-sm">{itemData.name}</div>
                <div className="text-slate-500">{itemData.description}</div>
                <div className="text-blue-600 font-bold text-xs mt-1">
                  Assigned to {itemData.usersCount || 5} platform users
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: SESSION DETAILS */}
          {mode === 'session' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-900 text-sm">{itemData.device || 'MacBook Pro'}</div>
                <div className="text-slate-500 font-mono">IP: {itemData.ipAddress || '192.168.1.1'}</div>
                <div className="text-slate-600">User: <strong>{itemData.userName}</strong></div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    toast.success('Session terminated');
                    onSuccess?.();
                    onClose();
                  }}
                  className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Terminate Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
