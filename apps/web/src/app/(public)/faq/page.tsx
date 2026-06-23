'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search } from 'lucide-react';

const FAQS: { cat: string; q: string; a: string }[] = [
  { cat: 'Membership', q: 'Can I freeze my membership?', a: 'Yes — Plus and Elite plans can freeze up to 60 days per year, free of charge. Basic plans can freeze 14 days for €10.' },
  { cat: 'Membership', q: 'Is there a contract?', a: 'No long-term contracts. All plans are month-to-month and can be cancelled with 14 days’ notice.' },
  { cat: 'Membership', q: 'Can I use any branch?', a: 'Plus and Elite plans include access to all 15 GymFlow locations worldwide. Basic plans are home-club only.' },
  { cat: 'Billing', q: 'How do I update my payment method?', a: 'From your dashboard → Settings → Billing. We accept all major cards, SEPA direct debit, iDEAL, and Apple/Google Pay.' },
  { cat: 'Billing', q: 'Do you offer student discounts?', a: 'Yes — use code STUDENT20 for 20% off any monthly plan. Verification required after signup.' },
  { cat: 'Billing', q: 'What is your refund policy?', a: 'New members can cancel within 7 days for a full refund, no questions asked.' },
  { cat: 'Classes', q: 'How do I book a class?', a: 'Open the app, pick a class, tap Book. You can book up to 7 days in advance.' },
  { cat: 'Classes', q: 'What if I miss a class?', a: 'Cancel up to 4 hours before. Three no-shows in a month triggers a 7-day booking timeout.' },
  { cat: 'Trainers', q: 'How do I book a personal trainer?', a: 'From the Trainers page → pick a coach → choose a slot. First session is always free.' },
  { cat: 'Trainers', q: 'Can I switch trainers?', a: 'Absolutely. You can change trainers any time from your dashboard.' },
  { cat: 'Facilities', q: 'Do you have showers and lockers?', a: 'Every location has showers, day lockers, towels (€2 or free for Elite), and changing rooms.' },
  { cat: 'Facilities', q: 'Is parking available?', a: 'Most locations have free or discounted parking. Check each branch on the Locations page.' },
];

const CATS = Array.from(new Set(FAQS.map((f) => f.cat)));

export default function FaqPage() {
  const [open, setOpen] = useState<string | null>(null);
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const list = FAQS.filter((f) => (cat === 'All' || f.cat === cat) && (f.q + f.a).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <section className="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Frequently asked questions</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Can&apos;t find what you need? <Link href="/contact" className="text-indigo-600 font-semibold">Contact us</Link>.</p>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search FAQs" className="w-full border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-sm" />
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {['All', ...CATS].map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1 text-xs font-semibold rounded-full border ${cat === c ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {list.map((f) => {
              const id = f.cat + f.q;
              const isOpen = open === id;
              return (
                <div key={id} className="bg-white border border-slate-200 rounded-xl">
                  <button onClick={() => setOpen(isOpen ? null : id)} className="w-full flex items-center justify-between p-4 text-left">
                    <span className="font-semibold text-sm text-slate-900">{f.q}</span>
                    <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && <p className="px-4 pb-4 text-sm text-slate-600">{f.a}</p>}
                </div>
              );
            })}
            {list.length === 0 && <p className="text-center text-slate-500 py-10">No matches.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
