'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MapPin, Clock, Phone, Navigation, Users, Search } from 'lucide-react';

type Loc = {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  hours: string;
  facilities: string[];
  occupancy: number;
  lat: number;
  lng: number;
};

const LOCS: Loc[] = [
  { id: 'ams-cent', name: 'GymFlow Amsterdam Centrum', city: 'Amsterdam', country: 'Netherlands', address: 'Damrak 102, 1012 LP', phone: '+31 20 555 0101', hours: '06:00 – 23:00', facilities: ['Sauna', 'Pool', 'Crossfit Box', 'Café'], occupancy: 62, lat: 52.3733, lng: 4.8927 },
  { id: 'ams-zuid', name: 'GymFlow Amsterdam Zuid', city: 'Amsterdam', country: 'Netherlands', address: 'Beethovenstraat 21', phone: '+31 20 555 0202', hours: '05:30 – 24:00', facilities: ['Pool', 'Boxing ring', 'Recovery zone'], occupancy: 41, lat: 52.3382, lng: 4.8731 },
  { id: 'lon-shor', name: 'GymFlow London Shoreditch', city: 'London', country: 'UK', address: 'Curtain Rd 88, EC2A', phone: '+44 20 7946 0011', hours: '24/7', facilities: ['Crossfit', 'Yoga studio', 'Crèche'], occupancy: 88, lat: 51.5237, lng: -0.0789 },
  { id: 'lon-kx', name: 'GymFlow London King’s Cross', city: 'London', country: 'UK', address: 'York Way 1, N1C 4PA', phone: '+44 20 7946 0033', hours: '06:00 – 23:00', facilities: ['Sauna', 'Pool', 'Spin studio'], occupancy: 34, lat: 51.5347, lng: -0.1245 },
  { id: 'ber-mit', name: 'GymFlow Berlin Mitte', city: 'Berlin', country: 'Germany', address: 'Friedrichstr. 110', phone: '+49 30 555 1212', hours: '05:00 – 24:00', facilities: ['Sauna', 'Yoga', 'Crossfit'], occupancy: 71, lat: 52.5249, lng: 13.3876 },
  { id: 'par-mar', name: 'GymFlow Paris Marais', city: 'Paris', country: 'France', address: 'Rue de Rivoli 75', phone: '+33 1 4234 5678', hours: '06:00 – 23:30', facilities: ['Boxing', 'Pilates studio', 'Café'], occupancy: 54, lat: 48.8559, lng: 2.355 },
];

function occColor(p: number) {
  if (p >= 80) return 'bg-red-100 text-red-700';
  if (p >= 60) return 'bg-orange-100 text-orange-700';
  return 'bg-green-100 text-green-700';
}

export default function LocationsPage() {
  const [q, setQ] = useState('');
  const filtered = LOCS.filter((l) => `${l.name} ${l.city} ${l.country}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <section className="pt-20 pb-10 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Find your gym</h1>
        <p className="text-slate-500 max-w-xl mx-auto">15 locations across 5 countries. One membership unlocks them all.</p>
      </section>

      <section className="px-6 pb-6">
        <div className="max-w-3xl mx-auto relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by city, name or country"
            className="w-full border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-sm shadow-sm"
          />
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
            {filtered.map((l) => (
              <div key={l.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-32 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <MapPin size={32} className="text-white/90" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900">{l.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    {l.city}, {l.country}
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                    <div className="flex items-start gap-1.5">
                      <MapPin size={12} className="mt-0.5 shrink-0" />
                      {l.address}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} /> {l.hours}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} /> {l.phone}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {l.facilities.map((f) => (
                      <span key={f} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${occColor(l.occupancy)}`}>
                      <Users size={10} className="inline mr-1" /> {l.occupancy}% busy
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/free-trial"
                      className="flex-1 text-center bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2 rounded-xl"
                    >
                      Book visit
                    </Link>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Get directions"
                      className="border border-slate-200 hover:border-slate-400 text-slate-700 px-3 rounded-xl flex items-center"
                    >
                      <Navigation size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-slate-500 col-span-full text-center py-10">No locations match your search.</p>}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-slate-900 text-white rounded-2xl p-6 aspect-square flex flex-col items-center justify-center text-center">
              <MapPin size={32} className="mb-3 text-indigo-400" />
              <p className="font-bold mb-1">Interactive map</p>
              <p className="text-xs text-slate-400 mb-5">Live occupancy & navigation coming soon to mobile.</p>
              <Link href="/free-trial" className="bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded-xl text-sm font-semibold">
                Get the app
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
