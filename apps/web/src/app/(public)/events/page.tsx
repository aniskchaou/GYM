'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Share2, Ticket, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const EVENTS = [
  {
    id: 'e1',
    title: 'Spring Open House',
    date: '2026-06-08T10:00:00',
    location: 'GymFlow Amsterdam Centrum',
    price: 'Free',
    tag: 'Community',
    img: 'from-amber-400 to-orange-600',
    desc: 'Tour the gym, try classes, meet the trainers. Bring a friend!',
  },
  {
    id: 'e2',
    title: 'Charity HIIT Marathon',
    date: '2026-06-22T08:00:00',
    location: 'All branches',
    price: '$20 entry',
    tag: 'Charity',
    img: 'from-rose-500 to-pink-600',
    desc: '4-hour HIIT relay. All proceeds to youth sports programs.',
  },
  {
    id: 'e3',
    title: 'Powerlifting Meet',
    date: '2026-07-15T09:00:00',
    location: 'GymFlow London Shoreditch',
    price: '$35 athlete · Free spectator',
    tag: 'Competition',
    img: 'from-indigo-600 to-purple-700',
    desc: 'Local meet — open to all levels. Trophies & PRs guaranteed.',
  },
  {
    id: 'e4',
    title: 'Yoga in the Park',
    date: '2026-07-28T07:30:00',
    location: 'Vondelpark, Amsterdam',
    price: 'Free for members',
    tag: 'Wellness',
    img: 'from-emerald-400 to-teal-600',
    desc: 'Sunrise vinyasa flow with Lena. Mats provided.',
  },
];

function useCountdown(target: string) {
  const [diff, setDiff] = useState(() => +new Date(target) - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(+new Date(target) - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  return `${days}d ${hours}h ${mins}m`;
}

function EventCard({ ev }: { ev: (typeof EVENTS)[number] }) {
  const cd = useCountdown(ev.date);
  const share = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/events#${ev.id}` : '';
    try {
      if (navigator.share) await navigator.share({ title: ev.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied!');
      }
    } catch {}
  };
  return (
    <div id={ev.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`h-36 bg-gradient-to-br ${ev.img} flex items-center justify-center text-white relative`}>
        <Ticket size={42} className="opacity-80" />
        {cd && (
          <span className="absolute top-3 left-3 bg-black/40 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-full">
            <Clock size={10} className="inline mr-1" />
            {cd}
          </span>
        )}
        <span className="absolute top-3 right-3 bg-white/90 text-slate-800 text-xs font-bold px-2 py-1 rounded-full">{ev.tag}</span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-slate-900 mb-1">{ev.title}</h3>
        <p className="text-xs text-slate-500 mb-3">{ev.desc}</p>
        <div className="text-xs text-slate-600 space-y-1 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            {new Date(ev.date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            {ev.location}
          </div>
          <div className="font-semibold text-indigo-600">{ev.price}</div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/auth/register?event=${ev.id}`}
            className="flex-1 text-center bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2 rounded-xl"
          >
            Register
          </Link>
          <button onClick={share} aria-label="Share" className="border border-slate-200 hover:border-slate-400 text-slate-700 px-3 rounded-xl">
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <div>
      <section className="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Upcoming events</h1>
        <p className="text-slate-500 max-w-xl mx-auto">Community, competition, charity. Come for the workout — stay for the people.</p>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EVENTS.map((e) => (
            <EventCard key={e.id} ev={e} />
          ))}
        </div>
      </section>
    </div>
  );
}
