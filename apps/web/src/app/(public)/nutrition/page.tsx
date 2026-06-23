'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Flame, Apple, Activity, ArrowRight, Sparkles } from 'lucide-react';

const MEALS = [
  { id: 1, name: 'Power Oats Bowl', kcal: 420, protein: 28, carbs: 55, fat: 12, tag: 'Breakfast' },
  { id: 2, name: 'Grilled Chicken Quinoa', kcal: 560, protein: 42, carbs: 48, fat: 18, tag: 'Lunch' },
  { id: 3, name: 'Salmon & Sweet Potato', kcal: 610, protein: 38, carbs: 52, fat: 25, tag: 'Dinner' },
  { id: 4, name: 'Greek Yogurt + Berries', kcal: 220, protein: 18, carbs: 24, fat: 5, tag: 'Snack' },
  { id: 5, name: 'Tofu Stir-Fry', kcal: 480, protein: 26, carbs: 50, fat: 16, tag: 'Vegan' },
  { id: 6, name: 'Protein Smoothie', kcal: 310, protein: 32, carbs: 28, fat: 8, tag: 'Snack' },
];

const PLANS = [
  { name: 'Weight Loss', kcal: '1600–1800', desc: 'Higher protein, moderate carbs, lower fat.', color: 'bg-orange-50 text-orange-700' },
  { name: 'Maintenance', kcal: '2000–2400', desc: 'Balanced macros for steady performance.', color: 'bg-blue-50 text-blue-700' },
  { name: 'Lean Bulk', kcal: '2600–3000', desc: 'Calorie surplus with strict protein targets.', color: 'bg-emerald-50 text-emerald-700' },
];

function calcBMR(weight: number, height: number, age: number, sex: 'male' | 'female') {
  return Math.round(10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161));
}
const ACTIVITY: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

export default function NutritionPage() {
  const [w, setW] = useState(70);
  const [h, setH] = useState(170);
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [act, setAct] = useState<keyof typeof ACTIVITY>('moderate');
  const [goal, setGoal] = useState<'cut' | 'maintain' | 'bulk'>('maintain');

  const { tdee, target, protein, carbs, fat, bmi } = useMemo(() => {
    const bmr = calcBMR(w, h, age, sex);
    const tdee = Math.round(bmr * ACTIVITY[act]);
    const target = goal === 'cut' ? tdee - 400 : goal === 'bulk' ? tdee + 350 : tdee;
    const protein = Math.round(w * 2);
    const fat = Math.round((target * 0.25) / 9);
    const carbs = Math.round((target - protein * 4 - fat * 9) / 4);
    const bmi = +(w / ((h / 100) * (h / 100))).toFixed(1);
    return { tdee, target, protein, carbs, fat, bmi };
  }, [w, h, age, sex, act, goal]);

  return (
    <div>
      <section className="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Eat for results</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Plans built around your goals — backed by our AI nutrition coach.</p>
      </section>

      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-bold text-lg mb-1 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-500" /> Free calorie calculator
            </h2>
            <p className="text-xs text-slate-500 mb-5">No signup. Instant macros.</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold text-slate-600 col-span-1">
                Weight (kg)
                <input type="number" value={w} onChange={(e) => setW(+e.target.value || 0)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Height (cm)
                <input type="number" value={h} onChange={(e) => setH(+e.target.value || 0)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Age
                <input type="number" value={age} onChange={(e) => setAge(+e.target.value || 0)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal" />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Sex
                <select value={sex} onChange={(e) => setSex(e.target.value as any)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Activity
                <select value={act} onChange={(e) => setAct(e.target.value as any)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal">
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                  <option value="athlete">Athlete</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Goal
                <select value={goal} onChange={(e) => setGoal(e.target.value as any)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal">
                  <option value="cut">Lose weight</option>
                  <option value="maintain">Maintain</option>
                  <option value="bulk">Build muscle</option>
                </select>
              </label>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Your daily targets</p>
            <div className="text-center mb-6">
              <div className="text-5xl font-extrabold text-slate-900">{target.toLocaleString()}</div>
              <div className="text-xs text-slate-500">kcal / day · TDEE {tdee.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-xs text-slate-500">Protein</div>
                <div className="font-bold text-slate-900">{protein}g</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-xs text-slate-500">Carbs</div>
                <div className="font-bold text-slate-900">{carbs}g</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-xs text-slate-500">Fat</div>
                <div className="font-bold text-slate-900">{fat}g</div>
              </div>
            </div>
            <p className="text-xs text-slate-600 text-center mb-4">BMI {bmi}</p>
            <Link
              href="/auth/register?plan=premium"
              className="block text-center bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl text-sm"
            >
              Get a full AI plan →
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Nutrition plans</h2>
          <p className="text-sm text-slate-500 text-center mb-8">Pick one or build your own with a coach.</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {PLANS.map((p) => (
              <div key={p.name} className="bg-white border border-slate-200 rounded-2xl p-6">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.color}`}>{p.kcal} kcal</span>
                <h3 className="font-bold text-slate-900 mt-3">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">{p.desc}</p>
                <Link href="/auth/register?plan=premium" className="text-indigo-600 text-xs font-bold inline-flex items-center gap-1">
                  Get this plan <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Meal examples</h2>
          <p className="text-sm text-slate-500 text-center mb-8">A taste of what your weekly plan could look like.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MEALS.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl p-5 border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900">{m.name}</h3>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{m.tag}</span>
                </div>
                <div className="flex gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Flame size={12} className="text-orange-500" /> {m.kcal} kcal
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity size={12} className="text-indigo-500" /> P{m.protein}
                  </span>
                  <span className="flex items-center gap-1">
                    <Apple size={12} className="text-green-500" /> C{m.carbs}
                  </span>
                  <span className="text-slate-500">F{m.fat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
