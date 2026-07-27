import React, { useEffect, useState } from 'react';
import { useTenantStore } from '../store/useTenantStore';
import { usersApi } from '../api/users.api';
import { UserCog, Plus, Shield, KeyRound, Trash2, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StaffPage() {
  const { activeStore } = useTenantStore();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STORE_MANAGER');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getStoreStaff();
      setStaffList(data || []);
    } catch {
      toast.error('Failed to load store staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStore]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return toast.error('Name and email required');

    try {
      await usersApi.addStoreStaff({ name, email, password: password || 'Password123!', role });
      toast.success('Staff member added successfully');
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add staff');
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (!window.confirm(`Reset password for ${name}?`)) return;
    try {
      const res = await usersApi.resetStaffPassword(id);
      toast.success(`Password reset! Temporary password: ${res.temporaryPassword}`, { duration: 6000 });
    } catch {
      toast.error('Failed to reset password');
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(`Remove staff access for ${name}?`)) return;
    try {
      await usersApi.deleteStoreStaff(id);
      toast.success('Staff member removed');
      loadData();
    } catch {
      toast.error('Failed to remove staff');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <UserCog className="w-6 h-6 text-indigo-400" /> Store Staff & Role Access Control
          </h1>
          <p className="text-sm text-slate-400">
            Manage team members and assigned access permissions for <span className="text-indigo-400 font-semibold">{activeStore?.name || 'Current Store'}</span>.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {/* STAFF TABLE */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Member Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">Loading team directory...</td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">No specific staff assigned yet. Store Owner has full administrative control.</td>
              </tr>
            ) : (
              staffList.map((st) => (
                <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-extrabold">
                      {st.name[0].toUpperCase()}
                    </div>
                    {st.name}
                  </td>
                  <td className="p-4 text-slate-400 font-mono">{st.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] uppercase font-extrabold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                      {st.role || st.roles?.[0]}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleResetPassword(st.id, st.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Reset Password"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(st.id, st.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Remove Access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD STAFF MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" /> Add Team Member
            </h2>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@store.com"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Initial Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password123!"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="STORE_MANAGER">Store Manager (Full Admin)</option>
                  <option value="SALES_EXECUTIVE">Sales Executive (Orders & Customers)</option>
                  <option value="WAREHOUSE_STAFF">Warehouse Staff (Inventory)</option>
                  <option value="CASHIER">Cashier (POS & Billing)</option>
                  <option value="DELIVERY_STAFF">Delivery Staff (Order Shipping)</option>
                  <option value="SUPPORT_STAFF">Support Staff (Customer Messaging)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
                >
                  Save Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
