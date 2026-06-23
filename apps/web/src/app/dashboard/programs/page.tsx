'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProgramsPage() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({ title: '', description: '', weeks: 4, level: 'BEGINNER', isPublished: true });
  const [open, setOpen] = useState<string | null>(null);

  const list = useQuery({ queryKey: ['programs'], queryFn: () => api.get('/programs').then((r) => r.data).catch(() => []) });
  const mine = useQuery({ queryKey: ['programs-mine'], queryFn: () => api.get('/programs/mine').then((r) => r.data).catch(() => []) });
  const detail = useQuery({
    queryKey: ['program', open],
    enabled: !!open,
    queryFn: () => api.get(`/programs/${open}`).then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: () => api.post('/programs', form).then((r) => r.data),
    onSuccess: () => { toast.success('Program created'); setShow(false); qc.invalidateQueries({ queryKey: ['programs'] }); },
  });
  const enroll = useMutation({
    mutationFn: (id: string) => api.post(`/programs/${id}/enroll`).then((r) => r.data),
    onSuccess: () => { toast.success('Enrolled'); qc.invalidateQueries({ queryKey: ['programs-mine'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const advance = useMutation({
    mutationFn: (id: string) => api.post(`/programs/${id}/advance`).then((r) => r.data),
    onSuccess: (d: any) => { toast.success(d.status === 'COMPLETED' ? 'Program complete!' : `Day ${d.currentDay} W${d.currentWeek}`); qc.invalidateQueries({ queryKey: ['programs-mine'] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Programs</h1>
          <p className="text-sm text-slate-500">Multi-week training programs</p>
        </div>
        <button onClick={() => setShow(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Plus size={16} /> New Program
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold mb-3">My enrollments</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {(mine.data ?? []).map((e: any) => (
            <li key={e.id} className="py-3 flex justify-between items-center">
              <div>
                <div className="font-medium">{e.program?.title}</div>
                <div className="text-xs text-slate-500">Week {e.currentWeek} · Day {e.currentDay} · {e.status} · {e.progress}%</div>
                <div className="h-1.5 bg-slate-200 rounded-full w-48 mt-1 overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: `${e.progress ?? 0}%` }} />
                </div>
              </div>
              {e.status !== 'COMPLETED' && (
                <button onClick={() => advance.mutate(e.programId)} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs">Mark day done</button>
              )}
            </li>
          ))}
          {(mine.data ?? []).length === 0 && <li className="py-2 text-slate-400">Not enrolled in any program.</li>}
        </ul>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {(list.data ?? []).map((p: any) => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2"><BookOpen size={16} /> {p.title}</h3>
                <p className="text-xs text-slate-500">{p.weeks} wks · {p.level} · {p.isPublished ? 'Published' : 'Draft'}</p>
              </div>
              <button onClick={() => enroll.mutate(p.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs">Enroll</button>
            </div>
            <p className="text-sm text-slate-600 mt-2">{p.description}</p>
            <button onClick={() => setOpen(open === p.id ? null : p.id)} className="text-xs text-indigo-600 mt-2 flex items-center">
              <ChevronRight size={12} className={`transition-transform ${open === p.id ? 'rotate-90' : ''}`} /> Days
            </button>
            {open === p.id && detail.data && (
              <ul className="mt-2 text-xs space-y-1 max-h-40 overflow-y-auto">
                {(detail.data.schedule ?? []).map((d: any) => (
                  <li key={d.id} className="border-l-2 border-indigo-200 pl-2">
                    W{d.weekNumber}D{d.dayNumber}: {d.title ?? 'Workout'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-3">
            <h2 className="font-semibold">New program</h2>
            <input placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <textarea placeholder="description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <input type="number" min={1} placeholder="weeks" value={form.weeks} onChange={(e) => setForm({ ...form, weeks: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((l) => <option key={l}>{l}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShow(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => create.mutate()} disabled={!form.title.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
