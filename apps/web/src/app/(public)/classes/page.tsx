'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Clock, Users, Flame, Filter } from 'lucide-react';

type Cls = {
  id: string;
  name: string;
  category: string;
  trainer: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMin: number;
  capacity: number;
  booked: number;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  time: string;
  desc: string;
};

const CLASSES: Cls[] = [
  { id: '1', name: 'Morning HIIT', category: 'HIIT', trainer: 'Alex Carter', level: 'Intermediate', durationMin: 45, capacity: 20, booked: 14, day: 'Mon', time: '07:00', desc: 'High-intensity intervals to torch fat.' },
  { id: '2', name: 'Power Yoga', category: 'Yoga', trainer: 'Lena Schmidt', level: 'Beginner', durationMin: 60, capacity: 25, booked: 22, day: 'Mon', time: '18:30', desc: 'Strength meets flexibility.' },
  { id: '3', name: 'Spin Cycle', category: 'Cardio', trainer: 'Marco Rossi', level: 'Intermediate', durationMin: 50, capacity: 30, booked: 11, day: 'Tue', time: '19:00', desc: 'Beats, lights and sweat.' },
  { id: '4', name: 'Strength 101', category: 'Strength', trainer: 'Alex Carter', level: 'Beginner', durationMin: 60, capacity: 15, booked: 8, day: 'Wed', time: '08:00', desc: 'Learn the big lifts safely.' },
  { id: '5', name: 'Boxing Conditioning', category: 'Boxing', trainer: 'Jamal Dia', level: 'Advanced', durationMin: 60, capacity: 18, booked: 18, day: 'Wed', time: '20:00', desc: 'Punch, sweat, repeat.' },
  { id: '6', name: 'Pilates Flow', category: 'Pilates', trainer: 'Sophie Moreau', level: 'Beginner', durationMin: 45, capacity: 20, booked: 9, day: 'Thu', time: '09:30', desc: 'Core control & posture.' },
  { id: '7', name: 'CrossFit WOD', category: 'CrossFit', trainer: 'Marco Rossi', level: 'Advanced', durationMin: 60, capacity: 16, booked: 12, day: 'Fri', time: '17:00', desc: 'Workout of the day.' },
  { id: '8', name: 'Zumba Party', category: 'Dance', trainer: 'Sophie Moreau', level: 'Beginner', durationMin: 50, capacity: 35, booked: 28, day: 'Sat', time: '10:00', desc: 'Dance your calories away.' },
  { id: '9', name: 'Sunday Stretch', category: 'Yoga', trainer: 'Lena Schmidt', level: 'Beginner', durationMin: 60, capacity: 25, booked: 6, day: 'Sun', time: '11:00', desc: 'Recover & breathe.' },
];

const CATS = ['All', ...Array.from(new Set(CLASSES.map((c) => c.category)))];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;
const TRAINERS = ['All', ...Array.from(new Set(CLASSES.map((c) => c.trainer)))];
const DAYS = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function fill(booked: number, capacity: number) {
  const pct = Math.round((booked / capacity) * 100);
  if (pct >= 100) return { label: 'Full', color: 'bg-red-100 text-red-700' };
  if (pct >= 75) return { label: 'Filling fast', color: 'bg-orange-100 text-orange-700' };
  return { label: 'Spots open', color: 'bg-green-100 text-green-700' };
}

export default function ClassesPage() {
  const [cat, setCat] = useState('All');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('All');
  const [trainer, setTrainer] = useState('All');
  const [day, setDay] = useState('All');

  const filtered = useMemo(
    () =>
      CLASSES.filter(
        (c) =>
          (cat === 'All' || c.category === cat) &&
          (level === 'All' || c.level === level) &&
          (trainer === 'All' || c.trainer === trainer) &&
          (day === 'All' || c.day === day),
      ),
    [cat, level, trainer, day],
  );

  return (
    <div>
      <section className="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Live class schedule</h1>
        <p className="text-slate-500 max-w-xl mx-auto">45+ weekly classes. Book a trial class to try anything for free.</p>
      </section>

      <section className="px-6 pb-6">
        <div className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-3 items-center">
          <Filter size={16} className="text-slate-500" />
          {[
            { v: cat, set: setCat as (s: string) => void, opts: CATS, label: 'Category' },
            { v: day, set: setDay as (s: string) => void, opts: DAYS, label: 'Day' },
            { v: level as string, set: setLevel as (s: string) => void, opts: LEVELS as readonly string[], label: 'Level' },
            { v: trainer, set: setTrainer as (s: string) => void, opts: TRAINERS, label: 'Trainer' },
          ].map(({ v, set, opts, label }) => (
            <select
              key={label}
              value={v}
              onChange={(e) => set(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white"
              aria-label={label}
            >
              {opts.map((o) => (
                <option key={o} value={o}>
                  {label === 'All' ? o : o === 'All' ? `All ${label.toLowerCase()}s` : o}
                </option>
              ))}
            </select>
          ))}
          <span className="ml-auto text-xs text-slate-500">
            Showing <b className="text-slate-800">{filtered.length}</b> classes
          </span>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const f = fill(c.booked, c.capacity);
            return (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{c.category}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.color}`}>{f.label}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{c.name}</h3>
                <p className="text-xs text-slate-500 mb-3">{c.desc}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {c.day} · {c.time} · {c.durationMin}min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {c.booked}/{c.capacity}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame size={12} /> {c.level}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  with <b className="text-slate-700">{c.trainer}</b>
                </p>
                <Link
                  href={`/free-trial?class=${encodeURIComponent(c.name)}`}
                  className="block text-center bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2 rounded-xl"
                >
                  Book trial class
                </Link>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-slate-500 col-span-full text-center py-10">No classes match your filters.</p>}
        </div>
      </section>
    </div>
  );
}
