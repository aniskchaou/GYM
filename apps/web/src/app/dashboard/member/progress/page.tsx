'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { TrendingUp, Plus, X, Scale, Activity, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const EMPTY = { weight: '', bodyFat: '', waist: '', chest: '', biceps: '', notes: '' };

function normalizeMeasurement(entry: any) {
  if (!entry) return null;
  return {
    ...entry,
    weight: entry.weight ?? entry.weightKg ?? null,
    bodyFat: entry.bodyFat ?? entry.bodyFatPct ?? null,
    waist: entry.waist ?? entry.waistCm ?? null,
    chest: entry.chest ?? entry.chestCm ?? null,
    biceps: entry.biceps ?? entry.armCm ?? null,
  };
}

function StatCard({ label, value, unit, prev, color }: { label: string; value?: number | null; unit: string; prev?: number | null; color: string }) {
  const diff = value && prev ? +(value - prev).toFixed(1) : null;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value ? `${value}${unit}` : '—'}</p>
      {diff !== null && (
        <p className={cn('text-xs mt-0.5 font-medium', diff <= 0 ? 'text-green-600' : 'text-red-500')}>
          {diff > 0 ? `+${diff}` : diff}{unit} vs last
        </p>
      )}
    </div>
  );
}

export default function MemberProgressPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY });

  const { data: profile } = useQuery({
    queryKey: ['member-card'],
    queryFn: () => api.get('/members/me/card').then(r => r.data),
  });

  const { data: measurements = [], isLoading } = useQuery<any[]>({
    queryKey: ['my-measurements'],
    queryFn: () => api.get('/members/me/measurements').then(r => r.data).catch(() => []),
    enabled: !!user?.id,
  });

  const logMut = useMutation({
    mutationFn: (dto: any) => api.post('/members/me/measurements', {
      weight:  dto.weight  ? parseFloat(dto.weight)  : undefined,
      bodyFat: dto.bodyFat ? parseFloat(dto.bodyFat) : undefined,
      waist:   dto.waist   ? parseFloat(dto.waist)   : undefined,
      chest:   dto.chest   ? parseFloat(dto.chest)   : undefined,
      biceps:  dto.biceps  ? parseFloat(dto.biceps)  : undefined,
      notes:   dto.notes,
    }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-measurements'] });
      toast.success('Progress logged!');
      setShowForm(false);
      setForm({ ...EMPTY });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const normalizedMeasurements = measurements.map(normalizeMeasurement).filter(Boolean);
  const latest = normalizedMeasurements[0];
  const previous = normalizedMeasurements[1];
  const goals = Array.isArray(profile?.fitnessGoals) ? profile.fitnessGoals : [];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={22} /> My Progress</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track your fitness journey over time</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Log Measurement
        </button>
      </div>

      {/* Latest stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Weight"   value={latest?.weight}  unit=" kg" prev={previous?.weight}  color="bg-blue-500" />
        <StatCard label="Body Fat" value={latest?.bodyFat} unit="%"   prev={previous?.bodyFat} color="bg-amber-500" />
        <StatCard label="Waist"    value={latest?.waist}   unit=" cm" prev={previous?.waist}   color="bg-indigo-500" />
        <StatCard label="Measurements logged" value={normalizedMeasurements.length} unit="" color="bg-green-500" />
      </div>

      {/* Goals */}
      {goals.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Target size={16} /> My Goals</h2>
          <div className="flex flex-wrap gap-2">
            {goals.map((g: string) => (
              <span key={g} className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">{g}</span>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-slate-800">Measurement History</h2>
          <span className="text-xs text-slate-400">{normalizedMeasurements.length} entries</span>
        </div>
        {isLoading ? (
          <p className="text-center text-slate-500 py-8">Loading…</p>
        ) : normalizedMeasurements.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Scale size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No measurements yet. Click "Log Measurement" to start tracking.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>{['Date', 'Weight', 'Body Fat', 'Waist', 'Chest', 'Biceps', 'Notes'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {normalizedMeasurements.map((m: any, i: number) => (
                <tr key={m.id ?? i} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-600">{m.date ? new Date(m.date).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{m.weight ? `${m.weight} kg` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{m.bodyFat ? `${m.bodyFat}%` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{m.waist ? `${m.waist} cm` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{m.chest ? `${m.chest} cm` : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{m.biceps ? `${m.biceps} cm` : '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-[150px] truncate">{m.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Log modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-slate-800">Log Measurement</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Weight (kg)', 'weight'], ['Body Fat (%)', 'bodyFat'], ['Waist (cm)', 'waist'], ['Chest (cm)', 'chest'], ['Biceps (cm)', 'biceps']].map(([label, key]) => (
                <label key={key} className="block">
                  <span className="text-xs text-slate-600 font-medium">{label}</span>
                  <input type="number" step="0.1" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </label>
              ))}
              <label className="block col-span-2">
                <span className="text-xs text-slate-600 font-medium">Notes</span>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={() => logMut.mutate(form)} disabled={logMut.isPending} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">{logMut.isPending ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
