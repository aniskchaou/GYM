'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DollarSign, TrendingUp, Building2, Percent, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SABillingPage() {
  const { data: stats } = useQuery<any>({
    queryKey: ['sa-gym-stats'],
    queryFn: () => api.get('/gyms/stats').then(r => r.data),
  });

  const { data: gyms = [] } = useQuery<any[]>({
    queryKey: ['sa-gyms-full'],
    queryFn: () => api.get('/gyms').then(r => r.data),
  });

  const PLAN_PRICE: Record<string, number> = { STARTER: 29, PROFESSIONAL: 99, ENTERPRISE: 299 };

  const totalCommission = gyms.reduce((s: number, g: any) => {
    const members = g._count?.users ?? 0;
    const rate = g.platformCommissionRate ?? 20;
    return s + members * rate * 0.1;  // simplified: members × commission% × avg €10 fee
  }, 0);

  const recentGyms = [...gyms]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const planColor = (p: string) => ({ STARTER: 'bg-sky-100 text-sky-700', PROFESSIONAL: 'bg-purple-100 text-purple-700', ENTERPRISE: 'bg-indigo-100 text-indigo-700' }[p] ?? 'bg-slate-100 text-slate-600');
  const statusColor = (s: string) => ({ ACTIVE: 'bg-green-100 text-green-700', TRIAL: 'bg-amber-100 text-amber-700', SUSPENDED: 'bg-red-100 text-red-700', CANCELLED: 'bg-slate-100 text-slate-500' }[s] ?? 'bg-slate-100 text-slate-600');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><DollarSign size={22} /> Payments &amp; Billing</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform revenue, gym subscriptions, and member commissions</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue',      value: `$${(stats?.mrr ?? 0).toLocaleString()}`,         sub: 'from subscriptions',  icon: DollarSign,  color: 'bg-indigo-500' },
          { label: 'Annual Run Rate',       value: `$${(stats?.arr ?? 0).toLocaleString()}`,         sub: 'projected',           icon: TrendingUp,  color: 'bg-emerald-500' },
          { label: 'Active Subscriptions',  value: stats?.active ?? 0,                               sub: 'paying gyms',         icon: Building2,   color: 'bg-amber-500' },
          { label: 'Est. Commission Rev.', value: `$${Math.round(totalCommission).toLocaleString()}`, sub: 'from member activity', icon: Percent,    color: 'bg-purple-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
              </div>
              <div className={cn('p-3 rounded-xl', s.color)}><s.icon size={20} className="text-white" /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><CreditCard size={16} /> Subscription Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                {['Plan', 'Price/mo', 'Subscribers', 'Total MRR', 'Share'].map(h => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['ENTERPRISE', 'PROFESSIONAL', 'STARTER'].map(tier => {
                const count = gyms.filter((g: any) => g.planTier === tier && g.status === 'ACTIVE').length;
                const mrr = count * (PLAN_PRICE[tier] ?? 0);
                const totalMrr = stats?.mrr ?? 1;
                return (
                  <tr key={tier} className="border-t border-slate-100">
                    <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded text-xs font-bold', planColor(tier))}>{tier}</span></td>
                    <td className="px-4 py-3 text-slate-600">${PLAN_PRICE[tier]}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{count}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">${mrr.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-slate-100 rounded-full w-24">
                          <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${totalMrr ? Math.round((mrr / totalMrr) * 100) : 0}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{totalMrr ? Math.round((mrr / totalMrr) * 100) : 0}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission rates */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Gym Billing Details</h2>
          <p className="text-xs text-slate-400">{gyms.length} gyms total</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              {['Gym', 'Plan', 'Status', 'Commission Rate', 'Subscription Fee', 'Members'].map(h => (
                <th key={h} className="text-left px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentGyms.map((g: any) => (
              <tr key={g.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{g.name}</p>
                  <p className="text-xs text-slate-400">{g.email}</p>
                </td>
                <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded text-xs font-bold', planColor(g.planTier))}>{g.planTier}</span></td>
                <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded text-xs font-bold', statusColor(g.status))}>{g.status}</span></td>
                <td className="px-4 py-3 text-slate-600">{g.platformCommissionRate ?? 20}%</td>
                <td className="px-4 py-3 text-slate-800 font-medium">${PLAN_PRICE[g.planTier] ?? 0}/mo</td>
                <td className="px-4 py-3 text-slate-600">{g._count?.users ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
