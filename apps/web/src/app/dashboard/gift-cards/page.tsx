'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift, Plus } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function GiftCardsPage() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ amount: 50, recipientEmail: '', message: '' });
  const [redeem, setRedeem] = useState('');
  const [lookup, setLookup] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);

  const mine = useQuery({ queryKey: ['gc-mine'], queryFn: () => api.get('/gift-cards/mine').then((r) => r.data).catch(() => []) });
  const all = useQuery({ queryKey: ['gc-all'], queryFn: () => api.get('/gift-cards').then((r) => r.data).catch(() => []) });

  const purchase = useMutation({
    mutationFn: () => api.post('/gift-cards/purchase', form).then((r) => r.data),
    onSuccess: () => { toast.success('Gift card created!'); setShow(false); qc.invalidateQueries({ queryKey: ['gc-mine'] }); qc.invalidateQueries({ queryKey: ['gc-all'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const redeemMut = useMutation({
    mutationFn: () => api.post('/gift-cards/redeem', { code: redeem }).then((r) => r.data),
    onSuccess: () => { toast.success('Redeemed!'); setRedeem(''); qc.invalidateQueries({ queryKey: ['gc-mine'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Invalid code'),
  });
  const doLookup = async () => {
    try {
      const r = await api.get('/gift-cards/lookup', { params: { code: lookup } });
      setLookupResult(r.data);
    } catch (e: any) {
      toast.error('Not found');
      setLookupResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gift Cards</h1>
          <p className="text-sm text-slate-500">Purchase, redeem, and manage gift cards</p>
        </div>
        <button onClick={() => setShow(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Plus size={16} /> Purchase
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold mb-3">Redeem a code</h3>
          <div className="flex gap-2">
            <input value={redeem} onChange={(e) => setRedeem(e.target.value)} placeholder="Gift card code" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <button onClick={() => redeemMut.mutate()} disabled={!redeem.trim()} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Redeem</button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold mb-3">Lookup balance</h3>
          <div className="flex gap-2">
            <input value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="Gift card code" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <button onClick={doLookup} disabled={!lookup.trim()} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Check</button>
          </div>
          {lookupResult && (
            <div className="mt-2 text-sm">Balance: <b className="text-emerald-700">${lookupResult.balance}</b> / ${lookupResult.amount} · {lookupResult.status}</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Gift size={18} className="text-pink-500" /> My gift cards</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {(mine.data ?? []).map((g: any) => (
            <li key={g.id} className="py-2 flex justify-between">
              <span><b>{g.code}</b> · ${g.balance}/${g.amount}</span>
              <span className="text-xs text-slate-500">{g.status}</span>
            </li>
          ))}
          {(mine.data ?? []).length === 0 && <li className="py-2 text-slate-400">No gift cards yet.</li>}
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold mb-3">All gym gift cards</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {(all.data ?? []).slice(0, 20).map((g: any) => (
            <li key={g.id} className="py-2 flex justify-between">
              <span>{g.code} → {g.recipientEmail ?? '—'}</span>
              <span>${g.balance}/${g.amount} · {g.status}</span>
            </li>
          ))}
        </ul>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-3">
            <h2 className="font-semibold">Purchase gift card</h2>
            <input type="number" placeholder="amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="recipient email (optional)" value={form.recipientEmail} onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <textarea placeholder="message (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShow(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => purchase.mutate()} disabled={form.amount <= 0} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Purchase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
