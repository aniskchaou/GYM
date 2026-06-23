'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, QrCode, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatDatetime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [query, setQuery] = useState('');
  const qc = useQueryClient();

  // Fetch the first available branch for this gym
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get('/branches').then((r) => r.data),
  });
  const branchId: string | undefined = Array.isArray(branches) ? branches[0]?.id : undefined;

  const { data: occupancy } = useQuery({
    queryKey: ['occupancy', branchId],
    queryFn: () => api.get(`/attendance/occupancy/${branchId}`).then((r) => r.data),
    enabled: !!branchId,
    refetchInterval: 30_000,
  });

  const checkInMutation = useMutation({
    mutationFn: (body: { query: string; method: string }) =>
      api.post('/attendance/check-in', body),
    onSuccess: (res) => {
      toast.success(`✅ ${res.data.user?.firstName} checked in!`);
      setQuery('');
      qc.invalidateQueries({ queryKey: ['occupancy'] });
      qc.invalidateQueries({ queryKey: ['today-attendance'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Check-in failed'),
  });

  const checkOutMutation = useMutation({
    mutationFn: (attendanceId: string) =>
      api.patch(`/attendance/${attendanceId}/check-out`, {}),
    onSuccess: (res) => {
      toast.success('✅ Checked out successfully');
      qc.invalidateQueries({ queryKey: ['occupancy'] });
      qc.invalidateQueries({ queryKey: ['today-attendance'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Check-out failed'),
  });

  const handleCheckIn = (method: 'QR_CODE' | 'RFID' | 'MANUAL') => {
    if (!query.trim()) return;
    checkInMutation.mutate({ query: query.trim(), method });
  };

  const { data: todayReport } = useQuery({
    queryKey: ['today-attendance', branchId],
    queryFn: () => {
      const today = new Date().toISOString().split('T')[0];
      const qs = branchId ? `&branchId=${branchId}` : '';
      return api.get(`/attendance/report?from=${today}&to=${today}${qs}`).then((r) => r.data);
    },
    enabled: !!branchId,
    refetchInterval: 60_000,
  });

  const occupancyPct = occupancy?.percentage ?? 0;
  const occupancyColor = occupancyPct < 60 ? 'bg-green-500' : occupancyPct < 85 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-6">
      {/* Occupancy */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-3">Current Occupancy</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-500">{occupancy?.current ?? 0} / {occupancy?.capacity ?? 0} people</span>
              <span className="font-medium text-slate-800">{occupancyPct}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${occupancyColor} rounded-full transition-all`}
                style={{ width: `${Math.min(occupancyPct, 100)}%` }}
              />
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            occupancyPct < 60 ? 'bg-green-100 text-green-700' :
            occupancyPct < 85 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
          }`}>
            {occupancyPct < 60 ? 'Low' : occupancyPct < 85 ? 'Moderate' : 'High'}
          </div>
        </div>
      </div>

      {/* Check-in widget */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Check In Member</h3>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckIn('MANUAL')}
              placeholder="Search name, email, QR code, or RFID tag…"
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>
          <button
            onClick={() => handleCheckIn('MANUAL')}
            disabled={checkInMutation.isPending || !query.trim()}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            <UserCheck size={16} />
            Check In
          </button>
          <button
            onClick={() => handleCheckIn('QR_CODE')}
            disabled={checkInMutation.isPending || !query.trim()}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            <QrCode size={16} />
            QR
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Press Enter or click Check In to process. QR codes and RFID tags are also accepted.</p>
      </div>

      {/* Today's log */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Today's Attendance</h3>
          <p className="text-xs text-slate-400 mt-0.5">{todayReport?.total ?? 0} check-ins today</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Member</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Check In</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Check Out</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Duration</th>
                <th className="text-left px-5 py-3 text-slate-500 font-medium">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {todayReport?.data?.map((a: any) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{a.user?.firstName} {a.user?.lastName}</p>
                    <p className="text-xs text-slate-400">{a.user?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs">{formatDatetime(a.checkedInAt)}</td>
                  <td className="px-5 py-3 text-slate-600 text-xs">
                    {a.checkedOutAt ? formatDatetime(a.checkedOutAt) : (
                      <button
                        onClick={() => checkOutMutation.mutate(a.id)}
                        disabled={checkOutMutation.isPending}
                        className="flex items-center gap-1 text-xs bg-green-600 text-white px-2.5 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircle size={11} /> Check Out
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {a.durationMin ? `${a.durationMin} min` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{a.method}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
