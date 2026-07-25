import React, { useState, useEffect, useRef } from 'react';
import { supportApi, Ticket, TicketMessage, getTicketId, getMessageId } from '../api/support.api';
import { useAuthStore } from '../store/useAuthStore';
import {
  Send,
  Search,
  CheckCircle,
  RotateCcw,
  Trash2,
  Clock,
  ShieldCheck,
  User,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SupportChatEngineProps {
  ticket: Ticket | null;
  onTicketUpdated?: () => void;
  isSuperAdmin?: boolean;
}

export function SupportChatEngine({
  ticket,
  onTicketUpdated,
  isSuperAdmin = false,
}: SupportChatEngineProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ticketId = getTicketId(ticket);

  useEffect(() => {
    if (ticket) {
      const validMessages = (ticket.messages || []).filter((m) => !m.isDeleted);
      setMessages(validMessages);

      // Auto mark read if appropriate
      if (ticketId) {
        supportApi.markAsRead(ticketId).catch(() => {});
      }
    } else {
      setMessages([]);
    }
  }, [ticket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!ticket) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
        <MessageSquare className="w-16 h-16 opacity-10 mb-4" />
        <p className="text-sm font-medium">Select a store or conversation to open the Support Chat</p>
      </div>
    );
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !ticketId) return;

    try {
      setIsSending(true);
      if (isSuperAdmin) {
        await supportApi.replyToGlobalTicket(ticketId, { message: replyMessage });
      } else {
        await supportApi.replyToTicket(ticketId, { message: replyMessage });
      }
      toast.success('Message sent');
      setReplyMessage('');
      if (onTicketUpdated) onTicketUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = async () => {
    if (!ticketId) return;
    try {
      await supportApi.closeTicket(ticketId);
      toast.success('Conversation closed');
      if (onTicketUpdated) onTicketUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to close conversation');
    }
  };

  const handleReopen = async () => {
    if (!ticketId) return;
    try {
      await supportApi.reopenTicket(ticketId);
      toast.success('Conversation reopened');
      if (onTicketUpdated) onTicketUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reopen conversation');
    }
  };

  const handleDeleteConversation = async () => {
    if (!ticketId || !confirm('Are you sure you want to delete this conversation?')) return;
    try {
      await supportApi.deleteTicket(ticketId);
      toast.success('Conversation deleted');
      if (onTicketUpdated) onTicketUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete conversation');
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!ticketId || !msgId || !confirm('Delete this message?')) return;
    try {
      await supportApi.deleteMessage(msgId, ticketId);
      toast.success('Message deleted');
      if (onTicketUpdated) onTicketUpdated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const filteredMessages = messages.filter((m) =>
    m.message.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'closed';

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* HEADER */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {ticket.subject}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Store: <strong className="text-slate-200">{ticket.storeId?.name || ticket.storeId || 'Default Store'}</strong></span>
              &bull;
              <span>Category: <strong className="text-slate-300 capitalize">{ticket.type ? ticket.type.replace('_', ' ') : 'Support'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* SEARCH IN CHAT */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 w-36 sm:w-48"
            />
          </div>

          {/* STATUS BADGE */}
          {isClosed ? (
            <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 text-xs px-3 py-1 rounded-full uppercase font-extrabold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Closed
            </span>
          ) : (
            <span className="bg-amber-950/60 text-amber-400 border border-amber-800/50 text-xs px-3 py-1 rounded-full uppercase font-extrabold flex items-center gap-1">
              <Clock className="w-3 h-3" /> Open
            </span>
          )}

          {/* ACTIONS */}
          {isClosed ? (
            <button
              onClick={handleReopen}
              title="Reopen Conversation"
              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleClose}
              title="Close Conversation"
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleDeleteConversation}
            title="Delete Conversation"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MESSAGES BODY */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/50">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            No messages found.
          </div>
        ) : (
          filteredMessages.map((m, idx) => {
            const isFromSuperAdmin = m.senderRole === 'SUPER_ADMIN';
            const isMe = isSuperAdmin ? isSuperAdmin : m.senderId === user?.id;
            const msgId = getMessageId(m);

            return (
              <div
                key={msgId || idx}
                className={`flex flex-col group ${isFromSuperAdmin ? 'items-start' : 'items-end'}`}
              >
                {/* SENDER INFO */}
                <div className="flex items-center gap-2 mb-1 px-1">
                  <div className={`p-1 rounded-full ${isFromSuperAdmin ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' : 'bg-slate-800 text-slate-300'}`}>
                    {isFromSuperAdmin ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  </div>
                  <span className="text-[11px] font-bold text-slate-300">
                    {isFromSuperAdmin ? 'Webzio Platform Support' : 'Store Admin'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* MESSAGE BUBBLE */}
                <div className="relative max-w-[82%] group">
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      isFromSuperAdmin
                        ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none shadow-md'
                        : 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/10'
                    }`}
                  >
                    {m.message}
                  </div>

                  {/* MESSAGE DELETE BUTTON */}
                  {msgId && (
                    <button
                      onClick={() => handleDeleteMessage(msgId)}
                      title="Delete message"
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 p-1 bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 rounded-full shadow-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT FOOTER */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800">
        <form onSubmit={handleReply} className="flex gap-3">
          <textarea
            required
            rows={2}
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder={isClosed ? 'Type your message to reopen this conversation...' : 'Type your reply here...'}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
          <button
            type="submit"
            disabled={isSending || !replyMessage.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-lg shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
            <span>{isClosed ? 'Reopen & Send' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
