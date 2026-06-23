'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const POSTS = [
  { id: 1, title: '5 mistakes killing your squat depth', cat: 'Training', minutes: 6, date: 'May 12', excerpt: 'Mobility, foot position, and bracing — fix these three and you’ll add 20 kg this quarter.', img: 'from-orange-500 to-red-600' },
  { id: 2, title: 'High-protein breakfasts under 5 minutes', cat: 'Nutrition', minutes: 4, date: 'May 06', excerpt: 'Real-food breakfasts that hit 30 g protein, taste great, and don’t require meal-prep Sundays.', img: 'from-emerald-500 to-teal-600' },
  { id: 3, title: 'Why your sleep is the missing rep', cat: 'Recovery', minutes: 8, date: 'Apr 28', excerpt: 'Sleep gates muscle protein synthesis. Here’s how to wreck or rescue yours.', img: 'from-indigo-500 to-purple-600' },
  { id: 4, title: 'Member story: Sara dropped 18 kg in 9 months', cat: 'Stories', minutes: 5, date: 'Apr 19', excerpt: 'No crash diets, no extreme programs — just consistency and a great trainer.', img: 'from-pink-500 to-rose-600' },
  { id: 5, title: 'A beginner’s guide to programming HIIT', cat: 'Training', minutes: 7, date: 'Apr 02', excerpt: 'How often, how hard, and why most people get the work-to-rest ratio wrong.', img: 'from-amber-500 to-orange-600' },
  { id: 6, title: 'Eating for endurance: carbs are not the enemy', cat: 'Nutrition', minutes: 6, date: 'Mar 21', excerpt: 'A practical look at fueling for runners, cyclists, and Hyrox athletes.', img: 'from-sky-500 to-blue-600' },
];

const CATS = ['All', 'Training', 'Nutrition', 'Recovery', 'Stories'];

export default function BlogPage() {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [email, setEmail] = useState('');
  const list = POSTS.filter((p) => (cat === 'All' || p.cat === cat) && (p.title + p.excerpt).toLowerCase().includes(q.toLowerCase()));

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return toast.error('Enter a valid email');
    try {
      const list = JSON.parse(localStorage.getItem('gf_subscribers') || '[]');
      list.push({ email, at: new Date().toISOString(), source: 'blog' });
      localStorage.setItem('gf_subscribers', JSON.stringify(list));
    } catch {}
    toast.success('Subscribed!');
    setEmail('');
  };

  return (
    <div>
      <section className="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Insights & stories</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Training, nutrition, recovery — short reads from our coaches.</p>
      </section>

      <section className="px-6 pb-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles" className="w-full border border-slate-300 rounded-2xl pl-11 pr-4 py-2.5 text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`px-3 py-1 text-xs font-semibold rounded-full border ${cat === c ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p) => (
            <article key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-36 bg-gradient-to-br ${p.img}`} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{p.cat}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={10} /> {p.minutes} min</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2 leading-snug">{p.title}</h3>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{p.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{p.date}</span>
                  <Link href="/auth/register" className="text-indigo-600 font-semibold text-xs inline-flex items-center gap-1">
                    Read <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
          {list.length === 0 && <p className="text-center text-slate-500 col-span-full py-10">No posts found.</p>}
        </div>
      </section>

      <section className="px-6 pb-20">
        <form onSubmit={subscribe} className="max-w-2xl mx-auto bg-slate-900 text-white rounded-2xl p-6 sm:p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Weekly tips. Zero spam.</h2>
          <p className="text-sm text-slate-400 mb-5">Get our best article in your inbox every Sunday.</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm" />
            <button className="bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded-xl text-sm font-semibold">Subscribe</button>
          </div>
        </form>
      </section>
    </div>
  );
}
