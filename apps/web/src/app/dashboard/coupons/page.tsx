'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Plus, X, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const EMPTY = {
  code: '',
  discountType: 'PERCENT',
  discountValue: 10,
  validFrom: '',
  validUntil: '',
  maxUses: '',
};

export default function CouponsPage() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => api.get('/coupons').then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (payload: any) => api.post('/coupons', payload).then((r) => r.data),
    onSuccess: () => {
      toast.success('Coupon created');
      qc.invalidateQueries({ queryKey: ['coupons'] });
      setShow(false);
      setForm(EMPTY);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/${id}`).then((r) => r.data),
    onSuccess: () => {
      toast.success('Coupon deleted');
      qc.invalidateQueries({ queryKey: ['coupons'] });
    },
  });

  const coupons: any[] = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Discount Coupons</h1>
          <p className="text-sm text-slate-500">Create promo codes for memberships & POS</p>
        </div>
        <button
          onClick={() => setShow(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={16} /> New Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center text-slate-500">Loading…</p>
        ) : coupons.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No coupons yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Discount</th>
                <th className="text-left px-4 py-3">Valid</th>
                <th className="text-left px-4 py-3">Used</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono font-semibold text-indigo-700">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.discountType === 'PERCENT' ? `${c.discountValue}%` : `${c.discountValue} off`}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {c.currentUses ?? 0}{c.maxUses ? ` / ${c.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { if (confirm('Delete coupon?')) remove.mutate(c.id); }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Tag size={18} /> New Coupon</h2>
              <button onClick={() => setShow(false)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <input
                placeholder="Code (e.g. SUMMER25)"
                className="w-full border rounded-lg px-3 py-2 text-sm uppercase"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="border rounded-lg px-3 py-2 text-sm"
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                >
                  <option value="PERCENT">% Percent</option>
                  <option value="FIXED">Fixed amount</option>
                </select>
                <input
                  type="number"
                  className="border rounded-lg px-3 py-2 text-sm"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2 text-sm"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                />
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2 text-sm"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                />
              </div>
              <input
                type="number"
                placeholder="Max uses (optional)"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200">
              <button onClick={() => setShow(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
              <button
                onClick={() => {
                  if (!form.code) return toast.error('Code required');
                  const payload: any = { ...form };
                  if (!payload.maxUses) delete payload.maxUses;
                  else payload.maxUses = Number(payload.maxUses);
                  if (!payload.validFrom) delete payload.validFrom;
                  if (!payload.validUntil) delete payload.validUntil;
                  create.mutate(payload);
                }}
                disabled={create.isPending}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {create.isPending ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
