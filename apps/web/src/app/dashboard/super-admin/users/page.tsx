'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, Search, ChevronDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLES = ['ALL', 'SUPER_ADMIN', 'GYM_OWNER', 'BRANCH_MANAGER', 'RECEPTIONIST', 'TRAINER', 'MEMBER'];
const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN:    'bg-red-100 text-red-700',
  GYM_OWNER:      'bg-indigo-100 text-indigo-700',
  BRANCH_MANAGER: 'bg-purple-100 text-purple-700',
  RECEPTIONIST:   'bg-sky-100 text-sky-700',
  TRAINER:        'bg-amber-100 text-amber-700',
  MEMBER:         'bg-green-100 text-green-700',
};

function getInitials(first?: string, last?: string) {
  return `${(first ?? '?')[0]}${(last ?? '')[0] ?? ''}`.toUpperCase();
}

export default function SAUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole]     = useState('ALL');
  const [page, setPage]     = useState(1);

  const { data, isLoading } = useQuery<{ users: any[]; total: number; limit: number }>({
    queryKey: ['sa-all-users', search, role, page],
    queryFn: () => api.get('/gyms/sa/users', {
      params: { search: search || undefined, role: role === 'ALL' ? undefined : role, page, limit: 50 },
    }).then(r => r.data),
  });

  const users  = data?.users ?? [];
  const total  = data?.total ?? 0;
  const limit  = data?.limit ?? 50;
  const pages  = Math.ceil(total / limit);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Users size={22} /> All Users</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage every user across all gym tenants</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users…" className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden text-xs">
          {ROLES.map(r => (
            <button key={r} onClick={() => { setRole(r); setPage(1); }} className={cn('px-3 py-2 font-medium transition-colors', role === r ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50')}>
              {r === 'ALL' ? 'All' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">{total.toLocaleString()} users</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
            <tr>
              {['User', 'Role', 'Gym', 'Verified', 'Joined'].map(h => (
                <th key={h} className="text-left px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading…</td></tr>}
            {!isLoading && users.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No users found</td></tr>}
            {users.map((u: any) => (
              <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                      {u.avatarUrl ? <img src={u.avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" /> : getInitials(u.firstName, u.lastName)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-semibold', ROLE_COLOR[u.role] ?? 'bg-slate-100 text-slate-600')}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">{u.gym?.name ?? <span className="text-slate-400">—</span>}</td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', u.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                    {u.isEmailVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40">Previous</button>
            <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
