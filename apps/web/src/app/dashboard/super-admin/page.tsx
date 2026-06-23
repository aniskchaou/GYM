'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Building2, Users, CreditCard, TrendingUp, Globe,
  CheckCircle, AlertCircle, XCircle, ArrowRight,
  Percent, ShieldCheck, ArrowUp, ArrowDown, Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface Gym {
  id: string;
  name: string;
  slug: string;
  email: string;
  city: string | null;
  status: string;
  planTier: string;
  platformCommissionRate?: number;
  createdAt: string;
  _count: { users: number; branches: number };
}

function StatCard({
  label, value, sub, icon: Icon, color, trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', color)}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={cn('flex items-center gap-1 mt-3 text-xs font-semibold', trend >= 0 ? 'text-emerald-600' : 'text-red-500')}>
          {trend >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
          {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:    'bg-emerald-50 text-emerald-700 border-emerald-100',
  TRIAL:     'bg-amber-50  text-amber-700  border-amber-100',
  SUSPENDED: 'bg-red-50    text-red-700    border-red-100',
  CANCELLED: 'bg-slate-50  text-slate-500  border-slate-200',
};
const PLAN_STYLE: Record<string, string> = {
  STARTER:      'bg-sky-50    text-sky-700    border-sky-100',
  PROFESSIONAL: 'bg-purple-50 text-purple-700 border-purple-100',
  ENTERPRISE:   'bg-indigo-50 text-indigo-700 border-indigo-100',
};

export default function SuperAdminDashboard() {
  const { data: gyms = [], isLoading } = useQuery<Gym[]>({
    queryKey: ['sa-gyms'],
    queryFn: () => api.get('/gyms').then((r) => r.data),
  });

  const total       = gyms.length;
  const active      = gyms.filter((g) => g.status === 'ACTIVE').length;
  const trial       = gyms.filter((g) => g.status === 'TRIAL').length;
  const suspended   = gyms.filter((g) => g.status === 'SUSPENDED').length;
  const totalMembers = gyms.reduce((s, g) => s + (g._count?.users ?? 0), 0);
  const enterprise  = gyms.filter((g) => g.planTier === 'ENTERPRISE').length;
  const professional = gyms.filter((g) => g.planTier === 'PROFESSIONAL').length;

  const recent = [...gyms]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Super Admin</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Platform Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">GymFlow SaaS — all gyms, members &amp; revenue at a glance</p>
        </div>
        <Link
          href="/dashboard/admin/gyms"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          Manage all gyms <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Gyms"    value={total}        sub={`${active} active`}      icon={Building2}  color="bg-indigo-500" trend={12} />
        <StatCard label="Total Members" value={totalMembers} sub="across all gyms"          icon={Users}      color="bg-emerald-500" trend={8} />
        <StatCard label="On Trial"      value={trial}        sub="14-day free trial"        icon={AlertCircle} color="bg-amber-500" />
        <StatCard label="Enterprise"    value={enterprise}   sub={`${professional} Professional`} icon={TrendingUp} color="bg-purple-500" trend={5} />
      </div>

      {/* Status breakdown + plan breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" /> Gym status breakdown
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Active',    count: active,    icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500' },
              { label: 'On Trial',  count: trial,     icon: AlertCircle, color: 'text-amber-500',   bg: 'bg-amber-500' },
              { label: 'Suspended', count: suspended, icon: XCircle,     color: 'text-red-500',     bg: 'bg-red-500' },
              { label: 'Cancelled', count: gyms.filter(g => g.status === 'CANCELLED').length, icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-400' },
            ].map(({ label, count, icon: Icon, color, bg }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className={cn('w-4 h-4 shrink-0', color)} />
                <span className="text-sm text-slate-600 w-24">{label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={cn('h-2 rounded-full transition-all', bg)} style={{ width: total ? `${(count / total) * 100}%` : '0%' }} />
                </div>
                <span className="text-sm font-bold text-slate-700 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" /> Subscription plan breakdown
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Enterprise',   count: enterprise,    color: 'text-indigo-500', bg: 'bg-indigo-500',  price: '$299/mo' },
              { label: 'Professional', count: professional,  color: 'text-purple-500', bg: 'bg-purple-500',  price: '$99/mo' },
              { label: 'Starter',      count: gyms.filter(g => g.planTier === 'STARTER').length, color: 'text-sky-500', bg: 'bg-sky-500', price: '$29/mo' },
            ].map(({ label, count, color, bg, price }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={cn('text-xs font-bold w-20 shrink-0', color)}>{label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={cn('h-2 rounded-full transition-all', bg)} style={{ width: total ? `${(count / total) * 100}%` : '0%' }} />
                </div>
                <span className="text-sm font-bold text-slate-700 w-6 text-right">{count}</span>
                <span className="text-xs text-slate-400 w-16 text-right">{price}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-extrabold text-indigo-600">{enterprise}</p>
              <p className="text-xs text-slate-400">Enterprise</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-purple-600">{professional}</p>
              <p className="text-xs text-slate-400">Professional</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-sky-600">{gyms.filter(g => g.planTier === 'STARTER').length}</p>
              <p className="text-xs text-slate-400">Starter</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'All Gyms',   href: '/dashboard/admin/gyms', icon: Globe,     color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
          { label: 'Analytics',  href: '/dashboard/reports',    icon: TrendingUp, color: 'bg-purple-50 text-purple-600 border-purple-100' },
          { label: 'Branches',   href: '/dashboard/branches',   icon: Building2,  color: 'bg-sky-50    text-sky-600    border-sky-100' },
          { label: 'Commission', href: '/dashboard/admin/gyms', icon: Percent,    color: 'bg-amber-50  text-amber-600  border-amber-100' },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link
            key={label}
            href={href}
            className={cn('flex items-center gap-3 p-4 rounded-2xl border font-semibold text-sm hover:shadow-md transition-all', color)}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </Link>
        ))}
      </div>

      {/* Recently added gyms */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Recently added gyms</h2>
          <Link href="/dashboard/admin/gyms" className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Gym', 'City', 'Status', 'Plan', 'Members', 'Joined'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-5 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : recent.map((gym) => (
                    <tr key={gym.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{gym.name}</p>
                          <p className="text-xs text-slate-400">{gym.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">{gym.city ?? '—'}</td>
                      <td className="px-5 py-3">
                        <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', STATUS_STYLE[gym.status] ?? STATUS_STYLE.CANCELLED)}>
                          {gym.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', PLAN_STYLE[gym.planTier] ?? PLAN_STYLE.STARTER)}>
                          {gym.planTier}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-slate-700">{gym._count?.users ?? 0}</td>
                      <td className="px-5 py-3 text-xs text-slate-400">
                        {new Date(gym.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
