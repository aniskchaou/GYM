'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users, TrendingUp, CreditCard, UserCheck,
  Calendar, ArrowUp, ArrowDown,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

function StatCard({
  title, value, subtitle, icon: Icon, trend, color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', color)}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', trend >= 0 ? 'text-green-600' : 'text-red-500')}>
          {trend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}

export default function OwnerDashboardPage() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => api.get('/reports/kpis').then((r) => r.data),
  });

  const { data: revenueChart } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => api.get('/reports/revenue-chart?months=6').then((r) => r.data),
  });

  const { data: memberGrowth } = useQuery({
    queryKey: ['member-growth'],
    queryFn: () => api.get('/reports/member-growth?months=6').then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl h-32 shadow-sm" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Active Members',
      value: kpis?.activeMembers ?? 0,
      subtitle: `${kpis?.newMembersThisMonth ?? 0} new this month`,
      icon: Users,
      color: 'bg-indigo-500',
      trend: kpis?.memberGrowth,
    },
    {
      title: 'Revenue This Month',
      value: formatCurrency(kpis?.revenueThisMonth ?? 0),
      subtitle: `Total: ${formatCurrency(kpis?.totalRevenue ?? 0)}`,
      icon: CreditCard,
      color: 'bg-green-500',
      trend: kpis?.revenueGrowth,
    },
    {
      title: "Today's Check-ins",
      value: kpis?.todayCheckIns ?? 0,
      icon: UserCheck,
      color: 'bg-blue-500',
    },
    {
      title: 'Churn Rate',
      value: `${kpis?.churnRate ?? 0}%`,
      subtitle: `${kpis?.upcomingClasses ?? 0} classes today`,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Revenue — Last 6 months</h3>
          {revenueChart && (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Member growth */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Member Growth</h3>
          {memberGrowth && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)' }}
                />
                <Bar dataKey="members" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Member', href: '/dashboard/members/new', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
            { label: 'Check In', href: '/dashboard/attendance', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
            { label: 'New Class', href: '/dashboard/classes/new', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
            { label: 'Reports', href: '/dashboard/reports', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
          ].map((a) => (
            <a
              key={a.label}
              href={a.href}
              className={cn('rounded-xl p-4 text-center text-sm font-medium transition-colors', a.color)}
            >
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
