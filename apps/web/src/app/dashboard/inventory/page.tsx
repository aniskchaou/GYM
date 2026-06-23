'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Boxes, AlertTriangle, Plus, Truck } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'movements' | 'suppliers' | 'low'>('movements');
  const [moveForm, setMoveForm] = useState<any>({ productId: '', type: 'PURCHASE', quantity: 1, reason: '' });
  const [supForm, setSupForm] = useState<any>({ name: '', contact: '' });

  const movements = useQuery({ queryKey: ['inv-mov'], queryFn: () => api.get('/inventory/movements').then((r) => r.data).catch(() => []) });
  const suppliers = useQuery({ queryKey: ['inv-sup'], queryFn: () => api.get('/inventory/suppliers').then((r) => r.data).catch(() => []) });
  const low = useQuery({ queryKey: ['inv-low'], queryFn: () => api.get('/inventory/low-stock').then((r) => r.data).catch(() => []) });
  const products = useQuery({ queryKey: ['products'], queryFn: () => api.get('/pos/products').then((r) => r.data).catch(() => []) });

  const recordMove = useMutation({
    mutationFn: () => api.post('/inventory/movements', moveForm).then((r) => r.data),
    onSuccess: () => { toast.success('Recorded'); qc.invalidateQueries({ queryKey: ['inv-mov'] }); qc.invalidateQueries({ queryKey: ['inv-low'] }); setMoveForm({ productId: '', type: 'IN', quantity: 1, reason: '' }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const addSupplier = useMutation({
    mutationFn: () => api.post('/inventory/suppliers', supForm).then((r) => r.data),
    onSuccess: () => { toast.success('Supplier added'); qc.invalidateQueries({ queryKey: ['inv-sup'] }); setSupForm({ name: '', contact: '' }); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inventory & Suppliers</h1>
        <p className="text-sm text-slate-500">Track stock, movements, and low-stock alerts</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {(['movements', 'suppliers', 'low'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium ${tab === t ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-slate-500'}`}
          >
            {t === 'low' ? 'Low Stock' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'movements' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Boxes size={18} /> Recent movements</h2>
            <ul className="divide-y divide-slate-100 text-sm">
              {(movements.data ?? []).map((m: any) => (
                <li key={m.id} className="py-2 flex justify-between">
                  <span>{m.productName ?? m.productId} · <b>{m.type}</b> · {m.quantity}</span>
                  <span className="text-slate-500 text-xs">{new Date(m.createdAt).toLocaleString()}</span>
                </li>
              ))}
              {(movements.data ?? []).length === 0 && <li className="text-slate-400 py-2">No movements yet.</li>}
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold mb-3">Record movement</h3>
            <select value={moveForm.productId} onChange={(e) => setMoveForm({ ...moveForm, productId: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-2">
              <option value="">Select product</option>
              {(products.data ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.name} (stock: {p.stock})</option>)}
            </select>
            <select value={moveForm.type} onChange={(e) => setMoveForm({ ...moveForm, type: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-2">
              {['PURCHASE','SALE','ADJUSTMENT','RETURN','EXPIRY'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <input type="number" placeholder="quantity" value={moveForm.quantity} onChange={(e) => setMoveForm({ ...moveForm, quantity: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-2" />
            <input placeholder="reason (optional)" value={moveForm.reason} onChange={(e) => setMoveForm({ ...moveForm, reason: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3" />
            <button onClick={() => recordMove.mutate()} disabled={!moveForm.productId} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">Save</button>
          </div>
        </div>
      )}

      {tab === 'suppliers' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Truck size={18} /> Suppliers</h2>
            <ul className="divide-y divide-slate-100 text-sm">
              {(suppliers.data ?? []).map((s: any) => (
                <li key={s.id} className="py-2 flex justify-between">
                  <span><b>{s.name}</b> · {s.contact ?? '—'}</span>
                </li>
              ))}
              {(suppliers.data ?? []).length === 0 && <li className="text-slate-400 py-2">No suppliers.</li>}
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Plus size={16} /> Add Supplier</h3>
            <input placeholder="name" value={supForm.name} onChange={(e) => setSupForm({ ...supForm, name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-2" />
            <input placeholder="contact" value={supForm.contact} onChange={(e) => setSupForm({ ...supForm, contact: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3" />
            <button onClick={() => addSupplier.mutate()} disabled={!supForm.name.trim()} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">Add</button>
          </div>
        </div>
      )}

      {tab === 'low' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-amber-700"><AlertTriangle size={18} /> Low stock</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {(low.data ?? []).map((p: any) => (
              <li key={p.id} className="py-2 flex justify-between">
                <span><b>{p.name}</b></span>
                <span className="text-amber-700">{p.stock} left</span>
              </li>
            ))}
            {(low.data ?? []).length === 0 && <li className="text-emerald-600 py-2">All products well-stocked.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
