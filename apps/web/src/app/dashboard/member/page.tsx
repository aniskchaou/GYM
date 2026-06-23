'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { CreditCard, UserCheck, Calendar, QrCode } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate, formatDatetime, membershipStatusColor, cn } from '@/lib/utils';

function QRCodeImage({ value }: { value: string }) {
  const [src, setSrc] = useState<string>('');
  useEffect(() => {
    if (!value) return;
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(value, { width: 180, margin: 2 }).then(setSrc);
    });
  }, [value]);
  if (!src) return <div className="w-44 h-44 bg-slate-100 rounded-xl animate-pulse" />;
  return <img src={src} alt="Check-in QR Code" className="w-44 h-44 rounded-xl border border-slate-200" />;
}

export default function MemberDashboardPage() {
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/members/me/card').then((r) => r.data),
  });

  const { data: bookings } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/my').then((r) => r.data),
  });

  const { data: upcoming } = useQuery({
    queryKey: ['upcoming-classes'],
    queryFn: () => api.get('/bookings/classes/upcoming').then((r) => r.data),
  });

  const activeMembership = profile?.memberships?.find((m: any) => m.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Membership card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Digital Membership Card</p>
            <h2 className="text-2xl font-bold">{profile?.firstName} {profile?.lastName}</h2>
            <p className="font-mono text-indigo-200 text-sm mt-1">
              {profile?.memberProfile?.memberNumber ?? '—'}
            </p>
          </div>
          <QrCode size={48} className="text-indigo-300 opacity-80" />
        </div>

        {activeMembership ? (
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-xs">Plan</p>
              <p className="font-semibold">{activeMembership.plan?.name}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs">Valid until</p>
              <p className="font-semibold">{formatDate(activeMembership.endDate)}</p>
            </div>
            <div>
              <p className="text-indigo-200 text-xs">Status</p>
              <span className="bg-green-400/20 text-green-200 text-xs px-2 py-0.5 rounded-full font-medium">
                {activeMembership.status}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-indigo-200 text-sm">No active membership</p>
            <Link href="/dashboard/my-membership" className="text-white underline text-sm mt-1 inline-block">
              Get a plan →
            </Link>
          </div>
        )}
      </div>

      {/* QR Code Card */}
      {profile?.qrCode && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center gap-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <QrCode size={18} className="text-indigo-500" /> Your Check-in QR Code
          </h3>
          <QRCodeImage value={profile.qrCode} />
          <p className="text-xs text-slate-400 text-center">
            Show this code at reception or scan it at the check-in terminal
          </p>
          <p className="font-mono text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
            {profile.memberNumber}
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Check-ins This Month',
            value: profile?.stats?.monthlyCheckIns ?? 0,
            icon: UserCheck,
            color: 'bg-green-100 text-green-600',
          },
          {
            label: 'Classes Booked',
            value: bookings?.length ?? 0,
            icon: Calendar,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Days Remaining',
            value: activeMembership
              ? Math.max(0, Math.ceil((new Date(activeMembership.endDate).getTime() - Date.now()) / 86_400_000))
              : 0,
            icon: CreditCard,
            color: 'bg-indigo-100 text-indigo-600',
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
              <s.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming classes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Upcoming Classes</h3>
          <Link href="/dashboard/classes" className="text-indigo-500 text-sm hover:text-indigo-400">Browse all →</Link>
        </div>
        <div className="divide-y divide-slate-50">
          {upcoming?.slice(0, 5).map((cls: any) => (
            <div key={cls.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800 text-sm">{cls.gymClass?.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDatetime(cls.startTime)} · {cls.gymClass?.duration} min
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {cls.bookings?.length ?? 0}/{cls.maxCapacity} spots
                </span>
                <Link
                  href={`/dashboard/classes`}
                  className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                >
                  Book
                </Link>
              </div>
            </div>
          )) ?? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">
              No upcoming classes scheduled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
