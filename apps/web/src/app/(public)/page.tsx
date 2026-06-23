import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowRight, MapPin, Star, Users, Search, Dumbbell,
  CheckCircle, Shield, CreditCard, BarChart2, Zap,
  ChevronRight, Trophy, Heart, Flame, Bike, PersonStanding,
  Quote, TrendingUp, Award, Clock, RefreshCw, Sparkles,
  Building2, ThumbsUp, CalendarDays,
} from 'lucide-react';

const GymMap = dynamic(() => import('@/components/public/GymMap'), { ssr: false });

async function getFeaturedGyms() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/gyms/discover?limit=6`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.gyms ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const gyms = await getFeaturedGyms();

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white pt-20 pb-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 border border-white/20">
            🏋️ 200+ gyms across the network
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-5">
            Find your perfect gym,<br />
            <span className="text-yellow-300">join in minutes.</span>
          </h1>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Browse gyms near you, compare memberships, meet the trainers — then sign up online. No calls, no paperwork.
          </p>

          {/* Search redirect */}
          <form action="/discover" method="get" className="max-w-2xl mx-auto mb-6">
            <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search by gym name or city…"
                  className="w-full pl-10 pr-4 py-3 text-slate-800 bg-transparent text-base focus:outline-none placeholder:text-slate-400"
                />
              </div>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shrink-0">
                Search <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/discover" className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              <MapPin className="w-5 h-5" /> Browse all gyms
            </Link>
            <Link href="/auth/register" className="border-2 border-white/40 hover:border-white text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
              Create account
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-slate-900 mb-10">Join a gym in 3 steps</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '1', icon: Search, color: 'indigo', title: 'Find your gym', desc: 'Browse gyms near you. Filter by city, rating, price, and speciality. Read reviews and check what\'s included.', link: '/discover', cta: 'Browse gyms' },
              { step: '2', icon: Dumbbell, color: 'purple', title: 'Pick a plan', desc: 'Visit the gym\'s profile, see trainers, facilities and membership plans. Choose the one that fits your goals.', link: '/discover', cta: 'Explore gyms' },
              { step: '3', icon: CheckCircle, color: 'green', title: 'Register & go', desc: 'Create your account in under 2 minutes. Show up, scan your QR code, and start training today.', link: '/auth/register', cta: 'Get started' },
            ].map(({ step, icon: Icon, color, title, desc, link, cta }) => (
              <div key={step} className="relative bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-${color}-500`}>{step}</div>
                  <Icon className={`w-5 h-5 text-${color}-500`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{desc}</p>
                <Link href={link} className={`inline-flex items-center gap-1 text-sm font-semibold text-${color}-600 hover:underline`}>
                  {cta} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GYMS NEAR ME MAP ─────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Explore the map</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-2">Gyms near you</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm">
              Allow location access to see every gym on the network plotted on an interactive map. Click a pin to view the gym profile.
            </p>
          </div>
          <GymMap />
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-indigo-600 text-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '200+', label: 'Gyms on the network' },
            { value: '12 000+', label: 'Active members' },
            { value: '350+', label: 'Certified trainers' },
            { value: '4.8 ★', label: 'Average gym rating' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl sm:text-4xl font-extrabold mb-1">{value}</p>
              <p className="text-indigo-200 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── POPULAR CATEGORIES ────────────────────────────────────── */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Browse by workout category</h2>
            <p className="text-slate-500 text-sm mt-1">Find a gym that matches your fitness style</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Dumbbell, label: 'Strength', color: 'indigo' },
              { icon: Flame, label: 'HIIT', color: 'orange' },
              { icon: Bike, label: 'Cycling', color: 'sky' },
              { icon: PersonStanding, label: 'Yoga', color: 'emerald' },
              { icon: Heart, label: 'Cardio', color: 'rose' },
              { icon: Trophy, label: 'CrossFit', color: 'amber' },
            ].map(({ icon: Icon, label, color }) => (
              <Link
                key={label}
                href={`/discover?category=${label.toLowerCase()}`}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 bg-white hover:border-${color}-300 hover:shadow-md transition-all group`}
              >
                <div className={`w-12 h-12 bg-${color}-50 rounded-xl flex items-center justify-center group-hover:bg-${color}-100 transition-colors`}>
                  <Icon className={`w-6 h-6 text-${color}-500`} />
                </div>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED GYMS ────────────────────────────────────────── */}
      {gyms.length > 0 && (
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Featured gyms</h2>
                <p className="text-slate-500 text-sm mt-1">Highly rated gyms on our network</p>
              </div>
              <Link href="/discover" className="flex items-center gap-1 text-indigo-600 font-semibold text-sm hover:underline">
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gyms.map((gym: any) => (
                <Link
                  key={gym.id}
                  href={`/gyms/${gym.slug}`}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 overflow-hidden transition-all group"
                >
                  {gym.coverUrl ? (
                    <img src={gym.coverUrl} alt={gym.name} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Dumbbell className="w-12 h-12 text-white/60" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {gym.logoUrl ? <img src={gym.logoUrl} alt="" className="w-full h-full object-cover" /> : <Dumbbell className="w-5 h-5 text-indigo-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate group-hover:text-indigo-600">{gym.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                          {gym.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{gym.city}</span>}
                          {gym.rating > 0 && <span className="flex items-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-amber-400" />{gym.rating.toFixed(1)}</span>}
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{gym._count?.users ?? 0}</span>
                        </div>
                      </div>
                      {gym.membershipPlans?.length > 0 && (
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-400">from</p>
                          <p className="font-bold text-indigo-600 text-sm">{gym.membershipPlans[0].currency} {gym.membershipPlans[0].price}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/discover" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors">
                <Search className="w-5 h-5" /> Find gyms near you
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">What members say</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Real people, real results</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', gym: 'FitZone Downtown', rating: 5, text: 'Signing up was so easy — I found a gym near me, picked a plan, and was training the same day. The QR check-in is a game changer.' },
              { name: 'James R.', gym: 'IronHouse Gym', rating: 5, text: 'I tried three gyms through GymFlow before committing. Being able to compare trainers and prices side by side saved me so much time.' },
              { name: 'Priya K.', gym: 'Zen Wellness Studio', rating: 5, text: 'The yoga classes are amazing and the online booking is seamless. I never have to call ahead — everything is managed through the app.' },
            ].map(({ name, gym, rating, text }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <Quote className="w-6 h-6 text-indigo-200 mb-3" />
                <p className="text-slate-600 text-sm leading-relaxed mb-5">{text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm shrink-0">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{name}</p>
                    <p className="text-xs text-slate-400">{gym}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEMBER BENEFITS ──────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">For members</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-3">Everything you need to reach your goals</h2>
            <p className="text-slate-500 max-w-xl mx-auto">One account to find, join, and manage your gym memberships.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Search, color: 'indigo', title: 'Discover gyms', desc: 'Search across 200+ gyms by city, type, price or facilities.' },
              { icon: Star, color: 'amber', title: 'Read reviews', desc: 'See ratings and reviews from real members before you commit.' },
              { icon: CheckCircle, color: 'emerald', title: 'Book classes', desc: 'Reserve spots in live classes and personal training sessions online.' },
              { icon: Zap, color: 'purple', title: 'QR check-in', desc: 'Walk in and scan your personal QR code — no cards, no queues.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className={`p-5 rounded-2xl bg-${color}-50 border border-${color}-100 hover:shadow-md transition-shadow`}>
                <Icon className={`w-6 h-6 text-${color}-500 mb-3`} />
                <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/auth/register" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors">
              Join a gym today <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── LIST YOUR GYM ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Steps + CTA */}
            <div>
              <span className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
                🏋️ For gym owners
              </span>
              <h2 className="text-4xl font-extrabold mb-4 leading-tight">
                Add your gym.<br />
                <span className="text-indigo-400">Reach thousands of members.</span>
              </h2>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                Register your gym on GymFlow in under 5 minutes — completely free. Members discover you, compare plans and sign up online.
              </p>

              {/* 3-step process */}
              <div className="space-y-5 mb-10">
                {[
                  {
                    n: '1',
                    title: 'Create your gym profile',
                    desc: 'Enter your gym name, location and contact email. Your gym gets a public page instantly.',
                    color: 'indigo',
                  },
                  {
                    n: '2',
                    title: 'Set up your owner account',
                    desc: 'Create your personal login. You\'ll use it to manage members, classes, payments and more.',
                    color: 'purple',
                  },
                  {
                    n: '3',
                    title: 'Choose a plan & go live',
                    desc: 'Start free with a 14-day trial. Go live on the GymFlow network — no credit card required.',
                    color: 'emerald',
                  },
                ].map(({ n, title, desc, color }) => (
                  <div key={n} className="flex gap-4 items-start">
                    <div className={`w-9 h-9 rounded-xl bg-${color}-500 text-white font-extrabold flex items-center justify-center shrink-0 text-sm`}>
                      {n}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/auth/register-gym"
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
                >
                  Register Your Gym Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-6 py-4 rounded-xl font-semibold transition-colors"
                >
                  Already listed? Sign in
                </Link>
              </div>
              <p className="text-slate-500 text-xs mt-3">✓ Free 14-day trial &nbsp; ✓ No credit card required &nbsp; ✓ Cancel anytime</p>
            </div>

            {/* Right: Dashboard preview card */}
            <div className="relative">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                {/* Mock topbar */}
                <div className="bg-slate-900 px-5 py-3 flex items-center gap-3 border-b border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="ml-2 text-xs text-slate-400">GymFlow Dashboard — Your Gym</span>
                </div>

                {/* Mock KPI row */}
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: 'Active Members', value: '248', trend: '+12 this week', color: 'indigo' },
                      { label: 'Revenue (Jun)', value: '$8,420', trend: '+18% vs May', color: 'emerald' },
                      { label: 'Classes Today', value: '6', trend: '42 seats booked', color: 'purple' },
                    ].map(({ label, value, trend, color }) => (
                      <div key={label} className={`bg-${color}-500/10 border border-${color}-500/20 rounded-xl p-3`}>
                        <p className="text-xs text-slate-400 mb-1">{label}</p>
                        <p className={`text-xl font-extrabold text-${color}-400`}>{value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{trend}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mock member list */}
                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-300 mb-3">Recent check-ins</p>
                    {[
                      { name: 'Alice Johnson', time: '2 min ago', plan: 'Premium' },
                      { name: 'Bob Carter', time: '8 min ago', plan: 'Monthly' },
                      { name: 'Maria Santos', time: '15 min ago', plan: 'Annual' },
                    ].map(({ name, time, plan }) => (
                      <div key={name} className="flex items-center gap-3 py-1.5 border-b border-slate-600/50 last:border-0">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                          {name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate">{name}</p>
                          <p className="text-xs text-slate-500">{time}</p>
                        </div>
                        <span className="text-xs text-indigo-400 font-medium shrink-0">{plan}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                14-day free trial
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES (for gym owners) ───────────────────── */}
      <section className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">For gym owners</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-3">Run your gym smarter</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Everything you need to manage members, payments and growth — in one platform.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Users, title: 'Member Management', desc: 'Onboard members, track profiles, memberships and attendance history in one place.' },
              { icon: CreditCard, title: 'Payments & Billing', desc: 'Automated invoicing, Stripe integration and real-time revenue tracking.' },
              { icon: BarChart2, title: 'Analytics & Reports', desc: 'KPI dashboards, churn analysis and revenue charts to grow your business.' },
              { icon: Zap, title: 'QR Check-In', desc: 'QR code check-in, live occupancy tracking and daily attendance reports.' },
              { icon: Shield, title: 'Multi-Branch', desc: 'Manage multiple locations from a single account with role-based access.' },
              { icon: Star, title: 'Online Presence', desc: 'Your gym gets a public profile page for members to discover and join online.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-indigo-500" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/auth/register-gym" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold transition-colors">
              Register Your Gym — it&apos;s free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── GYM OF THE MONTH ─────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gradient-to-br from-amber-50 to-orange-50 border-t border-amber-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Badge + text */}
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                <Award className="w-3.5 h-3.5" /> Gym of the Month — June 2026
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
                IronHouse Performance Center
              </h2>
              <p className="text-slate-600 leading-relaxed mb-5 max-w-lg">
                Voted #1 by members this month for their world-class strength equipment, 24/7 access, dedicated coaching staff and brand-new recovery suite with ice baths and infrared saunas.
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                {[
                  { icon: Star, label: '4.9 rating', color: 'amber' },
                  { icon: Users, label: '1,200+ members', color: 'indigo' },
                  { icon: MapPin, label: 'Downtown branch', color: 'rose' },
                  { icon: Clock, label: '24 / 7 access', color: 'emerald' },
                ].map(({ icon: Icon, label, color }) => (
                  <span key={label} className={`inline-flex items-center gap-1.5 text-sm font-medium text-${color}-700 bg-${color}-50 border border-${color}-100 px-3 py-1.5 rounded-full`}>
                    <Icon className="w-4 h-4" /> {label}
                  </span>
                ))}
              </div>
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-colors"
              >
                Explore this gym <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Visual card */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-amber-100">
                <div className="w-full h-56 bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
                  <Dumbbell className="w-20 h-20 text-white/20" />
                </div>
                <div className="bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">IronHouse Performance</p>
                      <p className="text-xs text-slate-400">Downtown · Open 24/7</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">from</p>
                      <p className="font-bold text-amber-600">$39 / mo</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> #1 this month
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRENDING GYMS ────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5" /> Trending this week
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Hot gyms right now</h2>
              <p className="text-slate-500 text-sm mt-1">Based on new sign-ups and member reviews in the last 7 days</p>
            </div>
            <Link href="/discover" className="hidden sm:flex items-center gap-1 text-indigo-600 font-semibold text-sm hover:underline">
              See all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { rank: 1, name: 'PeakFit Studio', city: 'New York', tag: '🔥 +142 new members', badge: 'bg-rose-500', price: '$45', specialty: 'HIIT & Cardio' },
              { rank: 2, name: 'Zen Wellness Hub', city: 'Los Angeles', tag: '⭐ 4.9 this week', badge: 'bg-amber-500', price: '$55', specialty: 'Yoga & Pilates' },
              { rank: 3, name: 'CrossCore Gym', city: 'Chicago', tag: '📈 Fastest growing', badge: 'bg-indigo-500', price: '$39', specialty: 'CrossFit' },
              { rank: 4, name: 'AquaFlex Center', city: 'Miami', tag: '💬 Most reviewed', badge: 'bg-emerald-500', price: '$49', specialty: 'Swimming & Spa' },
            ].map(({ rank, name, city, tag, badge, price, specialty }) => (
              <Link
                key={name}
                href="/discover"
                className="group relative bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="h-28 bg-gradient-to-br from-slate-700 to-slate-500 flex items-center justify-center">
                  <Dumbbell className="w-10 h-10 text-white/20 group-hover:text-white/30 transition-colors" />
                </div>
                <div className={`absolute top-3 left-3 ${badge} text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow`}>
                  {rank}
                </div>
                <div className="p-4">
                  <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 mb-2">
                    <MapPin className="w-3 h-3" /> {city} · {specialty}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 mb-3">{tag}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-indigo-600">from {price}/mo</span>
                    <span className="text-xs text-indigo-500 font-semibold group-hover:underline">View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BROWSE BY CITY ───────────────────────────────────────── */}
      <section className="py-14 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Browse gyms by city</h2>
          <p className="text-slate-500 text-sm mb-8">Gyms are available across the country. Pick your city to start.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { city: 'New York', count: 34 },
              { city: 'Los Angeles', count: 28 },
              { city: 'Chicago', count: 19 },
              { city: 'Miami', count: 16 },
              { city: 'Houston', count: 14 },
              { city: 'Phoenix', count: 11 },
              { city: 'Seattle', count: 9 },
              { city: 'Boston', count: 8 },
              { city: 'Denver', count: 7 },
              { city: 'Austin', count: 6 },
            ].map(({ city, count }) => (
              <Link
                key={city}
                href={`/discover?city=${encodeURIComponent(city)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-sm font-medium text-slate-700 hover:text-indigo-700 transition-all shadow-sm"
              >
                <Building2 className="w-3.5 h-3.5" />
                {city}
                <span className="text-xs text-slate-400 font-normal">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── THINKING OF SWITCHING? ────────────────────────────────── */}
      <section className="py-16 px-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <RefreshCw className="w-3.5 h-3.5" /> Thinking of switching gyms?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">You deserve a better gym.</h2>
            <p className="text-slate-300 max-w-xl mx-auto">
              Thousands of members switch gyms every month through GymFlow. Here's why they make the move.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {[
              { icon: Sparkles, title: 'Better equipment', desc: 'Find gyms with modern, well-maintained equipment that matches your training style — no more waiting for broken machines.' },
              { icon: MapPin, title: 'Closer to you', desc: 'A gym 5 minutes from home beats one 30 minutes away. Use our map to find options you didn\'t know existed.' },
              { icon: ThumbsUp, title: 'More value', desc: 'Compare membership prices side by side. Many members find equal or better gyms for significantly less per month.' },
              { icon: CalendarDays, title: 'Better class schedule', desc: 'Find gyms with live classes that actually fit your calendar — yoga, HIIT, spin and more at times that work for you.' },
              { icon: Users, title: 'Better community', desc: 'The right gym feels like a second home. Read member reviews and visit a few before committing.' },
              { icon: Trophy, title: 'Level up your training', desc: 'Access specialist trainers in powerlifting, boxing, yoga or rehab. The right coach changes everything.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all">
                <Icon className="w-6 h-6 text-indigo-300 mb-3" />
                <h3 className="font-bold text-white mb-1.5">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              <Search className="w-5 h-5" /> Find a better gym today
            </Link>
            <p className="text-slate-400 text-sm mt-3">No commitment required. Browse free, join when you're ready.</p>
          </div>
        </div>
      </section>

      {/* ── THIS WEEK'S FEATURED CLASSES ─────────────────────────── */}
      <section className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 mb-1">
                <CalendarDays className="w-3.5 h-3.5" /> This week
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Featured classes across the network</h2>
              <p className="text-slate-500 text-sm mt-1">Book a free trial class at any gym below</p>
            </div>
            <Link href="/discover" className="hidden sm:flex items-center gap-1 text-indigo-600 font-semibold text-sm hover:underline">
              All classes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { day: 'Mon', time: '7:00 AM', type: 'HIIT Blast', gym: 'PeakFit Studio', trainer: 'Coach Alex', spots: 4, color: 'rose', icon: Flame },
              { day: 'Tue', time: '6:30 AM', type: 'Power Yoga', gym: 'Zen Wellness Hub', trainer: 'Instructor Maya', spots: 8, color: 'emerald', icon: PersonStanding },
              { day: 'Wed', time: '12:00 PM', type: 'Spin Cycle', gym: 'AquaFlex Center', trainer: 'Coach Jordan', spots: 6, color: 'sky', icon: Bike },
              { day: 'Thu', time: '6:00 PM', type: 'CrossFit WOD', gym: 'CrossCore Gym', trainer: 'Coach Sam', spots: 3, color: 'amber', icon: Trophy },
              { day: 'Fri', time: '7:30 AM', type: 'Strength & Conditioning', gym: 'IronHouse Performance', trainer: 'Coach Mike', spots: 5, color: 'indigo', icon: Dumbbell },
              { day: 'Sat', time: '9:00 AM', type: 'Cardio Kickboxing', gym: 'FightFit Academy', trainer: 'Coach Dana', spots: 10, color: 'purple', icon: Heart },
            ].map(({ day, time, type, gym, trainer, spots, color, icon: Icon }) => (
              <div key={type + day} className={`relative rounded-2xl border border-${color}-100 bg-${color}-50 p-5 hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`text-center bg-${color}-500 text-white rounded-xl px-3 py-1.5 min-w-[56px]`}>
                    <p className="text-xs font-bold opacity-80">{day}</p>
                    <p className="text-sm font-extrabold leading-tight">{time}</p>
                  </div>
                  <span className={`text-xs font-semibold text-${color}-700 bg-${color}-100 border border-${color}-200 px-2.5 py-1 rounded-full`}>
                    {spots} spots left
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 text-${color}-500`} />
                  <h3 className="font-bold text-slate-900">{type}</h3>
                </div>
                <p className="text-xs text-slate-500 mb-0.5">{gym}</p>
                <p className="text-xs text-slate-400 mb-4">with {trainer}</p>
                <Link
                  href="/discover"
                  className={`block w-full text-center bg-${color}-500 hover:bg-${color}-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors`}
                >
                  Book free trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to start your fitness journey?</h2>
          <p className="text-indigo-100 mb-8 text-lg">Find a gym near you and join online in minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/discover" className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3.5 rounded-xl font-bold transition-colors inline-flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" /> Browse gyms near me
            </Link>
            <Link href="/auth/login" className="border-2 border-white/40 hover:border-white text-white px-8 py-3.5 rounded-xl font-bold transition-colors">
              Already a member? Sign in
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
