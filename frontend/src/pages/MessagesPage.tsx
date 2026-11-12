import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  User, 
  Check, 
  CheckCheck, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SafetyModal } from '../components/SafetyModal';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get('conv');

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(initialConvId ? Number(initialConvId) : null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConvs = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      if (!activeConvId && data.length > 0) {
        setActiveConvId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  const fetchMessages = async (convId: number) => {
    try {
      const data = await api.getMessages(convId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConvs();
    const interval = setInterval(fetchConvs, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      const msgInterval = setInterval(() => fetchMessages(activeConvId), 4000);
      return () => clearInterval(msgInterval);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || !newMessage.trim() || isSending) return;

    setIsSending(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const sent = await api.sendMessage(activeConvId, content);
      setMessages((prev) => [...prev, sent]);
      fetchConvs(); // Update last message in sidebar
    } catch (err: any) {
      alert(err.message || 'Failed to deliver message.');
    } finally {
      setIsSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Private Campus Messaging
        </h1>
        <p className="text-xs text-slate-500">
          Encrypted, authorized communication for accepted recovery requests.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[75vh] flex">
        
        {/* Left Pane: Conversation List */}
        <div className="w-full sm:w-80 md:w-96 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 bg-white">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Conversations ({conversations.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoadingConvs ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No active conversations yet.</p>
                <p className="text-[11px] text-slate-500">
                  Chat unlocks automatically when a recovery request is accepted.
                </p>
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = c.id === activeConvId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`p-4 transition cursor-pointer flex items-start space-x-3 ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 uppercase shadow-sm">
                      {c.partner_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {c.partner_name}
                        </span>
                        {c.unread_count > 0 && (
                          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-blue-700 block truncate">
                        {c.item_name}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {c.last_message ? c.last_message.content : 'No messages yet.'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Message Thread */}
        <div className="hidden sm:flex flex-1 flex-col h-full bg-white">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {activeConv.partner_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">
                      {activeConv.partner_name}
                    </h3>
                    <span className="text-[11px] text-slate-500 capitalize">
                      {activeConv.partner_type} • Re: {activeConv.item_name} ({activeConv.request_code})
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsSafetyOpen(true)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition"
                    title="Report Conversation"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
                <div className="text-center py-2">
                  <span className="px-3 py-1 rounded-full bg-slate-200/60 text-[10px] text-slate-600 font-medium">
                    🔒 Messages are protected and visible only to the two recovery participants.
                  </span>
                </div>

                {messages.map((m) => {
                  const isMine = m.is_mine;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-sm ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                      </div>

                      <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1 px-1">
                        <span>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && (
                          m.is_read ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-400" />
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex items-center space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message (e.g. Can we meet near Block 32 reception at 3 PM?)..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 space-y-2">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-semibold">Select a conversation to start chatting</p>
            </div>
          )}
        </div>

      </div>

      {/* Safety Modal */}
      {activeConv && (
        <SafetyModal
          isOpen={isSafetyOpen}
          onClose={() => setIsSafetyOpen(false)}
          targetUserId={activeConv.partner_id}
          targetUserName={activeConv.partner_name}
          conversationId={activeConv.id}
        />
      )}

    </div>
  );
};
