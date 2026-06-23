'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { MessageSquare, Search, Plus, CheckCircle, Clock, AlertCircle, XCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}

const STATUS_META: Record<string, { color: string; icon: React.ElementType }> = {
  OPEN:        { color: 'bg-amber-100 text-amber-700', icon: Clock },
  IN_PROGRESS: { color: 'bg-blue-100 text-blue-700',   icon: AlertCircle },
  RESOLVED:    { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CLOSED:      { color: 'bg-slate-100 text-slate-500', icon: XCircle },
};

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700', MEDIUM: 'bg-amber-100 text-amber-700', LOW: 'bg-slate-100 text-slate-500',
};

const EMPTY_FORM = { subject: '', description: '', priority: 'MEDIUM' };

export default function ComplaintsPage() {
  const qc = useQueryClient();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ ...EMPTY_FORM });

  const { data = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ['complaints'],
    queryFn: () => api.get('/members/complaints/all').then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: (dto: any) => api.post('/members/general/complaint', dto).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['complaints'] }); toast.success('Complaint logged'); setShowForm(false); setForm({ ...EMPTY_FORM }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const resolveMut = useMutation({
    mutationFn: (id: string) => api.post(`/members/complaints/${id}/resolve`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['complaints'] }); toast.success('Complaint resolved'); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const tickets = Array.isArray(data) ? data : [];
  const visible = tickets.filter(t =>
    (filter === 'ALL' || t.status === filter) &&
    (!search || t.subject.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    OPEN:        tickets.filter(t => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    RESOLVED:    tickets.filter(t => t.status === 'RESOLVED').length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><MessageSquare size={22} /> Member Complaints</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and resolve member issues and support requests</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Log Complaint
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open',        value: counts.OPEN,        color: 'border-amber-200 bg-amber-50 text-amber-700' },
          { label: 'In Progress', value: counts.IN_PROGRESS, color: 'border-blue-200 bg-blue-50 text-blue-700' },
          { label: 'Resolved',    value: counts.RESOLVED,    color: 'border-green-200 bg-green-50 text-green-700' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl border p-4', s.color)}>
            <p className="text-xs opacity-70">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints…" className="pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div className="flex gap-1 border border-slate-200 rounded-lg overflow-hidden text-xs">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={cn('px-3 py-2 font-medium', filter === s ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50')}>
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>{['Subject', 'Priority', 'Status', 'Reported', 'Action'].map(h => (
              <th key={h} className="text-left px-4 py-3">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading…</td></tr>}
            {!isLoading && visible.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">No complaints found</td></tr>}
            {visible.map(t => {
              const { color, icon: Icon } = STATUS_META[t.status] ?? STATUS_META.OPEN;
              return (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{t.subject}</p>
                    <p className="text-xs text-slate-400 truncate max-w-xs">{t.description}</p>
                  </td>
                  <td className="px-4 py-3"><span className={cn('px-2 py-0.5 rounded text-xs font-semibold', PRIORITY_COLOR[t.priority] ?? 'bg-slate-100 text-slate-500')}>{t.priority}</span></td>
                  <td className="px-4 py-3"><span className={cn('flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold w-fit', color)}><Icon size={11} />{t.status.replace('_',' ')}</span></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {(t.status === 'OPEN' || t.status === 'IN_PROGRESS') && (
                      <button onClick={() => resolveMut.mutate(t.id)} disabled={resolveMut.isPending} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
                        <CheckCircle size={11} /> Resolve
                      </button>
                    )}
                    {t.status === 'RESOLVED' && <span className="text-xs text-slate-400">✓ Resolved</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New complaint modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-800">Log Complaint</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); createMut.mutate(form); }} className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Subject</span>
                <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Description</span>
                <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Priority</span>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option>HIGH</option><option>MEDIUM</option><option>LOW</option>
                </select>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMut.isPending} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{createMut.isPending ? 'Saving…' : 'Log Complaint'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
