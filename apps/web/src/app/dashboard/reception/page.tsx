'use client';

import Link from 'next/link';
import { UserCheck, Users, Calendar, QrCode } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function ReceptionDashboardPage() {
  const { data: occupancy } = useQuery({
    queryKey: ['occupancy', 'branch-main'],
    queryFn: () => api.get('/attendance/occupancy/branch-main').then((r) => r.data),
    refetchInterval: 30_000,
  });

  const pct = occupancy?.percentage ?? 0;

  return (
    <div className="space-y-6">
      {/* Occupancy banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-200 text-sm">Current Gym Occupancy</p>
            <p className="text-4xl font-bold mt-1">{pct}%</p>
            <p className="text-blue-200 text-sm mt-1">{occupancy?.current ?? 0} of {occupancy?.capacity ?? 0} members inside</p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center">
            <span className="text-2xl font-bold">{pct}%</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Check In Member', href: '/dashboard/attendance', icon: UserCheck, color: 'bg-green-500' },
          { label: 'Search Members', href: '/dashboard/members', icon: Users, color: 'bg-blue-500' },
          { label: 'Today\'s Classes', href: '/dashboard/classes', icon: Calendar, color: 'bg-purple-500' },
          { label: 'Scan QR Code', href: '/dashboard/attendance?mode=qr', icon: QrCode, color: 'bg-orange-500' },
        ].map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="bg-white rounded-2xl p-5 text-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 ${a.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <a.icon size={22} className="text-white" />
            </div>
            <p className="text-sm font-medium text-slate-700">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Live check-in shortcut */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <p className="text-slate-500 text-sm mb-3">Go to full attendance management for manual and QR check-ins.</p>
        <Link
          href="/dashboard/attendance"
          className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <UserCheck size={16} />
          Open Check-in Station
        </Link>
      </div>
    </div>
  );
}
