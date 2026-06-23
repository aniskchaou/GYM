'use client';

import { useState } from 'react';
import { UserSquare2, Plus, Search, X, Clock, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type VisitorStatus = 'IN' | 'OUT';

interface Visitor {
  id: string;
  name: string;
  phone?: string;
  purpose: string;
  hostMember?: string;
  checkIn: string;
  checkOut?: string;
  status: VisitorStatus;
  badge?: string;
}

const PURPOSES = ['Guest of member', 'Tour / Inquiry', 'Delivery', 'Maintenance', 'Event attendee', 'Trial session', 'Other'];

const EMPTY_FORM = { name: '', phone: '', purpose: 'Guest of member', hostMember: '', badge: '' };

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [search, setSearch]     = useState('');

  const addVisitor = () => {
    if (!form.name) { toast.error('Name is required'); return; }
    const v: Visitor = {
      id: `vis-${Date.now()}`,
      name: form.name, phone: form.phone,
      purpose: form.purpose, hostMember: form.hostMember,
      badge: form.badge || `B${String(visitors.length + 1).padStart(3, '0')}`,
      checkIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'IN',
    };
    setVisitors(prev => [v, ...prev]);
    toast.success(`${form.name} checked in — badge ${v.badge}`);
    setShowForm(false);
    setForm({ ...EMPTY_FORM });
  };

  const checkOut = (id: string) => {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: 'OUT', checkOut: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) } : v));
    toast.success('Visitor checked out');
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const visible = visitors.filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()) || (v.purpose).toLowerCase().includes(search.toLowerCase()));
  const activeCount = visitors.filter(v => v.status === 'IN').length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><UserSquare2 size={22} /> Visitor Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">{today}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Check In Visitor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Currently Inside',  value: activeCount,                   color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
          { label: 'Total Today',        value: visitors.length,               color: 'bg-slate-50 border-slate-200 text-slate-700' },
          { label: 'Checked Out Today',  value: visitors.length - activeCount, color: 'bg-green-50 border-green-200 text-green-700' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl border p-4', s.color)}>
            <p className="text-xs opacity-70">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search visitors…" className="pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>

      {/* Visitor list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
            <tr>{['Badge', 'Visitor', 'Purpose', 'Host', 'Check In', 'Check Out', 'Status', 'Action'].map(h => (
              <th key={h} className="text-left px-4 py-3">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={8} className="p-10 text-center text-slate-400">
                <UserSquare2 size={28} className="mx-auto mb-2 opacity-30" />
                <p>No visitors today. Click "Check In Visitor" to log an entry.</p>
              </td></tr>
            )}
            {visible.map(v => (
              <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{v.badge}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{v.name}</p>
                  {v.phone && <p className="text-xs text-slate-400">{v.phone}</p>}
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">{v.purpose}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{v.hostMember || '—'}</td>
                <td className="px-4 py-3 text-slate-600 text-xs flex items-center gap-1"><LogIn size={11} className="text-green-500" />{v.checkIn}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {v.checkOut ? <span className="flex items-center gap-1"><LogOut size={11} className="text-slate-400" />{v.checkOut}</span> : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs font-medium', v.status === 'IN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>
                    {v.status === 'IN' ? <><CheckCircle size={11} /> Inside</> : <><XCircle size={11} /> Left</>}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {v.status === 'IN' && (
                    <button onClick={() => checkOut(v.id)} className="flex items-center gap-1 text-xs border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600">
                      <LogOut size={11} /> Check Out
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add visitor modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-800">Check In Visitor</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block col-span-2">
                  <span className="text-xs font-medium text-slate-600">Full Name *</span>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Visitor's full name" className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Phone</span>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555-0000" className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Badge # (auto)</span>
                  <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder={`B${String(visitors.length + 1).padStart(3,'0')}`} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Purpose</span>
                <select value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  {PURPOSES.map(p => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Host Member (if guest)</span>
                <input value={form.hostMember} onChange={e => setForm(f => ({ ...f, hostMember: e.target.value }))} placeholder="Member's name" className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={addVisitor} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700">Check In</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
