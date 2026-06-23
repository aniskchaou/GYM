'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Star, Award, Calendar, Play, Search } from 'lucide-react';

type Trainer = {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  rating: number;
  reviews: number;
  certs: string[];
  bio: string;
  available: string;
};

const TRAINERS: Trainer[] = [
  {
    id: 'alex',
    name: 'Alex Carter',
    title: 'Head Strength Coach',
    specialties: ['Strength', 'Powerlifting', 'HIIT'],
    rating: 4.9,
    reviews: 412,
    certs: ['NSCA-CSCS', 'CrossFit L3'],
    bio: 'Olympic-style lifting & functional power. 12 years coaching, 200+ athletes.',
    available: 'Mon–Fri',
  },
  {
    id: 'lena',
    name: 'Lena Schmidt',
    title: 'Yoga & Mobility Lead',
    specialties: ['Yoga', 'Mobility', 'Recovery'],
    rating: 5.0,
    reviews: 289,
    certs: ['RYT-500', 'FRC Mobility'],
    bio: 'Power vinyasa with a clinical mobility lens. Helps lifters move better.',
    available: 'Mon, Wed, Sat',
  },
  {
    id: 'marco',
    name: 'Marco Rossi',
    title: 'CrossFit Coach',
    specialties: ['CrossFit', 'Conditioning', 'Olympic Lifts'],
    rating: 4.8,
    reviews: 356,
    certs: ['CrossFit L2', 'USA Weightlifting'],
    bio: 'Builds engines. Tough but fair. Loves complex barbell work.',
    available: 'Tue–Sun',
  },
  {
    id: 'sophie',
    name: 'Sophie Moreau',
    title: 'Pilates & Dance Coach',
    specialties: ['Pilates', 'Dance', 'Cardio'],
    rating: 4.9,
    reviews: 198,
    certs: ['Stott Pilates', 'Zumba ZIN'],
    bio: 'Energy on tap. Turns classes into parties without losing form.',
    available: 'Wed–Sun',
  },
  {
    id: 'jamal',
    name: 'Jamal Dia',
    title: 'Combat & Conditioning',
    specialties: ['Boxing', 'Muay Thai', 'HIIT'],
    rating: 4.9,
    reviews: 467,
    certs: ['British Boxing L2', 'NASM-CPT'],
    bio: 'Ex-amateur boxer. Will outwork you with a smile.',
    available: 'Mon, Wed, Fri, Sun',
  },
  {
    id: 'ayla',
    name: 'Ayla Khan',
    title: 'Nutrition & Body Comp',
    specialties: ['Nutrition', 'Fat Loss', 'Hormones'],
    rating: 5.0,
    reviews: 142,
    certs: ['Precision Nutrition L2', 'MSc Sport Nutrition'],
    bio: 'Helps members transform body composition without crash diets.',
    available: 'By appointment',
  },
];

const SPEC = ['All', 'Strength', 'Yoga', 'CrossFit', 'Boxing', 'Pilates', 'Nutrition', 'HIIT'];

export default function TrainersPage() {
  const [spec, setSpec] = useState('All');
  const [q, setQ] = useState('');

  const filtered = useMemo(
    () =>
      TRAINERS.filter(
        (t) =>
          (spec === 'All' || t.specialties.includes(spec)) &&
          (q === '' || t.name.toLowerCase().includes(q.toLowerCase()) || t.title.toLowerCase().includes(q.toLowerCase())),
      ),
    [spec, q],
  );

  return (
    <div>
      <section className="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Meet your coaches</h1>
        <p className="text-slate-500 max-w-xl mx-auto">120+ certified trainers. Book a free 20-min consult to find your perfect match.</p>
      </section>

      <section className="px-6 pb-6">
        <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap gap-3 items-center">
          <div className="flex-1 relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search trainers"
              className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-sm"
            />
          </div>
          {SPEC.map((s) => (
            <button
              key={s}
              onClick={() => setSpec(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${spec === s ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-gradient-to-br from-indigo-400 to-purple-500 relative flex items-end justify-start p-4">
                <span className="text-5xl font-extrabold text-white/90">{t.name[0]}</span>
                <button
                  aria-label="Play intro"
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center"
                >
                  <Play size={14} className="text-indigo-600 ml-0.5" fill="currentColor" />
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900">{t.name}</h3>
                <p className="text-xs text-indigo-600 font-semibold mb-2">{t.title}</p>
                <div className="flex items-center gap-1 mb-3">
                  <Star size={13} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-semibold text-slate-800">{t.rating}</span>
                  <span className="text-xs text-slate-500">({t.reviews})</span>
                </div>
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{t.bio}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {t.specialties.map((s) => (
                    <span key={s} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Award size={12} /> {t.certs[0]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {t.available}
                  </span>
                </div>
                <Link
                  href={`/contact?trainer=${t.id}`}
                  className="block text-center bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2 rounded-xl"
                >
                  Book consultation
                </Link>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-slate-500 col-span-full text-center py-10">No trainers match your search.</p>}
        </div>
      </section>
    </div>
  );
}
