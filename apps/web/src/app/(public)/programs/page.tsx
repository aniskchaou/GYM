import Link from 'next/link';
import { Target, TrendingUp, Heart, Zap, Clock, Users, ArrowRight, Trophy } from 'lucide-react';

const PROGRAMS = [
  {
    slug: 'fat-loss-8w',
    title: 'Fat Loss Accelerator',
    goal: 'Lose Weight',
    icon: TrendingUp,
    color: 'from-orange-500 to-pink-500',
    duration: '8 weeks',
    sessions: '4/week',
    desc: 'Burn fat without burning out. Strength + conditioning + AI nutrition.',
    outcomes: ['Lose 5–10 kg', 'Drop 2 sizes', 'More energy'],
    enrolled: 1284,
  },
  {
    slug: 'muscle-gain-12w',
    title: 'Muscle Build 12',
    goal: 'Build Muscle',
    icon: Trophy,
    color: 'from-indigo-500 to-purple-600',
    duration: '12 weeks',
    sessions: '5/week',
    desc: 'Hypertrophy-focused split with progressive overload programming.',
    outcomes: ['+4–6 kg lean mass', 'Bigger arms & shoulders', 'Stronger lifts'],
    enrolled: 982,
  },
  {
    slug: 'beginner-foundations',
    title: 'Beginner Foundations',
    goal: 'Start Fitness',
    icon: Heart,
    color: 'from-emerald-500 to-teal-500',
    duration: '4 weeks',
    sessions: '3/week',
    desc: 'New to the gym? Learn the basics safely with a coach in your corner.',
    outcomes: ['Confidence in the gym', 'Form for big lifts', 'Build the habit'],
    enrolled: 2104,
  },
  {
    slug: 'endurance-10k',
    title: '10K Ready',
    goal: 'Endurance',
    icon: Zap,
    color: 'from-cyan-500 to-blue-600',
    duration: '10 weeks',
    sessions: '4/week',
    desc: 'From couch to 10K — pacing, intervals and strength to run injury-free.',
    outcomes: ['Run 10K non-stop', 'Better VO2max', 'No knee pain'],
    enrolled: 412,
  },
  {
    slug: 'glute-summer',
    title: 'Summer Glutes',
    goal: 'Body Composition',
    icon: Target,
    color: 'from-rose-500 to-fuchsia-600',
    duration: '6 weeks',
    sessions: '4/week',
    desc: 'Targeted glute & posterior chain training. Beach-ready in 6 weeks.',
    outcomes: ['Stronger glutes', 'Better posture', 'Confidence boost'],
    enrolled: 1532,
  },
  {
    slug: 'shred-30',
    title: '30-Day Shred Challenge',
    goal: 'Challenge',
    icon: Trophy,
    color: 'from-amber-500 to-red-600',
    duration: '30 days',
    sessions: 'Daily',
    desc: 'Hardcore. Public leaderboard. Prizes for top 10.',
    outcomes: ['Cut 3–5 kg', 'Mental edge', 'Community vibes'],
    enrolled: 678,
  },
];

const STORIES = [
  { name: 'Mia', before: '78kg', after: '64kg', program: 'Fat Loss Accelerator', weeks: 8 },
  { name: 'Tom', before: '70kg', after: '76kg', program: 'Muscle Build 12', weeks: 12 },
  { name: 'Priya', before: '0K runner', after: '10K in 53min', program: '10K Ready', weeks: 10 },
];

export default function ProgramsPage() {
  return (
    <div>
      <section className="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Programs designed for your goal</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Pick a path. Follow the plan. Get results. Free with any Premium or Elite membership.</p>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROGRAMS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.slug} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-32 bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                  <Icon size={42} className="text-white/90" />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{p.goal}</span>
                  <h3 className="font-bold text-slate-900 mt-2">{p.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-3">{p.desc}</p>
                  <div className="flex gap-3 text-xs text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {p.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap size={12} /> {p.sessions}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {p.enrolled}
                    </span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 mb-4">
                    {p.outcomes.map((o) => (
                      <li key={o} className="flex gap-2">
                        <span className="text-green-500">✓</span> {o}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/auth/register?program=${p.slug}`}
                    className="block text-center bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2 rounded-xl"
                  >
                    Enroll now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 pb-20 bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Before & after</h2>
          <p className="text-center text-sm text-slate-500 mb-10">Real members. Real programs. Real numbers.</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {STORIES.map((s) => (
              <div key={s.name} className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                  {s.name[0]}
                </div>
                <h3 className="font-semibold text-slate-900">{s.name}</h3>
                <div className="flex justify-center items-center gap-2 my-3 text-sm">
                  <span className="text-slate-500 line-through">{s.before}</span>
                  <ArrowRight size={14} className="text-indigo-500" />
                  <span className="text-indigo-600 font-bold">{s.after}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {s.program} · {s.weeks} weeks
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl p-10">
          <h2 className="text-3xl font-extrabold mb-3">Need help choosing?</h2>
          <p className="text-indigo-100 mb-6">Book a free 20-min consult and our coaches will pick the right program for you.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-7 py-3 rounded-xl font-bold">
            Book a free consult <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
