'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { MessageSquare, Send, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
  memberName?: string;
  memberId?: string;
}

export default function MessagesPage() {
  const params   = useSearchParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [selectedMember, setSelectedMember] = useState(params.get('memberId') ?? '');
  const [text, setText]   = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['trainer-clients'],
    queryFn: () => api.get('/trainers/my/clients').then(r => r.data),
    enabled: user?.role === 'TRAINER',
  });

  // For members - show their trainer's messages via notifications
  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data?.notifications ?? r.data ?? []),
    enabled: user?.role === 'MEMBER',
  });

  const sendMut = useMutation({
    mutationFn: ({ memberId, message }: { memberId: string; message: string }) =>
      api.post('/trainers/my/message', { memberId, message }).then(r => r.data),
    onSuccess: () => {
      const client = clients.find(c => c.id === selectedMember);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        from: 'me',
        text,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        memberName: client ? `${client.firstName} ${client.lastName}` : selectedMember,
        memberId: selectedMember,
      }]);
      toast.success('Message sent');
      setText('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to send'),
  });

  const handleSend = () => {
    if (!text.trim() || !selectedMember) return;
    sendMut.mutate({ memberId: selectedMember, message: text.trim() });
  };

  const selectedClient = clients.find(c => c.id === selectedMember);
  const threadMessages = messages.filter(m => m.memberId === selectedMember);

  const trainerNotifications = notifications.filter((n: any) =>
    n.title === 'Message from your trainer'
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-0">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><MessageSquare size={22} /> Messages</h1>
        <p className="text-sm text-slate-500 mt-0.5">{user?.role === 'TRAINER' ? 'Send messages to your clients' : 'Messages from your trainer'}</p>
      </div>

      {/* TRAINER view */}
      {user?.role === 'TRAINER' && (
        <div className="flex h-[calc(100vh-220px)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Sidebar: client list */}
          <div className="w-64 border-r border-slate-100 flex flex-col">
            <div className="p-3 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Clients ({clients.length})</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {clients.length === 0 && (
                <p className="text-xs text-slate-400 p-4 text-center">No clients assigned</p>
              )}
              {clients.map((c: any) => {
                const unread = messages.filter(m => m.memberId === c.id && m.from === 'them').length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedMember(c.id)}
                    className={cn('w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left', selectedMember === c.id ? 'bg-indigo-50 border-r-2 border-indigo-500' : '')}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-slate-400 truncate">{c.email}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {!selectedMember ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageSquare size={40} className="mx-auto mb-2 opacity-30" />
                  <p>Select a client to start messaging</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                    {selectedClient?.firstName[0]}{selectedClient?.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{selectedClient?.firstName} {selectedClient?.lastName}</p>
                    <p className="text-xs text-slate-400">{selectedClient?.email}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {threadMessages.length === 0 && (
                    <div className="text-center text-slate-400 mt-10">
                      <p className="text-sm">No messages yet. Send your first message!</p>
                    </div>
                  )}
                  {threadMessages.map(msg => (
                    <div key={msg.id} className={cn('flex', msg.from === 'me' ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-xs px-4 py-2.5 rounded-2xl text-sm', msg.from === 'me' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none')}>
                        <p>{msg.text}</p>
                        <p className={cn('text-xs mt-1', msg.from === 'me' ? 'text-indigo-200' : 'text-slate-400')}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="border-t border-slate-100 p-4 flex gap-3">
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder={`Message ${selectedClient?.firstName}…`}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!text.trim() || sendMut.isPending}
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5 text-sm font-medium"
                  >
                    <Send size={15} /> Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MEMBER view — shows trainer messages from notifications */}
      {user?.role === 'MEMBER' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-slate-800">Messages from Trainer</h2>
          </div>
          {trainerNotifications.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No messages yet from your trainer.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {trainerNotifications.map((n: any) => (
                <div key={n.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <User size={14} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Your Trainer</p>
                    <p className="text-sm text-slate-700 mt-0.5">{n.body}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
