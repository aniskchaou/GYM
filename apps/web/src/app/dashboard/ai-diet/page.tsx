'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AiDietPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<any>({
    ageYears: 30, gender: 'male', weightKg: 75, heightCm: 175,
    activityLevel: 'moderate', goal: 'maintenance', allergies: '',
  });

  const mine = useQuery({ queryKey: ['ai-diet'], queryFn: () => api.get('/ai/diet/mine').then((r) => r.data).catch(() => []) });

  const generate = useMutation({
    mutationFn: () => api.post('/ai/diet/generate', { ...form, allergies: form.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) }).then((r) => r.data),
    onSuccess: () => { toast.success('Plan generated!'); qc.invalidateQueries({ queryKey: ['ai-diet'] }); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Sparkles className="text-amber-500" /> AI Diet</h1>
        <p className="text-sm text-slate-500">Generate a personalised meal plan based on your goals</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
          <h2 className="font-semibold">Your profile</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label>Age <input type="number" value={form.ageYears} onChange={(e) => setForm({ ...form, ageYears: Number(e.target.value) })} className="w-full border border-slate-300 rounded px-2 py-1 mt-1" /></label>
            <label>Gender
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full border border-slate-300 rounded px-2 py-1 mt-1">
                <option value="male">Male</option><option value="female">Female</option>
              </select>
            </label>
            <label>Weight (kg) <input type="number" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })} className="w-full border border-slate-300 rounded px-2 py-1 mt-1" /></label>
            <label>Height (cm) <input type="number" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })} className="w-full border border-slate-300 rounded px-2 py-1 mt-1" /></label>
            <label>Activity
              <select value={form.activityLevel} onChange={(e) => setForm({ ...form, activityLevel: e.target.value })} className="w-full border border-slate-300 rounded px-2 py-1 mt-1">
                {['sedentary', 'light', 'moderate', 'active', 'very_active'].map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>
            <label>Goal
              <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="w-full border border-slate-300 rounded px-2 py-1 mt-1">
                {['weight_loss', 'maintenance', 'muscle_gain'].map((g) => <option key={g}>{g}</option>)}
              </select>
            </label>
            <label className="col-span-2">Allergies (comma-separated) <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="e.g. nuts, dairy" className="w-full border border-slate-300 rounded px-2 py-1 mt-1" /></label>
          </div>
          <button onClick={() => generate.mutate()} disabled={generate.isPending} className="w-full bg-gradient-to-r from-amber-500 to-pink-500 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {generate.isPending ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Generate AI plan
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="font-semibold mb-3">My AI plans</h2>
          <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
            {(mine.data ?? []).map((p: any) => (
              <li key={p.id} className="border border-slate-200 rounded-lg p-3">
                <div className="font-medium text-sm">{p.title}</div>
                <div className="text-xs text-slate-500">{p.goal} · {p.calories ?? 0} kcal</div>
                <details className="mt-2">
                  <summary className="text-xs text-indigo-600 cursor-pointer">View days</summary>
                  <ul className="text-xs mt-2 space-y-2">
                    {(p.days ?? []).map((d: any) => (
                      <li key={d.id} className="border-l-2 border-indigo-200 pl-2">
                        <b>Day {d.dayNumber}</b>
                        <ul className="ml-2 text-slate-600">
                          {(d.meals ?? []).map((m: any) => (
                            <li key={m.id}>{m.type}: {m.name} · {m.calories} kcal</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
            {(mine.data ?? []).length === 0 && <li className="text-slate-400 text-sm">No AI plans yet — generate your first one!</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
