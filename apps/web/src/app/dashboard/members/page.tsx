'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus, Filter, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate, membershipStatusColor, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function MembersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['members', search, page],
    queryFn: () => api.get(`/members?search=${search}&page=${page}&limit=20`).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const { data: trainers = [] } = useQuery<any[]>({
    queryKey: ['trainers'],
    queryFn: () => api.get('/trainers').then(r => r.data?.trainers ?? r.data ?? []),
  });

  const assignMut = useMutation({
    mutationFn: ({ memberId, trainerId }: { memberId: string; trainerId: string }) =>
      api.post(`/members/${memberId}/assign-trainer`, { trainerId }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members'] }); toast.success('Trainer assigned'); setAssigningId(null); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Members</h2>
          <p className="text-sm text-slate-500">{data?.total ?? 0} total members</p>
        </div>
        <Link
          href="/dashboard/members/new"
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <UserPlus size={16} />
          Add Member
        </Link>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, or member number…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
          <Filter size={14} /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Member</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Member #</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Plan</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Trainer</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.data?.map((member: any) => {
                    const activeMembership = member.memberships?.[0];
                    return (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                              {member.firstName[0]}{member.lastName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{member.firstName} {member.lastName}</p>
                              <p className="text-xs text-slate-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                          {member.memberProfile?.memberNumber ?? '—'}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {activeMembership?.plan?.name ?? '—'}
                        </td>
                        <td className="px-5 py-4">
                          {activeMembership ? (
                            <span className={cn('px-2 py-1 rounded-full text-xs font-medium', membershipStatusColor(activeMembership.status))}>
                              {activeMembership.status}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">No plan</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {assigningId === member.id ? (
                            <div className="flex items-center gap-1">
                              <select
                                autoFocus
                                className="text-xs border border-indigo-300 rounded-lg px-2 py-1 focus:outline-none"
                                defaultValue=""
                                onChange={e => { if (e.target.value) assignMut.mutate({ memberId: member.id, trainerId: e.target.value }); }}
                              >
                                <option value="">— pick trainer —</option>
                                {trainers.map((t: any) => (
                                  <option key={t.id} value={t.id}>{t.user?.firstName ?? t.firstName} {t.user?.lastName ?? t.lastName}</option>
                                ))}
                              </select>
                              <button onClick={() => setAssigningId(null)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAssigningId(member.id)}
                              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg px-2 py-1 hover:bg-indigo-50"
                            >
                              <Dumbbell size={11} /> Assign
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(member.createdAt)}</td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/dashboard/members/${member.id}`}
                            className="text-indigo-500 hover:text-indigo-400 text-xs font-medium"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= data.total}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
