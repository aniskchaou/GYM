'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BarChart2, TrendingUp, Users, Building2, DollarSign, Activity } from 'lucide-react';

function KPI({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}><Icon size={20} className="text-white" /></div>
      </div>
    </div>
  );
}

export default function SAAnalyticsPage() {
  const { data: stats } = useQuery<any>({
    queryKey: ['sa-gym-stats'],
    queryFn: () => api.get('/gyms/stats').then(r => r.data),
  });

  const { data: gyms = [] } = useQuery<any[]>({
    queryKey: ['sa-gyms-full'],
    queryFn: () => api.get('/gyms').then(r => r.data),
  });

  const { data: users } = useQuery<any>({
    queryKey: ['sa-all-users'],
    queryFn: () => api.get('/gyms/sa/users?limit=1').then(r => r.data),
  });

  const totalMembers  = gyms.reduce((s: number, g: any) => s + (g._count?.users ?? 0), 0);
  const avgMembersPerGym = gyms.length ? Math.round(totalMembers / gyms.length) : 0;
  const byCity: Record<string, number> = {};
  gyms.forEach((g: any) => { if (g.city) byCity[g.city] = (byCity[g.city] ?? 0) + 1; });
  const topCities = Object.entries(byCity).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const byCountry: Record<string, number> = {};
  gyms.forEach((g: any) => { if (g.country) byCountry[g.country] = (byCountry[g.country] ?? 0) + 1; });

  const planDist = [
    { tier: 'Enterprise',    count: gyms.filter((g: any) => g.planTier === 'ENTERPRISE').length,   color: 'bg-indigo-500' },
    { tier: 'Professional',  count: gyms.filter((g: any) => g.planTier === 'PROFESSIONAL').length, color: 'bg-purple-500' },
    { tier: 'Starter',       count: gyms.filter((g: any) => g.planTier === 'STARTER').length,      color: 'bg-sky-500' },
  ];
  const maxPlan = Math.max(...planDist.map(p => p.count), 1);

  const statusDist = [
    { s: 'Active',    count: stats?.active ?? 0,    color: 'bg-green-500' },
    { s: 'Trial',     count: stats?.trial ?? 0,     color: 'bg-amber-500' },
    { s: 'Suspended', count: stats?.suspended ?? 0, color: 'bg-red-500' },
  ];
  const maxStatus = Math.max(...statusDist.map(d => d.count), 1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><BarChart2 size={22} /> Platform Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Real-time overview of the GymFlow platform</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Gyms"     value={stats?.total ?? 0}        sub={`${stats?.active ?? 0} active`}  icon={Building2}    color="bg-indigo-500" />
        <KPI label="Total Members"  value={totalMembers}              sub={`~${avgMembersPerGym} per gym`}  icon={Users}        color="bg-emerald-500" />
        <KPI label="Monthly Revenue" value={`$${(stats?.mrr ?? 0).toLocaleString()}`} sub="MRR (active gyms)" icon={DollarSign}   color="bg-amber-500" />
        <KPI label="All Users"      value={users?.total ?? '—'}       sub="across all gyms"                icon={Activity}     color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={16} /> Plan Distribution</h2>
          <div className="space-y-3">
            {planDist.map(p => (
              <div key={p.tier}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{p.tier}</span>
                  <span className="font-bold text-slate-800">{p.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className={`h-2 rounded-full ${p.color}`} style={{ width: `${Math.round((p.count / maxPlan) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Activity size={16} /> Status Breakdown</h2>
          <div className="space-y-3">
            {statusDist.map(d => (
              <div key={d.s}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{d.s}</span>
                  <span className="font-bold text-slate-800">{d.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className={`h-2 rounded-full ${d.color}`} style={{ width: `${Math.round((d.count / maxStatus) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><DollarSign size={16} /> Revenue Breakdown</h2>
          <div className="space-y-2">
            {[{ tier: 'Enterprise', price: 299 }, { tier: 'Professional', price: 99 }, { tier: 'Starter', price: 29 }].map(({ tier, price }) => {
              const count = gyms.filter((g: any) => g.planTier === tier.toUpperCase()).length;
              return (
                <div key={tier} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-600">{tier} × {count}</span>
                  <span className="font-semibold text-slate-800">${(count * price).toLocaleString()}/mo</span>
                </div>
              );
            })}
            <div className="flex justify-between items-center pt-2 font-bold">
              <span className="text-slate-700">Total MRR</span>
              <span className="text-indigo-600">${(stats?.mrr ?? 0).toLocaleString()}/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top cities */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Top Cities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {topCities.map(([city, count]) => (
            <div key={city} className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{count}</p>
              <p className="text-xs text-slate-500">{city}</p>
            </div>
          ))}
          {topCities.length === 0 && <p className="text-slate-400 text-sm col-span-4">No city data yet</p>}
        </div>
      </div>

      {/* Gym growth table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-slate-800">Top Gyms by Members</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              {['Gym', 'City', 'Plan', 'Members', 'Branches'].map(h => (
                <th key={h} className="text-left px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...gyms].sort((a: any, b: any) => (b._count?.users ?? 0) - (a._count?.users ?? 0)).slice(0, 10).map((g: any) => (
              <tr key={g.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{g.name}</td>
                <td className="px-4 py-3 text-slate-500">{g.city ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{g.planTier}</span>
                </td>
                <td className="px-4 py-3 font-semibold">{g._count?.users ?? 0}</td>
                <td className="px-4 py-3 text-slate-500">{g._count?.branches ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
