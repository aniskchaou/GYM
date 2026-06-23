'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, TrendingDown, TrendingUp, AlertCircle, Heart, DollarSign, Play } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const TYPES = [
  { key: 'CHURN_RISK', label: 'Churn Risk', icon: TrendingDown, color: 'text-red-500' },
  { key: 'UPGRADE_PROPENSITY', label: 'Upgrade Propensity', icon: TrendingUp, color: 'text-emerald-500' },
  { key: 'INACTIVITY', label: 'Inactivity', icon: AlertCircle, color: 'text-amber-500' },
  { key: 'HIGH_ENGAGEMENT', label: 'High Engagement', icon: Heart, color: 'text-pink-500' },
  { key: 'REVENUE_POTENTIAL', label: 'Revenue Potential', icon: DollarSign, color: 'text-indigo-500' },
];

export default function AiInsightsPage() {
  const qc = useQueryClient();
  const [type, setType] = useState<string>('CHURN_RISK');

  const insights = useQuery({
    queryKey: ['ai-insights', type],
    queryFn: () => api.get('/ai/insights', { params: { type } }).then((r) => r.data).catch(() => []),
  });

  const run = useMutation({
    mutationFn: () => api.post('/ai/insights/run').then((r) => r.data),
    onSuccess: (d: any) => { toast.success(`Generated ${d?.created ?? '?'} insights`); qc.invalidateQueries({ queryKey: ['ai-insights'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Brain className="text-purple-600" /> AI Insights</h1>
          <p className="text-sm text-slate-500">ML-driven member intelligence — churn, upgrades, engagement</p>
        </div>
        <button onClick={() => run.mutate()} disabled={run.isPending} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
          <Play size={16} /> Run scoring
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border ${type === t.key ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200'}`}
            >
              <Icon size={16} className={t.color} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="text-left p-3">Member</th>
              <th className="text-left p-3">Score</th>
              <th className="text-left p-3">Reason</th>
              <th className="text-left p-3">Generated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(insights.data ?? []).map((i: any) => (
              <tr key={i.id}>
                <td className="p-3">{i.user?.firstName} {i.user?.lastName} <div className="text-xs text-slate-500">{i.user?.email}</div></td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-slate-200 rounded-full w-24 overflow-hidden">
                      <div className={`h-full ${i.score >= 80 ? 'bg-red-500' : i.score >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${i.score}%` }} />
                    </div>
                    <span className="font-semibold">{i.score}</span>
                  </div>
                </td>
                <td className="p-3 text-slate-600">{i.reason ?? '—'}</td>
                <td className="p-3 text-xs text-slate-500">{new Date(i.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {(insights.data ?? []).length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-slate-400">No insights yet. Click "Run scoring" to generate.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
