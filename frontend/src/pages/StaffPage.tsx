import React, { useEffect, useState } from 'react';
import { useTenantStore } from '../store/useTenantStore';
import { UserCog, Plus, Shield, Mail } from 'lucide-react';
import { api } from '../api/axios';
import { toast } from 'react-hot-toast';

export default function StaffPage() {
  const { activeStore } = useTenantStore();
  const [staffList, setStaffList] = useState<any[]>([]);

  const loadData = async () => {
    if (!activeStore?._id) return;
    try {
      const res = await api.get(`/users/store/${activeStore._id}`);
      setStaffList(res.data);
    } catch (err) {
      toast.error('Failed to load store staff');
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStore]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Staff & Role-Based Access Control (RBAC)</h1>
          <p className="text-xs text-slate-400">Team Members & Access Levels for <span className="text-indigo-400">{activeStore?.name}</span></p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3.5">Member Name</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Assigned Roles</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500">No specific staff assigned yet. Store Owner has full administrative control.</td>
              </tr>
            ) : (
              staffList.map((st) => (
                <tr key={st._id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-white">{st.name}</td>
                  <td className="p-3.5 text-slate-400">{st.email}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                      {st.roles?.join(', ')}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-emerald-400 font-semibold text-[11px]">Active</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
