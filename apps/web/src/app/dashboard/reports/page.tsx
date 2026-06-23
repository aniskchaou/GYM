'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart2, Users, TrendingUp, Activity, Award, Dumbbell } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const FALLBACK_REVENUE = [
  { month: 'Jan', revenue: 0 }, { month: 'Feb', revenue: 0 }, { month: 'Mar', revenue: 0 },
  { month: 'Apr', revenue: 0 }, { month: 'May', revenue: 0 }, { month: 'Jun', revenue: 0 },
];

const FALLBACK_GROWTH = [
  { month: 'Jan', members: 0 }, { month: 'Feb', members: 0 }, { month: 'Mar', members: 0 },
  { month: 'Apr', members: 0 }, { month: 'May', members: 0 }, { month: 'Jun', members: 0 },
];

export default function ReportsPage() {
  const { data: kpis } = useQuery({
    queryKey: ['reports-kpis'],
    queryFn: () => api.get('/reports/kpis').then((r) => r.data).catch(() => null),
  });

  const { data: revenueChart } = useQuery({
    queryKey: ['reports-revenue'],
    queryFn: () => api.get('/reports/revenue-chart').then((r) => r.data).catch(() => null),
  });

  const { data: growthChart } = useQuery({
    queryKey: ['reports-growth'],
    queryFn: () => api.get('/reports/member-growth').then((r) => r.data).catch(() => null),
  });

  const { data: topClasses } = useQuery({
    queryKey: ['reports-top-classes'],
    queryFn: () => api.get('/reports/top-classes').then((r) => r.data).catch(() => null),
  });

  const kpiData = kpis ?? {};
  const revData: any[] = revenueChart?.data ?? revenueChart ?? FALLBACK_REVENUE;
  const growthData: any[] = growthChart?.data ?? growthChart ?? FALLBACK_GROWTH;
  const topClassesData: any[] = topClasses?.data ?? topClasses ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Analytics & Reports</h2>
        <p className="text-sm text-slate-500 mt-0.5">Business intelligence overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, color: 'bg-indigo-50 text-indigo-500', label: 'Total Members', value: kpiData.totalMembers ?? '—' },
          { icon: TrendingUp, color: 'bg-green-50 text-green-500', label: 'Monthly Revenue', value: kpiData.monthlyRevenue != null ? formatCurrency(kpiData.monthlyRevenue) : '—' },
          { icon: Activity, color: 'bg-orange-50 text-orange-500', label: 'Avg Daily Check-ins', value: kpiData.avgDailyCheckIns ?? '—' },
          { icon: Award, color: 'bg-purple-50 text-purple-500', label: 'Retention Rate', value: kpiData.retentionRate != null ? `${kpiData.retentionRate}%` : '—' },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revData}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Member growth chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Member Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="members" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top classes */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Top Classes by Bookings</h3>
        {topClassesData.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Dumbbell size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No class data yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topClassesData.map((cls: any, idx: number) => (
              <div key={cls.id ?? idx} className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-medium text-slate-700">{cls.name}</p>
                    <p className="text-xs text-slate-500">{cls.bookings ?? 0} bookings</p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-indigo-400 h-1.5 rounded-full"
                      style={{ width: `${topClassesData[0]?.bookings ? Math.round((cls.bookings / topClassesData[0].bookings) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
