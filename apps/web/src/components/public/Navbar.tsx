'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, Dumbbell, Menu, X } from 'lucide-react';

const PRIMARY_NAV = [
  { href: '/discover', label: 'Browse Gyms' },
  { href: '/classes', label: 'Classes' },
  { href: '/trainers', label: 'Trainers' },
];

const MORE_NAV = [
  { href: '/programs', label: 'Programs' },
  { href: '/nutrition', label: 'Nutrition' },
  { href: '/locations', label: 'Locations' },
  { href: '/events', label: 'Events' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) => {
    const active = isActive(href);
    return active
      ? 'text-slate-950 bg-slate-100'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50';
  };

  const moreActive = MORE_NAV.some((item) => isActive(item.href));

  return (
    <nav className="bg-white/95 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="bg-indigo-500 p-1.5 rounded-lg">
            <Dumbbell size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold">GymFlow</span>
        </Link>

        <div className="hidden lg:flex items-center gap-2 text-sm font-medium">
          {PRIMARY_NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-full px-3 py-2 transition-colors ${linkClass(n.href)}`}
            >
              {n.label}
            </Link>
          ))}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((value) => !value)}
              className={`flex items-center gap-1 rounded-full px-3 py-2 transition-colors ${moreActive ? 'text-slate-950 bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              aria-expanded={moreOpen}
              aria-label="More navigation links"
            >
              More
              <ChevronDown size={16} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                {MORE_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`block rounded-xl px-3 py-2 text-sm transition-colors ${linkClass(item.href)}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/register-gym"
            className={`text-sm font-medium transition-colors rounded-full px-3 py-2 ${linkClass('/auth/register-gym')}`}
          >
            For Gyms
          </Link>
          <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className={`text-sm font-medium transition-colors border border-slate-200 px-3 py-2 rounded-full ${isActive('/auth/register') ? 'text-slate-950 bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Join a gym
          </Link>
          <Link
            href="/discover"
            className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors ${isActive('/discover') ? 'bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
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
            {[...PRIMARY_NAV, ...MORE_NAV].map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-2 transition-colors ${isActive(n.href) ? 'bg-slate-100 text-slate-950' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'}`}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/auth/register-gym"
              onClick={() => setOpen(false)}
              className={`rounded-xl px-3 py-2 font-medium transition-colors ${isActive('/auth/register-gym') ? 'bg-slate-100 text-slate-950' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'}`}
            >
              For Gyms
            </Link>
            <Link href="/auth/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-50">
              Sign in
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setOpen(false)}
              className={`rounded-xl px-3 py-2 transition-colors ${isActive('/auth/register') ? 'bg-slate-100 text-slate-950' : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'}`}
            >
              Join a gym
            </Link>
            <Link
              href="/discover"
              onClick={() => setOpen(false)}
              className="bg-indigo-600 text-white text-center font-semibold px-4 py-2 rounded-full"
            >
              Find a gym
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
