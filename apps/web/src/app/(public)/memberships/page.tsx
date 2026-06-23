import Link from 'next/link';
import { Check, ArrowRight, Gift, Calendar, Users, Sparkles } from 'lucide-react';

const TIERS = [
  {
    name: 'Day Pass',
    price: '$15',
    period: 'one-time',
    desc: 'Walk in for a single workout.',
    perks: ['Full gym access for 24h', 'Locker & shower', 'No registration needed'],
  },
  {
    name: '10-Visit Pack',
    price: '$110',
    period: 'pack',
    desc: 'For occasional visitors.',
    perks: ['10 visits, valid 6 months', 'Shareable with friends', 'No monthly commitment'],
  },
  {
    name: 'Monthly Open',
    price: '$29',
    period: '/mo',
    desc: 'Unlimited gym access.',
    perks: ['24/7 access', 'Locker room', 'Mobile app', 'Free Wi-Fi'],
  },
  {
    name: 'Monthly Plus',
    price: '$49',
    period: '/mo',
    desc: 'Most popular for new members.',
    perks: ['Everything in Open', 'Unlimited group classes', 'Nutrition plans', '2 guest passes/mo'],
    popular: true,
  },
  {
    name: 'Annual Elite',
    price: '$890',
    period: '/yr',
    desc: 'Save big & unlock VIP perks.',
    perks: ['Everything in Plus', '1-on-1 PT (4x/mo)', 'AI diet & program', 'Recovery zone', 'Priority bookings'],
  },
];

const PERKS = [
  { icon: Calendar, title: 'Freeze for free', desc: 'Pause your plan up to 60 days/year.' },
  { icon: Gift, title: 'Refer & earn', desc: 'Give a friend $20 off. Get $20 in credit.' },
  { icon: Users, title: 'Family bundle', desc: 'Add a partner and save 15% on both plans.' },
  { icon: Sparkles, title: 'Birthday boost', desc: 'Free PT session + smoothie on your birthday.' },
];

export default function MembershipsPage() {
  return (
    <div>
      <section className="pt-20 pb-12 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Memberships built for every lifestyle</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Drop in for a day or commit for a year — choose the rhythm that suits you.</p>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`relative rounded-2xl p-6 border ${t.popular ? 'border-indigo-400 shadow-lg shadow-indigo-100 bg-white' : 'border-slate-200 bg-white'}`}
            >
              {t.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Popular
                </span>
              )}
              <h3 className="font-bold text-slate-900">{t.name}</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">{t.desc}</p>
              <div className="mb-4">
                <span className="text-3xl font-extrabold text-slate-900">{t.price}</span>
                <span className="text-xs text-slate-500 ml-1">{t.period}</span>
              </div>
              <ul className="space-y-2 mb-5">
                {t.perks.map((p) => (
                  <li key={p} className="flex gap-2 text-xs text-slate-600">
                    <Check size={13} className="text-green-500 shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link
                href={`/auth/register?plan=${t.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`block text-center py-2 rounded-xl text-xs font-bold transition-colors ${t.popular ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'border border-slate-200 hover:border-slate-400 text-slate-700'}`}
              >
                Choose
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Member perks that make a difference</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-3">
                  <Icon size={18} className="text-indigo-500" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1 text-sm">{title}</h3>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Not sure which one?</h2>
          <p className="text-slate-500 mb-6">Take our 30-second quiz and we&apos;ll recommend the best plan for you.</p>
          <Link href="/free-trial" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-7 py-3 rounded-xl font-bold">
            Find my plan <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
