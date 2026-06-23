'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Building2, Plus, ExternalLink, Users, Globe, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function MyGymsPage() {
  const { user } = useAuthStore();

  const { data: myGym, isLoading } = useQuery<any>({
    queryKey: ['my-gym'],
    queryFn: () => api.get('/gyms/my').then(r => r.data).catch(() => null),
  });

  const { data: branches = [] } = useQuery<any[]>({
    queryKey: ['branches'],
    queryFn: () => api.get('/branches').then(r => r.data),
  });

  const { data: stats } = useQuery<any>({
    queryKey: ['kpis'],
    queryFn: () => api.get('/reports/kpis').then(r => r.data),
  });

  const planColor = (p: string) => ({ STARTER: 'bg-sky-100 text-sky-700', PROFESSIONAL: 'bg-purple-100 text-purple-700', ENTERPRISE: 'bg-indigo-100 text-indigo-700' }[p] ?? 'bg-slate-100 text-slate-600');
  const statusColor = (s: string) => ({ ACTIVE: 'bg-green-100 text-green-700', TRIAL: 'bg-amber-100 text-amber-700', SUSPENDED: 'bg-red-100 text-red-700' }[s] ?? 'bg-slate-100 text-slate-600');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Building2 size={22} /> My Gym Organizations</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your gym properties, branches, and subscription</p>
      </div>

      {isLoading && <p className="text-slate-500">Loading…</p>}

      {myGym && (
        <>
          {/* Primary gym card */}
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm overflow-hidden">
            <div className="flex items-start justify-between p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                  {myGym.logoUrl ? (
                    <img src={myGym.logoUrl} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                  ) : (
                    <Building2 size={24} className="text-indigo-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{myGym.name}</h2>
                  <p className="text-sm text-slate-500">{myGym.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', statusColor(myGym.status))}>{myGym.status}</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', planColor(myGym.planTier))}>{myGym.planTier}</span>
                    {myGym.city && <span className="text-xs text-slate-400">{myGym.city}{myGym.country ? `, ${myGym.country}` : ''}</span>}
                  </div>
                </div>
              </div>
              <Link href="/dashboard/settings?tab=gym" className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline">Edit <ExternalLink size={12} /></Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 border-t border-slate-100">
              {[
                { label: 'Members', value: stats?.totalMembers ?? myGym._count?.users ?? '—' },
                { label: 'Branches', value: (branches.length || myGym._count?.branches) ?? '—' },
                { label: 'Max Members', value: myGym.maxMembers?.toLocaleString() ?? '—' },
                { label: 'Currency', value: myGym.currency ?? 'USD' },
              ].map(s => (
                <div key={s.label} className="p-4 text-center border-r border-slate-100 last:border-0">
                  <p className="text-lg font-bold text-slate-800">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Subscription alert */}
            {myGym.status === 'TRIAL' && myGym.trialEndsAt && (
              <div className="mx-5 mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <Clock size={16} className="text-amber-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">Trial ends {new Date(myGym.trialEndsAt).toLocaleDateString()}</p>
                  <p className="text-xs text-amber-600">Upgrade to a paid plan to continue after your trial.</p>
                </div>
                <Link href="/dashboard/settings?tab=billing" className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 whitespace-nowrap">Upgrade now</Link>
              </div>
            )}
          </div>

          {/* Branches section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-slate-800">Branches ({branches.length}/{myGym.maxBranches})</h3>
              <Link href="/dashboard/branches" className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline">Manage branches <ArrowRight size={12} /></Link>
            </div>
            {branches.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p>No branches yet. <Link href="/dashboard/branches" className="text-indigo-600 hover:underline">Create your first branch →</Link></p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {branches.slice(0, 5).map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{b.name}</p>
                      <p className="text-xs text-slate-400">{b.address ?? b.city ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span><Users size={11} className="inline mr-1" />{b.capacity} capacity</span>
                      <span className={cn('px-2 py-0.5 rounded-full', b.isActive === false ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700')}>{b.isActive === false ? 'Inactive' : 'Active'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Register additional gym CTA */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
            <Plus size={22} className="text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-lg">Own another gym?</h3>
            <p className="text-sm text-slate-600 mt-1 mb-4">
              You can register additional gym locations as separate organizations on GymFlow. Each gym gets its own dashboard, members, and subscription.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {['Separate billing per gym', 'Independent member databases', 'Unified GymFlow account', 'Each gym has its own staff'].map(f => (
                <span key={f} className="flex items-center gap-1 text-xs bg-white border border-indigo-100 text-slate-600 px-2.5 py-1 rounded-full">
                  <CheckCircle size={11} className="text-indigo-500" />{f}
                </span>
              ))}
            </div>
            <Link href="/auth/register-gym" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Globe size={16} /> Register Another Gym
            </Link>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/dashboard/settings?tab=billing', label: 'Billing & Subscription', color: 'bg-indigo-50 text-indigo-700' },
          { href: '/dashboard/settings?tab=gym',     label: 'Gym Settings',           color: 'bg-slate-50  text-slate-700' },
          { href: '/dashboard/branches',             label: 'Manage Branches',        color: 'bg-purple-50 text-purple-700' },
          { href: '/dashboard/staff',                label: 'Manage Staff',           color: 'bg-amber-50  text-amber-700' },
        ].map(l => (
          <Link key={l.href} href={l.href} className={cn('flex items-center justify-between p-4 rounded-xl border border-slate-100 text-sm font-medium hover:shadow-sm transition-shadow', l.color)}>
            {l.label} <ArrowRight size={14} />
          </Link>
        ))}
      </div>
    </div>
  );
}
