'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { CheckCircle, X, ArrowRight, Sparkles, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

type Plan = {
  name: string;
  monthly: number;
  yearly: number;
  desc: string;
  features: { label: string; included: boolean }[];
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Basic',
    monthly: 29,
    yearly: 290,
    desc: 'Just the essentials',
    features: [
      { label: 'Open gym access', included: true },
      { label: 'Locker room & showers', included: true },
      { label: 'Free Wi-Fi', included: true },
      { label: 'Mobile app booking', included: true },
      { label: 'Group classes', included: false },
      { label: 'Personal trainer', included: false },
      { label: 'Nutrition plans', included: false },
      { label: 'Guest passes', included: false },
    ],
  },
  {
    name: 'Premium',
    monthly: 49,
    yearly: 490,
    desc: 'Most popular',
    popular: true,
    features: [
      { label: 'Open gym access', included: true },
      { label: 'Locker room & showers', included: true },
      { label: 'Free Wi-Fi', included: true },
      { label: 'Mobile app booking', included: true },
      { label: 'Unlimited group classes', included: true },
      { label: 'Trainer access (group)', included: true },
      { label: 'Nutrition plans', included: true },
      { label: '2 guest passes / month', included: true },
    ],
  },
  {
    name: 'Elite',
    monthly: 89,
    yearly: 890,
    desc: 'Full experience',
    features: [
      { label: 'Open gym access', included: true },
      { label: 'Locker room & showers', included: true },
      { label: 'Free Wi-Fi', included: true },
      { label: 'Mobile app booking', included: true },
      { label: 'Unlimited group classes', included: true },
      { label: '1-on-1 PT (4 sessions/mo)', included: true },
      { label: 'AI diet & program', included: true },
      { label: 'Unlimited guests + recovery zone', included: true },
    ],
  },
];

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts. Cancel monthly with one click in your account.' },
  { q: 'Is there a joining fee?', a: 'No joining fee on yearly plans. Monthly plans have a one-time $19 setup.' },
  { q: 'Can I freeze my membership?', a: 'Yes — freeze up to 60 days/year for free (Premium and Elite).' },
  { q: 'Do you have student discounts?', a: 'Yes — 20% off any plan with a valid student ID.' },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyPromo = () => {
    const map: Record<string, number> = { WELCOME10: 10, STUDENT20: 20, NEWYEAR25: 25 };
    const d = map[promo.toUpperCase()] ?? 0;
    setDiscount(d);
    if (d) toast.success(`${d}% discount applied!`);
    else toast.error('Invalid promo code');
  };

  const priced = useMemo(() => {
    return PLANS.map((p) => {
      const raw = yearly ? p.yearly : p.monthly;
      const final = Math.round(raw * (1 - discount / 100));
      return { ...p, raw, final };
    });
  }, [yearly, discount]);

  return (
    <div>
      <section className="pt-20 pb-12 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
          <Sparkles size={12} /> Save 17% on yearly plans
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Simple, transparent pricing</h1>
        <p className="text-slate-500 max-w-xl mx-auto">No contracts. No hidden fees. Cancel anytime.</p>

        <div className="inline-flex bg-slate-100 rounded-full p-1 mt-8">
          <button
            onClick={() => setYearly(false)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${!yearly ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${yearly ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
          >
            Yearly <span className="text-green-600">−17%</span>
          </button>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          {priced.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl p-7 border ${p.popular ? 'border-indigo-400 shadow-xl shadow-indigo-100' : 'border-slate-200'}`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most popular
                </span>
              )}
              <h3 className="font-bold text-xl text-slate-900">{p.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{p.desc}</p>
              <div className="mt-5 mb-5">
                {discount > 0 && <span className="line-through text-slate-400 text-sm mr-2">${p.raw}</span>}
                <span className="text-4xl font-extrabold text-slate-900">${p.final}</span>
                <span className="text-slate-500 text-sm">/{yearly ? 'yr' : 'mo'}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {p.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <CheckCircle size={15} className="text-green-500 shrink-0" />
                    ) : (
                      <X size={15} className="text-slate-300 shrink-0" />
                    )}
                    <span className={f.included ? 'text-slate-700' : 'text-slate-400 line-through'}>{f.label}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/auth/register?plan=${p.name.toLowerCase()}&period=${yearly ? 'yearly' : 'monthly'}`}
                className={`block text-center py-3 rounded-xl text-sm font-bold transition-colors ${p.popular ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'border border-slate-200 hover:border-slate-400 text-slate-700'}`}
              >
                Get {p.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto mt-10 bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
            <Tag size={12} /> Have a promo code?
          </p>
          <div className="flex gap-2">
            <input
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="e.g. WELCOME10"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={applyPromo} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              Apply
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Try: WELCOME10, STUDENT20, NEWYEAR25</p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="bg-slate-50 rounded-xl p-5 group">
                <summary className="font-semibold text-slate-800 cursor-pointer flex justify-between items-center">
                  {f.q} <span className="text-indigo-500 group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="text-sm text-slate-600 mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl p-10">
          <h2 className="text-3xl font-extrabold mb-3">Not ready to commit?</h2>
          <p className="text-indigo-100 mb-6">Try a 7-day free trial. No card. No strings.</p>
          <Link
            href="/free-trial"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-7 py-3 rounded-xl font-bold transition-colors"
          >
            Start free trial <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
