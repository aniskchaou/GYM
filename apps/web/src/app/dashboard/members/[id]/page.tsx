'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, Calendar, CreditCard, UserCheck } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate, membershipStatusColor, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => api.get(`/members/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: attendance } = useQuery({
    queryKey: ['member-attendance', id],
    queryFn: () => api.get(`/members/${id}/attendance`).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 text-sm">Member not found.</p>
        <Link href="/dashboard/members" className="text-indigo-500 text-sm mt-2 inline-block">
          ← Back to Members
        </Link>
      </div>
    );
  }

  const activeMembership = member.memberships?.[0];
  const initials = `${member.firstName?.[0] ?? ''}${member.lastName?.[0] ?? ''}`;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/members"
          className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-lg font-semibold text-slate-800">Member Profile</h2>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-xl font-semibold text-slate-800">
            {member.firstName} {member.lastName}
          </h3>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
            <span className="flex items-center gap-1.5">
              <Mail size={13} /> {member.email}
            </span>
            {member.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={13} /> {member.phone}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> Joined {formatDate(member.createdAt)}
            </span>
          </div>
          {member.memberProfile?.memberNumber && (
            <p className="text-xs text-slate-400 font-mono mt-1">
              Member # {member.memberProfile.memberNumber}
            </p>
          )}
        </div>
      </div>

      {/* Membership */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <CreditCard size={15} className="text-indigo-400" /> Membership
        </h4>
        {activeMembership ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">{activeMembership.plan?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatDate(activeMembership.startDate)} → {formatDate(activeMembership.endDate)}
              </p>
            </div>
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                membershipStatusColor(activeMembership.status)
              )}
            >
              {activeMembership.status}
            </span>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No active membership plan.</p>
        )}
      </div>

      {/* Recent attendance */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <UserCheck size={15} className="text-indigo-400" /> Recent Attendance
        </h4>
        {attendance && attendance.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {attendance.slice(0, 10).map((a: any) => (
              <div key={a.id} className="py-2.5 flex items-center justify-between text-sm">
                <span className="text-slate-600">{formatDate(a.checkInTime)}</span>
                <span className="text-xs text-slate-400 capitalize">{a.type?.toLowerCase()?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No attendance records yet.</p>
        )}
      </div>
    </div>
  );
}
