import Link from 'next/link';
import { Heart, Users, Globe, Award, ArrowRight } from 'lucide-react';

const VALUES = [
  { icon: Heart, title: 'Health first', desc: 'Sustainable progress beats short-term hype. Always.' },
  { icon: Users, title: 'Community', desc: 'A gym is a place. Community is what makes you come back.' },
  { icon: Globe, title: 'Accessible', desc: 'World-class fitness shouldn’t need a luxury price tag.' },
  { icon: Award, title: 'Excellence', desc: 'Our coaches are the best in their field — and they love what they do.' },
];

const TEAM = [
  { name: 'Daniel Park', role: 'Founder & CEO' },
  { name: 'Maya Adler', role: 'COO' },
  { name: 'Theo Laurent', role: 'Head of Training' },
  { name: 'Nadia Volkov', role: 'Head of Nutrition' },
];

export default function AboutPage() {
  return (
    <div>
      <section className="pt-20 pb-16 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Our mission</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          To make world-class fitness — and the community around it — accessible to anyone who wants to be stronger, healthier, and happier.
        </p>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Our story</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-4">From one studio to 15 locations</h2>
            <p className="text-slate-600 mb-3">
              GymFlow began in 2019 as a single studio above a coffee shop in Amsterdam. The founders, frustrated by intimidating big-box gyms,
              wanted a place that felt like home — but trained you like an athlete.
            </p>
            <p className="text-slate-600">
              Six years later, we&apos;ve grown to 15 locations across Europe, 120+ certified coaches, and 12,000+ members. The mission hasn&apos;t changed.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">What we stand for</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100">
                <Icon size={22} className="text-indigo-500 mb-3" />
                <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">The team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((m) => (
              <div key={m.name} className="text-center">
                <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-3xl font-extrabold mb-3">
                  {m.name[0]}
                </div>
                <p className="font-semibold text-slate-900">{m.name}</p>
                <p className="text-xs text-slate-500">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl p-10">
          <h2 className="text-3xl font-extrabold mb-3">Train with us</h2>
          <p className="text-indigo-100 mb-6">Come visit. We&apos;ll show you around.</p>
          <Link href="/free-trial" className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-7 py-3 rounded-xl font-bold">
            Book a tour <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
