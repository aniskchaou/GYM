'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { CreditCard, Check, Zap, Star, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Plan {
  tier: string; name: string; price: number;
  maxMembers: number; maxBranches: number;
  features: string[]; popular?: boolean;
}

const TIER_ICONS: Record<string, React.ElementType> = { STARTER: Zap, PROFESSIONAL: Star, ENTERPRISE: Crown };
const TIER_COLORS: Record<string, string> = {
  STARTER: 'border-sky-200 bg-sky-50',
  PROFESSIONAL: 'border-purple-300 bg-purple-50 ring-2 ring-purple-300',
  ENTERPRISE: 'border-indigo-200 bg-indigo-50',
};
const TIER_BADGE: Record<string, string> = {
  STARTER: 'bg-sky-100 text-sky-700',
  PROFESSIONAL: 'bg-purple-100 text-purple-700',
  ENTERPRISE: 'bg-indigo-100 text-indigo-700',
};

export default function SAPlansPage() {
  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['sa-pricing-plans'],
    queryFn: () => api.get('/gyms/pricing').then(r => r.data),
  });

  const { data: stats } = useQuery<any>({
    queryKey: ['sa-gym-stats'],
    queryFn: () => api.get('/gyms/stats').then(r => r.data),
  });

  const { data: gyms = [] } = useQuery<any[]>({
    queryKey: ['sa-gyms-full'],
    queryFn: () => api.get('/gyms').then(r => r.data),
  });

  const countByTier = (tier: string) => gyms.filter((g: any) => g.planTier === tier).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><CreditCard size={22} /> Subscription Plans</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform pricing tiers and current subscriber distribution</p>
      </div>

      {/* Revenue overview */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Monthly Recurring Revenue', value: `$${(stats?.mrr ?? 0).toLocaleString()}`, sub: 'from active gyms' },
          { label: 'Annual Run Rate', value: `$${(stats?.arr ?? 0).toLocaleString()}`, sub: 'projected ARR' },
          { label: 'Total Active Subscriptions', value: stats?.active ?? 0, sub: 'paying gyms' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Plan cards */}
      {isLoading ? (
        <p className="text-center text-slate-500 py-12">Loading plans…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => {
            const Icon = TIER_ICONS[plan.tier] ?? Zap;
            const count = countByTier(plan.tier);
            const mrr = count * plan.price;
            return (
              <div key={plan.tier} className={cn('rounded-2xl border p-6 relative', TIER_COLORS[plan.tier])}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">Most Popular</span>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold', TIER_BADGE[plan.tier])}>
                    <Icon size={13} /> {plan.name}
                  </div>
                  <span className="text-2xl font-extrabold text-slate-800">${plan.price}<span className="text-sm font-normal text-slate-500">/mo</span></span>
                </div>

                {/* Stats */}
                <div className="bg-white/70 rounded-xl p-3 mb-4 grid grid-cols-2 gap-2 text-center">
                  <div><p className="text-xl font-bold text-slate-800">{count}</p><p className="text-xs text-slate-500">Gyms</p></div>
                  <div><p className="text-xl font-bold text-slate-800">${mrr.toLocaleString()}</p><p className="text-xs text-slate-500">MRR</p></div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Limits</p>
                  <p className="text-sm text-slate-700">👥 Up to {plan.maxMembers.toLocaleString()} members</p>
                  <p className="text-sm text-slate-700">🏢 Up to {plan.maxBranches} branch{plan.maxBranches > 1 ? 'es' : ''}</p>
                </div>

                <ul className="space-y-1.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check size={14} className="text-green-500 mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Distribution table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-slate-800">Plan distribution</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              {['Plan', 'Price', 'Subscribers', 'MRR contribution', '% of total'].map(h => (
                <th key={h} className="text-left px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => {
              const count = countByTier(plan.tier);
              const mrr = count * plan.price;
              const totalMrr = stats?.mrr ?? 1;
              return (
                <tr key={plan.tier} className="border-t border-slate-100">
                  <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded text-xs font-bold', TIER_BADGE[plan.tier])}>{plan.name}</span></td>
                  <td className="px-4 py-3 text-slate-700">${plan.price}/mo</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{count}</td>
                  <td className="px-4 py-3 text-slate-700">${mrr.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 bg-slate-100 rounded-full w-20">
                        <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${totalMrr ? Math.round((mrr / totalMrr) * 100) : 0}%` }} />
                      </div>
                      <span className="text-slate-600 text-xs">{totalMrr ? Math.round((mrr / totalMrr) * 100) : 0}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
