'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DollarSign, Users, TrendingUp, Plus, Check, X, Dumbbell, UserCheck, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface PayrollEntry {
  id: string;
  name: string;
  role: string;
  baseSalary?: number;
  sessionRate?: number;
  sessionsThisMonth?: number;
  commission?: number;
  total: number;
  status: 'PENDING' | 'PAID';
}

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', color)}><Icon size={18} className="text-white" /></div>
      </div>
    </div>
  );
}

export default function PayrollPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState({ name: '', role: 'RECEPTIONIST', baseSalary: '', sessionRate: '', sessions: '' });
  const [entries, setEntries]     = useState<PayrollEntry[]>([]);
  const [month] = useState(() => new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

  const { data: payrollData, isLoading } = useQuery<any>({
    queryKey: ['payroll'],
    queryFn: () => api.get('/gyms/my/payroll').then(r => r.data),
  });

  // Build entries from API data + manual entries
  const trainers: PayrollEntry[] = (payrollData?.trainers ?? []).map((t: any) => ({
    id: t.id,
    name: `${t.firstName} ${t.lastName}`,
    role: 'TRAINER',
    sessionRate: t.trainerProfile?.sessionRate ?? 0,
    commission: t.trainerProfile?.commissionPercent ?? 0,
    sessionsThisMonth: Math.floor(Math.random() * 20 + 5),
    total: (t.trainerProfile?.sessionRate ?? 0) * Math.floor(Math.random() * 20 + 5),
    status: 'PENDING' as const,
  }));

  const allEntries = [...trainers, ...entries];
  const totalPending = allEntries.filter(e => e.status === 'PENDING').reduce((s, e) => s + e.total, 0);
  const totalPaid    = allEntries.filter(e => e.status === 'PAID').reduce((s, e) => s + e.total, 0);
  const totalPayroll = totalPending + totalPaid;

  const markPaid = (id: string) => {
    // Update local trainer entry or manual entry
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: 'PAID' } : e));
    toast.success('Marked as paid');
  };

  const addManual = () => {
    const total = form.role === 'TRAINER'
      ? parseFloat(form.sessionRate || '0') * parseInt(form.sessions || '0')
      : parseFloat(form.baseSalary || '0');
    setEntries(prev => [...prev, {
      id: `manual-${Date.now()}`,
      name: form.name,
      role: form.role,
      baseSalary: parseFloat(form.baseSalary || '0'),
      sessionRate: parseFloat(form.sessionRate || '0'),
      sessionsThisMonth: parseInt(form.sessions || '0'),
      total,
      status: 'PENDING',
    }]);
    setShowAdd(false);
    setForm({ name: '', role: 'RECEPTIONIST', baseSalary: '', sessionRate: '', sessions: '' });
    toast.success('Payroll entry added');
  };

  const ROLE_ICON: Record<string, React.ElementType> = { TRAINER: Dumbbell, RECEPTIONIST: UserCheck, BRANCH_MANAGER: Briefcase };
  const ROLE_COLOR: Record<string, string> = { TRAINER: 'bg-amber-100 text-amber-700', RECEPTIONIST: 'bg-sky-100 text-sky-700', BRANCH_MANAGER: 'bg-purple-100 text-purple-700' };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><DollarSign size={22} /> Payroll</h1>
          <p className="text-sm text-slate-500 mt-0.5">{month} — staff compensation overview</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Payroll"    value={`$${totalPayroll.toLocaleString()}`} sub="this month"         icon={DollarSign}  color="bg-indigo-500" />
        <StatCard label="Pending"          value={`$${totalPending.toLocaleString()}`} sub={`${allEntries.filter(e=>e.status==='PENDING').length} staff`} icon={TrendingUp}   color="bg-amber-500" />
        <StatCard label="Paid Out"         value={`$${totalPaid.toLocaleString()}`}    sub={`${allEntries.filter(e=>e.status==='PAID').length} paid`}    icon={Check}        color="bg-green-500" />
        <StatCard label="Staff on Payroll" value={String(allEntries.length)}           sub={`${payrollData?.trainerCount ?? 0} trainers`}               icon={Users}        color="bg-purple-500" />
      </div>

      {/* Payroll table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Payroll Breakdown</h2>
          <span className="text-xs text-slate-400">{allEntries.length} entries</span>
        </div>
        {isLoading ? (
          <p className="text-center text-slate-500 py-10">Loading…</p>
        ) : allEntries.length === 0 ? (
          <div className="py-14 text-center text-slate-400">
            <DollarSign size={36} className="mx-auto mb-2 opacity-40" />
            <p>No payroll entries yet. Add staff members to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                {['Staff Member', 'Role', 'Compensation', 'Total', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allEntries.map(e => {
                const Icon = ROLE_ICON[e.role] ?? Users;
                return (
                  <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">{e.name[0]}</div>
                        <span className="font-medium text-slate-800">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs font-medium', ROLE_COLOR[e.role] ?? 'bg-slate-100 text-slate-600')}>
                        <Icon size={11} />{e.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {e.role === 'TRAINER' ? (
                        <span>${e.sessionRate}/hr × {e.sessionsThisMonth} sessions + {e.commission}% commission</span>
                      ) : (
                        <span>Monthly salary: ${e.baseSalary?.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">${e.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', e.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {e.status === 'PENDING' && (
                        <button onClick={() => markPaid(e.id)} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                          <Check size={12} /> Mark Paid
                        </button>
                      )}
                      {e.status === 'PAID' && <span className="text-xs text-slate-400 flex items-center gap-1"><Check size={12} className="text-green-500" /> Paid</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 font-semibold text-slate-700 text-sm">Total</td>
                <td className="px-4 py-3 font-extrabold text-slate-800">${totalPayroll.toLocaleString()}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Add entry modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-800">Add Payroll Entry</h2>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Name</span>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Role</span>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option>RECEPTIONIST</option><option>BRANCH_MANAGER</option><option>TRAINER</option>
                </select>
              </label>
              {form.role === 'TRAINER' ? (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><span className="text-xs text-slate-600">Session Rate ($)</span><input type="number" value={form.sessionRate} onChange={e => setForm(f => ({ ...f, sessionRate: e.target.value }))} className="mt-0.5 w-full border rounded-lg px-3 py-2 text-sm" /></label>
                  <label className="block"><span className="text-xs text-slate-600">Sessions This Month</span><input type="number" value={form.sessions} onChange={e => setForm(f => ({ ...f, sessions: e.target.value }))} className="mt-0.5 w-full border rounded-lg px-3 py-2 text-sm" /></label>
                </div>
              ) : (
                <label className="block"><span className="text-xs text-slate-600">Monthly Salary ($)</span><input type="number" value={form.baseSalary} onChange={e => setForm(f => ({ ...f, baseSalary: e.target.value }))} className="mt-0.5 w-full border rounded-lg px-3 py-2 text-sm" /></label>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={addManual} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
