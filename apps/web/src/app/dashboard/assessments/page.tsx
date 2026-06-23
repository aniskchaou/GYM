'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { ClipboardList, Plus, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Athletic'];
const COMMON_GOALS = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'Stress Relief', 'General Fitness', 'Sports Performance', 'Rehabilitation'];

const EMPTY_FORM = { memberId: '', fitnessLevel: 'Beginner', goals: [] as string[], weight: '', height: '', bodyFat: '', notes: '', testResults: '' };

export default function AssessmentsPage() {
  const params = useSearchParams();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(!!params.get('memberId'));
  const [form, setForm] = useState({ ...EMPTY_FORM, memberId: params.get('memberId') ?? '' });
  const [assessments, setAssessments] = useState<any[]>([]);

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['trainer-clients'],
    queryFn: () => api.get('/trainers/my/clients').then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: (dto: any) => api.post('/trainers/my/assessment', dto).then(r => r.data),
    onSuccess: (data) => {
      const client = clients.find(c => c.id === form.memberId);
      setAssessments(prev => [{
        id: Date.now(),
        memberName: client ? `${client.firstName} ${client.lastName}` : form.memberId,
        ...data,
        date: new Date().toLocaleDateString(),
      }, ...prev]);
      toast.success('Assessment saved');
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const toggleGoal = (g: string) => {
    setForm(f => ({
      ...f,
      goals: f.goals.includes(g) ? f.goals.filter(x => x !== g) : [...f.goals, g],
    }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ClipboardList size={22} /> Fitness Assessments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Evaluate client fitness level, set goals and record baselines</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> New Assessment
        </button>
      </div>

      {/* Assessment list */}
      {assessments.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-slate-400">
          <ClipboardList size={36} className="mx-auto mb-2 opacity-30" />
          <p className="font-medium text-slate-600">No assessments yet</p>
          <p className="text-sm mt-1">Click "New Assessment" to evaluate a client's fitness.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{a.memberName}</p>
                  <p className="text-xs text-slate-400">{a.date}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">{a.fitnessLevel}</span>
              </div>
              {a.goals?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {a.goals.map((g: string) => (
                    <span key={g} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{g}</span>
                  ))}
                </div>
              )}
              {a.notes && <p className="text-sm text-slate-500 mt-2 text-xs">{a.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Assessment form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg text-slate-800">Fitness Assessment</h2>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Client */}
              <label className="block">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Client *</span>
                <select value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                  <option value="">— Select client —</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </label>

              {/* Fitness level */}
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Fitness Level</p>
                <div className="grid grid-cols-4 gap-2">
                  {FITNESS_LEVELS.map(level => (
                    <button
                      key={level}
                      onClick={() => setForm(f => ({ ...f, fitnessLevel: level }))}
                      className={cn('py-2 rounded-xl text-xs font-medium border-2 transition-colors', form.fitnessLevel === level ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Goals (select all that apply)</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_GOALS.map(g => (
                    <button
                      key={g}
                      onClick={() => toggleGoal(g)}
                      className={cn('flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors', form.goals.includes(g) ? 'bg-green-600 text-white border-green-600' : 'border-slate-200 text-slate-600 hover:border-slate-300')}
                    >
                      {form.goals.includes(g) && <CheckCircle size={11} />}{g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Baseline measurements */}
              <div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Baseline Measurements</p>
                <div className="grid grid-cols-3 gap-3">
                  {[['Weight (kg)', 'weight'], ['Height (cm)', 'height'], ['Body Fat (%)', 'bodyFat']].map(([label, key]) => (
                    <label key={key} className="block">
                      <span className="text-xs text-slate-500">{label}</span>
                      <input type="number" step="0.1" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="mt-0.5 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="grid grid-cols-1 gap-3">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Test Results / Observations</span>
                  <textarea value={form.testResults} onChange={e => setForm(f => ({ ...f, testResults: e.target.value }))} rows={2} placeholder="Push-ups: 20, Plank: 60s, VO2 max: …" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Notes / Recommendations</span>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Client should focus on cardio 3x/week before adding strength training…" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" />
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm hover:bg-slate-50">Cancel</button>
                <button
                  onClick={() => createMut.mutate({ memberId: form.memberId, fitnessLevel: form.fitnessLevel, goals: form.goals, weight: form.weight ? parseFloat(form.weight) : undefined, height: form.height ? parseFloat(form.height) : undefined, bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined, notes: [form.testResults, form.notes].filter(Boolean).join(' | ') })}
                  disabled={!form.memberId || form.goals.length === 0 || createMut.isPending}
                  className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createMut.isPending ? 'Saving…' : 'Save Assessment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
