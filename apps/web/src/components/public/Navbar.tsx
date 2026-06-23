'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Dumbbell, Menu, X } from 'lucide-react';

const NAV = [
  { href: '/discover', label: 'Browse Gyms' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/auth/register-gym', label: 'Register Your Gym' },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="bg-white/95 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="bg-indigo-500 p-1.5 rounded-lg">
            <Dumbbell size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold">GymFlow</span>
        </Link>

        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-slate-900 transition-colors">
              {n.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 px-3 py-1.5 rounded-lg"
          >
            Join a gym
          </Link>
          <Link
            href="/auth/register-gym"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg"
          >
            Add Your Gym Free
          </Link>
          <Link
            href="/discover"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Find a gym
          </Link>
        </div>

        <button onClick={() => setOpen((o) => !o)} className="md:hidden p-2 text-slate-700" aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-100 bg-white">
          <div className="px-6 py-4 flex flex-col gap-3 text-sm">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="text-slate-700 hover:text-indigo-600">
                {n.label}
              </Link>
            ))}
            <Link href="/auth/login" onClick={() => setOpen(false)} className="text-slate-700 hover:text-indigo-600">
              Sign in
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setOpen(false)}
              className="text-slate-700 hover:text-indigo-600"
            >
              Join a gym
            </Link>
            <Link
              href="/auth/register-gym"
              onClick={() => setOpen(false)}
              className="text-indigo-600 font-semibold hover:text-indigo-700"
            >
              🏋️ Register your gym — it&apos;s free
            </Link>
            <Link
              href="/discover"
              onClick={() => setOpen(false)}
              className="bg-indigo-600 text-white text-center font-semibold px-4 py-2 rounded-lg"
            >
              Find a gym
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
