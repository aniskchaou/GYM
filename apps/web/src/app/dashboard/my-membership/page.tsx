'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Calendar, CheckCircle, Clock, RefreshCw, Snowflake, Play, ExternalLink, ShoppingBag, Zap } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';
import Link from 'next/link';

function normalizeFeatures(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
}

export default function MyMembershipPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showPlans, setShowPlans] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-membership'],
    queryFn: () => api.get('/memberships/my').then((r) => r.data).catch(() => null),
  });

  const { data: plans } = useQuery<any[]>({
    queryKey: ['membership-plans'],
    queryFn: () => api.get('/membership-plans').then(r => r.data?.plans ?? r.data ?? []),
    enabled: showPlans || !data,
  });

  const renewMut = useMutation({
    mutationFn: (id: string) => api.post(`/memberships/${id}/renew`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-membership'] }); toast.success('Membership renewed!'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Renewal failed'),
  });

  const freezeMut = useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) =>
      on ? api.patch(`/memberships/${id}/freeze`, {}).then(r => r.data)
         : api.patch(`/memberships/${id}/unfreeze`, {}).then(r => r.data),
    onSuccess: (_, { on }) => { qc.invalidateQueries({ queryKey: ['my-membership'] }); toast.success(on ? 'Membership frozen' : 'Membership unfrozen'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const purchaseMut = useMutation({
    mutationFn: ({ planId, memberId }: { planId: string; memberId: string }) =>
      api.post('/memberships', { planId, memberId }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-membership'] }); toast.success('Membership purchased!'); setShowPlans(false); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Purchase failed'),
  });

  const payOnline = async (planTier?: string) => {
    try {
      const { data } = await api.post('/gyms/my/billing/checkout', { planTier: planTier ?? 'STARTER' });
      window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Payment gateway not configured. Please contact reception.');
    }
  };

  const membership = data?.membership ?? data;
  const normalizedMembership = Array.isArray(membership)
    ? membership.find((item: any) => item?.status === 'ACTIVE' || item?.status === 'FROZEN') ?? membership[0] ?? null
    : membership;

  if (isLoading) {
    return <div className="bg-white rounded-2xl h-48 shadow-sm animate-pulse" />;
  }

  if (!normalizedMembership) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-center text-white">
          <CreditCard size={48} className="mx-auto mb-4 opacity-40" />
          <h2 className="text-xl font-bold mb-2">No Active Membership</h2>
          <p className="text-slate-400 text-sm mb-6">Choose a plan below to get started</p>
          <button onClick={() => setShowPlans(true)} className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl">
            <ShoppingBag size={16} /> Browse Plans
          </button>
        </div>

        {(showPlans || !data) && (plans ?? []).length > 0 && (
          <div className="grid sm:grid-cols-3 gap-4">
            {(plans ?? []).map((plan: any) => (
              <div key={plan.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
                <div>
                  <p className="font-bold text-slate-800 text-lg">{plan.name}</p>
                  <p className="text-2xl font-extrabold text-indigo-600 mt-1">{formatCurrency(plan.price)}<span className="text-sm font-normal text-slate-400">/mo</span></p>
                </div>
                {normalizeFeatures(plan.features).length > 0 && (
                  <ul className="space-y-1.5 flex-1">
                    {normalizeFeatures(plan.features).slice(0, 4).map((f: string) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-600"><CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />{f}</li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => purchaseMut.mutate({ planId: plan.id, memberId: user?.id ?? '' })}
                  disabled={purchaseMut.isPending}
                  className="w-full bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {purchaseMut.isPending ? 'Processing…' : 'Purchase'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const plan = normalizedMembership.plan ?? {};
  const planFeatures = normalizeFeatures((plan as any).features);
  const daysLeft = normalizedMembership.endDate
    ? Math.max(0, Math.ceil((new Date(normalizedMembership.endDate).getTime() - Date.now()) / 86400000))
    : null;

  const statusColor = normalizedMembership.status === 'ACTIVE' ? 'from-indigo-600 to-purple-600' : 'from-slate-700 to-slate-800';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Membership card */}
      <div className={cn('rounded-2xl p-6 text-white bg-gradient-to-br', statusColor)}>
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-widest font-semibold">GymFlow Member</p>
            <h2 className="text-2xl font-bold mt-1">{plan.name ?? 'Membership'}</h2>
          </div>
          <div className="bg-white/20 p-2.5 rounded-xl">
            <CreditCard size={24} className="text-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-white/60 text-xs mb-1">Member</p>
            <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs mb-1">Member #</p>
            <p className="font-semibold font-mono">{normalizedMembership.memberNumber ?? normalizedMembership.member?.memberProfile?.memberNumber ?? '----'}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs mb-1">Valid from</p>
            <p className="font-semibold">{normalizedMembership.startDate ? formatDate(normalizedMembership.startDate) : '--'}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs mb-1">Valid until</p>
            <p className="font-semibold">{normalizedMembership.endDate ? formatDate(normalizedMembership.endDate) : 'Ongoing'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
          <span className="text-sm font-medium">{normalizedMembership.status}</span>
          {daysLeft !== null && (
            <span className="flex items-center gap-1 text-sm">
              <Clock size={14} />
              {daysLeft} days remaining
            </span>
          )}
        </div>
      </div>

      {/* Plan details */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Plan Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-slate-400 text-xs">Plan</p>
            <p className="font-medium text-slate-800 mt-0.5">{plan.name}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Price</p>
            <p className="font-medium text-slate-800 mt-0.5">{plan.price != null ? formatCurrency(plan.price) : '--'}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Billing</p>
            <p className="font-medium text-slate-800 mt-0.5">{plan.interval ?? 'Monthly'}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Renewal</p>
            <p className="font-medium text-slate-800 mt-0.5">{normalizedMembership.autoRenew ? 'Auto' : 'Manual'}</p>
          </div>
        </div>
        {planFeatures.length > 0 && (
          <ul className="space-y-2 mt-4 pt-4 border-t border-slate-50">
            {planFeatures.map((f: string) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle size={14} className="text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Member actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Membership Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Renew */}
          <button
            onClick={() => renewMut.mutate(normalizedMembership.id)}
            disabled={renewMut.isPending}
            className="flex items-center gap-2 justify-center p-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            {renewMut.isPending ? 'Renewing…' : 'Renew Membership'}
          </button>

          {/* Freeze / Unfreeze */}
          {normalizedMembership.status === 'ACTIVE' ? (
            <button
              onClick={() => freezeMut.mutate({ id: normalizedMembership.id, on: true })}
              disabled={freezeMut.isPending}
              className="flex items-center gap-2 justify-center p-3 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 text-sm font-medium hover:bg-sky-100 disabled:opacity-50"
            >
              <Snowflake size={16} />
              {freezeMut.isPending ? 'Freezing…' : 'Freeze Membership'}
            </button>
          ) : normalizedMembership.status === 'FROZEN' ? (
            <button
              onClick={() => freezeMut.mutate({ id: normalizedMembership.id, on: false })}
              disabled={freezeMut.isPending}
              className="flex items-center gap-2 justify-center p-3 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 disabled:opacity-50"
            >
              <Play size={16} />
              {freezeMut.isPending ? 'Unfreezing…' : 'Unfreeze Membership'}
            </button>
          ) : null}

          {/* Pay online */}
          <button
            onClick={() => payOnline()}
            className="flex items-center gap-2 justify-center p-3 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100"
          >
            <CreditCard size={16} /> Pay Online
          </button>

          {/* Invoices */}
          <Link href="/dashboard/member/invoices" className="flex items-center gap-2 justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium hover:bg-slate-100">
            <ExternalLink size={16} /> My Invoices
          </Link>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/dashboard/bookings" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-center">
          <Calendar size={24} className="mx-auto text-indigo-500 mb-2" />
          <p className="font-semibold text-sm text-slate-800">Book a Class</p>
          <p className="text-xs text-slate-400 mt-0.5">Reserve your spot</p>
        </Link>
        <Link href="/dashboard/member/progress" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-center">
          <CheckCircle size={24} className="mx-auto text-green-500 mb-2" />
          <p className="font-semibold text-sm text-slate-800">My Progress</p>
          <p className="text-xs text-slate-400 mt-0.5">Track your journey</p>
        </Link>
      </div>
    </div>
  );
}
