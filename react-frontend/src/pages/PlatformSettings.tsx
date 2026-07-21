import React from 'react';
import { Settings, Shield, Globe, Mail } from 'lucide-react';

export default function PlatformSettings() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          Platform Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">Configure global platform behavior and defaults.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-indigo-400" />
          Global Configuration
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Platform Name</label>
            <input type="text" defaultValue="Webzio Ecom OS" className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Support Email</label>
            <input type="email" defaultValue="support@webzio.com" className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-rose-400" />
          Security & Compliance
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/40">
            <div>
              <h3 className="font-medium text-slate-200">Force MFA for all Super Admins</h3>
              <p className="text-sm text-slate-400">Require multi-factor authentication for platform access.</p>
            </div>
            <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
