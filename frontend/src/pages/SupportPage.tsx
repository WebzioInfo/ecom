import React, { useEffect, useState } from 'react';
import { supportApi, Ticket } from '../api/support.api';
import { MessageSquare, Plus, CheckCircle2, Circle, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

import { useSearchParams } from 'react-router-dom';

export default function SupportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('technical_issue');
  const [message, setMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  const fetchTickets = async () => {
    try {
      const data = await supportApi.getStoreTickets();
      setTickets(data);
      // Auto-select ticket from URL if it exists
      const urlTicketId = searchParams.get('ticketId');
      if (urlTicketId) {
        const found = data.find(t => t._id === urlTicketId);
        if (found) setSelectedTicket(found);
      }
    } catch (err) {
      toast.error('Failed to load support tickets');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Update URL when ticket selection changes
  const handleSelectTicket = (ticket: Ticket | null) => {
    setSelectedTicket(ticket);
    if (ticket) {
      setSearchParams({ ticketId: ticket._id });
    } else {
      setSearchParams({});
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTicket = await supportApi.createTicket({ subject, type, message });
      toast.success('Ticket submitted successfully');
      setIsCreating(false);
      setSubject('');
      setMessage('');
      await fetchTickets();
      handleSelectTicket(newTicket);
    } catch (err) {
      toast.error('Failed to submit ticket');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await supportApi.replyToTicket(selectedTicket._id, { message: replyMessage });
      toast.success('Reply sent');
      setReplyMessage('');
      const updatedTicket = await supportApi.getStoreTicket(selectedTicket._id);
      handleSelectTicket(updatedTicket);
      fetchTickets();
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Support Center</h1>
          <p className="text-sm text-slate-400">Contact the Webzio platform team for assistance.</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(!isCreating);
            handleSelectTicket(null);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-medium transition-colors"
        >
          {isCreating ? 'Cancel' : <><Plus className="w-4 h-4" /> New Ticket</>}
        </button>
      </div>

      {isCreating ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="E.g., Cannot upload product images"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="technical_issue">Technical Issue</option>
                  <option value="billing">Billing Inquiry</option>
                  <option value="subscription">Subscription Management</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="general_support">General Support</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                placeholder="Describe your issue in detail..."
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex flex-1 gap-6 min-h-0">
          {/* TICKET LIST */}
          <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-xl overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 sticky top-0">
              <h2 className="text-lg font-bold text-white">Your Tickets</h2>
            </div>
            <div className="divide-y divide-slate-800">
              {tickets.map(t => (
                <div 
                  key={t._id} 
                  onClick={() => handleSelectTicket(t)}
                  className={`p-4 cursor-pointer hover:bg-slate-800/50 transition-colors ${selectedTicket?._id === t._id ? 'bg-indigo-900/20 border-l-2 border-indigo-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-white text-sm truncate pr-2">{t.subject}</span>
                    {t.status === 'open' && <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Open</span>}
                    {t.status === 'in_progress' && <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">In Prog</span>}
                    {t.status === 'closed' && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Closed</span>}
                  </div>
                  <div className="text-xs text-slate-400 mb-2 truncate capitalize">
                    {t.type.replace('_', ' ')}
                  </div>
                  <div className="flex items-center text-[10px] text-slate-500 gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(t.updatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No tickets found</p>
                </div>
              )}
            </div>
          </div>

          {/* TICKET DETAILS */}
          <div className="w-2/3 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col">
            {selectedTicket ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 sticky top-0">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedTicket.subject}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span className="capitalize">{selectedTicket.type.replace('_', ' ')}</span>
                      &bull;
                      <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </p>
                  </div>
                  <div>
                    {selectedTicket.status === 'open' && <span className="bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full uppercase font-bold">Open</span>}
                    {selectedTicket.status === 'in_progress' && <span className="bg-indigo-500/20 text-indigo-400 text-xs px-3 py-1 rounded-full uppercase font-bold">In Progress</span>}
                    {selectedTicket.status === 'closed' && <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full uppercase font-bold">Closed</span>}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {selectedTicket.messages.map((m, idx) => {
                    const isSuperAdmin = m.senderRole === 'SUPER_ADMIN';
                    return (
                      <div key={idx} className={`flex flex-col ${!isSuperAdmin ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-baseline gap-2 mb-1 px-1">
                          <span className="text-[10px] font-bold text-slate-400">
                            {isSuperAdmin ? 'Webzio Support' : 'You'}
                          </span>
                          <span className="text-[9px] text-slate-500">{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                        <div className={`p-3 rounded-lg text-sm max-w-[80%] ${!isSuperAdmin ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                          {m.message}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/80">
                  <form onSubmit={handleReply} className="flex gap-3">
                    <textarea
                      required
                      rows={2}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder={selectedTicket.status === 'closed' ? "Reply to reopen ticket..." : "Type your reply..."}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      {selectedTicket.status === 'closed' ? 'Reopen' : 'Send Reply'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <MessageSquare className="w-16 h-16 opacity-10 mb-4" />
                <p>Select a ticket to view the conversation</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
