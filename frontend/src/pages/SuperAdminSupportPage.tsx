import React, { useEffect, useState } from 'react';
import { supportApi, Ticket } from '../api/support.api';
import { MessageSquare, CheckCircle2, Circle, AlertCircle, Clock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuperAdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const fetchTickets = async () => {
    try {
      const data = await supportApi.getGlobalTickets();
      setTickets(data);
    } catch (err) {
      toast.error('Failed to load global support tickets');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await supportApi.replyToGlobalTicket(selectedTicket._id, { message: replyMessage });
      toast.success('Reply sent');
      setReplyMessage('');
      const updatedTicket = await supportApi.getGlobalTicket(selectedTicket._id);
      setSelectedTicket(updatedTicket);
      fetchTickets();
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    try {
      await supportApi.updateTicketStatus(selectedTicket._id, status);
      toast.success('Status updated');
      const updatedTicket = await supportApi.getGlobalTicket(selectedTicket._id);
      setSelectedTicket(updatedTicket);
      fetchTickets();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 flex h-[calc(100vh-140px)] gap-6">
      {/* TICKET LIST */}
      <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-xl overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 sticky top-0">
          <h2 className="text-lg font-bold text-white">Global Inbox</h2>
          <p className="text-xs text-slate-400">All tenant support requests</p>
        </div>
        <div className="divide-y divide-slate-800">
          {tickets.map(t => (
            <div 
              key={t._id} 
              onClick={() => setSelectedTicket(t)}
              className={`p-4 cursor-pointer hover:bg-slate-800/50 transition-colors ${selectedTicket?._id === t._id ? 'bg-indigo-900/20 border-l-2 border-indigo-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-white text-sm truncate pr-2">{t.subject}</span>
                {t.status === 'open' && <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Open</span>}
                {t.status === 'in_progress' && <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">In Prog</span>}
                {t.status === 'closed' && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Closed</span>}
              </div>
              <div className="text-xs text-slate-400 mb-2 truncate">
                {t.storeId?.name || 'Unknown Store'}
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
              <p className="text-sm">Inbox is empty</p>
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
                  <span>{selectedTicket.storeId?.name}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <select 
                  className="bg-slate-950 border border-slate-700 text-xs text-white rounded px-3 py-1.5 focus:outline-none"
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {selectedTicket.messages.map((m, idx) => {
                const isSuperAdmin = m.senderRole === 'SUPER_ADMIN';
                return (
                  <div key={idx} className={`flex flex-col ${isSuperAdmin ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-2 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-400">
                        {isSuperAdmin ? 'Webzio Support' : selectedTicket.storeId?.name}
                      </span>
                      <span className="text-[9px] text-slate-500">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <div className={`p-3 rounded-lg text-sm max-w-[80%] ${isSuperAdmin ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
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
                  placeholder="Type your reply to the tenant..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={selectedTicket.status === 'closed'}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Send Reply
                </button>
              </form>
              {selectedTicket.status === 'closed' && (
                <p className="text-xs text-amber-500 mt-2 text-center">Reopen the ticket to send a reply.</p>
              )}
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
  );
}
