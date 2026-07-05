'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { TrendingUp, Plus, X, Scale, Ruler, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const EMPTY_LOG = { weight: '', height: '', bodyFat: '', chest: '', waist: '', hips: '', biceps: '', notes: '' };

export default function TrainerProgressPage() {
  const params  = useSearchParams();
  const memberId = params.get('memberId') ?? '';
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY_LOG, memberId });
  const [selectedMember, setSelectedMember] = useState(memberId);

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['trainer-clients'],
    queryFn: () => api.get('/trainers/my/clients').then(r => r.data),
  });

  const { data: assessments = [] } = useQuery<any[]>({
    queryKey: ['assessments'],
    queryFn: () => api.get('/trainers/my/assessments').then(r => r.data),
  });

  const logMut = useMutation({
    mutationFn: (dto: any) => api.post(`/members/${dto.memberId}/measurements`, {
      weight: dto.weight ? parseFloat(dto.weight) : undefined,
      height: dto.height ? parseFloat(dto.height) : undefined,
      bodyFat: dto.bodyFat ? parseFloat(dto.bodyFat) : undefined,
      chest: dto.chest ? parseFloat(dto.chest) : undefined,
      waist: dto.waist ? parseFloat(dto.waist) : undefined,
      hips: dto.hips ? parseFloat(dto.hips) : undefined,
      biceps: dto.biceps ? parseFloat(dto.biceps) : undefined,
      notes: dto.notes,
    }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assessments'] }); toast.success('Measurement recorded'); setShowForm(false); setForm({ ...EMPTY_LOG, memberId: selectedMember }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const memberLogs = assessments.filter((a: any) => selectedMember === '' || a.member?.user?.id === selectedMember);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={22} /> Member Progress</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track body measurements and fitness improvements</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Log Measurement
        </button>
      </div>

      {/* Member selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Client</label>
        <select
          value={selectedMember}
          onChange={e => setSelectedMember(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="">— All clients —</option>
          {clients.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </select>
      </div>

      {/* Progress history */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-slate-800">Measurement History</h2>
          <span className="text-xs text-slate-400">{memberLogs.length} records</span>
        </div>
        {memberLogs.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Scale size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No measurements recorded yet. Click "Log Measurement" to start.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>{['Date', 'Member', 'Weight', 'Body Fat', 'Waist', 'Notes'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {memberLogs.map((log: any) => (
                <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-600">{log.date ? new Date(log.date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{log.member?.user?.firstName} {log.member?.user?.lastName}</td>
                  <td className="px-4 py-3 text-slate-600">{log.weightKg ? `${log.weightKg} kg` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{log.bodyFatPct ? `${log.bodyFatPct}%` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{log.waistCm ? `${log.waistCm} cm` : '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-[200px] truncate">{log.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Log modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg text-slate-800">Log Measurement</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Client *</span>
                <select
                  value={form.memberId}
                  onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))}
                  className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="">— Select client —</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[['Weight (kg)', 'weight'], ['Height (cm)', 'height'], ['Body Fat (%)', 'bodyFat'], ['Chest (cm)', 'chest'], ['Waist (cm)', 'waist'], ['Hips (cm)', 'hips'], ['Biceps (cm)', 'biceps']].map(([label, key]) => (
                  <label key={key} className="block">
                    <span className="text-xs font-medium text-slate-600">{label}</span>
                    <input type="number" step="0.1" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  </label>
                ))}
              </div>
              <label className="block">
                <span className="text-xs font-medium text-slate-600">Notes</span>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
              </label>
              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">Cancel</button>
                <button onClick={() => logMut.mutate(form)} disabled={!form.memberId || logMut.isPending} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{logMut.isPending ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
