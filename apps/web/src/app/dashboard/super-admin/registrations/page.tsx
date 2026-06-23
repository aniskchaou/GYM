'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Clock, CheckCircle, XCircle, Building2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Gym {
  id: string; name: string; slug: string; email: string;
  city?: string; country?: string; planTier: string; status: string;
  createdAt: string;
  _count: { users: number };
}

export default function SARegistrationsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<Gym[]>({
    queryKey: ['sa-registrations'],
    queryFn: () => api.get('/gyms').then(r =>
      (r.data as Gym[]).filter(g => g.status === 'TRIAL')
    ),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => api.patch(`/gyms/${id}`, { status: 'ACTIVE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-registrations'] }); qc.invalidateQueries({ queryKey: ['sa-gyms'] }); toast.success('Gym approved and activated'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => api.patch(`/gyms/${id}`, { status: 'CANCELLED' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-registrations'] }); qc.invalidateQueries({ queryKey: ['sa-gyms'] }); toast.success('Registration rejected'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const gyms = (data ?? []).filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase())
  );

  const planColor = (p: string) => ({ STARTER: 'bg-sky-100 text-sky-700', PROFESSIONAL: 'bg-purple-100 text-purple-700', ENTERPRISE: 'bg-indigo-100 text-indigo-700' }[p] ?? 'bg-slate-100 text-slate-600');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Clock size={22} /> Gym Registrations</h1>
        <p className="text-sm text-slate-500 mt-0.5">Review and approve gyms currently on trial</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Awaiting Review', value: gyms.length, color: 'bg-amber-50 border-amber-100', text: 'text-amber-600' },
          { label: 'Approved today', value: 0, color: 'bg-green-50 border-green-100', text: 'text-green-600' },
          { label: 'Rejected today', value: 0, color: 'bg-red-50 border-red-100', text: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl border p-4', s.color)}>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={cn('text-2xl font-bold mt-1', s.text)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search registrations…" className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading && <p className="text-center text-slate-500 py-8">Loading…</p>}
        {!isLoading && gyms.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">All caught up!</p>
            <p className="text-sm text-slate-500">No pending registrations at this time.</p>
          </div>
        )}
        {gyms.map(g => (
          <div key={g.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{g.name}</p>
                <p className="text-xs text-slate-500">{g.email} · {g.city ?? 'No city'}{g.country ? `, ${g.country}` : ''}</p>
                <p className="text-xs text-slate-400">Registered {new Date(g.createdAt).toLocaleDateString()} · {g._count.users} user{g._count.users !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={cn('px-2 py-0.5 rounded text-xs font-semibold', planColor(g.planTier))}>{g.planTier}</span>
              <button
                onClick={() => rejectMut.mutate(g.id)}
                disabled={rejectMut.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle size={13} /> Reject
              </button>
              <button
                onClick={() => approveMut.mutate(g.id)}
                disabled={approveMut.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle size={13} /> Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
