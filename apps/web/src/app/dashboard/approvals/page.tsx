'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { CheckCircle, Clock, XCircle, Users, Search, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface PendingMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  memberProfile?: { memberNumber?: string };
  memberships?: { id: string; status: string; plan?: { name: string } }[];
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:    'bg-green-100 text-green-700',
  PENDING:   'bg-amber-100 text-amber-700',
  INACTIVE:  'bg-slate-100 text-slate-500',
  CANCELLED: 'bg-red-100   text-red-600',
  EXPIRED:   'bg-slate-100 text-slate-500',
};

export default function MembershipApprovalsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  // Members without active memberships = pending approval
  const { data: pending = [], isLoading } = useQuery<PendingMember[]>({
    queryKey: ['pending-memberships'],
    queryFn: () => api.get('/members/pending-memberships').then(r => r.data),
  });

  const { data: plansData } = useQuery<any[]>({
    queryKey: ['membership-plans'],
    queryFn: () => api.get('/membership-plans').then(r => r.data?.plans ?? r.data),
  });
  const plans = plansData ?? [];

  const approveMut = useMutation({
    mutationFn: ({ memberId, planId }: { memberId: string; planId: string }) =>
      api.post('/memberships', { memberId, planId }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pending-memberships'] });
      toast.success('Membership approved');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const rejectMut = useMutation({
    mutationFn: (memberId: string) =>
      api.put(`/members/${memberId}`, { isEmailVerified: false }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pending-memberships'] }); toast.success('Member rejected'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const visible = pending.filter(m =>
    !search || `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><UserCheck size={22} /> Membership Approvals</h1>
        <p className="text-sm text-slate-500 mt-0.5">Members awaiting an active membership assignment</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Awaiting',  value: pending.length,  color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Plans Available', value: plans.length, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
          { label: 'Approved Today', value: 0, color: 'bg-green-50 border-green-200 text-green-700' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl border p-4', s.color)}>
            <p className="text-xs opacity-70">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members…" className="pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading && <p className="text-center text-slate-500 py-8">Loading…</p>}
        {!isLoading && visible.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">All caught up!</p>
            <p className="text-sm text-slate-500">No pending membership approvals.</p>
          </div>
        )}
        {visible.map(m => {
          const lastMembership = m.memberships?.[0];
          return (
            <div key={m.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                  {m.firstName[0]}{m.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{m.firstName} {m.lastName}</p>
                  <p className="text-xs text-slate-400">{m.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {m.memberProfile?.memberNumber ? `#${m.memberProfile.memberNumber} · ` : ''}
                    Registered {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                  {lastMembership && (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLOR[lastMembership.status] ?? 'bg-slate-100 text-slate-500')}>
                      Last: {lastMembership.status} — {lastMembership.plan?.name ?? '—'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Plan selector + approve */}
                <ApproveForm
                  plans={plans}
                  onApprove={planId => approveMut.mutate({ memberId: m.id, planId })}
                  loading={approveMut.isPending}
                />
                <button
                  onClick={() => rejectMut.mutate(m.id)}
                  disabled={rejectMut.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50"
                >
                  <XCircle size={13} /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApproveForm({ plans, onApprove, loading }: { plans: any[]; onApprove: (planId: string) => void; loading: boolean }) {
  const [planId, setPlanId] = useState('');
  return (
    <div className="flex items-center gap-2">
      <select value={planId} onChange={e => setPlanId(e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none bg-white">
        <option value="">Select plan…</option>
        {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
      </select>
      <button
        disabled={!planId || loading}
        onClick={() => onApprove(planId)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-40"
      >
        <CheckCircle size={13} /> Approve
      </button>
    </div>
  );
}
