'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Dumbbell, Plus, ClipboardList, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import api from '@/lib/api';
import { formatDatetime } from '@/lib/utils';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';

export default function TrainerDashboardPage() {
  const { user } = useAuthStore();

  const { data: classes } = useQuery({
    queryKey: ['upcoming-classes'],
    queryFn: () => api.get('/bookings/classes/upcoming').then((r) => r.data),
  });

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['trainer-clients'],
    queryFn: () => api.get('/trainers/my/clients').then(r => r.data),
  });

  const { data: ptSessions = [] } = useQuery<any[]>({
    queryKey: ['pt-sessions'],
    queryFn: () => api.get('/pt-sessions').then(r => r.data?.sessions ?? r.data ?? []),
  });

  const upcomingSessions = ptSessions.filter((s: any) => s.status === 'SCHEDULED' || s.status === 'PENDING');

  const QUICK_ACTIONS = [
    { label: 'My Clients',     href: '/dashboard/trainer/clients',   icon: Users,         color: 'bg-blue-500' },
    { label: 'PT Sessions',    href: '/dashboard/pt-sessions',        icon: Calendar,      color: 'bg-purple-500' },
    { label: 'Workout Plans',  href: '/dashboard/workout-plans',      icon: Dumbbell,      color: 'bg-green-500' },
    { label: 'Assessments',    href: '/dashboard/assessments',        icon: ClipboardList, color: 'bg-amber-500' },
    { label: 'Progress',       href: '/dashboard/trainer/progress',   icon: TrendingUp,    color: 'bg-indigo-500' },
    { label: 'Messages',       href: '/dashboard/messages',           icon: MessageSquare, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome, {user?.firstName}!</h2>
        <p className="text-green-200 mt-1">Trainer Panel — manage your clients, sessions and programs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Classes This Week', value: classes?.length ?? 0,         icon: Calendar, color: 'bg-green-500' },
          { label: 'Active Clients',    value: clients.length,                icon: Users,    color: 'bg-blue-500' },
          { label: 'Upcoming Sessions', value: upcomingSessions.length,       icon: Dumbbell, color: 'bg-purple-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <s.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon, color }) => (
            <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon size={15} className="text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming PT sessions */}
      {upcomingSessions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Upcoming PT Sessions</h3>
            <Link href="/dashboard/pt-sessions" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingSessions.slice(0, 5).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.member?.user?.firstName ?? s.memberName ?? '—'} {s.member?.user?.lastName ?? ''}</p>
                  <p className="text-xs text-slate-400">{s.scheduledAt ? formatDatetime(s.scheduledAt) : '—'}</p>
                </div>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming classes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Upcoming Classes</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {!classes?.length && <p className="px-5 py-6 text-sm text-slate-400 text-center">No upcoming classes.</p>}
          {classes?.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">{c.gymClass?.name ?? c.name ?? '—'}</p>
                <p className="text-xs text-slate-400">{c.scheduledAt ? formatDatetime(c.scheduledAt) : '—'}</p>
              </div>
              <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full">{c.status ?? 'SCHEDULED'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
