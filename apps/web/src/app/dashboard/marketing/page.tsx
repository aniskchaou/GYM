'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Send, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const SEGMENTS = ['ALL', 'ACTIVE', 'INACTIVE_7D', 'INACTIVE_30D', 'CHURN_RISK', 'EXPIRING_7D', 'NEW_MEMBERS_30D', 'HIGH_VALUE', 'TRIAL'];
const CHANNELS = ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP'];

export default function MarketingPage() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({ name: '', subject: '', body: '', channel: 'EMAIL', segment: 'ALL' });
  const [segPreview, setSegPreview] = useState<string>('ALL');

  const campaigns = useQuery({ queryKey: ['campaigns'], queryFn: () => api.get('/marketing/campaigns').then((r) => r.data).catch(() => []) });
  const preview = useQuery({
    queryKey: ['seg-preview', segPreview],
    queryFn: () => api.get('/marketing/segment/preview', { params: { segment: segPreview } }).then((r) => r.data).catch(() => []),
  });

  const create = useMutation({
    mutationFn: () => api.post('/marketing/campaigns', form).then((r) => r.data),
    onSuccess: () => { toast.success('Created'); setShow(false); qc.invalidateQueries({ queryKey: ['campaigns'] }); },
  });
  const send = useMutation({
    mutationFn: (id: string) => api.post(`/marketing/campaigns/${id}/send`).then((r) => r.data),
    onSuccess: (d: any) => { toast.success(`Sent to ${d?.recipientCount ?? '?'}`); qc.invalidateQueries({ queryKey: ['campaigns'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/marketing/campaigns/${id}`).then((r) => r.data),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['campaigns'] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketing</h1>
          <p className="text-sm text-slate-500">Campaigns, segments, triggers</p>
        </div>
        <button onClick={() => setShow(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Plus size={16} /> New Campaign
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Megaphone size={18} /> Campaigns</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {(campaigns.data ?? []).map((c: any) => (
              <li key={c.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{c.name} <span className="text-xs text-slate-500">· {c.channel} · {c.segment}</span></div>
                  <div className="text-xs text-slate-500">{c.subject}</div>
                  <div className="text-xs text-slate-500">Status: {c.status} · Sent: {c.sentCount ?? 0}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => send.mutate(c.id)} disabled={c.status === 'COMPLETED'} className="text-emerald-600 disabled:text-slate-300"><Send size={16} /></button>
                  <button onClick={() => confirm('Delete?') && del.mutate(c.id)} className="text-red-500"><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
            {(campaigns.data ?? []).length === 0 && <li className="py-2 text-slate-400">No campaigns yet.</li>}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold mb-3">Segment preview</h3>
          <select value={segPreview} onChange={(e) => setSegPreview(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3">
            {SEGMENTS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <div className="text-2xl font-bold text-indigo-700">{(preview.data ?? []).length}</div>
          <div className="text-xs text-slate-500">members in segment</div>
        </div>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-3">
            <h2 className="font-semibold">New campaign</h2>
            <input placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="subject / title" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <textarea placeholder="body" rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
                {CHANNELS.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
                {SEGMENTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShow(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => create.mutate()} disabled={!form.name.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
