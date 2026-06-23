'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BarChart2, Users, UserCheck, CreditCard, Calendar, TrendingUp, Download, Printer } from 'lucide-react';

function Stat({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-3xl font-extrabold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}><Icon size={18} className="text-white" /></div>
      </div>
    </div>
  );
}

export default function DailyReportPage() {
  const today = new Date().toISOString().split('T')[0];
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const { data: kpis }       = useQuery({ queryKey: ['kpis'],       queryFn: () => api.get('/reports/kpis').then(r => r.data) });
  const { data: branches }   = useQuery({ queryKey: ['branches'],   queryFn: () => api.get('/branches').then(r => r.data) });
  const branchId = Array.isArray(branches) ? branches[0]?.id : undefined;

  const { data: attendance } = useQuery({
    queryKey: ['today-attendance', branchId],
    queryFn: () => api.get(`/attendance/report?from=${today}&to=${today}${branchId ? `&branchId=${branchId}` : ''}`).then(r => r.data),
    enabled: !!branchId,
  });

  const { data: paymentsData } = useQuery({
    queryKey: ['payments', 1],
    queryFn: () => api.get('/payments/history?page=1&limit=50').then(r => r.data),
  });

  const { data: memberships } = useQuery({
    queryKey: ['active-memberships'],
    queryFn: () => api.get('/memberships?status=ACTIVE&limit=50').then(r => r.data),
  });

  const todayPayments = (paymentsData?.data ?? paymentsData?.payments ?? []).filter((p: any) =>
    p.createdAt && p.createdAt.startsWith(today) && p.status === 'PAID'
  );
  const todayRevenue = todayPayments.reduce((s: number, p: any) => s + (p.amount ?? 0), 0);
  const todayCheckIns = attendance?.total ?? 0;
  const activeMemberships = Array.isArray(memberships) ? memberships.length : (memberships?.length ?? 0);

  const hourlyBreakdown: Record<string, number> = {};
  (attendance?.data ?? []).forEach((a: any) => {
    const hour = new Date(a.checkedInAt).getHours();
    const label = `${hour.toString().padStart(2,'0')}:00`;
    hourlyBreakdown[label] = (hourlyBreakdown[label] ?? 0) + 1;
  });
  const peakHour = Object.entries(hourlyBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const handlePrint = () => window.print();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><BarChart2 size={22} /> Daily Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">{dateLabel}</p>
        </div>
        <button onClick={handlePrint} className="flex items-center gap-2 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
          <Printer size={16} /> Print Report
        </button>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">GymFlow — Daily Report</h1>
        <p className="text-slate-600">{dateLabel}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Check-ins Today"    value={todayCheckIns}                  sub="members visited"      icon={UserCheck}  color="bg-indigo-500" />
        <Stat label="Revenue Today"      value={`$${todayRevenue.toFixed(2)}`}  sub={`${todayPayments.length} payments`} icon={CreditCard}  color="bg-green-500" />
        <Stat label="Active Members"     value={kpis?.totalMembers ?? '—'}      sub="total enrolled"       icon={Users}      color="bg-amber-500" />
        <Stat label="Active Memberships" value={activeMemberships}              sub="paid subscriptions"   icon={TrendingUp} color="bg-purple-500" />
      </div>

      {/* Attendance breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><UserCheck size={16} /> Attendance Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-slate-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-slate-800">{todayCheckIns}</p>
            <p className="text-xs text-slate-500 mt-1">Total check-ins</p>
          </div>
          <div className="text-center bg-slate-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-slate-800">{peakHour}</p>
            <p className="text-xs text-slate-500 mt-1">Peak hour</p>
          </div>
          <div className="text-center bg-slate-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-slate-800">{hourlyBreakdown[peakHour] ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">Peak count</p>
          </div>
        </div>

        {Object.keys(hourlyBreakdown).length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 mb-2">Hourly traffic</p>
            <div className="flex items-end gap-1 h-20">
              {Object.entries(hourlyBreakdown).sort(([a],[b])=>a.localeCompare(b)).map(([hour, count]) => {
                const maxCount = Math.max(...Object.values(hourlyBreakdown));
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={hour} className="flex flex-col items-center flex-1 min-w-0">
                    <div className="w-full bg-indigo-500 rounded-t" style={{ height: `${pct}%`, minHeight: '4px' }} title={`${hour}: ${count}`} />
                    <p className="text-slate-400 text-[9px] mt-0.5 truncate w-full text-center">{hour}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Today's payments */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2"><CreditCard size={16} /> Today&apos;s Payments</h2>
          <span className="text-xs text-slate-400">{todayPayments.length} transactions · ${todayRevenue.toFixed(2)} total</span>
        </div>
        {todayPayments.length === 0 ? (
          <p className="text-slate-400 text-sm p-6 text-center">No payments collected today.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>{['Member', 'Amount', 'Method', 'Description'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {todayPayments.map((p: any) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-800">{p.user?.firstName} {p.user?.lastName}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">${p.amount}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs capitalize">{(p.method ?? '—').toLowerCase()}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{p.description ?? '—'}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-700" colSpan={1}>Total</td>
                <td className="px-4 py-3 font-bold text-slate-800" colSpan={3}>${todayRevenue.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Today's check-in list */}
      {(attendance?.data?.length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-slate-800">Check-in Log</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>{['Member', 'Check In', 'Check Out', 'Duration'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {attendance.data.slice(0, 20).map((a: any) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-800">{a.user?.firstName} {a.user?.lastName}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{new Date(a.checkedInAt).toLocaleTimeString()}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{a.checkedOutAt ? new Date(a.checkedOutAt).toLocaleTimeString() : <span className="text-green-600">Active</span>}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{a.durationMin ? `${a.durationMin} min` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
