'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, MessageSquare, TrendingUp, Dumbbell, ClipboardList, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    } catch {
      return trimmed
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export default function TrainerClientsPage() {
  const { data: clients = [], isLoading } = useQuery<any[]>({
    queryKey: ['trainer-clients'],
    queryFn: () => api.get('/trainers/my/clients').then(r => r.data),
  });

  const markAttendance = useMutation({
    mutationFn: (body: { query: string; method: string }) => api.post('/attendance/check-in', body),
    onSuccess: (r) => toast.success(`${r.data.user?.firstName} checked in`),
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const PLAN_COLOR: Record<string, string> = {
    ACTIVE:   'bg-green-100 text-green-700',
    FROZEN:   'bg-blue-100  text-blue-700',
    EXPIRED:  'bg-slate-100 text-slate-500',
    CANCELLED:'bg-red-100   text-red-600',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Users size={22} /> My Clients</h1>
        <p className="text-sm text-slate-500 mt-0.5">{clients.length} members assigned to you</p>
      </div>

      {isLoading && <p className="text-slate-500 text-center py-10">Loading clients…</p>}

      {!isLoading && clients.length === 0 && (
        <div className="bg-white rounded-xl border p-12 text-center text-slate-400">
          <Users size={36} className="mx-auto mb-2 opacity-30" />
          <p>No clients assigned yet. Ask your gym owner to assign members to you.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((m: any) => {
          const activeMembership = m.memberships?.[0];
          const fitnessGoals = normalizeStringArray(m.memberProfile?.fitnessGoals);
          return (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 shrink-0">
                  {m.firstName[0]}{m.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{m.firstName} {m.lastName}</p>
                  <p className="text-xs text-slate-400 truncate">{m.email}</p>
                  {activeMembership && (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', PLAN_COLOR[activeMembership.status] ?? 'bg-slate-100 text-slate-500')}>
                      {activeMembership.plan?.name} · {activeMembership.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Goals */}
              {fitnessGoals.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Goals</p>
                  <div className="flex flex-wrap gap-1">
                    {fitnessGoals.slice(0, 3).map((g) => (
                      <span key={g} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{g}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/dashboard/assessments?memberId=${m.id}`} className="flex items-center justify-center gap-1 text-xs border border-slate-200 rounded-lg py-1.5 text-slate-600 hover:bg-slate-50">
                  <ClipboardList size={12} /> Assess
                </Link>
                <Link href={`/dashboard/trainer/progress?memberId=${m.id}`} className="flex items-center justify-center gap-1 text-xs border border-slate-200 rounded-lg py-1.5 text-slate-600 hover:bg-slate-50">
                  <TrendingUp size={12} /> Progress
                </Link>
                <button
                  onClick={() => markAttendance.mutate({ query: m.email, method: 'MANUAL' })}
                  className="flex items-center justify-center gap-1 text-xs bg-green-600 text-white rounded-lg py-1.5 hover:bg-green-700"
                >
                  <UserCheck size={12} /> Check In
                </button>
                <Link href={`/dashboard/messages?memberId=${m.id}`} className="flex items-center justify-center gap-1 text-xs bg-indigo-600 text-white rounded-lg py-1.5 hover:bg-indigo-700">
                  <MessageSquare size={12} /> Message
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
