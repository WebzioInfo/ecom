import React from 'react';
import { Users, Search, Plus, MoreVertical, Shield } from 'lucide-react';

export default function AdminsManager() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            Platform Admins
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage super admins, support staff, and platform roles.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-emerald-600/20">
          <Plus className="w-4 h-4" />
          Invite Admin
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search admins by name or email..."
              className="pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-80 transition"
            />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/40 text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Last Active</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            <tr className="hover:bg-slate-800/30 transition group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">System Architect</div>
                    <div className="text-xs text-slate-500">architect@webzio.com</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 text-xs font-semibold">
                  <Shield className="w-3 h-3" />
                  Super Admin
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 text-slate-400">Just now</td>
              <td className="px-6 py-4 text-right">
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
