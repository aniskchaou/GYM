'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Users, CheckCircle, Plus, X, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const INTERVAL_LABEL: Record<string, string> = {
  MONTHLY: '/mo',
  QUARTERLY: '/quarter',
  SEMI_ANNUAL: '/6mo',
  ANNUAL: '/yr',
  DAILY: '/day',
  WEEKLY: '/week',
};

const PLAN_TYPES = ['MONTHLY', 'ANNUAL', 'PAY_PER_VISIT', 'FAMILY', 'STUDENT', 'CORPORATE', 'DAY_PASS'];
const EMPTY_PLAN = { name: '', description: '', type: 'MONTHLY', price: '', durationDays: '30', features: '' };

export default function MembershipsPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_PLAN);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: () => api.get('/membership-plans').then((r) => r.data),
  });

  const { data: activeMemberships } = useQuery({
    queryKey: ['active-memberships'],
    queryFn: () => api.get('/memberships?status=ACTIVE&limit=10').then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (payload: any) => api.post('/membership-plans', payload).then((r) => r.data),
    onSuccess: () => {
      toast.success('Plan created');
      qc.invalidateQueries({ queryKey: ['membership-plans'] });
      setShowModal(false);
      setForm(EMPTY_PLAN);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to create plan'),
  });

  const renew = useMutation({
    mutationFn: (id: string) => api.post(`/memberships/${id}/renew`).then(r => r.data),
    onSuccess: () => {
      toast.success('Membership renewed for another period');
      qc.invalidateQueries({ queryKey: ['active-memberships'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Renewal failed'),
  });

  const plans: any[] = data?.plans ?? data ?? [];
  const memberships: any[] = activeMemberships?.memberships ?? activeMemberships ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid sm:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-48 shadow-sm" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800 text-lg">New Membership Plan</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const payload = { ...form, features: form.features ? form.features.split(',').map((s) => s.trim()).filter(Boolean) : [] };
              create.mutate(payload);
            }} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Plan Name *</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Monthly Basic" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-white">
                    {PLAN_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Price (€) *</label>
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="29.99" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Days</label>
                  <input type="number" min="1" value={form.durationDays} onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Features (comma-separated)</label>
                <input value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                  placeholder="Unlimited access, Locker room, Pool" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={create.isPending} className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-60">
                  {create.isPending ? 'Creating…' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Membership Plans</h2>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Plus size={16} /> New Plan
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan: any) => (
            <div key={plan.id} className={cn('bg-white rounded-2xl p-6 shadow-sm border transition-shadow hover:shadow-md', plan.isPopular ? 'border-indigo-300' : 'border-slate-100')}>
              {plan.isPopular && (
                <span className="text-xs font-bold bg-indigo-500 text-white px-2.5 py-1 rounded-full mb-3 inline-block">Most Popular</span>
              )}
              <h3 className="font-bold text-slate-800 text-lg">{plan.name}</h3>
              {plan.description && <p className="text-slate-500 text-sm mt-1 mb-3">{plan.description}</p>}
              <div className="mb-4">
                <span className="text-3xl font-extrabold text-slate-900">{formatCurrency(plan.price)}</span>
                <span className="text-slate-500 text-sm">{INTERVAL_LABEL[plan.interval] ?? '/mo'}</span>
              </div>
              {plan.features?.length > 0 && (
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f: string) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle size={13} className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-50">
                <span className="flex items-center gap-1"><Users size={12} /> {plan._count?.memberships ?? 0} members</span>
                <span className={`px-2 py-0.5 rounded-full font-medium ${plan.isActive !== false ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                  {plan.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-3 bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
              <CreditCard size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">No plans yet. Create your first membership plan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent active memberships */}
      {memberships.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Active Memberships</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {memberships.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-sm text-slate-800">
                    {m.member?.user?.firstName} {m.member?.user?.lastName}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{m.plan?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-slate-500">
                    <p>{m.endDate ? new Date(m.endDate).toLocaleDateString() : 'Ongoing'}</p>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <button
                    onClick={() => renew.mutate(m.id)}
                    disabled={renew.isPending}
                    className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    title="Renew membership for another period"
                  >
                    <RefreshCw size={11} /> Renew
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
