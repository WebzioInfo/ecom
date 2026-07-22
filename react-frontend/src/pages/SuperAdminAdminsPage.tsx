import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { Users, Shield, ShieldAlert, CheckCircle2, Search, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/users/global', { params: { search } });
      setAdmins(res.data);
    } catch (err) {
      toast.error('Failed to load admins');
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [search]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const endpoint = currentStatus ? `/users/global/${id}/suspend` : `/users/global/${id}/activate`;
      await api.patch(endpoint);
      toast.success(`User account ${currentStatus ? 'suspended' : 'activated'}`);
      fetchAdmins();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Global Store Admins
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage tenant owners and staff across the platform.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64 transition"
          />
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-800/50 text-xs uppercase font-medium text-slate-300 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Roles</th>
              <th className="px-6 py-4">Company (Store)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  No admins found matching the search.
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700">
                        {admin.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{admin.name}</div>
                        <div className="text-[11px] text-slate-500">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {admin.roles?.map((role: string) => (
                        <span key={role} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] uppercase font-semibold border border-indigo-500/20">
                          {role.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {admin.storeId ? (
                      <div>
                        <div className="font-medium text-slate-300">{admin.storeId.name}</div>
                        <div className="text-[10px] text-slate-500">{admin.storeId.slug}</div>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {admin.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 text-xs font-medium">
                        <Shield className="w-3.5 h-3.5" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleStatus(admin._id, admin.isActive)}
                      className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${admin.isActive ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                    >
                      {admin.isActive ? 'Suspend' : 'Activate'}
                    </button>
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
