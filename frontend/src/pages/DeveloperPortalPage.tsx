import React, { useEffect, useState } from 'react';
import { apiKeysApi, ApiKeyItem } from '../api/api-keys.api';
import { useTenantStore } from '../store/useTenantStore';
import { Key, Plus, Copy, Shield, Check, RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DeveloperPortalPage() {
  const { activeStore } = useTenantStore();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [newKeyDetails, setNewKeyDetails] = useState<any>(null);

  const loadData = async () => {
    if (!activeStore?._id) return;
    try {
      const data = await apiKeysApi.getByStore(activeStore._id);
      setKeys(data);
    } catch (err) {
      toast.error('Failed to load API keys');
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStore]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiKeysApi.create({
        storeId: activeStore?._id || '',
        name,
      });
      setNewKeyDetails(res);
      toast.success('API Key generated successfully');
      setShowModal(false);
      setName('');
      loadData();
    } catch (err) {
      toast.error('Failed to generate API Key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">API & Developer Hub</h1>
          <p className="text-xs text-slate-400">Headless API Keys, Webhook Secrets & Webhook Engine for <span className="text-indigo-400">{activeStore?.name}</span></p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Generate New API Key
        </button>
      </div>

      {newKeyDetails && (
        <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-xs space-y-2">
          <p className="font-bold text-indigo-300">Copy your API Secret Key now! It will not be shown again.</p>
          <div className="flex items-center justify-between p-2 rounded bg-slate-900 font-mono text-emerald-400">
            <span>{newKeyDetails.apiKey}</span>
            <button onClick={() => copyToClipboard(newKeyDetails.apiKey)} className="text-slate-400 hover:text-white">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* API KEYS TABLE */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3.5">Key Name</th>
              <th className="p-3.5">Public API Key</th>
              <th className="p-3.5">Rate Limit</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">No API keys generated for this store yet.</td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k._id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 font-semibold text-white">{k.name}</td>
                  <td className="p-3.5 font-mono text-indigo-400">{k.key}</td>
                  <td className="p-3.5 text-slate-400">{k.rateLimitPerMinute} req/min</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${k.isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                      {k.isActive ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button onClick={() => copyToClipboard(k.key)} className="p-1.5 text-slate-400 hover:text-white">
                      <Copy className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SAMPLE CODE SNIPPET */}
      <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <h3 className="text-sm font-bold text-slate-200">Headless API Endpoint Integration Example</h3>
        <pre className="p-4 bg-slate-950 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
{`curl -X GET "http://localhost:3000/api/storefront/v1/products" \\
  -H "x-api-key: wbx_live_YOUR_API_KEY"`}
        </pre>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 text-xs">
            <h2 className="text-base font-bold text-white">Generate Store API Key</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Key Description Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js Mobile Storefront"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold">Generate Key</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
