'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Building2, Users, Percent, CheckCircle, AlertCircle, Search, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Gym {
  id: string; name: string; slug: string; email: string;
  status: string; planTier: string; city: string | null;
  platformCommissionRate: number; rating: number;
  _count: { users: number; branches: number };
}

export default function AdminGymsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRate, setNewRate] = useState('');

  const { data, isLoading } = useQuery<Gym[]>({
    queryKey: ['admin-gyms'],
    queryFn: () => api.get('/gyms').then(r => r.data),
  });

  const commissionMutation = useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) =>
      api.patch(`/gyms/${id}/commission`, { rate }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-gyms'] }); toast.success('Commission rate updated'); setEditingId(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/gyms/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-gyms'] }); toast.success('Status updated'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const gyms = (data || []).filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => ({ ACTIVE: 'bg-green-100 text-green-700', TRIAL: 'bg-yellow-100 text-yellow-700', SUSPENDED: 'bg-red-100 text-red-700', CANCELLED: 'bg-gray-100 text-gray-600' }[s] ?? 'bg-gray-100 text-gray-600');
  const planColor = (p: string) => ({ STARTER: 'bg-blue-50 text-blue-700', PROFESSIONAL: 'bg-purple-50 text-purple-700', ENTERPRISE: 'bg-indigo-50 text-indigo-700' }[p] ?? 'bg-gray-50 text-gray-600');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gym Management</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage all gyms, subscriptions and commission rates</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total gyms', value: gyms.length, icon: Building2, color: 'indigo' },
          { label: 'Active', value: gyms.filter(g => g.status === 'ACTIVE').length, icon: CheckCircle, color: 'green' },
          { label: 'Trial', value: gyms.filter(g => g.status === 'TRIAL').length, icon: AlertCircle, color: 'yellow' },
          { label: 'Avg commission', value: `${gyms.length ? Math.round(gyms.reduce((s, g) => s + (g.platformCommissionRate ?? 20), 0) / gyms.length) : 0}%`, icon: Percent, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gyms..." className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Gym', 'Status', 'Plan', 'Members', 'Commission %', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-5 bg-gray-100 rounded animate-pulse" /></td></tr>) :
             gyms.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">No gyms found</td></tr> :
             gyms.map(gym => (
              <tr key={gym.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3"><p className="font-medium text-gray-900">{gym.name}</p><p className="text-xs text-gray-500">{gym.email}</p>{gym.city && <p className="text-xs text-gray-400">{gym.city}</p>}</td>
                <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(gym.status)}`}>{gym.status}</span></td>
                <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${planColor(gym.planTier)}`}>{gym.planTier}</span></td>
                <td className="px-4 py-3"><div className="flex items-center gap-1 text-sm text-gray-700"><Users className="w-4 h-4 text-gray-400" /> {gym._count.users}</div></td>
                <td className="px-4 py-3">
                  {editingId === gym.id ? (
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" max="100" value={newRate} onChange={e => setNewRate(e.target.value)} className="w-16 px-2 py-1 border border-indigo-300 rounded-lg text-sm focus:outline-none" />
                      <span className="text-gray-500 text-sm">%</span>
                      <button onClick={() => { const r = parseFloat(newRate); if (isNaN(r) || r < 0 || r > 100) { toast.error('Rate must be 0-100'); return; } commissionMutation.mutate({ id: gym.id, rate: r }); }} className="text-green-600 hover:text-green-700"><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-indigo-600">{gym.platformCommissionRate ?? 20}%</span>
                      <button onClick={() => { setEditingId(gym.id); setNewRate(String(gym.platformCommissionRate ?? 20)); }} className="text-gray-400 hover:text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {gym.status !== 'ACTIVE' && <button onClick={() => statusMutation.mutate({ id: gym.id, status: 'ACTIVE' })} className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded-lg">Activate</button>}
                    {gym.status === 'ACTIVE' && <button onClick={() => statusMutation.mutate({ id: gym.id, status: 'SUSPENDED' })} className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded-lg">Suspend</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
        <strong>How commissions work:</strong> When a member pays for a gym subscription, the platform collects the set commission % via Stripe Connect application fees. The remainder goes directly to the gym owner. Requires Stripe Connect to be configured per gym.
      </div>
    </div>
  );
}
