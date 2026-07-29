import React, { useEffect, useState } from 'react';
import { useTenantStore } from '../store/useTenantStore';
import { teamApi } from '../api/team.api';
import { UserCog, Plus, Shield, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StaffPage() {
  const { activeStore } = useTenantStore();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [members, roles] = await Promise.all([
        teamApi.getMembers(),
        teamApi.getRoles()
      ]);
      setStaffList(members || []);
      setRolesList(roles || []);
      if (roles?.length > 0) {
        setRoleId(roles.find((r: any) => r.name === 'MANAGER')?.id || roles[0].id);
      }
    } catch {
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStore]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !roleId) return toast.error('Name, email, and role required');

    try {
      await teamApi.createMember({ name, email, roleId, department, designation });
      toast.success('Team member added successfully');
      setShowModal(false);
      setName('');
      setEmail('');
      setDepartment('');
      setDesignation('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(`Remove access for ${name}?`)) return;
    try {
      await teamApi.removeMember(id);
      toast.success('Member removed');
      loadData();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCog className="w-6 h-6 text-indigo-600" /> Team & Roles
          </h1>
          <p className="text-sm text-slate-500">
            Manage team members and assigned access permissions for <span className="text-indigo-700 font-semibold">{activeStore?.name || 'Current Store'}</span>.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* STAFF TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Member Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Assigned Role</th>
              <th className="p-4">Department</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">Loading team directory...</td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">No team members assigned yet.</td>
              </tr>
            ) : (
              staffList.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-extrabold">
                      {st.name ? st.name[0].toUpperCase() : 'U'}
                    </div>
                    {st.name}
                  </td>
                  <td className="p-4 text-slate-500 font-mono">{st.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold bg-slate-100 text-slate-700">
                      {st.role?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{st.department || '-'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {st.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleDeleteStaff(st.id, st.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

      {/* ROLES TABLE */}
      <div className="pt-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" /> Roles & Permissions
          </h2>
          <p className="text-sm text-slate-500">
            Define custom roles and configure granular permissions.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-card">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Role Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Base Modules</th>
                <th className="p-4">Permissions Configured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">Loading roles...</td>
                </tr>
              ) : rolesList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">No roles configured.</td>
                </tr>
              ) : (
                rolesList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{r.name}</td>
                    <td className="p-4 text-slate-600">{r.description}</td>
                    <td className="p-4">
                      {r.accessibleModules?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {r.accessibleModules.map((m: string) => (
                            <span key={m} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 uppercase border border-slate-200">
                              {m}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No specific modules</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {r.permissions?.length || 0} Policies
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD STAFF MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-popover">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" /> Invite Team Member
            </h2>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@store.com"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Sales"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Executive"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role *</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="" disabled>Select a role...</option>
                  {rolesList.map(r => (
                    <option key={r.id} value={r.id}>{r.name} - {r.description}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm"
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
