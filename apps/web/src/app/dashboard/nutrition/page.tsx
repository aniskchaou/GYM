'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Apple, Plus, Search } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NutritionPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({ title: '', goal: 'maintenance', calories: 2000, memberId: '' });
  const [active, setActive] = useState<any>(null);

  const foods = useQuery({
    queryKey: ['foods', q],
    queryFn: () => api.get('/nutrition/foods', { params: q ? { q } : {} }).then((r) => r.data).catch(() => []),
  });
  const mine = useQuery({ queryKey: ['plans-mine'], queryFn: () => api.get('/nutrition/plans/mine').then((r) => r.data).catch(() => []) });
  const authored = useQuery({ queryKey: ['plans-authored'], queryFn: () => api.get('/nutrition/plans/authored').then((r) => r.data).catch(() => []) });
  const detail = useQuery({
    queryKey: ['plan', active?.id],
    enabled: !!active,
    queryFn: () => api.get(`/nutrition/plans/${active.id}`).then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: () => api.post('/nutrition/plans', form).then((r) => r.data),
    onSuccess: () => { toast.success('Plan created'); setShow(false); qc.invalidateQueries({ queryKey: ['plans-authored'] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nutrition</h1>
          <p className="text-sm text-slate-500">Meal plans and food library</p>
        </div>
        <button onClick={() => setShow(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Plus size={16} /> New Meal Plan
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Apple size={18} className="text-emerald-600" /> My plans</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {(mine.data ?? []).map((p: any) => (
              <li key={p.id} className="py-2 cursor-pointer hover:bg-slate-50 px-2 rounded" onClick={() => setActive(p)}>
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-slate-500">{p.goal} · {p.calories ?? 0} kcal</div>
              </li>
            ))}
            {(mine.data ?? []).length === 0 && <li className="py-2 text-slate-400">No plans yet.</li>}
          </ul>

          <h3 className="font-semibold mt-6 mb-2 text-sm">Plans I authored</h3>
          <ul className="text-sm divide-y divide-slate-100">
            {(authored.data ?? []).map((p: any) => (
              <li key={p.id} className="py-2 cursor-pointer hover:bg-slate-50 px-2 rounded" onClick={() => setActive(p)}>
                {p.title} <span className="text-xs text-slate-500">· {p.calories ?? 0} kcal</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Search size={16} className="text-slate-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search foods…" className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
          </div>
          <ul className="divide-y divide-slate-100 text-sm max-h-80 overflow-y-auto">
            {(foods.data ?? []).slice(0, 30).map((f: any) => (
              <li key={f.id} className="py-2 flex justify-between">
                <span>{f.name}</span>
                <span className="text-xs text-slate-500">{f.calories} kcal · P{f.protein} C{f.carbs} F{f.fat}</span>
              </li>
            ))}
            {(foods.data ?? []).length === 0 && <li className="py-2 text-slate-400">No foods.</li>}
          </ul>
        </div>
      </div>

      {active && detail.data && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="font-semibold">{detail.data.title}</h2>
              <p className="text-xs text-slate-500">{detail.data.goal} · {detail.data.calories ?? 0} kcal</p>
            </div>
            <button onClick={() => setActive(null)} className="text-sm text-slate-500">Close</button>
          </div>
          <div className="space-y-3">
            {(detail.data.days ?? []).map((d: any) => (
              <div key={d.id} className="border border-slate-200 rounded-lg p-3">
                <div className="font-medium text-sm">Day {d.dayNumber}</div>
                <ul className="text-xs mt-1 space-y-1">
                  {(d.meals ?? []).map((m: any) => (
                    <li key={m.id}>
                      <b>{m.type}</b> – {m.name} · {m.calories} kcal
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-3">
            <h2 className="font-semibold">New meal plan</h2>
            <input placeholder="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="member ID" value={form.memberId} onChange={(e) => setForm({ ...form, memberId: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              {['weight_loss', 'maintenance', 'bulk'].map((g) => <option key={g}>{g}</option>)}
            </select>
            <input type="number" placeholder="daily kcal" value={form.calories} onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShow(false)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={() => create.mutate()} disabled={!form.title.trim() || !form.memberId.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
