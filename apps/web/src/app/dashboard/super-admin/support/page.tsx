'use client';

import { useState } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, XCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Static mock tickets — support tickets API endpoint not yet exposed
const MOCK_TICKETS = [
  { id: 'TKT-001', gym: 'Demo Fitness Center',  subject: 'Payment gateway not working',         status: 'OPEN',        priority: 'HIGH',   created: '2026-06-20', category: 'Billing' },
  { id: 'TKT-002', gym: 'PeakFit Studio',       subject: 'Members cannot check in via QR',      status: 'IN_PROGRESS', priority: 'HIGH',   created: '2026-06-19', category: 'Technical' },
  { id: 'TKT-003', gym: 'IronHouse Performance', subject: 'Request to upgrade to Enterprise',   status: 'OPEN',        priority: 'MEDIUM', created: '2026-06-18', category: 'Billing' },
  { id: 'TKT-004', gym: 'Zen Wellness Hub',      subject: 'How to add a second branch?',        status: 'RESOLVED',    priority: 'LOW',    created: '2026-06-17', category: 'Question' },
  { id: 'TKT-005', gym: 'AquaFlex Center',       subject: 'Export member data to CSV',          status: 'OPEN',        priority: 'LOW',    created: '2026-06-17', category: 'Feature' },
  { id: 'TKT-006', gym: 'CrossCore Gym',         subject: 'Trainer schedule not saving',        status: 'IN_PROGRESS', priority: 'MEDIUM', created: '2026-06-16', category: 'Technical' },
  { id: 'TKT-007', gym: 'FightFit Academy',      subject: 'Cannot send push notifications',     status: 'CLOSED',      priority: 'LOW',    created: '2026-06-15', category: 'Technical' },
  { id: 'TKT-008', gym: 'Urban Iron Gym',        subject: 'Refund request for member',          status: 'OPEN',        priority: 'HIGH',   created: '2026-06-14', category: 'Billing' },
];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  OPEN:        { label: 'Open',        color: 'bg-amber-100 text-amber-700',  icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700',    icon: AlertCircle },
  RESOLVED:    { label: 'Resolved',    color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  CLOSED:      { label: 'Closed',      color: 'bg-slate-100 text-slate-500',  icon: XCircle },
};
const PRIORITY_COLOR: Record<string, string> = {
  HIGH:   'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW:    'bg-slate-100 text-slate-500',
};

export default function SASupportPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [tickets, setTickets] = useState(MOCK_TICKETS);

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.gym.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || t.status === filter;
    return matchSearch && matchFilter;
  });

  const setStatus = (id: string, status: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const counts = {
    OPEN:        tickets.filter(t => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED:    tickets.filter(t => t.status === 'RESOLVED').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><MessageSquare size={22} /> Support Tickets</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage gym owner support requests and inquiries</p>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open', count: counts.OPEN, color: 'border-amber-200 bg-amber-50', text: 'text-amber-700' },
          { label: 'In Progress', count: counts.IN_PROGRESS, color: 'border-blue-200 bg-blue-50', text: 'text-blue-700' },
          { label: 'Resolved', count: counts.RESOLVED, color: 'border-green-200 bg-green-50', text: 'text-green-700' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl border p-4', s.color)}>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={cn('text-2xl font-bold mt-1', s.text)}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex gap-1 border border-slate-200 rounded-lg overflow-hidden text-xs">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={cn('px-3 py-2 font-medium', filter === s ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50')}>
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>
              {['ID', 'Subject', 'Gym', 'Category', 'Priority', 'Status', 'Created', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-slate-500">No tickets found</td></tr>}
            {filtered.map(t => {
              const { color, icon: Icon } = STATUS_META[t.status];
              return (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs">{t.subject}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{t.gym}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{t.category}</span></td>
                  <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded text-xs font-semibold', PRIORITY_COLOR[t.priority])}>{t.priority}</span></td>
                  <td className="px-4 py-3"><span className={cn('flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold w-fit', color)}><Icon size={11} />{STATUS_META[t.status].label}</span></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{t.created}</td>
                  <td className="px-4 py-3">
                    <select value={t.status} onChange={e => setStatus(t.id, e.target.value)} className="text-xs border rounded px-1.5 py-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-400">
                      {Object.keys(STATUS_META).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
