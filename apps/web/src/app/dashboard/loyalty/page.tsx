'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift, Trophy, Star } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function LoyaltyPage() {
  const qc = useQueryClient();
  const account = useQuery({ queryKey: ['loyalty-acct'], queryFn: () => api.get('/loyalty/account').then((r) => r.data).catch(() => null) });
  const tiers = useQuery({ queryKey: ['loyalty-tiers'], queryFn: () => api.get('/loyalty/tiers').then((r) => r.data).catch(() => []) });
  const rewards = useQuery({ queryKey: ['loyalty-rewards'], queryFn: () => api.get('/loyalty/rewards').then((r) => r.data).catch(() => []) });
  const board = useQuery({ queryKey: ['loyalty-board'], queryFn: () => api.get('/loyalty/leaderboard').then((r) => r.data).catch(() => []) });

  const redeem = useMutation({
    mutationFn: (id: string) => api.post(`/loyalty/rewards/${id}/redeem`).then((r) => r.data),
    onSuccess: () => { toast.success('Redeemed!'); qc.invalidateQueries({ queryKey: ['loyalty-acct'] }); qc.invalidateQueries({ queryKey: ['loyalty-rewards'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Loyalty</h1>
        <p className="text-sm text-slate-500">Earn points, climb tiers, redeem rewards</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-xs opacity-80">Your points</div>
          <div className="text-3xl font-bold">{account.data?.points ?? 0}</div>
          <div className="text-sm mt-1 opacity-90">Tier: {account.data?.tier ?? '—'}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-xs text-slate-500">Lifetime points</div>
          <div className="text-2xl font-bold">{account.data?.lifetimePoints ?? 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-xs text-slate-500">Multiplier</div>
          <div className="text-2xl font-bold">×{account.data?.multiplier ?? 1}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Star size={18} className="text-amber-500" /> Tiers</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(tiers.data ?? []).map((t: any) => (
            <div key={t.id} className="border border-slate-200 rounded-lg p-3 text-sm">
              <div className="font-semibold">{t.name}</div>
              <div className="text-xs text-slate-500">From {t.minPoints} pts · ×{t.multiplier}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Gift size={18} className="text-pink-500" /> Rewards</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(rewards.data ?? []).map((r: any) => {
            const canAfford = (account.data?.points ?? 0) >= r.costPoints;
            return (
              <div key={r.id} className="border border-slate-200 rounded-lg p-4">
                <div className="font-medium">{r.name}</div>
                <p className="text-xs text-slate-500">{r.description}</p>
                <div className="text-xs mt-2 text-indigo-700 font-semibold">{r.costPoints} pts</div>
                {r.stock != null && <div className="text-xs text-slate-500">Stock: {r.stock}</div>}
                <button
                  onClick={() => redeem.mutate(r.id)}
                  disabled={!canAfford}
                  className="mt-3 w-full bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-500 text-white py-1.5 rounded text-sm"
                >
                  {canAfford ? 'Redeem' : 'Not enough'}
                </button>
              </div>
            );
          })}
          {(rewards.data ?? []).length === 0 && <p className="text-sm text-slate-500">No rewards yet.</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Trophy size={18} className="text-amber-500" /> Leaderboard</h2>
        <ol className="space-y-2">
          {(board.data ?? []).slice(0, 10).map((m: any, i: number) => (
            <li key={m.userId ?? i} className="flex justify-between text-sm border-b border-slate-100 py-1.5">
              <span><b>#{i + 1}</b> {m.firstName} {m.lastName}</span>
              <span className="text-indigo-700 font-semibold">{m.points} pts</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
