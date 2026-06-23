'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dumbbell, Plus, X, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

type Day = {
  dayOfWeek: number;
  name: string;
  exercises: Array<{ exerciseId: string; sets: number; reps?: string; weight?: string; restTime?: number; notes?: string }>;
};

const EMPTY: { memberUserId: string; title: string; description: string; weeks: number; days: Day[] } = {
  memberUserId: '', title: '', description: '', weeks: 4,
  days: [{ dayOfWeek: 1, name: 'Day 1', exercises: [] }],
};

export default function WorkoutPlansPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const isStaff = ['GYM_OWNER', 'BRANCH_MANAGER', 'TRAINER', 'SUPER_ADMIN'].includes(user?.role ?? '');

  const { data: plans } = useQuery({
    queryKey: ['workout-plans'],
    queryFn: () => api.get('/workouts/plans').then((r) => r.data),
  });
  const { data: exercises } = useQuery({
    queryKey: ['workouts-library'],
    queryFn: () => api.get('/workouts/exercises').then((r) => r.data),
    enabled: show,
  });
  const { data: members } = useQuery({
    queryKey: ['members', { limit: 100 }],
    queryFn: () => api.get('/members', { params: { limit: 100 } }).then((r) => r.data),
    enabled: show && isStaff,
  });

  const create = useMutation({
    mutationFn: (p: any) => api.post('/workouts/plans', p).then((r) => r.data),
    onSuccess: () => {
      toast.success('Plan created');
      qc.invalidateQueries({ queryKey: ['workout-plans'] });
      setShow(false); setForm(EMPTY);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/workouts/plans/${id}`).then((r) => r.data),
    onSuccess: () => { toast.success('Plan deleted'); qc.invalidateQueries({ queryKey: ['workout-plans'] }); },
  });

  const list: any[] = Array.isArray(plans) ? plans : plans?.data ?? [];
  const exerciseList: any[] = Array.isArray(exercises) ? exercises : exercises?.data ?? [];
  const memberList: any[] = Array.isArray(members) ? members : members?.data ?? [];

  const addDay = () => setForm((f) => ({ ...f, days: [...f.days, { dayOfWeek: f.days.length + 1, name: `Day ${f.days.length + 1}`, exercises: [] }] }));
  const removeDay = (idx: number) => setForm((f) => ({ ...f, days: f.days.filter((_, i) => i !== idx) }));
  const addExercise = (dayIdx: number) => setForm((f) => ({
    ...f,
    days: f.days.map((d, i) => i === dayIdx ? { ...d, exercises: [...d.exercises, { exerciseId: '', sets: 3, reps: '10' }] } : d),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Dumbbell size={22} /> Workout Plans</h1>
          <p className="text-sm text-slate-500">Structured multi-day training programs</p>
        </div>
        {isStaff && (
          <button onClick={() => setShow(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={16} /> New Plan</button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-500">{p.weeks ?? 0} weeks · {p.days?.length ?? 0} days</p>
              </div>
              {isStaff && (
                <button onClick={() => { if (confirm('Delete plan?')) remove.mutate(p.id); }} className="text-red-500"><Trash2 size={14} /></button>
              )}
            </div>
            {p.description && <p className="text-sm text-slate-600 mb-3">{p.description}</p>}
            {p.member?.user && (
              <p className="text-xs text-indigo-600">For: {p.member.user.firstName} {p.member.user.lastName}</p>
            )}
            <div className="mt-3 space-y-1">
              {(p.days ?? []).map((d: any) => (
                <p key={d.id} className="text-xs text-slate-600">• {d.name} ({d.exercises?.length ?? 0} exercises)</p>
              ))}
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="col-span-3 text-center text-slate-500 py-12">No plans yet</p>}
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="font-semibold">Create Workout Plan</h2>
              <button onClick={() => setShow(false)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Plan title" className="border rounded-lg px-3 py-2 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <input type="number" placeholder="Weeks" className="border rounded-lg px-3 py-2 text-sm" value={form.weeks} onChange={(e) => setForm({ ...form, weeks: Number(e.target.value) })} />
              </div>
              {isStaff && (
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.memberUserId} onChange={(e) => setForm({ ...form, memberUserId: e.target.value })}>
                  <option value="">Assign to member…</option>
                  {memberList.map((m: any) => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                </select>
              )}
              <textarea placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

              <div className="space-y-3">
                {form.days.map((d, dIdx) => (
                  <div key={dIdx} className="border border-slate-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <input
                        className="font-medium text-sm border rounded px-2 py-1"
                        value={d.name}
                        onChange={(e) => setForm((f) => ({ ...f, days: f.days.map((x, i) => i === dIdx ? { ...x, name: e.target.value } : x) }))}
                      />
                      {form.days.length > 1 && <button onClick={() => removeDay(dIdx)} className="text-red-500 text-xs">Remove day</button>}
                    </div>
                    <div className="space-y-2">
                      {d.exercises.map((ex, eIdx) => (
                        <div key={eIdx} className="flex gap-2 items-center">
                          <select
                            className="flex-1 border rounded px-2 py-1 text-xs"
                            value={ex.exerciseId}
                            onChange={(e) => setForm((f) => ({
                              ...f,
                              days: f.days.map((x, i) => i === dIdx ? {
                                ...x,
                                exercises: x.exercises.map((y, j) => j === eIdx ? { ...y, exerciseId: e.target.value } : y),
                              } : x),
                            }))}
                          >
                            <option value="">Select exercise…</option>
                            {exerciseList.map((ex: any) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                          </select>
                          <input type="number" placeholder="Sets" className="w-16 border rounded px-2 py-1 text-xs" value={ex.sets}
                            onChange={(e) => setForm((f) => ({ ...f, days: f.days.map((x, i) => i === dIdx ? { ...x, exercises: x.exercises.map((y, j) => j === eIdx ? { ...y, sets: Number(e.target.value) } : y) } : x) }))} />
                          <input placeholder="Reps" className="w-20 border rounded px-2 py-1 text-xs" value={ex.reps ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, days: f.days.map((x, i) => i === dIdx ? { ...x, exercises: x.exercises.map((y, j) => j === eIdx ? { ...y, reps: e.target.value } : y) } : x) }))} />
                        </div>
                      ))}
                      <button onClick={() => addExercise(dIdx)} className="text-xs text-indigo-600">+ Add exercise</button>
                    </div>
                  </div>
                ))}
                <button onClick={addDay} className="text-sm text-indigo-600">+ Add day</button>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t sticky bottom-0 bg-white">
              <button onClick={() => setShow(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button
                onClick={() => {
                  if (!form.title) return toast.error('Title required');
                  const payload: any = { ...form };
                  if (!payload.memberUserId) return toast.error('Member required');
                  create.mutate(payload);
                }}
                disabled={create.isPending}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                {create.isPending ? 'Saving…' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
