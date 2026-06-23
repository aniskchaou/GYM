'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Plus, Play, Square } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LiveClassesPage() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({ title: '', description: '', startTime: '', endTime: '', capacity: 50, streamUrl: '' });
  const [active, setActive] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const list = useQuery({ queryKey: ['live'], queryFn: () => api.get('/live-classes').then((r) => r.data).catch(() => []) });
  const detail = useQuery({
    queryKey: ['live', active?.id],
    enabled: !!active,
    queryFn: () => api.get(`/live-classes/${active.id}`).then((r) => r.data),
  });
  const messages = useQuery({
    queryKey: ['live-msg', active?.id],
    enabled: !!active,
    queryFn: () => api.get(`/live-classes/${active.id}/messages`).then((r) => r.data).catch(() => []),
    refetchInterval: active ? 4000 : false,
  });

  const create = useMutation({
    mutationFn: () => api.post('/live-classes', { ...form, startTime: new Date(form.startTime).toISOString(), endTime: new Date(form.endTime).toISOString() }).then((r) => r.data),
    onSuccess: () => { toast.success('Created'); setShow(false); qc.invalidateQueries({ queryKey: ['live'] }); },
  });
  const join = useMutation({
    mutationFn: (id: string) => api.post(`/live-classes/${id}/join`).then((r) => r.data),
    onSuccess: (d) => { toast.success('Joined'); setActive(d); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const status = useMutation({
    mutationFn: ({ id, s }: any) => api.post(`/live-classes/${id}/status`, { status: s }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['live'] }),
  });
  const post = useMutation({
    mutationFn: () => api.post(`/live-classes/${active.id}/messages`, { content: msg }).then((r) => r.data),
    onSuccess: () => { setMsg(''); qc.invalidateQueries({ queryKey: ['live-msg', active.id] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Classes</h1>
          <p className="text-sm text-slate-500">Stream, join, chat in real-time</p>
        </div>
        <button onClick={() => setShow(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Plus size={16} /> Schedule
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          {(list.data ?? []).map((c: any) => (
            <button key={c.id} onClick={() => { setActive(c); join.mutate(c.id); }} className={`w-full text-left p-3 rounded-lg ${active?.id === c.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-2 font-medium text-sm"><Video size={14} /> {c.title}</div>
              <div className="text-xs text-slate-500">{new Date(c.startTime).toLocaleString()} · {c.status}</div>
            </button>
          ))}
          {(list.data ?? []).length === 0 && <p className="text-sm text-slate-500 p-3">No classes scheduled.</p>}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {!active ? (
            <p className="text-slate-500 text-sm">Select a class.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-lg">{detail.data?.title}</h2>
                  <p className="text-xs text-slate-500">{detail.data?.status} · {detail.data?._count?.participants ?? 0} participants</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => status.mutate({ id: active.id, s: 'LIVE' })} className="text-emerald-600"><Play size={16} /></button>
                  <button onClick={() => status.mutate({ id: active.id, s: 'ENDED' })} className="text-red-500"><Square size={16} /></button>
                </div>
              </div>
              {detail.data?.streamUrl && (
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-white text-xs">
                  Stream: <a href={detail.data.streamUrl} target="_blank" rel="noreferrer" className="underline ml-1">open</a>
                </div>
              )}
              <div className="border-t pt-3">
                <h3 className="font-medium text-sm mb-2">Chat</h3>
                <ul className="space-y-1 max-h-48 overflow-y-auto text-sm">
                  {(messages.data ?? []).map((m: any) => (
                    <li key={m.id}><b className="text-indigo-700">{m.user?.firstName ?? '?'}:</b> {m.content}</li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-2">
                  <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && msg.trim() && post.mutate()} placeholder="Type a message…" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                  <button onClick={() => post.mutate()} disabled={!msg.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Send</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-3">
            <h2 className="font-semibold">Schedule live class</h2>
            <input placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <textarea placeholder="description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <label className="text-xs text-slate-500">Start
              <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mt-1" />
            </label>
            <label className="text-xs text-slate-500">End
              <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mt-1" />
            </label>
            <input type="number" placeholder="capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="stream URL" value={form.streamUrl} onChange={(e) => setForm({ ...form, streamUrl: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShow(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => create.mutate()} disabled={!form.title || !form.startTime || !form.endTime} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
