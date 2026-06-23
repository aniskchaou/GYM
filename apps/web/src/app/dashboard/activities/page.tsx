'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Plus } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ActivitiesPage() {
  const qc = useQueryClient();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({ title: '', description: '', target: 100, unit: 'reps', rewardPoints: 50 });

  const list = useQuery({
    queryKey: ['activities'],
    queryFn: () => api.get('/activities').then((r) => r.data).catch(() => []),
  });
  const mine = useQuery({
    queryKey: ['activities-mine'],
    queryFn: () => api.get('/activities/mine').then((r) => r.data).catch(() => []),
  });

  const create = useMutation({
    mutationFn: () => api.post('/activities', form).then((r) => r.data),
    onSuccess: () => { toast.success('Created'); setShow(false); qc.invalidateQueries({ queryKey: ['activities'] }); },
  });
  const join = useMutation({
    mutationFn: (id: string) => api.post(`/activities/${id}/join`).then((r) => r.data),
    onSuccess: () => { toast.success('Joined'); qc.invalidateQueries({ queryKey: ['activities-mine'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });
  const progress = useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) =>
      api.post(`/activities/${id}/progress`, { progress: value }).then((r) => r.data),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['activities-mine'] }); },
  });

  const items: any[] = list.data ?? [];
  const myItems: any[] = mine.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activities & Challenges</h1>
          <p className="text-sm text-slate-500">Compete, track progress, win loyalty points</p>
        </div>
        <button onClick={() => setShow(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Plus size={16} /> New Challenge
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold mb-4">My challenges</h2>
        {myItems.length === 0 ? <p className="text-sm text-slate-500">Not enrolled in any challenge.</p> : (
          <ul className="space-y-3">
            {myItems.map((p: any) => (
              <li key={p.id} className="border border-slate-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{p.activity?.title}</span>
                  <span className="text-xs text-slate-500">{p.progress}/{p.activity?.target} {p.activity?.unit}</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, (p.progress/(p.activity?.target||1))*100)}%` }} />
                </div>
                <div className="mt-2 flex gap-2 items-center text-xs">
                  <input
                    type="number"
                    placeholder="add"
                    className="border border-slate-300 rounded px-2 py-1 w-24"
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter') {
                        progress.mutate({ id: p.activityId, value: Number(p.progress) + Number(e.target.value) });
                        e.target.value = '';
                      }
                    }}
                  />
                  <span className="text-slate-400">Enter to log progress</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold mb-4">All challenges</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a) => (
            <div key={a.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 font-semibold"><Trophy size={16} className="text-amber-500" /> {a.title}</div>
              <p className="text-xs text-slate-500 mt-1">{a.description}</p>
              <p className="text-xs mt-2">Target: <b>{a.target} {a.unit}</b> · Reward: <b>{a.rewardPoints} pts</b></p>
              <button onClick={() => join.mutate(a.id)} className="mt-3 w-full bg-indigo-50 text-indigo-700 py-1.5 rounded text-sm hover:bg-indigo-100">
                Join
              </button>
            </div>
          ))}
        </div>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-3">
            <h2 className="font-semibold">New Challenge</h2>
            {(['title','description','unit'] as const).map((k) => (
              <input key={k} placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            ))}
            <div className="flex gap-3">
              <input type="number" placeholder="target" value={form.target} onChange={(e) => setForm({ ...form, target: Number(e.target.value) })} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              <input type="number" placeholder="rewardPoints" value={form.rewardPoints} onChange={(e) => setForm({ ...form, rewardPoints: Number(e.target.value) })} className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShow(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => create.mutate()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
