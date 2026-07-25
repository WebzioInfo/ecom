import React, { useEffect, useState } from 'react';
import { supportApi, Ticket, StoreSupportSummary, getTicketId } from '../api/support.api';
import { SupportChatEngine } from '../components/SupportChatEngine';
import { useAuthStore } from '../store/useAuthStore';
import {
  MessageSquare,
  Search,
  Plus,
  Store as StoreIcon,
  Clock,
  User,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupportPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.isSuperAdmin;

  // Super Admin States
  const [storeSummaries, setStoreSummaries] = useState<StoreSupportSummary[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  // Store Admin States
  const [storeTickets, setStoreTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('');

  // Common Active Ticket
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  // Filters & Loading
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // New Ticket Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('TECHNICAL_ISSUE');
  const [initialMessage, setInitialMessage] = useState('');

  useEffect(() => {
    loadSupportData();
  }, [isSuperAdmin]);

  const loadSupportData = async () => {
    try {
      setIsLoading(true);
      if (isSuperAdmin) {
        const summaries = await supportApi.getGlobalSummaries();
        setStoreSummaries(summaries);
        if (summaries.length > 0 && !selectedStoreId) {
          setSelectedStoreId(summaries[0].storeId);
          loadStoreTicketForSuperAdmin(summaries[0].storeId);
        } else if (selectedStoreId) {
          loadStoreTicketForSuperAdmin(selectedStoreId);
        }
      } else {
        const tickets = await supportApi.getStoreTickets();
        setStoreTickets(tickets);
        if (tickets.length > 0 && !selectedTicketId) {
          const tId = getTicketId(tickets[0]);
          setSelectedTicketId(tId);
          setActiveTicket(tickets[0]);
        } else if (selectedTicketId) {
          const found = tickets.find((t) => getTicketId(t) === selectedTicketId);
          if (found) setActiveTicket(found);
        }
      }
    } catch (err) {
      console.error('Failed to load support data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStoreTicketForSuperAdmin = async (sId: string) => {
    try {
      const tickets = await supportApi.getGlobalTickets({ storeId: sId });
      if (tickets.length > 0) {
        setActiveTicket(tickets[0]);
      } else {
        setActiveTicket(null);
      }
    } catch (err) {
      toast.error('Failed to load conversation for store');
    }
  };

  const handleSelectStoreSummary = (summary: StoreSupportSummary) => {
    setSelectedStoreId(summary.storeId);
    loadStoreTicketForSuperAdmin(summary.storeId);
  };

  const handleSelectStoreTicket = (ticket: Ticket) => {
    const tId = getTicketId(ticket);
    setSelectedTicketId(tId);
    setActiveTicket(ticket);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !initialMessage) return;

    try {
      await supportApi.createTicket({
        subject,
        type,
        message: initialMessage,
      });
      toast.success('Support request created successfully');
      setIsModalOpen(false);
      setSubject('');
      setInitialMessage('');
      loadSupportData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create support ticket');
    }
  };

  // Filter Store Summaries (Super Admin)
  const filteredSummaries = storeSummaries.filter((s) => {
    const matchesSearch =
      s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'OPEN' && s.ticketStatus === 'OPEN') ||
      (statusFilter === 'CLOSED' && s.ticketStatus === 'CLOSED');
    return matchesSearch && matchesStatus;
  });

  // Filter Store Tickets (Store Admin)
  const filteredTickets = storeTickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'OPEN' && (t.status === 'OPEN' || t.status === 'open')) ||
      (statusFilter === 'CLOSED' && (t.status === 'CLOSED' || t.status === 'closed'));
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" /> Enterprise Support Module
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isSuperAdmin ? 'Support Center' : 'Support Conversations'}
          </h1>
          <p className="text-xs text-slate-400">
            {isSuperAdmin
              ? 'Manage and respond to support conversations across all tenant stores.'
              : 'Direct 1-on-1 enterprise support channel with Webzio SaaS Platform Admins.'}
          </p>
        </div>

        {!isSuperAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> New Support Ticket
          </button>
        )}
      </div>

      {/* CHAT CONTAINER LAYOUT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* LEFT SIDEBAR PANEL */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-xl">
          {/* SEARCH & FILTERS */}
          <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-900/90">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder={isSuperAdmin ? 'Search store name, slug...' : 'Search subject...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <Filter className="w-3 h-3 text-slate-500 ml-1" />
              {(['ALL', 'OPEN', 'CLOSED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase transition-colors ${
                    statusFilter === status
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* ITEM LIST */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading conversations...</div>
            ) : isSuperAdmin ? (
              filteredSummaries.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No store conversations found.</div>
              ) : (
                filteredSummaries.map((sum) => {
                  const isSelected = selectedStoreId === sum.storeId;
                  return (
                    <div
                      key={sum.storeId}
                      onClick={() => handleSelectStoreSummary(sum)}
                      className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-indigo-600/10 border-l-4 border-indigo-500'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {sum.storeName[0].toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{sum.storeName}</h4>
                          {sum.unreadCount > 0 && (
                            <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                              {sum.unreadCount} new
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 truncate mb-1">{sum.lastMessage}</div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="truncate">Owner: {sum.ownerName}</span>
                          <span>{new Date(sum.lastActivity).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No support tickets found.</div>
            ) : (
              filteredTickets.map((ticket) => {
                const tId = getTicketId(ticket);
                const isSelected = selectedTicketId === tId;
                const lastMsg = ticket.messages?.[ticket.messages.length - 1]?.message || 'No messages';

                return (
                  <div
                    key={tId}
                    onClick={() => handleSelectStoreTicket(ticket)}
                    className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/10 border-l-4 border-indigo-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-slate-100 truncate">{ticket.subject}</h4>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                          ticket.status === 'CLOSED' || ticket.status === 'closed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 truncate mb-1">{lastMsg}</div>

                      <div className="text-[10px] text-slate-500 text-right">
                        {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT CHAT ENGINE PANEL */}
        <div className="lg:col-span-8 h-full min-h-0">
          <SupportChatEngine
            ticket={activeTicket}
            onTicketUpdated={loadSupportData}
            isSuperAdmin={isSuperAdmin}
          />
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" /> Start New Support Request
            </h3>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Brief topic (e.g. Payment Gateway Issue)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="TECHNICAL_ISSUE">Technical & Infrastructure</option>
                  <option value="BILLING">Billing & Subscription</option>
                  <option value="GENERAL_SUPPORT">General Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue or question in detail..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-colors"
                >
                  Submit Support Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
