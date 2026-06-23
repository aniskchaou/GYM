'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Wrench, Plus, AlertTriangle, CheckCircle, Clock, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Equipment {
  id: string;
  name: string;
  category?: string;
  serialNumber?: string;
  status?: string;
  isUnderMaintenance?: boolean;
  lastMaintenanceAt?: string;
  purchasedAt?: string;
}

interface MaintenanceLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: string;
  notes: string;
  date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  technician?: string;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:     'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100  text-blue-700',
  DONE:        'bg-green-100 text-green-700',
};

const MAINTENANCE_TYPES = ['Routine Check', 'Repair', 'Cleaning', 'Calibration', 'Part Replacement', 'Safety Inspection'];

export default function MaintenancePage() {
  const qc = useQueryClient();
  const [search, setSearch]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [logs, setLogs]         = useState<MaintenanceLog[]>([]);
  const [form, setForm]         = useState({ equipmentId: '', type: 'Routine Check', notes: '', technician: '', date: new Date().toISOString().slice(0, 10) });

  const { data: equipment = [], isLoading } = useQuery<Equipment[]>({
    queryKey: ['equipment'],
    queryFn: () => api.get('/equipment').then(r => r.data ?? []),
  });

  const maintenanceMut = useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) =>
      api.post(`/equipment/${id}/maintenance`, { on }).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['equipment'] });
      toast.success(vars.on ? 'Equipment set to maintenance mode' : 'Equipment marked as available');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const addLog = () => {
    const eq = equipment.find(e => e.id === form.equipmentId);
    if (!eq) { toast.error('Select equipment'); return; }
    const log: MaintenanceLog = {
      id: `log-${Date.now()}`,
      equipmentId: form.equipmentId,
      equipmentName: eq.name,
      type: form.type,
      notes: form.notes,
      date: form.date,
      status: 'PENDING',
      technician: form.technician,
    };
    setLogs(prev => [log, ...prev]);
    toast.success('Maintenance log added');
    setShowForm(false);
    setForm({ equipmentId: '', type: 'Routine Check', notes: '', technician: '', date: new Date().toISOString().slice(0, 10) });
  };

  const updateLogStatus = (id: string, status: MaintenanceLog['status']) => {
    setLogs(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const underMaintenance = equipment.filter(e => e.isUnderMaintenance);
  const available        = equipment.filter(e => !e.isUnderMaintenance);

  const filteredEquipment = equipment.filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase()) || (e.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Wrench size={22} /> Equipment Maintenance</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track maintenance status and schedule service logs</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Log Maintenance
        </button>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Available',       value: available.length,        color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Under Maintenance', value: underMaintenance.length, color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Total Equipment', value: equipment.length,         color: 'bg-slate-50 border-slate-200 text-slate-700' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl border p-4', s.color)}>
            <p className="text-xs opacity-70">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Equipment status grid */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <h2 className="font-semibold text-slate-800">Equipment Status</h2>
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm w-full focus:outline-none" />
          </div>
        </div>
        {isLoading ? (
          <p className="text-slate-500 text-sm">Loading equipment…</p>
        ) : filteredEquipment.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-slate-400">
            <Wrench size={32} className="mx-auto mb-2 opacity-30" />
            <p>No equipment found. Add equipment from the Equipment page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredEquipment.map(eq => (
              <div key={eq.id} className={cn('bg-white rounded-xl border shadow-sm p-4', eq.isUnderMaintenance ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200')}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{eq.name}</p>
                    {eq.category && <p className="text-xs text-slate-400">{eq.category}</p>}
                    {eq.serialNumber && <p className="text-xs text-slate-400 font-mono">S/N: {eq.serialNumber}</p>}
                  </div>
                  {eq.isUnderMaintenance
                    ? <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                    : <CheckCircle  size={16} className="text-green-500 shrink-0" />
                  }
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', eq.isUnderMaintenance ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')}>
                    {eq.isUnderMaintenance ? 'Maintenance' : 'Available'}
                  </span>
                  <button
                    onClick={() => maintenanceMut.mutate({ id: eq.id, on: !eq.isUnderMaintenance })}
                    disabled={maintenanceMut.isPending}
                    className={cn('text-xs px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-40', eq.isUnderMaintenance ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-amber-500 text-white hover:bg-amber-600')}
                  >
                    {eq.isUnderMaintenance ? 'Mark Available' : 'Set Maintenance'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Clock size={16} /> Maintenance Logs</h2>
          <span className="text-xs text-slate-400">{logs.length} entries</span>
        </div>
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Clock size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No maintenance logs yet. Click "Log Maintenance" to add a service record.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>{['Equipment', 'Type', 'Technician', 'Date', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{log.equipmentName}</td>
                  <td className="px-4 py-3 text-slate-600">{log.type}</td>
                  <td className="px-4 py-3 text-slate-500">{log.technician || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{log.date}</td>
                  <td className="px-4 py-3">
                    <select
                      value={log.status}
                      onChange={e => updateLogStatus(log.id, e.target.value as MaintenanceLog['status'])}
                      className={cn('text-xs px-2 py-0.5 rounded border-0 font-medium focus:outline-none cursor-pointer', STATUS_COLOR[log.status])}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate">{log.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Log maintenance modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-800">Log Maintenance</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Equipment</span>
                <select value={form.equipmentId} onChange={e => setForm(f => ({ ...f, equipmentId: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="">— Select equipment —</option>
                  {equipment.map(e => <option key={e.id} value={e.id}>{e.name}{e.category ? ` (${e.category})` : ''}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Type</span>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    {MAINTENANCE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Date</span>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Technician / Assigned To</span>
                <input value={form.technician} onChange={e => setForm(f => ({ ...f, technician: e.target.value }))} placeholder="Name or company" className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Notes</span>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={addLog} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700">Save Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
