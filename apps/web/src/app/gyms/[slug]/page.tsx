'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Phone, Globe, Star, Users, Dumbbell,
  ChevronLeft, CheckCircle, ArrowRight, Building2,
} from 'lucide-react';

interface GymProfile {
  id: string; name: string; slug: string;
  logoUrl: string | null; coverUrl: string | null; description: string | null;
  city: string | null; country: string | null; address: string | null;
  phone: string | null; email: string; website: string | null;
  rating: number; reviewCount: number;
  _count: { users: number; branches: number };
  branches: { id: string; name: string; address: string | null; city: string | null; phone: string | null; capacity: number }[];
  membershipPlans: {
    id: string; name: string; description: string | null; type: string;
    price: number; currency: string; durationDays: number;
    features: string[]; classesIncluded: boolean; maxVisitsPerDay: number;
  }[];
  users: {
    id: string; firstName: string; lastName: string; avatarUrl: string | null;
    trainerProfile: { specialties: string[]; bio: string | null; rating: number | null; experience: number | null } | null;
  }[];
}

const SECTIONS = [
  { id: 'overview',  label: 'Overview'  },
  { id: 'pricing',   label: 'Pricing'   },
  { id: 'trainers',  label: 'Trainers'  },
  { id: 'locations', label: 'Locations' },
];

export default function GymProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [gym, setGym] = useState<GymProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  useEffect(() => {
    fetch(`${API}/gyms/profile/${slug}`)
      .then(r => r.json())
      .then(data => { setGym(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!gym) return;
    observerRef.current = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) observerRef.current?.observe(el); });
    return () => observerRef.current?.disconnect();
  }, [gym]);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!gym) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Dumbbell className="w-16 h-16 text-gray-300" />
      <h2 className="text-xl font-semibold text-gray-700">Gym not found</h2>
      <Link href="/discover" className="text-indigo-600 hover:underline">Back to discovery</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* GYM STICKY NAVBAR */}
      <nav className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/discover" className="text-gray-400 hover:text-gray-700 shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            {gym.logoUrl
              ? <img src={gym.logoUrl} alt="" className="w-8 h-8 rounded-lg object-contain bg-gray-50 border border-gray-100 p-0.5 shrink-0" />
              : <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0"><Dumbbell className="w-4 h-4 text-indigo-600" /></div>
            }
            <span className="font-semibold text-gray-900 truncate hidden sm:block">{gym.name}</span>
          </div>

          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === s.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}>
                {s.label}
              </button>
            ))}
          </div>

          <Link href={`/auth/register?gymId=${gym.id}&gymName=${encodeURIComponent(gym.name)}&gymSlug=${gym.slug}`}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
            Join <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scrollTo(s.id)}
              className={`shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                activeSection === s.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* COVER */}
      <div className="h-56 md:h-72 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
        {gym.coverUrl && <img src={gym.coverUrl} alt="" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/30" />
        {gym.logoUrl && (
          <div className="absolute bottom-[-28px] left-6 w-16 h-16 rounded-2xl bg-white shadow-xl overflow-hidden border-4 border-white">
            <img src={gym.logoUrl} alt="" className="w-full h-full object-contain p-1" />
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">

        {/* OVERVIEW */}
        <section id="overview" className={`scroll-mt-32 bg-white rounded-2xl shadow-sm p-6 mb-8 ${gym.logoUrl ? 'mt-10' : 'mt-6'}`}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{gym.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                {(gym.city || gym.address) && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{[gym.address, gym.city, gym.country].filter(Boolean).join(', ')}</span>}
                {gym.rating > 0 && <span className="flex items-center gap-1 text-amber-500 font-medium"><Star className="w-4 h-4 fill-amber-400" />{gym.rating.toFixed(1)} ({gym.reviewCount} reviews)</span>}
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{gym._count.users} members</span>
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{gym._count.branches} {gym._count.branches === 1 ? 'branch' : 'branches'}</span>
              </div>
              {gym.description && <p className="mt-3 text-gray-600 leading-relaxed">{gym.description}</p>}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Link href={`/auth/register?gymId=${gym.id}&gymName=${encodeURIComponent(gym.name)}&gymSlug=${gym.slug}`}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 font-medium whitespace-nowrap">
                Join this gym <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex gap-3 text-sm text-gray-500 justify-end">
                {gym.phone && <a href={`tel:${gym.phone}`} className="flex items-center gap-1 hover:text-indigo-600"><Phone className="w-4 h-4" />{gym.phone}</a>}
                {gym.website && <a href={gym.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-indigo-600"><Globe className="w-4 h-4" /> Website</a>}
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="scroll-mt-32 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Membership Pricing</h2>
          {gym.membershipPlans.length === 0
            ? <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">No public plans available yet</div>
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gym.membershipPlans.map(plan => (
                <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div><h3 className="font-bold text-gray-900">{plan.name}</h3><p className="text-xs text-gray-500 capitalize mt-0.5">{plan.type.replace('_', ' ').toLowerCase()}</p></div>
                    <div className="text-right"><span className="text-2xl font-bold text-indigo-600">{plan.currency} {plan.price}</span><p className="text-xs text-gray-500">/{plan.durationDays} days</p></div>
                  </div>
                  {plan.description && <p className="text-sm text-gray-600 mb-3">{plan.description}</p>}
                  <ul className="space-y-1.5 mb-4 flex-1">
                    {plan.classesIncluded && <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Classes included</li>}
                    {plan.maxVisitsPerDay > 1 && <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {plan.maxVisitsPerDay} visits/day</li>}
                    {plan.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {f}</li>)}
                  </ul>
                  <Link href={`/auth/register?gymId=${gym.id}&gymName=${encodeURIComponent(gym.name)}&gymSlug=${gym.slug}&planId=${plan.id}&planName=${encodeURIComponent(plan.name)}`}
                    className="block w-full text-center bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 text-sm font-medium transition-colors">
                    Choose this plan
                  </Link>
                </div>
              ))}
            </div>
          }
        </section>

        {/* TRAINERS */}
        <section id="trainers" className="scroll-mt-32 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Our Trainers</h2>
          {gym.users.length === 0
            ? <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">No trainers listed yet</div>
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gym.users.map(trainer => (
                <div key={trainer.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                      {trainer.avatarUrl ? <img src={trainer.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-indigo-600 font-bold text-sm">{trainer.firstName[0]}{trainer.lastName[0]}</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{trainer.firstName} {trainer.lastName}</p>
                      {trainer.trainerProfile?.rating && (
                        <div className="flex items-center gap-1 text-xs text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400" />{trainer.trainerProfile.rating.toFixed(1)}
                          {trainer.trainerProfile.experience && <span className="text-gray-400 ml-1">{trainer.trainerProfile.experience}y exp</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  {trainer.trainerProfile?.bio && <p className="text-sm text-gray-600 line-clamp-2 mb-2">{trainer.trainerProfile.bio}</p>}
                  {(trainer.trainerProfile?.specialties?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {trainer.trainerProfile!.specialties.slice(0, 4).map((s, i) => <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
        </section>

        {/* LOCATIONS */}
        <section id="locations" className="scroll-mt-32 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Locations &amp; Branches</h2>
          {gym.branches.length === 0
            ? <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-gray-100">No branch info available</div>
            : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gym.branches.map(branch => (
                <div key={branch.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-indigo-200 transition-all">
                  <h3 className="font-bold text-gray-900 mb-3">{branch.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {(branch.address || branch.city) && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 shrink-0" />{[branch.address, branch.city].filter(Boolean).join(', ')}</div>}
                    {branch.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400 shrink-0" /><a href={`tel:${branch.phone}`} className="hover:text-indigo-600">{branch.phone}</a></div>}
                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400 shrink-0" /> Capacity: {branch.capacity}</div>
                  </div>
                </div>
              ))}
            </div>
          }
        </section>

        {/* JOIN CTA */}
        {gym.membershipPlans.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-xl font-bold mb-2">Ready to join {gym.name}?</h2>
            <p className="text-indigo-200 mb-4">Choose a membership plan and start training today</p>
            <button onClick={() => scrollTo('pricing')} className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
              See pricing <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
