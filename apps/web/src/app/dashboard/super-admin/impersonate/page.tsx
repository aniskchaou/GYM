'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore, getRoleDashboard } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { UserCog, Search, LogIn, AlertTriangle, Building2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Gym {
  id: string; name: string; slug: string; email: string;
  city?: string; status: string; planTier: string;
  _count: { users: number };
}

export default function SAImpersonatePage() {
  const router   = useRouter();
  const setAuth  = useAuthStore(s => s.setAuth);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<Gym | null>(null);

  const { data, isLoading } = useQuery<Gym[]>({
    queryKey: ['sa-gyms-full'],
    queryFn: () => api.get('/gyms').then(r => r.data),
  });

  const impersonateMut = useMutation({
    mutationFn: (gymId: string) => api.post(`/gyms/${gymId}/impersonate`).then(r => r.data),
    onSuccess: (data) => {
      // Store impersonated session
      const { accessToken, user } = data;
      // Persist token in axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      // Update auth store (no refresh token for impersonation sessions)
      setAuth(user, accessToken, '');
      toast.success(`Now impersonating ${user.firstName} ${user.lastName} (${confirm?.name})`);
      setConfirm(null);
      router.push(getRoleDashboard(user.role));
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Impersonation failed'),
  });

  const planColor = (p: string) => ({ STARTER: 'bg-sky-100 text-sky-700', PROFESSIONAL: 'bg-purple-100 text-purple-700', ENTERPRISE: 'bg-indigo-100 text-indigo-700' }[p] ?? 'bg-slate-100 text-slate-600');
  const statusColor = (s: string) => ({ ACTIVE: 'bg-green-100 text-green-700', TRIAL: 'bg-amber-100 text-amber-700', SUSPENDED: 'bg-red-100 text-red-700' }[s] ?? 'bg-slate-100 text-slate-600');

  const gyms = (data ?? []).filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><UserCog size={22} /> Impersonate Gym Admin</h1>
        <p className="text-sm text-slate-500 mt-0.5">Log in as a gym owner for support purposes</p>
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Use with caution</p>
          <p className="text-xs text-amber-700 mt-0.5">Impersonation gives you full access to the gym owner's account. All actions are logged in the audit trail. Only use this for legitimate support purposes.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gyms…" className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {/* Gym list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              {['Gym', 'Status', 'Plan', 'Members', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading…</td></tr>}
            {!isLoading && gyms.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No gyms found</td></tr>}
            {gyms.map(g => (
              <tr key={g.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                      <Building2 size={15} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{g.name}</p>
                      <p className="text-xs text-slate-400">{g.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded text-xs font-semibold', statusColor(g.status))}>{g.status}</span></td>
                <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded text-xs font-semibold', planColor(g.planTier))}>{g.planTier}</span></td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-slate-600"><Users size={12} />{g._count.users}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setConfirm(g)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
                    <LogIn size={12} /> Impersonate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCog size={22} className="text-amber-600" />
            </div>
            <h2 className="font-bold text-lg text-slate-800 text-center mb-2">Impersonate Admin?</h2>
            <p className="text-sm text-slate-600 text-center mb-1">You are about to log in as the gym owner of:</p>
            <p className="text-base font-bold text-indigo-700 text-center mb-4">{confirm.name}</p>
            <p className="text-xs text-slate-400 text-center mb-6">This action is logged. You will have a 2-hour impersonation session.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={() => impersonateMut.mutate(confirm.id)} disabled={impersonateMut.isPending} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {impersonateMut.isPending ? 'Logging in…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
