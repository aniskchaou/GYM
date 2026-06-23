'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, ChevronRight, QrCode, Sparkles, Calendar, MapPin, User } from 'lucide-react';
import toast from 'react-hot-toast';

const BRANCHES = [
  { id: 'ams-cent', label: 'Amsterdam Centrum' },
  { id: 'ams-zuid', label: 'Amsterdam Zuid' },
  { id: 'lon-shor', label: 'London Shoreditch' },
  { id: 'lon-kx', label: 'London King’s Cross' },
  { id: 'ber-mit', label: 'Berlin Mitte' },
  { id: 'par-mar', label: 'Paris Marais' },
];

const GOALS = [
  { id: 'lose', label: 'Lose weight' },
  { id: 'build', label: 'Build muscle' },
  { id: 'fit', label: 'Get fit' },
  { id: 'sport', label: 'Train for a sport' },
  { id: 'health', label: 'General health' },
];

function randomTicket() {
  return 'GF-' + Math.random().toString(36).slice(2, 7).toUpperCase() + '-' + Date.now().toString(36).slice(-4).toUpperCase();
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= n ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
            {step > n ? <Check size={14} /> : n}
          </div>
          {n < 3 && <div className={`w-10 h-0.5 ${step > n ? 'bg-indigo-500' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  );
}

function FreeTrialInner() {
  const sp = useSearchParams();
  const prefillClass = sp.get('class') || '';
  const prefillBranch = sp.get('branch') || sp.get('location') || '';
  const prefillTrainer = sp.get('trainer') || '';
  const prefillEvent = sp.get('event') || '';

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [goal, setGoal] = useState('');
  const [branch, setBranch] = useState(prefillBranch);
  const [date, setDate] = useState('');
  const [ticket, setTicket] = useState('');

  const next1 = () => {
    if (!name || !email.includes('@') || phone.length < 6) return toast.error('Please complete name, email, phone.');
    setStep(2);
  };
  const next2 = () => {
    if (!goal || !branch || !date) return toast.error('Please pick goal, branch and date.');
    const t = randomTicket();
    try {
      const list = JSON.parse(localStorage.getItem('gf_leads') || '[]');
      list.push({ name, email, phone, goal, branch, date, ticket: t, prefillClass, prefillTrainer, prefillEvent, at: new Date().toISOString() });
      localStorage.setItem('gf_leads', JSON.stringify(list));
    } catch {}
    setTicket(t);
    setStep(3);
    toast.success('Your free trial is booked!');
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      <Stepper step={step} />

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Tell us about you</h2>
          <p className="text-sm text-slate-500 text-center mb-4">Your free 7-day pass is one minute away.</p>
          <label className="text-xs font-semibold text-slate-600 block">
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal" />
          </label>
          <label className="text-xs font-semibold text-slate-600 block">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal" />
          </label>
          <label className="text-xs font-semibold text-slate-600 block">
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal" />
          </label>
          <button onClick={next1} className="w-full inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl">
            Continue <ChevronRight size={16} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Pick your trial</h2>
          <p className="text-sm text-slate-500 text-center mb-4">When and where works best for you?</p>
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">Your goal</p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button key={g.id} onClick={() => setGoal(g.id)} className={`px-3 py-1.5 text-xs rounded-full border font-semibold ${goal === g.id ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <label className="text-xs font-semibold text-slate-600 block">
            Branch
            <select value={branch} onChange={(e) => setBranch(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal">
              <option value="">Select…</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 block">
            Preferred date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-normal" />
          </label>
          {(prefillClass || prefillTrainer || prefillEvent) && (
            <div className="bg-indigo-50 text-indigo-700 text-xs rounded-lg p-3">
              <Sparkles size={12} className="inline mr-1" />
              We&apos;ll match you with{' '}
              <strong>{prefillClass || prefillTrainer || prefillEvent}</strong> at your visit.
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="flex-1 border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl">
              Back
            </button>
            <button onClick={next2} className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl">
              Confirm <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={26} />
          </div>
          <h2 className="text-2xl font-bold mb-1">You&apos;re in, {name.split(' ')[0]}!</h2>
          <p className="text-sm text-slate-500 mb-6">We sent your pass to {email}.</p>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-6 mb-4">
            <p className="text-xs uppercase tracking-wider opacity-80 mb-2">Free trial pass</p>
            <div className="bg-white text-slate-900 rounded-xl p-4 inline-flex items-center justify-center mb-3">
              <QrCode size={84} />
            </div>
            <p className="font-mono text-sm tracking-widest">{ticket}</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-left text-sm space-y-2 mb-5">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar size={14} className="text-indigo-500" /> {date}
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin size={14} className="text-indigo-500" /> {BRANCHES.find((b) => b.id === branch)?.label || branch}
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <User size={14} className="text-indigo-500" /> {GOALS.find((g) => g.id === goal)?.label}
            </div>
          </div>

          <Link href="/auth/register" className="block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl">
            Create your account
          </Link>
          <Link href="/" className="block mt-2 text-sm text-slate-500 hover:text-slate-800">
            Back to home
          </Link>
        </div>
      )}
    </div>
  );
}

export default function FreeTrialPage() {
  return (
    <div>
      <section className="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">7 days. On us.</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Full access. Any class. Any branch. No card required.</p>
      </section>
      <section className="px-6 pb-20">
        <Suspense fallback={<div className="text-center text-slate-500">Loading…</div>}>
          <FreeTrialInner />
        </Suspense>
      </section>
    </div>
  );
}
